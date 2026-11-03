import React, { useState, useMemo } from 'react';
import {
  Currency,
  REST_CURRENCY_SYMBOLS,
  VehicleCategory,
  DriverFatigueInput,
  FatigueAnalysis,
  RestAreaFacility,
  RestReservationRecord,
  calculateDriverFatigue,
  calculateParkingTariff,
  calculateStatutorySanctions,
  evaluateRestChecklist,
  evaluateRestExam,
  generateRestReservationRecord,
} from '../utils/restSafeCompliance';
import {
  MOCK_REST_FACILITIES,
  MOCK_DRIVER_PRESETS,
  MOCK_REST_CHECKLIST,
  MOCK_REST_EXAM_QUESTIONS,
  MOCK_RESERVATION_RECORDS,
  VehicleDriverPreset,
} from '../data/mockRestSafeData';

interface RestSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: Currency;
}

type ModalTab =
  | 'RADAR'
  | 'FATIGUE_TELEMETRY'
  | 'BOOKING_TARIFF'
  | 'CHECKLIST'
  | 'THEORY_EXAM'
  | 'CERTIFICATE_REGISTRY';

export const RestSafeModal: React.FC<RestSafeModalProps> = ({
  isOpen,
  onClose,
  currency = 'AZN',
}) => {
  // Active Tab
  const [activeTab, setActiveTab] = useState<ModalTab>('RADAR');

  // Facilities radar filters
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string>('ALL');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(MOCK_REST_FACILITIES[0].id);

  // Fatigue Telemetry State
  const [continuousHours, setContinuousHours] = useState<number>(4.2);
  const [restMinutes, setRestMinutes] = useState<number>(0);
  const [dailyHours, setDailyHours] = useState<number>(7.5);
  const [hoursAwake, setHoursAwake] = useState<number>(14.0);
  const [timeOfDay, setTimeOfDay] = useState<'DAY' | 'NIGHT' | 'POST_LUNCH'>('NIGHT');
  const [perclosPct, setPerclosPct] = useState<number>(11.5);
  const [steeringCorrections, setSteeringCorrections] = useState<number>(12);
  const [vehicleSpeedKmh, setVehicleSpeedKmh] = useState<number>(85);
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>('SEMI_TRAILER_TIR');
  const [shorePowerNeeded, setShorePowerNeeded] = useState<boolean>(true);
  const [illegalShoulderParking, setIllegalShoulderParking] = useState<boolean>(false);

  // Booking details
  const [bookingDurationHours, setBookingDurationHours] = useState<number>(8);
  const [bookingPlate, setBookingPlate] = useState<string>('99-RS-101');
  const [bookingDriverName, setBookingDriverName] = useState<string>('Elmar Məmmədov');
  const [bookingDriverFin, setBookingDriverFin] = useState<string>('5ABC123');
  const [bookingCompany, setBookingCompany] = useState<string>('Silk Way Logistics QSC');

  // Checklist state
  const [checklist, setChecklist] = useState(MOCK_REST_CHECKLIST);

  // Exam state
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Reservations Registry State
  const [reservations, setReservations] = useState<RestReservationRecord[]>(MOCK_RESERVATION_RECORDS);
  const [currentReservation, setCurrentReservation] = useState<RestReservationRecord | null>(
    MOCK_RESERVATION_RECORDS[0]
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  // Active facility reference
  const selectedFacility = useMemo(() => {
    return (
      MOCK_REST_FACILITIES.find((f) => f.id === selectedFacilityId) || MOCK_REST_FACILITIES[0]
    );
  }, [selectedFacilityId]);

  // Derived fatigue analysis
  const fatigueInput: DriverFatigueInput = useMemo(() => {
    return {
      continuousDrivingHours: continuousHours,
      restTakenMinutes: restMinutes,
      dailyDrivingHours: dailyHours,
      hoursAwake,
      timeOfDay,
      perclosPct,
      steeringCorrectionsPerMin: steeringCorrections,
      vehicleSpeedKmh,
      vehicleCategory,
      shorePowerNeeded,
      parkingDurationHours: bookingDurationHours,
    };
  }, [
    continuousHours,
    restMinutes,
    dailyHours,
    hoursAwake,
    timeOfDay,
    perclosPct,
    steeringCorrections,
    vehicleSpeedKmh,
    vehicleCategory,
    shorePowerNeeded,
    bookingDurationHours,
  ]);

  const fatigueAnalysis: FatigueAnalysis = useMemo(() => {
    return calculateDriverFatigue(fatigueInput);
  }, [fatigueInput]);

  // Derived tariff
  const parkingTariff = useMemo(() => {
    return calculateParkingTariff(bookingDurationHours, shorePowerNeeded, vehicleCategory);
  }, [bookingDurationHours, shorePowerNeeded, vehicleCategory]);

  // Derived fines
  const statutorySanctions = useMemo(() => {
    return calculateStatutorySanctions(fatigueAnalysis, illegalShoulderParking);
  }, [fatigueAnalysis, illegalShoulderParking]);

  // Derived checklist score
  const checklistResult = useMemo(() => {
    return evaluateRestChecklist(checklist);
  }, [checklist]);

  // Derived exam evaluation
  const examResult = useMemo(() => {
    return evaluateRestExam(MOCK_REST_EXAM_QUESTIONS, examAnswers);
  }, [examAnswers]);

  // Filtered facilities
  const filteredFacilities = useMemo(() => {
    if (selectedRouteFilter === 'ALL') return MOCK_REST_FACILITIES;
    return MOCK_REST_FACILITIES.filter((f) => f.routeNumber === selectedRouteFilter);
  }, [selectedRouteFilter]);

  // Filtered registry
  const filteredReservations = useMemo(() => {
    if (!searchQuery.trim()) return reservations;
    const q = searchQuery.toLowerCase().trim();
    return reservations.filter(
      (r) =>
        r.certificateNumber.toLowerCase().includes(q) ||
        r.vehiclePlate.toLowerCase().includes(q) ||
        r.driverName.toLowerCase().includes(q) ||
        r.restAreaName.toLowerCase().includes(q) ||
        r.driverFin.toLowerCase().includes(q)
    );
  }, [reservations, searchQuery]);

  if (!isOpen) return null;

  // Apply Driver Preset
  const handleApplyPreset = (preset: VehicleDriverPreset) => {
    setBookingPlate(preset.plate);
    setVehicleCategory(preset.category);
    setBookingDriverName(preset.driverName);
    setBookingDriverFin(preset.driverFin);
    setBookingCompany(preset.companyName);
    setContinuousHours(preset.continuousHours);
    setRestMinutes(preset.restMinutes);
    setDailyHours(preset.dailyHours);
    setHoursAwake(preset.hoursAwake);
    setTimeOfDay(preset.timeOfDay);
    setPerclosPct(preset.perclosPct);
    setSteeringCorrections(preset.steeringCorrectionsPerMin);
    setVehicleSpeedKmh(preset.vehicleSpeedKmh);
    setShorePowerNeeded(preset.shorePowerNeeded);
  };

  // Toggle checklist
  const handleToggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, passed: !item.passed } : item))
    );
  };

  const handleSelectAllChecklist = (val: boolean) => {
    setChecklist((prev) => prev.map((item) => ({ ...item, passed: val })));
  };

  // Exam answers
  const handleAnswerExam = (qId: string, optIndex: number) => {
    setExamAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  // Synthesized Web Audio Alert Tone
  const playAlarmSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio not supported in test environment
    }
  };

  // Create Reservation
  const handleCreateReservation = () => {
    const record = generateRestReservationRecord(
      selectedFacility,
      bookingPlate,
      vehicleCategory,
      bookingDriverName,
      bookingDriverFin,
      bookingCompany,
      bookingDurationHours,
      shorePowerNeeded
    );
    setReservations((prev) => [record, ...prev]);
    setCurrentReservation(record);
    setActiveTab('CERTIFICATE_REGISTRY');
  };

  // Copy code helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedMessage(`${label} kopyalandı!`);
    setTimeout(() => setCopiedMessage(null), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-slate-100">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 px-5 py-4 border-b border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 text-2xl shadow-inner">
              🛏️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  AAYDA • AYNA • BDYP
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono">
                  SSTPA • AETR • REST-SAFE-AZ-2026
                </span>
              </div>
              <h2
                id="modal-title"
                className="text-base sm:text-lg font-bold text-white flex items-center space-x-2 mt-0.5"
              >
                <span>Magistral Yol İstirahət Zonaları & Sürücü Yorğunluğu SCADA Portalı</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              SCADA CANLI
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors border border-slate-700"
              aria-label="Bağla"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-4 py-2 flex items-center space-x-1 sm:space-x-2 overflow-x-auto text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('RADAR')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'RADAR'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>🗺️</span>
            <span>İstirahət Məntəqələri Radarı</span>
          </button>
          <button
            onClick={() => setActiveTab('FATIGUE_TELEMETRY')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'FATIGUE_TELEMETRY'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>⏱️</span>
            <span>AETR & Yorğunluq Standı</span>
          </button>
          <button
            onClick={() => setActiveTab('BOOKING_TARIFF')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'BOOKING_TARIFF'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>🎫</span>
            <span>Rezervasiya & Tariflər</span>
          </button>
          <button
            onClick={() => setActiveTab('CHECKLIST')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'CHECKLIST'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>📋</span>
            <span>SSTPA Texniki Standartlar</span>
          </button>
          <button
            onClick={() => setActiveTab('THEORY_EXAM')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'THEORY_EXAM'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>🎓</span>
            <span>AETR Nəzəri İmtahan</span>
          </button>
          <button
            onClick={() => setActiveTab('CERTIFICATE_REGISTRY')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'CERTIFICATE_REGISTRY'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>🏛️</span>
            <span>E-Vauçer & Reyestr</span>
          </button>
        </div>

        {/* Notification Toast */}
        {copiedMessage && (
          <div className="bg-emerald-500/90 text-slate-900 font-semibold text-center text-xs py-1.5 px-4 shadow-lg animate-fadeIn">
            ✓ {copiedMessage}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: RADAR (FACILITIES OVERVIEW) */}
          {activeTab === 'RADAR' && (
            <div className="space-y-6">
              {/* Filter Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/60">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Magistral Dəhliz:</span>
                  {['ALL', 'M-1', 'M-2', 'M-3', 'M-4', 'ZY'].map((rt) => (
                    <button
                      key={rt}
                      onClick={() => setSelectedRouteFilter(rt)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                        selectedRouteFilter === rt
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {rt === 'ALL' ? 'Hamısı' : rt}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-slate-400">
                  Cəmi 6 strateji AAYDA/AYNA kompleksi • EU SSTPA Standartı
                </div>
              </div>

              {/* Grid of Rest Facilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFacilities.map((fac) => {
                  const isSelected = fac.id === selectedFacilityId;
                  const isFull = fac.liveOccupancyPct >= 95;
                  return (
                    <div
                      key={fac.id}
                      onClick={() => setSelectedFacilityId(fac.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-800/90 border-emerald-500/80 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                            {fac.routeNumber} • {fac.picketKm}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              fac.sstpaTier === 'PLATINUM'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                                : fac.sstpaTier === 'GOLD'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : fac.sstpaTier === 'SILVER'
                                ? 'bg-slate-300/20 text-slate-200 border border-slate-400/40'
                                : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                            }`}
                          >
                            SSTPA {fac.sstpaTier}
                          </span>
                        </div>

                        <h3 className="font-bold text-white text-sm mb-1">{fac.nameAz}</h3>
                        <p className="text-xs text-slate-400 mb-3">{fac.corridor}</p>

                        {/* Occupancy bar */}
                        <div className="space-y-1 mb-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">TIR Doluluğu:</span>
                            <span
                              className={`font-mono font-bold ${
                                isFull ? 'text-red-400' : 'text-emerald-400'
                              }`}
                            >
                              {fac.occupiedTirBays} / {fac.totalTirBays} ({fac.liveOccupancyPct}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                isFull
                                  ? 'bg-red-500'
                                  : fac.liveOccupancyPct > 80
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, fac.liveOccupancyPct)}%` }}
                            />
                          </div>
                        </div>

                        {/* Shore power status */}
                        <div className="flex items-center justify-between text-xs bg-slate-900/60 p-2 rounded-lg border border-slate-700/50 mb-3">
                          <span className="text-slate-400 flex items-center space-x-1">
                            <span>🔌</span>
                            <span>Reefer 400V Elektrik:</span>
                          </span>
                          <span className="font-mono text-teal-300 font-bold">
                            {fac.shorePowerPlugsTotal - fac.shorePowerPlugsOccupied} boş /{' '}
                            {fac.shorePowerPlugsTotal} post
                          </span>
                        </div>

                        {/* Amenities badges */}
                        <div className="flex flex-wrap gap-1 text-[11px] text-slate-300">
                          {fac.amenities.motelBeds > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-700/60 border border-slate-600/50">
                              🛏️ {fac.amenities.motelBeds} yer
                            </span>
                          )}
                          {fac.amenities.showers && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-700/60 border border-slate-600/50">
                              🚿 Duş
                            </span>
                          )}
                          {fac.amenities.canteen24h && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-700/60 border border-slate-600/50">
                              🍽️ 24/7 Yemək
                            </span>
                          )}
                          {fac.amenities.mosque && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-700/60 border border-slate-600/50">
                              🕌 Məscid
                            </span>
                          )}
                          {fac.amenities.cctvSecurity24h && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-700/60 border border-slate-600/50">
                              📹 CCTV
                            </span>
                          )}
                          {fac.amenities.fuelStationSocar && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-700/60 border border-slate-600/50 text-blue-300">
                              ⛽ SOCAR
                            </span>
                          )}
                          {fac.amenities.evChargersHpc > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-700/60 border border-slate-600/50 text-emerald-300">
                              ⚡ HPC ({fac.amenities.evChargersHpc})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold ${
                            fac.status === 'OPEN_AVAILABLE'
                              ? 'text-emerald-400'
                              : fac.status === 'HIGH_OCCUPANCY'
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {fac.status === 'OPEN_AVAILABLE'
                            ? '● Boş yerlər mövcuddur'
                            : fac.status === 'HIGH_OCCUPANCY'
                            ? '▲ Yüksək doluluq'
                            : '✕ Dolu / Yönləndirilir'}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFacilityId(fac.id);
                            setActiveTab('BOOKING_TARIFF');
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                        >
                          Rezerv et →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Highway Corridor Overview Alert */}
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex items-start space-x-3">
                <div className="text-2xl">🛡️</div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-white text-sm">
                    AAYDA & BDYP Təhlükəsiz Magistral Şəbəkəsi Xəbərdarlığı:
                  </div>
                  <div>
                    Azərbaycan Respublikasının "Avtomobil Yolları Haqqında" Qanununun 29-cu maddəsinə
                    və YHQ 50-ci maddəsinə əsasən, magistral yolların hərəkət hissəsində və ya yol
                    çiynində nasazlıq olmadan dayanmaq, dincəlmək və ya yatmaq qadağandır (İXM Maddə
                    346: 40 AZN cərimə). Sürücülər AETR 4.5 saatlıq fasilələrini rəsmi SSTPA
                    sertifikatlı istirahət vahalarında keçirməlidir.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FATIGUE TELEMETRY STAND */}
          {activeTab === 'FATIGUE_TELEMETRY' && (
            <div className="space-y-6">
              {/* Presets Header */}
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-2">
                <div className="text-xs font-semibold text-slate-300">
                  🚗 Sürətli Sürücü & Nəqliyyat Presetləri:
                </div>
                <div className="flex flex-wrap gap-2">
                  {MOCK_DRIVER_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleApplyPreset(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        bookingPlate === p.plate
                          ? 'bg-emerald-600 text-white border-emerald-400 font-bold shadow-md'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <span className="font-mono font-bold mr-1">{p.plate}</span>
                      <span>({p.vehicleModel.split(' ')[0]})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Two Column Layout: Sliders vs Telemetry Screen */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sliders Control Panel */}
                <div className="lg:col-span-6 space-y-4 bg-slate-800/30 p-4 rounded-xl border border-slate-700/60">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center justify-between">
                    <span>🎛️ Rəqəmsal Taxoqraf & Telemetriya Parametrləri</span>
                    <button
                      onClick={playAlarmSound}
                      className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-xs hover:bg-slate-600 flex items-center space-x-1"
                      title="Səsli həyəcan siqnalını sınaqdan keçir"
                    >
                      <span>🔊</span>
                      <span>Səs Testi</span>
                    </button>
                  </h3>

                  {/* Continuous Driving Hours */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Fasiləsiz İdarəetmə Müddəti:</span>
                      <span
                        className={`font-mono font-bold ${
                          continuousHours > 4.5 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {continuousHours.toFixed(1)} saat (AETR max 4.5h)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="8.0"
                      step="0.1"
                      value={continuousHours}
                      onChange={(e) => setContinuousHours(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  {/* Rest Taken */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Götürülmüş İstirahət Fasiləsi:</span>
                      <span className="font-mono text-teal-300 font-bold">
                        {restMinutes} dəqiqə (AETR req 45m)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      step="5"
                      value={restMinutes}
                      onChange={(e) => setRestMinutes(parseInt(e.target.value, 10))}
                      className="w-full accent-teal-500"
                    />
                  </div>

                  {/* Daily Driving Hours */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Gündəlik İdarəetmə (Daily Driving):</span>
                      <span
                        className={`font-mono font-bold ${
                          dailyHours > 9.0 ? 'text-red-400' : 'text-emerald-400'
                        }`}
                      >
                        {dailyHours.toFixed(1)} saat (AETR max 9.0h)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="12.0"
                      step="0.2"
                      value={dailyHours}
                      onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  {/* Hours Awake */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Oyaq Qalma Müddəti (Sleep Deprivation):</span>
                      <span className="font-mono text-amber-300 font-bold">
                        {hoursAwake.toFixed(1)} saat
                      </span>
                    </div>
                    <input
                      type="range"
                      min="4.0"
                      max="24.0"
                      step="0.5"
                      value={hoursAwake}
                      onChange={(e) => setHoursAwake(parseFloat(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  {/* Time of Day */}
                  <div>
                    <span className="text-xs text-slate-300 block mb-1">
                      Günün Vaxtı (Sirkad Ritm Təsiri):
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'DAY', label: '☀️ Gündüz (1.0x)' },
                        { key: 'POST_LUNCH', label: '🍲 Nahar sonrası (1.2x)' },
                        { key: 'NIGHT', label: '🌙 Gecə (1.45x Risk)' },
                      ].map((item) => (
                        <button
                          key={item.key}
                          onClick={() => setTimeOfDay(item.key as 'DAY' | 'NIGHT' | 'POST_LUNCH')}
                          className={`py-1.5 px-2 rounded text-xs font-semibold border ${
                            timeOfDay === item.key
                              ? 'bg-emerald-600 text-white border-emerald-400'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PERCLOS & Steering */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">PERCLOS (Göz Qapanması):</span>
                        <span
                          className={`font-mono font-bold ${
                            perclosPct >= 15
                              ? 'text-red-400'
                              : perclosPct >= 8
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {perclosPct.toFixed(1)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="0.5"
                        value={perclosPct}
                        onChange={(e) => setPerclosPct(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Sükan Düzəlişləri:</span>
                        <span className="font-mono text-cyan-300 font-bold">
                          {steeringCorrections}/dəq
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="40"
                        step="1"
                        value={steeringCorrections}
                        onChange={(e) => setSteeringCorrections(parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Vehicle Speed */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">Nəqliyyatın Sürəti:</span>
                      <span className="font-mono text-white font-bold">{vehicleSpeedKmh} km/saat</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="130"
                      step="5"
                      value={vehicleSpeedKmh}
                      onChange={(e) => setVehicleSpeedKmh(parseInt(e.target.value, 10))}
                      className="w-full accent-slate-400"
                    />
                  </div>

                  {/* Illegal Shoulder Parking Checkbox */}
                  <div className="pt-2 border-t border-slate-700/60">
                    <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={illegalShoulderParking}
                        onChange={(e) => setIllegalShoulderParking(e.target.checked)}
                        className="rounded accent-red-500 w-4 h-4"
                      />
                      <span>
                        Sürücü magistral yol çiynində və ya zolaqda qanunsuz dayanıb (İXM 346: 40 AZN
                        cərimə riski)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Live Telemetry Display & Animated SVG */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Status Gauges Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* AETR Status */}
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/70">
                      <span className="text-[11px] text-slate-400 block">AETR Hüquqi Statusu</span>
                      <span
                        className={`text-sm font-bold block mt-1 ${
                          fatigueAnalysis.aetrStatus === 'COMPLIANT'
                            ? 'text-emerald-400'
                            : fatigueAnalysis.aetrStatus === 'WARNING_NEAR_LIMIT'
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {fatigueAnalysis.aetrStatus === 'COMPLIANT'
                          ? '✓ UYĞUNDUR'
                          : fatigueAnalysis.aetrStatus === 'WARNING_NEAR_LIMIT'
                          ? '▲ LİMİTƏ YAXIN'
                          : '✕ QANUNSUZ AŞMA'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {fatigueAnalysis.minutesUntilMandatoryBreak > 0
                          ? `Fasiləyə: ${fatigueAnalysis.minutesUntilMandatoryBreak} dəq`
                          : 'Fasilə vaxtı keçib!'}
                      </span>
                    </div>

                    {/* Fatigue Score */}
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/70">
                      <span className="text-[11px] text-slate-400 block">Yorğunluq İndeksi</span>
                      <span
                        className={`text-xl font-mono font-bold block mt-0.5 ${
                          fatigueAnalysis.fatigueScorePct >= 80
                            ? 'text-red-400'
                            : fatigueAnalysis.fatigueScorePct >= 55
                            ? 'text-orange-400'
                            : fatigueAnalysis.fatigueScorePct >= 30
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {fatigueAnalysis.fatigueScorePct}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        {fatigueAnalysis.fatigueLevel}
                      </span>
                    </div>

                    {/* Reaction Time */}
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/70 col-span-2 sm:col-span-1">
                      <span className="text-[11px] text-slate-400 block">Reaksiya Müddəti</span>
                      <span className="text-sm font-mono font-bold text-cyan-300 block mt-1">
                        {fatigueAnalysis.reactionTimeDegradedSec} san
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Baza 1.0s (+{Math.round((fatigueAnalysis.reactionTimeDegradedSec - 1.0) * 100)}
                        %)
                      </span>
                    </div>
                  </div>

                  {/* Animated SVG Simulation Canvas */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                    <div className="text-xs text-slate-400 font-semibold mb-2 flex justify-between items-center">
                      <span>Dinamik Əyləc & Təhlükəsizlik Məsafəsi Simulyatoru:</span>
                      <span className="font-mono text-emerald-400">
                        Cəmi Dayandı: {fatigueAnalysis.totalStoppingDistanceMeters}m (+
                        {fatigueAnalysis.stoppingDistanceIncreasePct}%)
                      </span>
                    </div>

                    <svg viewBox="0 0 500 180" className="w-full h-auto bg-slate-900/80 rounded-lg">
                      {/* Road Lane Lines */}
                      <line
                        x1="20"
                        y1="40"
                        x2="480"
                        y2="40"
                        stroke="#475569"
                        strokeWidth="2"
                        strokeDasharray="8 6"
                      />
                      <line x1="20" y1="140" x2="480" y2="140" stroke="#64748b" strokeWidth="3" />

                      {/* Moving Vehicle Cabin Silhouette */}
                      <g transform="translate(30, 60)">
                        <rect
                          x="0"
                          y="10"
                          width="70"
                          height="45"
                          rx="6"
                          fill="#047857"
                          stroke="#10b981"
                          strokeWidth="2"
                        />
                        <rect x="45" y="15" width="22" height="20" rx="3" fill="#67e8f9" opacity="0.8" />
                        {/* Wheels */}
                        <circle cx="15" cy="58" r="9" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                        <circle cx="55" cy="58" r="9" fill="#0f172a" stroke="#475569" strokeWidth="2" />
                        {/* Eye icon in cabin */}
                        <circle cx="56" cy="25" r="4" fill="#0f172a" />
                        <circle
                          cx="56"
                          cy="25"
                          r={perclosPct > 15 ? 1 : 2.5}
                          fill={perclosPct > 15 ? '#ef4444' : '#10b981'}
                        />
                      </g>

                      {/* Stopping distance bar */}
                      <g transform="translate(110, 80)">
                        {/* Reaction distance bar */}
                        <rect
                          x="0"
                          y="5"
                          width={Math.min(180, fatigueAnalysis.reactionDistanceMeters * 2.5)}
                          height="14"
                          rx="3"
                          fill="#f59e0b"
                          opacity="0.85"
                        />
                        <text
                          x="6"
                          y="16"
                          fill="#ffffff"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          Reaksiya: {fatigueAnalysis.reactionDistanceMeters}m
                        </text>

                        {/* Braking distance bar */}
                        <rect
                          x={Math.min(180, fatigueAnalysis.reactionDistanceMeters * 2.5)}
                          y="5"
                          width={Math.min(180, fatigueAnalysis.brakingDistanceMeters * 2.2)}
                          height="14"
                          rx="3"
                          fill="#ef4444"
                          opacity="0.85"
                        />
                        <text
                          x={Math.min(180, fatigueAnalysis.reactionDistanceMeters * 2.5) + 6}
                          y="16"
                          fill="#ffffff"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          Əyləc: {fatigueAnalysis.brakingDistanceMeters}m
                        </text>
                      </g>

                      {/* Stopping distance comparison marker */}
                      <line
                        x1={Math.min(
                          460,
                          110 +
                            fatigueAnalysis.reactionDistanceMeters * 2.5 +
                            fatigueAnalysis.brakingDistanceMeters * 2.2
                        )}
                        y1="60"
                        x2={Math.min(
                          460,
                          110 +
                            fatigueAnalysis.reactionDistanceMeters * 2.5 +
                            fatigueAnalysis.brakingDistanceMeters * 2.2
                        )}
                        y2="135"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                      />

                      {/* Rest area exit icon on right */}
                      <g transform="translate(420, 50)">
                        <rect
                          x="0"
                          y="0"
                          width="50"
                          height="35"
                          rx="5"
                          fill="#1e293b"
                          stroke="#38bdf8"
                          strokeWidth="2"
                        />
                        <text
                          x="25"
                          y="16"
                          textAnchor="middle"
                          fill="#38bdf8"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          REST
                        </text>
                        <text
                          x="25"
                          y="28"
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="8"
                          fontWeight="bold"
                        >
                          TIR 500m
                        </text>
                      </g>
                    </svg>

                    {/* Recommended action text */}
                    <div className="mt-2 p-2.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300">
                      <span className="font-bold text-emerald-400">Tövsiyə olunan addım: </span>
                      {fatigueAnalysis.recommendedActionAz}
                    </div>
                  </div>

                  {/* Statutory Fine Breakdown */}
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300">Hüquqi Məsuliyyət & İXM Cərimələri:</span>
                      <span className="text-amber-400 font-mono font-bold">
                        {statutorySanctions.totalFineDiscountedAzn}{' '}
                        {REST_CURRENCY_SYMBOLS[currency]} (50% endirimlə)
                      </span>
                    </div>

                    <div className="space-y-1">
                      {statutorySanctions.legalArticles.map((art, idx) => (
                        <div
                          key={idx}
                          className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800"
                        >
                          {art}
                        </div>
                      ))}
                    </div>

                    {statutorySanctions.demeritPoints > 0 && (
                      <div className="text-xs text-red-400 font-semibold">
                        ⚠️ Sürücüyə cəmi {statutorySanctions.demeritPoints} cərimə balı təyin edilə bilər.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BOOKING & TARIFFS */}
          {activeTab === 'BOOKING_TARIFF' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Inputs */}
                <div className="lg:col-span-7 space-y-4 bg-slate-800/30 p-5 rounded-xl border border-slate-700/60">
                  <h3 className="text-sm font-bold text-emerald-400">
                    📝 AAYDA & AYNA Təhlükəsiz Parklanma Yeri Rezervasiyası
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Facility Selector */}
                    <div className="sm:col-span-2">
                      <label className="text-xs text-slate-300 block mb-1">
                        Seçilmiş İstirahət Kompleksi:
                      </label>
                      <select
                        value={selectedFacilityId}
                        onChange={(e) => setSelectedFacilityId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        {MOCK_REST_FACILITIES.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.nameAz} ({f.routeNumber} • {f.picketKm}) - SSTPA {f.sstpaTier}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Vehicle Plate */}
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Dövlət Qeydiyyat Nişanı:</label>
                      <input
                        type="text"
                        value={bookingPlate}
                        onChange={(e) => setBookingPlate(e.target.value.toUpperCase())}
                        placeholder="Məs: 99-RS-101"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Vehicle Category */}
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Nəqliyyat Kateqoriyası:</label>
                      <select
                        value={vehicleCategory}
                        onChange={(e) => setVehicleCategory(e.target.value as VehicleCategory)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="SEMI_TRAILER_TIR">Yəhərli Dartıcı TIR (Semi-trailer)</option>
                        <option value="RIGID_HEAVY_TRUCK">Ağır Yük Avtomobili (Rigid)</option>
                        <option value="INTERCITY_COACH">Şəhərlərarası Avtobus (Coach)</option>
                        <option value="LIGHT_COMMERCIAL_VAN">Yüngül Kommersiya (Van)</option>
                        <option value="PASSENGER_CAR">Minik Avtomobili (Car)</option>
                      </select>
                    </div>

                    {/* Driver Name */}
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Sürücünün Adı, Soyadı:</label>
                      <input
                        type="text"
                        value={bookingDriverName}
                        onChange={(e) => setBookingDriverName(e.target.value)}
                        placeholder="Elmar Məmmədov"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Driver FIN */}
                    <div>
                      <label className="text-xs text-slate-300 block mb-1">Sürücü FİN Kodu:</label>
                      <input
                        type="text"
                        value={bookingDriverFin}
                        onChange={(e) => setBookingDriverFin(e.target.value.toUpperCase())}
                        placeholder="5ABC123"
                        maxLength={7}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Company */}
                    <div className="sm:col-span-2">
                      <label className="text-xs text-slate-300 block mb-1">Daşıyıcı Şirkət (VÖEN / Ad):</label>
                      <input
                        type="text"
                        value={bookingCompany}
                        onChange={(e) => setBookingCompany(e.target.value)}
                        placeholder="Silk Way Logistics QSC"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Duration slider */}
                    <div className="sm:col-span-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Parklanma Müddəti (saat):</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {bookingDurationHours} saat (İlk 2 saat pulsuzdur)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="24"
                        step="1"
                        value={bookingDurationHours}
                        onChange={(e) => setBookingDurationHours(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    {/* Shore Power Toggle */}
                    <div className="sm:col-span-2 bg-slate-900/60 p-3 rounded-lg border border-slate-700">
                      <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shorePowerNeeded}
                          onChange={(e) => setShorePowerNeeded(e.target.checked)}
                          className="rounded accent-emerald-500 w-4 h-4"
                        />
                        <span className="font-semibold text-white">
                          400V / 32A Soyuducu (Reefer) Şəbəkəsinə Qoşulma (0.80 ₼/saat)
                        </span>
                      </label>
                      <p className="text-[11px] text-slate-400 ml-6 mt-0.5">
                        Dizel aqreqatını söndürməyə imkan verir, səs-küyü və CO₂ emissiyasını sıfırlayır.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tariff Summary Card */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-5 rounded-xl border border-slate-700 shadow-xl space-y-4">
                    <div className="border-b border-slate-700 pb-3">
                      <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                        Rəsmi Dövlət Tarifi
                      </span>
                      <h4 className="text-lg font-bold text-white mt-1">
                        Ödəniş & Xidmət Hesabı
                      </h4>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ümumi Müddət:</span>
                        <span className="font-mono text-white font-bold">
                          {parkingTariff.durationHours} saat
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Qanuni Pulsuz Fasilə:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {parkingTariff.freeHours} saat (0.00 ₼)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ödənişli Saatlar:</span>
                        <span className="font-mono text-white font-bold">
                          {parkingTariff.billableHours} saat
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Parklanma Haqqı:</span>
                        <span className="font-mono text-white font-bold">
                          {parkingTariff.parkingFeeAzn.toFixed(2)} ₼
                        </span>
                      </div>
                      {shorePowerNeeded && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Reefer Elektrik Qoşulması:</span>
                          <span className="font-mono text-teal-300 font-bold">
                            {parkingTariff.shorePowerFeeAzn.toFixed(2)} ₼
                          </span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-700 flex justify-between items-baseline">
                        <span className="font-bold text-slate-200">Yekun Məbləğ:</span>
                        <div className="text-right">
                          <span className="text-2xl font-mono font-bold text-emerald-400">
                            {parkingTariff.totalFeeAzn.toFixed(2)}{' '}
                            {REST_CURRENCY_SYMBOLS[currency]}
                          </span>
                          <div className="text-[11px] text-slate-400 font-mono">
                            ≈ ${parkingTariff.totalFeeUsd.toFixed(2)} / €
                            {parkingTariff.totalFeeEur.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Included services */}
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-[11px] font-bold text-emerald-300 block mb-1">
                        Daxil olan xidmətlər:
                      </span>
                      {parkingTariff.amenitiesIncluded.map((am, i) => (
                        <div key={i} className="text-[11px] text-slate-300 flex items-center space-x-1.5">
                          <span className="text-emerald-400">✓</span>
                          <span>{am}</span>
                        </div>
                      ))}
                    </div>

                    {/* Submit reservation button */}
                    <button
                      onClick={handleCreateReservation}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>🎫</span>
                      <span>Rezervasiya Et & Elektron Vauçer Al</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SSTPA CHECKLIST */}
          {activeTab === 'CHECKLIST' && (
            <div className="space-y-6">
              {/* Score Header */}
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">SSTPA Uyğunluq Dərəcəsi:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-2xl font-mono font-bold text-emerald-400">
                      {checklistResult.scorePct}%
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        checklistResult.sstpaAchievedTier === 'PLATINUM'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          : checklistResult.sstpaAchievedTier === 'GOLD'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-400/20 text-slate-200 border border-slate-400/40'
                      }`}
                    >
                      SSTPA {checklistResult.sstpaAchievedTier} TİER
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSelectAllChecklist(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold border border-emerald-500/40 transition-colors"
                  >
                    Hamısını Seç
                  </button>
                  <button
                    onClick={() => handleSelectAllChecklist(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-650 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Checklist items */}
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                      item.passed
                        ? 'bg-slate-800/60 border-emerald-500/50 shadow-sm'
                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.passed}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="mt-1 rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {item.code}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {item.points} bal
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-white mt-0.5">{item.titleAz}</div>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                        Standart: {item.standardRef}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: THEORY EXAM */}
          {activeTab === 'THEORY_EXAM' && (
            <div className="space-y-6">
              {/* Header result */}
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-bold text-white text-sm">
                    AETR Sürücü İstirahət Rejimi & Magistral Parklanma İmtahanı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    10 sualdan ən azı 8-nə düzgün cavab verilməlidir (80% keçid həddi).
                  </p>
                </div>

                {examSubmitted && (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-mono font-bold text-white">
                      Nəticə: {examResult.score} / {examResult.total} ({examResult.percentage}%)
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        examResult.passed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {examResult.passed ? '✓ İMTAHANI KEÇDİ' : '✕ KƏSİLDİ'}
                    </span>
                  </div>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {MOCK_REST_EXAM_QUESTIONS.map((q, qIndex) => {
                  const userAnswer = examAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/60 space-y-3"
                    >
                      <div className="flex items-start space-x-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-xs font-bold font-mono">
                          {qIndex + 1}
                        </span>
                        <div className="flex-1 font-semibold text-xs sm:text-sm text-white">
                          {q.questionAz}
                        </div>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.optionsAz.map((opt, optIndex) => {
                          const isSelected = userAnswer === optIndex;
                          let btnStyle =
                            'bg-slate-850 hover:bg-slate-750 text-slate-300 border-slate-700';
                          if (isSelected) {
                            btnStyle = 'bg-emerald-600/40 text-emerald-200 border-emerald-500';
                          }
                          if (examSubmitted) {
                            if (optIndex === q.correctAnswer) {
                              btnStyle = 'bg-emerald-600 text-white border-emerald-400 font-bold';
                            } else if (isSelected && optIndex !== q.correctAnswer) {
                              btnStyle = 'bg-red-600 text-white border-red-400';
                            }
                          }

                          return (
                            <button
                              key={optIndex}
                              onClick={() => handleAnswerExam(q.id, optIndex)}
                              className={`p-2.5 rounded-lg text-xs text-left border transition-all ${btnStyle}`}
                            >
                              <span className="font-bold mr-2 font-mono">
                                {String.fromCharCode(65 + optIndex)})
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation if submitted */}
                      {examSubmitted && (
                        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                          <div className="font-bold text-emerald-400">
                            Hüquqi Əsaslandırma ({q.legalCitation}):
                          </div>
                          <div>{q.explanationAz}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit exam button */}
              <div className="text-center pt-2">
                <button
                  onClick={() => setExamSubmitted(true)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors"
                >
                  {examSubmitted ? 'Yenidən Qiymətləndir' : 'İmtahanı Tamamla & Yoxla'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: E-VOUCHER & PUBLIC REGISTRY */}
          {activeTab === 'CERTIFICATE_REGISTRY' && (
            <div className="space-y-6">
              {/* Active Voucher Display */}
              {currentReservation && (
                <div className="bg-gradient-to-b from-slate-850 via-slate-900 to-slate-950 p-6 rounded-2xl border-2 border-emerald-500/50 shadow-2xl relative">
                  {/* Watermark badge */}
                  <div className="absolute right-6 top-6 opacity-10 text-7xl select-none pointer-events-none">
                    🛏️
                  </div>

                  {/* Voucher Header */}
                  <div className="border-b border-slate-700/80 pb-4 mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 text-2xl">
                        🇦🇿
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                          Azərbaycan Respublikası Rəqəmsal İnkişaf və Nəqliyyat Nazirliyi • AAYDA • BDYP
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          Rəsmi Magistral İstirahət Zonası Elektron Giriş Vauçeri
                        </h3>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {currentReservation.certificateNumber}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                        Status: ÖDƏNİLDİ (ASANPAY)
                      </div>
                    </div>
                  </div>

                  {/* Grid details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs mb-6">
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Dövlət Qeydiyyat Nişanı:</span>
                      <span className="font-mono text-base font-bold text-white block mt-0.5">
                        {currentReservation.vehiclePlate}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {currentReservation.vehicleCategory}
                      </span>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Təhkim Olunmuş Park Yeri:</span>
                      <span className="font-mono text-base font-bold text-emerald-400 block mt-0.5">
                        {currentReservation.bayNumber}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Şlaqbaum PİN: {currentReservation.barrierPinCode}
                      </span>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Sürücü / FİN:</span>
                      <span className="font-bold text-white block mt-0.5">
                        {currentReservation.driverName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        FİN: {currentReservation.driverFin}
                      </span>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">İstirahət Məntəqəsi:</span>
                      <span className="font-bold text-white block mt-0.5">
                        {currentReservation.restAreaName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Müddət: {currentReservation.durationHours} saat
                      </span>
                    </div>
                  </div>

                  {/* Security Telemetrics & SİMA UID */}
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono mb-4">
                    <div>
                      <span className="text-slate-400">SİMA Rəqəmsal İmza UID: </span>
                      <span className="text-teal-300 font-bold">
                        {currentReservation.simaDigitalUid}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Təhlükəsizlik Checksum: </span>
                      <span className="text-slate-300">{currentReservation.securityHashSha256}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() =>
                        handleCopy(
                          currentReservation.certificateNumber,
                          'Vauçer Sertifikat Kodu'
                        )
                      }
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5"
                    >
                      <span>📋</span>
                      <span>Kodu Kopyala</span>
                    </button>

                    <button
                      onClick={() => window.print?.()}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors flex items-center space-x-1.5"
                    >
                      <span>🖨️</span>
                      <span>Vauçeri Çap Et</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Public Registry Search */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h4 className="text-sm font-bold text-white">
                    🏛️ Vahid Dövlət Magistral İstirahət Rezervasiya Reyestri
                  </h4>
                  <div className="w-full sm:w-64">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Qeydiyyat nişanı, sertifikat..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Registry Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700">
                      <tr>
                        <th className="p-3">Sertifikat №</th>
                        <th className="p-3">Dövlət Nişanı</th>
                        <th className="p-3">Sürücü & Şirkət</th>
                        <th className="p-3">İstirahət Məntəqəsi</th>
                        <th className="p-3">Yer</th>
                        <th className="p-3">Müddət</th>
                        <th className="p-3">Məbləğ</th>
                        <th className="p-3">Əməliyyat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                      {filteredReservations.map((r) => (
                        <tr key={r.reservationId} className="hover:bg-slate-800/50">
                          <td className="p-3 font-mono font-bold text-emerald-400">
                            {r.certificateNumber}
                          </td>
                          <td className="p-3 font-mono font-bold text-white">{r.vehiclePlate}</td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-200">{r.driverName}</div>
                            <div className="text-[11px] text-slate-500">{r.companyName}</div>
                          </td>
                          <td className="p-3 text-slate-300">{r.restAreaName}</td>
                          <td className="p-3 font-mono font-bold text-teal-300">{r.bayNumber}</td>
                          <td className="p-3">{r.durationHours} saat</td>
                          <td className="p-3 font-mono font-bold text-white">
                            {r.totalFeeAzn.toFixed(2)} ₼
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => {
                                setCurrentReservation(r);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] font-semibold border border-slate-700 transition-colors"
                            >
                              Bax →
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
        <div className="bg-slate-950/80 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>AAYDA • AYNA • BDYP Magistral Yol İstirahət Qaydaları (AETR / SSTPA)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors border border-slate-700"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
