import React, { useId, useState } from 'react';
import {
  Currency,
  formatCurrency,
  WildlifeCorridorAsset,
  WildlifeCorridorId,
  AnimalSpeciesId,
  AnimalSpeciesProfile,
  LightingCondition,
  RoadSurfaceFriction,
  calculateStoppingPhysics,
  evaluateWildlifeChecklist,
  gradeWildlifeExam,
  generateWildlifeCertificate,
  WildlifeCrossingCertificate,
} from '../utils/wildlifeCrossingCompliance';
import {
  MOCK_WILDLIFE_CORRIDORS,
  MOCK_ANIMAL_SPECIES,
  MOCK_VEHICLE_PRESETS,
  WILDLIFE_SAFETY_CHECKLIST,
  WILDLIFE_EXAM_QUESTIONS,
  MOCK_WILDLIFE_CERTIFICATES,
  VehicleWildlifePreset,
} from '../data/mockWildlifeCrossingData';

interface WildlifeCrossingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehiclePlate?: string;
  initialVehicleModel?: string;
}

type ActiveTab =
  | 'corridors_radar'
  | 'scada_biotelemetry'
  | 'stopping_physics'
  | 'safety_checklist'
  | 'exam_simulator'
  | 'issue_certificate'
  | 'public_registry';

export const WildlifeCrossingModal: React.FC<WildlifeCrossingModalProps> = ({
  isOpen,
  onClose,
  initialVehiclePlate = '99-WL-901',
  initialVehicleModel = 'Toyota RAV4 Hybrid AWD',
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('corridors_radar');
  const [currency, setCurrency] = useState<Currency>('AZN');

  // Accessibility unique IDs
  const speedInputId = useId();
  const reactionInputId = useId();
  const detectionInputId = useId();
  const geophoneInputId = useId();

  // Selected Corridor
  const [selectedCorridorId, setSelectedCorridorId] = useState<WildlifeCorridorId>('hirkan_leopard_corridor');
  const currentCorridor =
    MOCK_WILDLIFE_CORRIDORS.find((c) => c.id === selectedCorridorId) || MOCK_WILDLIFE_CORRIDORS[0];

  // Selected Animal Species
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<AnimalSpeciesId>(currentCorridor.targetSpeciesId);
  const currentSpecies: AnimalSpeciesProfile =
    MOCK_ANIMAL_SPECIES.find((s) => s.id === selectedSpeciesId) || MOCK_ANIMAL_SPECIES[0];

  // SCADA Bio-Telemetry Controls
  const [aiConfidencePct, setAiConfidencePct] = useState<number>(currentCorridor.liveTelemetry.aiConfidencePct);
  const [geophoneTremorHz, setGeophoneTremorHz] = useState<number>(currentCorridor.liveTelemetry.geophoneTremorHz);
  const [isVirtualFenceActive, setIsVirtualFenceActive] = useState<boolean>(true);
  const [isOpticalStrobeActive, setIsOpticalStrobeActive] = useState<boolean>(false);

  // Stopping Physics Controls
  const [vehicleSpeedKmH, setVehicleSpeedKmH] = useState<number>(80);
  const [lighting, setLighting] = useState<LightingCondition>('night_low_beam');
  const [surface, setSurface] = useState<RoadSurfaceFriction>('dry_asphalt');
  const [driverReactionTimeSec, setDriverReactionTimeSec] = useState<number>(1.2);

  // Vehicle Credentials
  const [vehiclePlate, setVehiclePlate] = useState<string>(initialVehiclePlate);
  const [vehicleModel, setVehicleModel] = useState<string>(initialVehicleModel);
  const [vinCode, setVinCode] = useState<string>('JTMBFREV9PD194821');
  const [vehicleMassKg, setVehicleMassKg] = useState<number>(1720);

  // Checklist State
  const [checkedChecklistIds, setCheckedChecklistIds] = useState<string[]>(
    WILDLIFE_SAFETY_CHECKLIST.map((item) => item.id)
  );

  // Exam State
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Certificates & Registry
  const [generatedCertificate, setGeneratedCertificate] = useState<WildlifeCrossingCertificate | null>(null);
  const [registryCertificates, setRegistryCertificates] = useState<WildlifeCrossingCertificate[]>(
    MOCK_WILDLIFE_CERTIFICATES
  );
  const [registrySearchQuery, setRegistrySearchQuery] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  // Stopping physics calculation
  const physicsResult = calculateStoppingPhysics({
    vehicleSpeedKmH,
    lighting,
    surface,
    animalSpeciesId: selectedSpeciesId,
    driverReactionTimeSec,
    vehicleMassKg,
  });

  // Checklist Evaluation
  const checklistResult = evaluateWildlifeChecklist(checkedChecklistIds);

  // Exam Evaluation
  const correctExamAnswers = WILDLIFE_EXAM_QUESTIONS.reduce((acc, q) => {
    acc[q.id] = q.correctAnswer;
    return acc;
  }, {} as Record<number, number>);
  const examResult = gradeWildlifeExam(examAnswers, correctExamAnswers);

  const handleSelectPreset = (preset: VehicleWildlifePreset) => {
    setVehiclePlate(preset.plate);
    setVehicleModel(preset.model);
    setVinCode(preset.vin);
    setVehicleMassKg(preset.massKg);
    const targetCorridor = MOCK_WILDLIFE_CORRIDORS.find((c) => c.id === preset.selectedCorridorId);
    if (targetCorridor) {
      setSelectedCorridorId(targetCorridor.id);
      setSelectedSpeciesId(targetCorridor.targetSpeciesId);
    }
  };

  const handleToggleChecklistItem = (id: string) => {
    setCheckedChecklistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExamAnswer = (questionId: number, optionIdx: number) => {
    if (examSubmitted) return;
    setExamAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleIssueCertificate = () => {
    const cert = generateWildlifeCertificate({
      vehiclePlate,
      vehicleModel,
      vinCode,
      corridor: currentCorridor,
      scorePercentage: examSubmitted ? examResult.scorePercentage : checklistResult.percentageScore,
    });
    setGeneratedCertificate(cert);
    setRegistryCertificates((prev) => [cert, ...prev]);
    setActiveTab('issue_certificate');
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${label} kopyalandı!`);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const filteredRegistry = registryCertificates.filter(
    (c) =>
      c.certificateNumber.toLowerCase().includes(registrySearchQuery.toLowerCase()) ||
      c.vehiclePlate.toLowerCase().includes(registrySearchQuery.toLowerCase()) ||
      c.corridorNameAz.toLowerCase().includes(registrySearchQuery.toLowerCase()) ||
      c.simaDigitalUid.toLowerCase().includes(registrySearchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      data-testid="wildlife-crossing-modal"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl flex flex-col text-slate-100 overflow-hidden font-sans">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-slate-950/80 border-b border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-lg border border-emerald-400/40 text-2xl">
              🦌
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AAYDA • ETSN • BDYP RƏSMİ
                </span>
                <span className="text-xs text-slate-400 font-mono">WILD-PASS-AZ-2026</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Vəhşi Təbiət & Heyvan Keçidləri SCADA Bio-Telemetriya Portalı
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-1 rounded-md font-medium transition ${
                    currency === c
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  data-testid={`currency-btn-${c.toLowerCase()}`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700"
              data-testid="modal-close-btn"
              aria-label="Bağla"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-950/60 border-b border-slate-800 overflow-x-auto text-xs">
          {[
            { id: 'corridors_radar', label: '1. Ekoloji Dəhlizlər Radarı', icon: '🌲' },
            { id: 'scada_biotelemetry', label: '2. SCADA Bio-Telemetriya', icon: '📡' },
            { id: 'stopping_physics', label: '3. Tormoz & Qəza Riski', icon: '🛑' },
            { id: 'safety_checklist', label: '4. 10 Bəndlik Yoxlama', icon: '📋' },
            { id: 'exam_simulator', label: '5. Dövlət İmtahanı', icon: '🎓' },
            { id: 'issue_certificate', label: '6. WILD-PASS Sertifikatı', icon: '📜' },
            { id: 'public_registry', label: '7. Açıq Dövlət Reyestri', icon: '🔍' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
              data-testid={`tab-btn-${tab.id}`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Copy Feedback Toast */}
        {copyFeedback && (
          <div className="bg-emerald-500/20 text-emerald-300 text-xs px-4 py-1.5 text-center border-b border-emerald-500/40 animate-fade-in">
            {copyFeedback}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: CORRIDORS RADAR */}
          {activeTab === 'corridors_radar' && (
            <div className="space-y-6" data-testid="tab-corridors-radar">
              {/* Presets Bar */}
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 mb-2 block">
                  Avtomobil və Dəhliz Hazır Preseti Seçin:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {MOCK_VEHICLE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`text-left p-2 rounded-lg border text-xs transition ${
                        vehiclePlate === preset.plate
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600'
                      }`}
                      data-testid={`preset-btn-${preset.id}`}
                    >
                      <div className="font-bold text-white">{preset.plate}</div>
                      <div className="text-[11px] text-slate-400 truncate">{preset.model}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 6 Strategic Corridors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_WILDLIFE_CORRIDORS.map((corridor) => {
                  const isSelected = selectedCorridorId === corridor.id;
                  return (
                    <div
                      key={corridor.id}
                      onClick={() => {
                        setSelectedCorridorId(corridor.id);
                        setSelectedSpeciesId(corridor.targetSpeciesId);
                        setAiConfidencePct(corridor.liveTelemetry.aiConfidencePct);
                        setGeophoneTremorHz(corridor.liveTelemetry.geophoneTremorHz);
                      }}
                      className={`cursor-pointer p-4 rounded-xl border transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-850 border-emerald-500 shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-800/40 border-slate-700/70 hover:bg-slate-800/80 hover:border-slate-600'
                      }`}
                      data-testid={`corridor-card-${corridor.id}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-700 text-slate-200">
                            {corridor.highwayCode}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              corridor.liveTelemetry.sensorStatus === 'critical_on_roadway'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : corridor.liveTelemetry.sensorStatus === 'wildlife_detected'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {corridor.liveTelemetry.sensorStatus === 'critical_on_roadway'
                              ? '🚨 ASZFALT ÜZƏRİNDƏ'
                              : corridor.liveTelemetry.sensorStatus === 'wildlife_detected'
                              ? '⚠️ YAXINLAŞIR'
                              : '✅ AÇIQ SƏRBƏST'}
                          </span>
                        </div>

                        <h3 className="font-bold text-white text-sm mb-1">{corridor.nameAz}</h3>
                        <p className="text-xs text-slate-400 mb-2">{corridor.locationAz}</p>

                        <div className="text-xs space-y-1 text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Kilometr Həddi:</span>
                            <span className="font-mono text-emerald-400 font-semibold">{corridor.kilometerMarker}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Ekodukt Eni:</span>
                            <span className="font-mono">{corridor.overpassWidthMeters} metr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Tor Çəpər Uzunluğu:</span>
                            <span className="font-mono">{corridor.fencingLengthKm} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Tövsiyə Sürət:</span>
                            <span className="font-mono font-bold text-amber-400">
                              {corridor.liveTelemetry.advisorySpeedLimitKmH} km/s
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Nəzarət Heyvanı:</span>
                        <span className="text-emerald-300 font-semibold truncate max-w-[150px]">
                          {corridor.primaryFaunaAz[0]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Corridor Detailed Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/40">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌲</span>
                    <div>
                      <h4 className="font-bold text-white">{currentCorridor.nameAz}</h4>
                      <p className="text-xs text-emerald-400 font-mono">
                        {currentCorridor.highwayCode} • {currentCorridor.kilometerMarker}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('scada_biotelemetry')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
                    data-testid="inspect-telemetry-btn"
                  >
                    Canlı Telemetriyanı Aç →
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {currentCorridor.primaryFaunaAz.map((fauna, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      🐾 {fauna}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCADA BIO-TELEMETRY */}
          {activeTab === 'scada_biotelemetry' && (
            <div className="space-y-6" data-testid="tab-scada-biotelemetry">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: SCADA Telemetry Radar */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="p-5 rounded-xl bg-slate-850 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <span>📡</span>
                        <span>SCADA FLIR Termal & Qeofon Canlı Göstəriciləri</span>
                      </h3>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {currentCorridor.kilometerMarker}
                      </span>
                    </div>

                    {/* Sensor Sliders */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <label htmlFor={detectionInputId} className="text-slate-300 font-medium">
                            FLIR İnfraqırmızı AI Tanıma Dəqiqliyi (%):
                          </label>
                          <span className="font-mono text-emerald-400 font-bold">{aiConfidencePct}%</span>
                        </div>
                        <input
                          id={detectionInputId}
                          type="range"
                          min="0"
                          max="100"
                          value={aiConfidencePct}
                          onChange={(e) => setAiConfidencePct(Number(e.target.value))}
                          className="w-full accent-emerald-500"
                          data-testid="ai-confidence-slider"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <label htmlFor={geophoneInputId} className="text-slate-300 font-medium">
                            Seysmik Qeofon Dırnaq Titrəyişi (Hz):
                          </label>
                          <span className="font-mono text-amber-400 font-bold">{geophoneTremorHz} Hz</span>
                        </div>
                        <input
                          id={geophoneInputId}
                          type="range"
                          min="0"
                          max="30"
                          step="0.5"
                          value={geophoneTremorHz}
                          onChange={(e) => setGeophoneTremorHz(Number(e.target.value))}
                          className="w-full accent-amber-500"
                          data-testid="geophone-slider"
                        />
                      </div>
                    </div>

                    {/* Virtual Fence Switches */}
                    <div className="pt-3 border-t border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                        <div>
                          <div className="font-semibold text-xs text-white">Ultrasəs Çəpər (25 kHz)</div>
                          <div className="text-[11px] text-slate-400">Yoldan meşəyə akustik impuls</div>
                        </div>
                        <button
                          onClick={() => setIsVirtualFenceActive(!isVirtualFenceActive)}
                          className={`px-3 py-1 rounded text-xs font-bold transition ${
                            isVirtualFenceActive
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                          data-testid="toggle-virtual-fence"
                        >
                          {isVirtualFenceActive ? 'AKTİV' : 'SÖNÜLÜ'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                        <div>
                          <div className="font-semibold text-xs text-white">Optik Stroboskop İşığı</div>
                          <div className="text-[11px] text-slate-400">Gecə vaxtı parıltı xəbərdarlığı</div>
                        </div>
                        <button
                          onClick={() => setIsOpticalStrobeActive(!isOpticalStrobeActive)}
                          className={`px-3 py-1 rounded text-xs font-bold transition ${
                            isOpticalStrobeActive
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                          data-testid="toggle-optical-strobe"
                        >
                          {isOpticalStrobeActive ? 'AKTİV' : 'SÖNÜLÜ'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic VMS Warning Sign */}
                  <div className="p-4 rounded-xl bg-black border-2 border-amber-500/80 shadow-lg text-center space-y-2">
                    <div className="text-[11px] font-mono tracking-widest text-amber-500 uppercase">
                      AAYDA & BDYP ELEKTRON İNFORMASİYA TABLOSU (VMS)
                    </div>
                    <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 animate-pulse tracking-wide">
                      {aiConfidencePct > 80
                        ? '⚠️ DİQQƏT: VƏHŞİ HEYVAN KEÇİDİ (WILDLIFE CROSSING)'
                        : '✅ MAGİSTRAL AÇIQDIR — NORMAL SÜRƏT'}
                    </div>
                    <div className="text-xs text-slate-300 font-mono">
                      MƏCBURİ TÖVSİYƏ SÜRƏT:{' '}
                      <span className="text-amber-400 font-bold text-sm">
                        {aiConfidencePct > 80 ? '50 km/s' : '90 km/s'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Col: Species Profile Card */}
                <div className="space-y-4">
                  <div className="p-5 rounded-xl bg-slate-850 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">Nəzarətdəki Heyvan Profili</h4>
                      <span className="text-xl">🐾</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Növün Adı:</span>
                        <span className="font-bold text-white text-sm">{currentSpecies.commonNameAz}</span>
                        <span className="italic text-slate-400 block text-[11px]">{currentSpecies.scientificName}</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Qırmızı Kitab Statusu:</span>
                        <span className="font-semibold text-amber-300">{currentSpecies.conservationStatusAz}</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Orta Çəki:</span>
                        <span className="font-mono text-white font-bold">{currentSpecies.averageAdultWeightKg} kq</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Bədən İstiliyi:</span>
                        <span className="font-mono text-emerald-400 font-bold">{currentSpecies.bodyTemperatureC}°C</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Faraların İşığına Reaksiyası:</span>
                        <span className="text-slate-200">{currentSpecies.headlightReactionBehaviorAz}</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/40">
                        <span className="text-red-300 block text-[11px] font-bold">ETSN Təzminat Dəyəri:</span>
                        <span className="font-mono font-black text-red-200 text-sm">
                          {formatCurrency(currentSpecies.statutoryFaunaCompensationAzn, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STOPPING PHYSICS & AVC RISK */}
          {activeTab === 'stopping_physics' && (
            <div className="space-y-6" data-testid="tab-stopping-physics">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Controls (5 Cols) */}
                <div className="lg:col-span-5 p-5 rounded-xl bg-slate-850 border border-slate-800 space-y-4">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <span>🛑</span>
                    <span>Hərəkət və Ətraf Şərait Göstəriciləri</span>
                  </h3>

                  {/* Vehicle Speed */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <label htmlFor={speedInputId} className="text-slate-300 font-medium">
                        Avtomobilin Sürəti:
                      </label>
                      <span className="font-mono text-emerald-400 font-bold">{vehicleSpeedKmH} km/s</span>
                    </div>
                    <input
                      id={speedInputId}
                      type="range"
                      min="30"
                      max="140"
                      step="5"
                      value={vehicleSpeedKmH}
                      onChange={(e) => setVehicleSpeedKmH(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                      data-testid="speed-slider"
                    />
                  </div>

                  {/* Driver Reaction Time */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <label htmlFor={reactionInputId} className="text-slate-300 font-medium">
                        Sürücünün Reaksiya Müddəti:
                      </label>
                      <span className="font-mono text-amber-400 font-bold">{driverReactionTimeSec} san</span>
                    </div>
                    <input
                      id={reactionInputId}
                      type="range"
                      min="0.6"
                      max="2.5"
                      step="0.1"
                      value={driverReactionTimeSec}
                      onChange={(e) => setDriverReactionTimeSec(Number(e.target.value))}
                      className="w-full accent-amber-500"
                      data-testid="reaction-slider"
                    />
                  </div>

                  {/* Lighting Condition */}
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">
                      Görmə və Faraların Vəziyyəti:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'daylight', label: 'Gündüz (120m)' },
                        { id: 'night_high_beam', label: 'Uzaq Far (95m)' },
                        { id: 'night_low_beam', label: 'Yaxın Far (40m)' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setLighting(item.id as LightingCondition)}
                          className={`p-2 rounded-lg text-xs font-semibold border transition ${
                            lighting === item.id
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                          data-testid={`lighting-btn-${item.id}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Surface Friction */}
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">
                      Yol Səthinin Sürtünməsi:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'dry_asphalt', label: 'Quru (μ=0.75)' },
                        { id: 'wet_rain', label: 'Yağış (μ=0.50)' },
                        { id: 'snow_ice', label: 'Qar/Buz (μ=0.20)' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSurface(item.id as RoadSurfaceFriction)}
                          className={`p-2 rounded-lg text-xs font-semibold border transition ${
                            surface === item.id
                              ? 'bg-amber-600 text-white border-amber-500'
                              : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                          data-testid={`surface-btn-${item.id}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Animal Species Select */}
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">
                      Yolda Qarşıya Çıxan Heyvan:
                    </label>
                    <select
                      value={selectedSpeciesId}
                      onChange={(e) => setSelectedSpeciesId(e.target.value as AnimalSpeciesId)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      data-testid="species-select"
                    >
                      {MOCK_ANIMAL_SPECIES.map((species) => (
                        <option key={species.id} value={species.id}>
                          {species.commonNameAz} ({species.averageAdultWeightKg} kq) —{' '}
                          {formatCurrency(species.statutoryFaunaCompensationAzn, currency)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Physics & Financial Results (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Verdict Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between ${
                      physicsResult.isCollisionAvoided
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                        : 'bg-red-950/50 border-red-500/60 text-red-200'
                    }`}
                    data-testid="collision-verdict-banner"
                  >
                    <div>
                      <div className="font-bold text-base flex items-center gap-2">
                        <span>{physicsResult.isCollisionAvoided ? '✅' : '💥'}</span>
                        <span>
                          {physicsResult.isCollisionAvoided
                            ? 'TOQQUŞMANIN QARŞISI ALINDI'
                            : 'KRİTİK TOQQUŞMA BAŞ VERDİ!'}
                        </span>
                      </div>
                      <p className="text-xs mt-1 text-slate-300">
                        {physicsResult.isCollisionAvoided
                          ? `Təhlükəsizlik ehtiyatı: +${physicsResult.safetyMarginM} metr. Heyvan qarşısında tam dayandı.`
                          : `Zərbə anındakı qalıq sürət: ${physicsResult.impactSpeedKmH} km/s. Kinetik enerji: ${physicsResult.kineticImpactJoules.toLocaleString()} J.`}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                        physicsResult.isCollisionAvoided
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {physicsResult.riskRating.toUpperCase()}
                    </span>
                  </div>

                  {/* Physics Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Görmə Məsafəsi:</span>
                      <span className="font-mono text-emerald-400 font-bold text-base">
                        {physicsResult.detectionDistanceM} m
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Reaksiya Məsafəsi:</span>
                      <span className="font-mono text-amber-400 font-bold text-base">
                        {physicsResult.reactionDistanceM} m
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Tormoz Məsafəsi:</span>
                      <span className="font-mono text-amber-400 font-bold text-base">
                        {physicsResult.brakingDistanceM} m
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Tam Dayanma:</span>
                      <span className="font-mono text-white font-bold text-base">
                        {physicsResult.totalStoppingDistanceM} m
                      </span>
                    </div>
                  </div>

                  {/* Financial Liability Card */}
                  <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                      Qanunvericilik üzrə Maddi Məsuliyyət və Cərimələr
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-300">ETSN Qırmızı Kitab Heyvan Təzminatı:</span>
                        <span className="font-mono font-bold text-red-400">
                          {formatCurrency(physicsResult.statutoryAnimalCompensationAzn, currency)}
                        </span>
                      </div>

                      <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-300">İXM 327.1 İnzibati Cərimə (50% endirimlə):</span>
                        <span className="font-mono text-amber-300">
                          {formatCurrency(physicsResult.promptDiscountFineAzn, currency)} (əsas: {physicsResult.administrativeFineAzn} AZN)
                        </span>
                      </div>

                      <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-300">Avtomobilə Dəyən Təxmini Zədə Xərci:</span>
                        <span className="font-mono text-slate-200">
                          {formatCurrency(physicsResult.estimatedVehicleDamageAzn, currency)}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-700/80 flex justify-between text-sm font-bold">
                        <span className="text-white">Cəmi Maliyyə Zərəri:</span>
                        <span className="font-mono text-red-300">
                          {formatCurrency(physicsResult.totalFinancialImpactAzn, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SAFETY CHECKLIST */}
          {activeTab === 'safety_checklist' && (
            <div className="space-y-6" data-testid="tab-safety-checklist">
              {/* Score Header */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white text-base">
                    10 Bəndlik Ekoloji və Texniki Təhlükəsizlik Yoxlaması
                  </h3>
                  <p className="text-xs text-slate-400">
                    AAYDA, ETSN və BDYP tərəfindən ekoloji dəhlizlər üçün təsdiqlənmiş meyarlar
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Uyğunluq Dərəcəsi:</span>
                    <span className="font-mono text-lg font-bold text-emerald-400">
                      {checklistResult.percentageScore}% ({checklistResult.checkedCount}/10)
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setCheckedChecklistIds(
                        checkedChecklistIds.length === 10
                          ? []
                          : WILDLIFE_SAFETY_CHECKLIST.map((item) => item.id)
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                    data-testid="toggle-all-checklist-btn"
                  >
                    {checkedChecklistIds.length === 10 ? 'Hamısını Sil' : 'Hamısını Seç'}
                  </button>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-3">
                {WILDLIFE_SAFETY_CHECKLIST.map((item, index) => {
                  const isChecked = checkedChecklistIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklistItem(item.id)}
                      className={`cursor-pointer p-3.5 rounded-xl border transition flex items-start gap-3 ${
                        isChecked
                          ? 'bg-slate-850 border-emerald-500/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                      data-testid={`checklist-item-${item.id}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Controlled by div click
                        className="mt-1 w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-white">
                            {index + 1}. {item.titleAz}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-400">
                            {item.statutoryReference}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{item.descriptionAz}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleIssueCertificate}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
                  data-testid="checklist-issue-cert-btn"
                >
                  <span>📜</span>
                  <span>Yoxlama Əsasında WILD-PASS Sertifikatı Al</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: EXAM SIMULATOR */}
          {activeTab === 'exam_simulator' && (
            <div className="space-y-6" data-testid="tab-exam-simulator">
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white text-base">
                    Dövlət Heyvanlar Aləmi və Ekoloji Yol Hərəkəti İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400">
                    Keçid balı: 80% (8/10). AR "Heyvanlar aləmi haqqında" Qanunu və Yol Hərəkəti Qaydaları
                  </p>
                </div>
                {examSubmitted && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                      examResult.isPassed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    NƏTİCƏ: {examResult.correctCount}/10 ({examResult.scorePercentage}%)
                  </span>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {WILDLIFE_EXAM_QUESTIONS.map((q) => {
                  const userAnswer = examAnswers[q.id];
                  const isAnswered = userAnswer !== undefined;
                  const isCorrect = isAnswered && userAnswer === q.correctAnswer;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-3"
                      data-testid={`exam-question-${q.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm text-white">
                          {q.id}. {q.questionAz}
                        </h4>
                        <span className="text-[10px] font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {q.legalCitation}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {q.optionsAz.map((option, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          let btnStyle = 'bg-slate-900/60 border-slate-700/70 text-slate-300 hover:border-slate-500';

                          if (examSubmitted) {
                            if (optIdx === q.correctAnswer) {
                              btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                            } else if (isSelected) {
                              btnStyle = 'bg-red-950/80 border-red-500 text-red-200';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-emerald-600/30 border-emerald-500 text-white font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleExamAnswer(q.id, optIdx)}
                              className={`p-2.5 rounded-lg border text-left text-xs transition ${btnStyle}`}
                              data-testid={`question-${q.id}-option-${optIdx}`}
                            >
                              <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)})</span>
                              <span>{option}</span>
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div
                          className={`p-2.5 rounded-lg text-xs mt-2 ${
                            isCorrect ? 'bg-emerald-950/30 text-emerald-300' : 'bg-red-950/30 text-red-300'
                          }`}
                        >
                          <span className="font-bold block mb-0.5">
                            {isCorrect ? '✅ Düzgündür!' : '❌ Səhvdir!'}
                          </span>
                          <span>{q.explanationAz}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit & Issue Certificate */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    setExamAnswers({});
                    setExamSubmitted(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
                  data-testid="reset-exam-btn"
                >
                  Cavabları Sıfırla
                </button>

                {!examSubmitted ? (
                  <button
                    onClick={() => setExamSubmitted(true)}
                    disabled={Object.keys(examAnswers).length < 10}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${
                      Object.keys(examAnswers).length === 10
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                    data-testid="submit-exam-btn"
                  >
                    İmtahanı Tamamla ({Object.keys(examAnswers).length}/10)
                  </button>
                ) : (
                  <button
                    onClick={handleIssueCertificate}
                    disabled={!examResult.isPassed}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
                      examResult.isPassed
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                    data-testid="exam-issue-cert-btn"
                  >
                    <span>📜</span>
                    <span>İmtahan Əsasında WILD-PASS Al ({examResult.scorePercentage}%)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: ISSUE CERTIFICATE */}
          {activeTab === 'issue_certificate' && (
            <div className="space-y-6" data-testid="tab-issue-certificate">
              {/* Top Form to generate / refresh */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Dövlət Qeydiyyat Nişanı:</label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-mono font-bold text-white uppercase"
                    data-testid="input-cert-plate"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Avtomobil Modeli:</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    data-testid="input-cert-model"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleIssueCertificate}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shadow"
                    data-testid="generate-cert-btn"
                  >
                    Şəhadətnaməni Yenilə / Ver ↻
                  </button>
                </div>
              </div>

              {/* Certificate Display */}
              {generatedCertificate ? (
                <div
                  className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/60 shadow-2xl space-y-5"
                  data-testid="wildlife-certificate-card"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/30 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600/30 border border-emerald-400/50 flex items-center justify-center text-3xl">
                        🦌
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                          AZƏRBAYCAN RESPUBLİKASI ETSN & AAYDA DÖVLƏT REYESTRİ
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white">
                          RƏSMİ WILD-PASS-AZ-2026 ELEKTRON KEÇİD SERTİFİKATI
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Şəhadətnamə №:</div>
                      <div className="font-mono font-bold text-emerald-400 text-sm">
                        {generatedCertificate.certificateNumber}
                      </div>
                    </div>
                  </div>

                  {/* Attributes Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Nəqliyyat Vasitəsi:</span>
                      <span className="font-bold text-white">{generatedCertificate.vehicleModel}</span>
                      <span className="font-mono text-emerald-400 block font-bold mt-0.5">
                        {generatedCertificate.vehiclePlate}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Təsdiqlənmiş Dəhliz:</span>
                      <span className="font-semibold text-slate-200">{generatedCertificate.corridorNameAz}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Şlaqbaum Keçid PIN:</span>
                      <span className="font-mono font-black text-amber-400 text-base">
                        {generatedCertificate.barrierReleasePin}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Maksimal Tövsiyə Sürət:</span>
                      <span className="font-mono font-bold text-white">
                        {generatedCertificate.assignedSpeedLimitKmH} km/s
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">SİMA Rəqəmsal İmza UID:</span>
                      <span className="font-mono text-emerald-300">{generatedCertificate.simaDigitalUid}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Etibarlılıq Müddəti:</span>
                      <span className="font-mono text-slate-300">
                        {generatedCertificate.issueDate} — {generatedCertificate.expiryDate}
                      </span>
                    </div>
                  </div>

                  {/* Security Checksum & Actions */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Kriptoqrafik İnteqrallıq Həşi:</span>
                      <span className="font-mono text-[11px] text-slate-300">
                        {generatedCertificate.cryptographicChecksum}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleCopyText(
                            generatedCertificate.certificateNumber,
                            'Sertifikat Nömrəsi'
                          )
                        }
                        className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                        data-testid="copy-cert-num-btn"
                      >
                        № Kopyala
                      </button>
                      <button
                        onClick={() =>
                          handleCopyText(
                            JSON.stringify(generatedCertificate, null, 2),
                            'Tam Şəhadətnamə Məlumatları'
                          )
                        }
                        className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                        data-testid="copy-cert-json-btn"
                      >
                        Sertifikatı Çap Et / Saxla
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-850 rounded-xl border border-dashed border-slate-700">
                  <p className="text-sm text-slate-400">
                    Hələlik şəhadətnamə generasiya edilməyib. Yuxarıdakı düyməni sıxaraq rəsmi WILD-PASS-AZ-2026 sertifikatını əldə edin.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: PUBLIC REGISTRY */}
          {activeTab === 'public_registry' && (
            <div className="space-y-6" data-testid="tab-public-registry">
              {/* Search Bar */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-[240px]">
                  <input
                    type="text"
                    placeholder="Reyestrdə axtarış: Nömrə, Qeydiyyat Nişanı və ya Dəhliz..."
                    value={registrySearchQuery}
                    onChange={(e) => setRegistrySearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500"
                    data-testid="registry-search-input"
                  />
                </div>
                <span className="text-xs text-slate-400">
                  Tapılan sənədlər: <strong className="text-emerald-400">{filteredRegistry.length}</strong>
                </span>
              </div>

              {/* Registry Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-850">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-3">Sertifikat №</th>
                      <th className="p-3">Qeydiyyat Nişanı</th>
                      <th className="p-3">Model</th>
                      <th className="p-3">Ekoloji Dəhliz</th>
                      <th className="p-3">PIN Kod</th>
                      <th className="p-3">Tarix</th>
                      <th className="p-3">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredRegistry.map((cert) => (
                      <tr key={cert.certificateNumber} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-bold text-emerald-400">{cert.certificateNumber}</td>
                        <td className="p-3 font-mono font-semibold text-white">{cert.vehiclePlate}</td>
                        <td className="p-3 text-slate-300">{cert.vehicleModel}</td>
                        <td className="p-3 text-slate-300 truncate max-w-[180px]">{cert.corridorNameAz}</td>
                        <td className="p-3 font-mono font-bold text-amber-400">{cert.barrierReleasePin}</td>
                        <td className="p-3 font-mono text-slate-400">{cert.issueDate}</td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              setGeneratedCertificate(cert);
                              setActiveTab('issue_certificate');
                            }}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold text-[11px] transition"
                            data-testid={`view-cert-btn-${cert.certificateNumber}`}
                          >
                            Baxış →
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

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>AAYDA SCADA & ETSN Qoruqlar İdarəsi Canlı Birləşmə Aktivdir</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            AR "Heyvanlar aləmi haqqında" Qanun Maddə 25 • İXM Maddə 327.1
          </div>
        </div>
      </div>
    </div>
  );
};
