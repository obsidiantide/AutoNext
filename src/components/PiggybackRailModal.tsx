import React, { useState, useMemo } from 'react';
import {
  X,
  Train,
  Truck,
  ShieldCheck,
  Scale,
  Gauge,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  HelpCircle,
  Leaf,
  Fuel,
  MapPin,
  ArrowRight,
  ExternalLink,
  Lock,
  Unlock,
  Layers,
  Coins,
} from 'lucide-react';
import {
  Currency,
  convertAzn,
  formatCurrency,
  IntermodalWagonType,
  RailTrackGauge,
  TerminalId,
  WAGON_SPECS,
  calculateBogieAxleLoad,
  evaluateLoadingClearance,
  calculateIntermodalSavingsAndTariff,
  evaluateFasteningChecklist,
  evaluatePiggybackExam,
  generateOfficialPiggybackCertificate,
  OfficialPiggybackCertificate,
} from '../utils/piggybackRailCompliance';
import {
  MOCK_TERMINALS_RECORD,
  MOCK_TERMINALS_LIST,
  MOCK_VEHICLE_PRESETS,
  MOCK_FASTENING_CHECKLIST,
  MOCK_EXAM_QUESTIONS,
  MOCK_PUBLIC_REGISTRY_CERTIFICATES,
} from '../data/mockPiggybackRailData';
import { Vehicle } from '../types/vehicle';

export interface PiggybackRailModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCar?: Vehicle | null;
}

export type PiggybackTab =
  | 'terminals'
  | 'simulator'
  | 'tariff'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export const PiggybackRailModal: React.FC<PiggybackRailModalProps> = ({
  isOpen,
  onClose,
  targetCar,
}) => {
  const [activeTab, setActiveTab] = useState<PiggybackTab>('terminals');
  const [currency, setCurrency] = useState<Currency>('AZN');

  // Terminal search
  const [terminalSearch, setTerminalSearch] = useState('');
  const [selectedTerminalId, setSelectedTerminalId] = useState<TerminalId>('alat_hub');

  // Preset Selection or Custom Vehicle State
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);

  // Loading Clearance Simulator State
  const activePreset = MOCK_VEHICLE_PRESETS[selectedPresetIndex];
  const [wagonType, setWagonType] = useState<IntermodalWagonType>(activePreset.wagonType);
  const [trackGauge, setTrackGauge] = useState<RailTrackGauge>(activePreset.trackGauge);
  const [trailerPlate, setTrailerPlate] = useState<string>(
    targetCar ? targetCar.plateNumber || '99-TR-707' : activePreset.trailerPlate
  );
  const [tractorPlate, setTractorPlate] = useState<string>(activePreset.tractorPlate);
  const [carrierName, setCarrierName] = useState<string>(activePreset.carrierNameAz);
  const [cargoDescription, setCargoDescription] = useState<string>(activePreset.cargoDescriptionAz);
  const [trailerTare, setTrailerTare] = useState<number>(activePreset.trailerTareTonnes);
  const [cargoPayload, setCargoPayload] = useState<number>(activePreset.cargoPayloadTonnes);
  const [loadedHeightMm, setLoadedHeightMm] = useState<number>(activePreset.loadedHeightFromRailMm);
  const [trailerWidthMm, setTrailerWidthMm] = useState<number>(activePreset.trailerWidthMm);
  const [kingpinLoadTonnes, setKingpinLoadTonnes] = useState<number>(activePreset.kingpinLoadTonnes);
  const [frontBogieTonnes, setFrontBogieTonnes] = useState<number>(activePreset.frontBogieTonnes);
  const [rearBogieTonnes, setRearBogieTonnes] = useState<number>(activePreset.rearBogieTonnes);
  const [isAirSuspensionDeflated, setIsAirSuspensionDeflated] = useState<boolean>(activePreset.isAirSuspensionDeflated);
  const [areWheelChocksLocked, setAreWheelChocksLocked] = useState<boolean>(activePreset.areWheelChocksLocked);
  const [lashingTensionKn, setLashingTensionKn] = useState<number>(activePreset.lashingTensionKn);

  // Tariff Calculator State
  const [originTerminal, setOriginTerminal] = useState<TerminalId>(activePreset.originTerminal);
  const [destinationTerminal, setDestinationTerminal] = useState<TerminalId>(activePreset.destinationTerminal);
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(false);

  // Checklist State
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    chk_kingpin_lock: true,
    chk_air_suspension: true,
    chk_wheel_chocks: true,
    chk_lashing_chains: true,
    chk_landing_gear: true,
    chk_brake_pipe: true,
  });

  // Exam State
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);

  // Registry & Certificate State
  const [registryCertificates, setRegistryCertificates] = useState<OfficialPiggybackCertificate[]>(
    MOCK_PUBLIC_REGISTRY_CERTIFICATES
  );
  const [activeCertificate, setActiveCertificate] = useState<OfficialPiggybackCertificate | null>(
    MOCK_PUBLIC_REGISTRY_CERTIFICATES[0]
  );
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [copiedCertId, setCopiedCertId] = useState<string | null>(null);

  // Synchronize when a preset is chosen
  const handleApplyPreset = (index: number) => {
    setSelectedPresetIndex(index);
    const p = MOCK_VEHICLE_PRESETS[index];
    setWagonType(p.wagonType);
    setTrackGauge(p.trackGauge);
    setTrailerPlate(p.trailerPlate);
    setTractorPlate(p.tractorPlate);
    setCarrierName(p.carrierNameAz);
    setCargoDescription(p.cargoDescriptionAz);
    setTrailerTare(p.trailerTareTonnes);
    setCargoPayload(p.cargoPayloadTonnes);
    setLoadedHeightMm(p.loadedHeightFromRailMm);
    setTrailerWidthMm(p.trailerWidthMm);
    setKingpinLoadTonnes(p.kingpinLoadTonnes);
    setFrontBogieTonnes(p.frontBogieTonnes);
    setRearBogieTonnes(p.rearBogieTonnes);
    setIsAirSuspensionDeflated(p.isAirSuspensionDeflated);
    setAreWheelChocksLocked(p.areWheelChocksLocked);
    setLashingTensionKn(p.lashingTensionKn);
    setOriginTerminal(p.originTerminal);
    setDestinationTerminal(p.destinationTerminal);
  };

  // Calculations
  const bogieResult = useMemo(() => {
    return calculateBogieAxleLoad({
      wagonType,
      trailerTareTonnes: trailerTare,
      cargoPayloadTonnes: cargoPayload,
      frontBogieTonnes,
      rearBogieTonnes,
      kingpinLoadTonnes,
      trackGauge,
    });
  }, [wagonType, trailerTare, cargoPayload, frontBogieTonnes, rearBogieTonnes, kingpinLoadTonnes, trackGauge]);

  const clearanceResult = useMemo(() => {
    return evaluateLoadingClearance({
      wagonType,
      loadedHeightFromRailMm: loadedHeightMm,
      trailerWidthMm,
      isAirSuspensionDeflated,
      areWheelChocksLocked,
      lashingTensionKn,
      bogieResult,
    });
  }, [wagonType, loadedHeightMm, trailerWidthMm, isAirSuspensionDeflated, areWheelChocksLocked, lashingTensionKn, bogieResult]);

  const tariffResult = useMemo(() => {
    return calculateIntermodalSavingsAndTariff({
      originTerminal,
      destinationTerminal,
      wagonType,
      grossTrailerWeightTonnes: bogieResult.grossTrailerWeightTonnes,
      isRoundTrip,
      terminals: MOCK_TERMINALS_RECORD,
    });
  }, [originTerminal, destinationTerminal, wagonType, bogieResult.grossTrailerWeightTonnes, isRoundTrip]);

  const checklistResult = useMemo(() => {
    return evaluateFasteningChecklist(MOCK_FASTENING_CHECKLIST, checkedItems);
  }, [checkedItems]);

  const examResult = useMemo(() => {
    return evaluatePiggybackExam(MOCK_EXAM_QUESTIONS, examAnswers);
  }, [examAnswers]);

  // Certificate Generator
  const handleGenerateCertificate = () => {
    const cert = generateOfficialPiggybackCertificate({
      trailerPlate,
      tractorPlate,
      vin: targetCar?.vin || activePreset.vin,
      carrierNameAz: carrierName,
      cargoDescriptionAz: cargoDescription,
      wagonType,
      trackGauge,
      originTerminalAz: MOCK_TERMINALS_RECORD[originTerminal]?.nameAz || originTerminal,
      destinationTerminalAz: MOCK_TERMINALS_RECORD[destinationTerminal]?.nameAz || destinationTerminal,
      distanceKm: tariffResult.distanceKm,
      totalCombinedWeightTonnes: bogieResult.totalCombinedWeightTonnes,
      maxAxleLoadTonnes: bogieResult.averageAxleLoadTonnes,
      loadedHeightFromRailMm: loadedHeightMm,
      co2AvoidedKg: tariffResult.co2EmissionsAvoidedKg,
      dieselSavedLitres: tariffResult.dieselSavedLitres,
    });
    setActiveCertificate(cert);
    setRegistryCertificates((prev) => [cert, ...prev]);
    setActiveTab('certificate');
  };

  const handleCopyCode = (id: string, textToCopy: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }
    setCopiedCertId(id);
    setTimeout(() => setCopiedCertId(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredTerminals = useMemo(() => {
    if (!terminalSearch.trim()) return MOCK_TERMINALS_LIST;
    const q = terminalSearch.toLowerCase();
    return MOCK_TERMINALS_LIST.filter(
      (t) =>
        t.nameAz.toLowerCase().includes(q) ||
        t.locationAz.toLowerCase().includes(q) ||
        t.customsPostAz.toLowerCase().includes(q)
    );
  }, [terminalSearch]);

  const filteredRegistry = useMemo(() => {
    if (!registrySearch.trim()) return registryCertificates;
    const q = registrySearch.toLowerCase();
    return registryCertificates.filter(
      (c) =>
        c.certificateId.toLowerCase().includes(q) ||
        c.trailerPlate.toLowerCase().includes(q) ||
        c.tractorPlate.toLowerCase().includes(q) ||
        c.vin.toLowerCase().includes(q) ||
        c.carrierNameAz.toLowerCase().includes(q) ||
        c.clearanceCode.toLowerCase().includes(q)
    );
  }, [registrySearch, registryCertificates]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="piggyback-modal-title"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-cyan-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Train className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  ADY • AYNA • BDYP
                </span>
                <span className="text-xs text-slate-400">UIC 596-2 / SMGS</span>
              </div>
              <h2
                id="piggyback-modal-title"
                className="text-lg sm:text-xl font-bold text-white flex items-center gap-2"
              >
                İntermodal Dəmir Yolu Kontreyler Portalı
                <span className="hidden sm:inline-block text-xs font-normal text-cyan-300">
                  (PIGGYBACK-AZ-2026)
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                    currency === curr
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              data-testid="piggyback-modal-close-btn"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 overflow-x-auto scrollbar-none">
          {[
            { id: 'terminals', label: 'Strateji Qovşaqlar', icon: MapPin },
            { id: 'simulator', label: 'Qabarit Simulyatoru', icon: Sliders },
            { id: 'tariff', label: 'Tarif & Eko Qənaət', icon: Leaf },
            { id: 'checklist', label: 'Bərkitmə Yoxlaması', icon: ShieldCheck },
            { id: 'exam', label: 'İntermodal İmtahan', icon: HelpCircle },
            { id: 'certificate', label: 'Tranzit Sertifikatı', icon: FileCheck },
            { id: 'registry', label: 'Dövlət Reyestri', icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PiggybackTab)}
                data-testid={`tab-${tab.id}`}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: TERMINALS RADAR */}
          {activeTab === 'terminals' && (
            <div className="space-y-6" data-testid="terminals-tab-content">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    Azərbaycanın 6 Strateji Multimodal Kontreyler və Dəmir Yolu Terminalı
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Orta Dəhliz (TITR), Şimal-Cənub (INSTC) və Bakı-Tbilisi-Qars (BTK) xətləri üzrə Ro-La və cib vaqonları qovşaqları.
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={terminalSearch}
                    onChange={(e) => setTerminalSearch(e.target.value)}
                    placeholder="Terminal və ya gömrük axtar..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTerminals.map((terminal) => {
                  const isSelected = selectedTerminalId === terminal.id;
                  return (
                    <div
                      key={terminal.id}
                      onClick={() => {
                        setSelectedTerminalId(terminal.id);
                        setOriginTerminal(terminal.id);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/30 border-cyan-500/60 shadow-lg shadow-cyan-950/40'
                          : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {terminal.distanceFromAlatKm} km (Ələtdən)
                        </span>
                        <div className="flex items-center gap-1">
                          {terminal.gaugesSupported.map((g) => (
                            <span
                              key={g}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300"
                            >
                              {g === 'GAUGE_1520_MM' ? '1520 mm' : '1435 mm'}
                            </span>
                          ))}
                        </div>
                      </div>

                      <h4 className="font-bold text-white text-sm mt-2">{terminal.nameAz}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{terminal.descriptionAz}</p>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Gantry Kran Gücü:</span>
                          <span className="font-semibold text-cyan-300">{terminal.craneCapacityTonnes} ton</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Gündəlik Qatar Qəbulu:</span>
                          <span className="font-semibold text-white">{terminal.dailyTrainCapacity} blok qatar</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Ro-La Rampası:</span>
                          <span className={terminal.roLaRampAvailable ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                            {terminal.roLaRampAvailable ? 'Mövcuddur (Aktiv)' : 'Yoxdur'}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span className="text-slate-400">Gömrük Postu:</span>
                          <span className="text-slate-300 font-mono text-[11px] truncate max-w-[180px]" title={terminal.customsPostAz}>
                            {terminal.customsPostAz}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOriginTerminal(terminal.id);
                            setActiveTab('tariff');
                          }}
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                        >
                          Tarif Hesabla <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[11px] text-slate-400">{terminal.locationAz}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LOADING CLEARANCE SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6" data-testid="simulator-tab-content">
              {/* Presets Bar */}
              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-cyan-400" />
                    Sürətli Yarımqoşqu və Vaqon Presetləri (6 Ssenari):
                  </span>
                  <span className="text-xs text-slate-400">Bir kliklə parametrləri yükləyin</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {MOCK_VEHICLE_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(idx)}
                      data-testid={`preset-btn-${idx}`}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                        selectedPresetIndex === idx
                          ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-sm'
                          : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="font-bold font-mono text-cyan-300">{preset.trailerPlate}</div>
                      <div className="text-[11px] text-slate-400 truncate">{preset.cargoDescriptionAz}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid: Controls vs Live Telemetry */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Controls (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Wagon & Gauge Selectors */}
                  <div className="p-4 bg-slate-800/50 border border-slate-800 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Train className="w-4 h-4 text-cyan-400" />
                      Dəmir Yolu Vaqon Növü & Rels Standartı
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Vaqon Tipi (Wagon Type)</label>
                        <select
                          value={wagonType}
                          onChange={(e) => setWagonType(e.target.value as IntermodalWagonType)}
                          data-testid="wagon-type-select"
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="POCKET_T3000E">T3000e İkili Cib Vaqonu (UIC P400)</option>
                          <option value="RO_LA_LOW_FLOOR">Saadkms Aşağı Döşəməli Ro-La Vaqonu</option>
                          <option value="CONTAINER_FLAT_60FT">Sgnss 60ft Düz İntermodal Platforma</option>
                          <option value="PLATFORM_HEAVY_DUTY">Res 4-Oxlu Ağır Sənaye Platforması</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Dəmir Yolu Rels Eni (Track Gauge)</label>
                        <select
                          value={trackGauge}
                          onChange={(e) => setTrackGauge(e.target.value as RailTrackGauge)}
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="GAUGE_1520_MM">1520 mm (ADY & MDB Enli Rels Standartı)</option>
                          <option value="GAUGE_1435_MM">1435 mm (BTK & Avropa Standart Relsi)</option>
                        </select>
                      </div>
                    </div>

                    {/* Plates & Carrier */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Qoşqu Nömrəsi</label>
                        <input
                          type="text"
                          value={trailerPlate}
                          onChange={(e) => setTrailerPlate(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Dartıcı Nömrəsi</label>
                        <input
                          type="text"
                          value={tractorPlate}
                          onChange={(e) => setTractorPlate(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Daşıyıcı Şirkət</label>
                        <input
                          type="text"
                          value={carrierName}
                          onChange={(e) => setCarrierName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                        />
                      </div>
                    </div>
                  </div>

                    {/* Dimensions & Loads Sliders */}
                    <div className="p-4 bg-slate-800/50 border border-slate-800 rounded-xl space-y-4">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Scale className="w-4 h-4 text-cyan-400" />
                        Həndəsi Qabarit və Çəki Paylanması
                      </h4>

                      {/* Height Slider */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300">Rels Başlığından Ümumi Hündürlük:</span>
                          <span className="font-bold text-cyan-300 font-mono">{loadedHeightMm} mm</span>
                        </div>
                        <input
                          type="range"
                          min="3500"
                          max="4300"
                          step="10"
                          value={loadedHeightMm}
                          onChange={(e) => setLoadedHeightMm(Number(e.target.value))}
                          data-testid="height-slider"
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                          <span>3500 mm</span>
                          <span>UIC P400 Həddi (4000 mm)</span>
                          <span>Xüsusi Dərin Cib (4200 mm)</span>
                        </div>
                      </div>

                      {/* Width Slider */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300">Yarımqoşqu Eni (Trailer Width):</span>
                          <span className="font-bold text-cyan-300 font-mono">{trailerWidthMm} mm</span>
                        </div>
                        <input
                          type="range"
                          min="2400"
                          max="2700"
                          step="10"
                          value={trailerWidthMm}
                          onChange={(e) => setTrailerWidthMm(Number(e.target.value))}
                          data-testid="width-slider"
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                          <span>2400 mm</span>
                          <span>Maks Standart (2600 mm)</span>
                          <span>2700 mm</span>
                        </div>
                      </div>

                      {/* Weight Sliders: Cargo & Tare */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-300">Yükün Çəkisi:</span>
                            <span className="font-bold text-white font-mono">{cargoPayload} ton</span>
                          </div>
                          <input
                            type="range"
                            min="5.0"
                            max="36.0"
                            step="0.5"
                            value={cargoPayload}
                            onChange={(e) => setCargoPayload(Number(e.target.value))}
                            className="w-full accent-cyan-500 cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-300">Yarımqoşqu Tarası:</span>
                            <span className="font-bold text-white font-mono">{trailerTare} ton</span>
                          </div>
                          <input
                            type="range"
                            min="5.0"
                            max="14.0"
                            step="0.2"
                            value={trailerTare}
                            onChange={(e) => setTrailerTare(Number(e.target.value))}
                            className="w-full accent-cyan-500 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Bogie Loads */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Ön Arabacıq Yükü (t)</label>
                          <input
                            type="number"
                            min="10"
                            max="30"
                            step="0.1"
                            value={frontBogieTonnes}
                            onChange={(e) => setFrontBogieTonnes(Number(e.target.value))}
                            className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Arxa Arabacıq Yükü (t)</label>
                          <input
                            type="number"
                            min="10"
                            max="30"
                            step="0.1"
                            value={rearBogieTonnes}
                            onChange={(e) => setRearBogieTonnes(Number(e.target.value))}
                            className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Şkvorin Dayaq (t)</label>
                          <input
                            type="number"
                            min="5"
                            max="20"
                            step="0.5"
                            value={kingpinLoadTonnes}
                            onChange={(e) => setKingpinLoadTonnes(Number(e.target.value))}
                            className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Fastening Toggles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAirSuspensionDeflated}
                            onChange={(e) => setIsAirSuspensionDeflated(e.target.checked)}
                            data-testid="suspension-toggle"
                            className="w-4 h-4 accent-cyan-500 rounded"
                          />
                          <span>Pnevmatik asqı körükləri tam boşaldılıb</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={areWheelChocksLocked}
                            onChange={(e) => setAreWheelChocksLocked(e.target.checked)}
                            data-testid="chocks-toggle"
                            className="w-4 h-4 accent-cyan-500 rounded"
                          />
                          <span>Təkər dayaqları relsə kilidlənib</span>
                        </label>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300">Zəncirli Bərkitmə Dartı Qüvvəsi (Lashing Tension):</span>
                          <span className="font-bold text-white font-mono">{lashingTensionKn} kN</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="200"
                          step="5"
                          value={lashingTensionKn}
                          onChange={(e) => setLashingTensionKn(Number(e.target.value))}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                          <span>50 kN (Yetərsiz)</span>
                          <span>Min Tələb: 100 kN</span>
                          <span>200 kN</span>
                        </div>
                      </div>
                    </div>
                </div>

                {/* Live Telemetry & Clearance Status (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Status Banner */}
                  <div
                    className={`p-5 rounded-xl border flex flex-col items-center text-center transition-all ${
                      clearanceResult.isFullyApproved
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {clearanceResult.isFullyApproved ? (
                      <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2" />
                    ) : (
                      <XCircle className="w-12 h-12 text-rose-400 mb-2" />
                    )}

                    <h3 className="font-bold text-lg text-white">
                      {clearanceResult.isFullyApproved
                        ? 'QABARİT VƏ TƏHLÜKƏSİZLİK TƏSDİQLƏNDİ'
                        : 'QABARİT AŞINTISI / UYĞUNSUZLUQ'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      {clearanceResult.isFullyApproved
                        ? 'UIC 596-2 və GOST 1-T standartları üzrə dəmir yolu qatarına yüklənməyə tam icazə verilir.'
                        : 'Qeyd olunan parametrlər dəmir yolu hərəkət təhlükəsizliyi tələblərinə cavab vermir.'}
                    </p>

                    <span className="mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-700 text-cyan-300 font-mono">
                      {bogieResult.clearanceCategory}
                    </span>
                  </div>

                  {/* Telemetry Matrix */}
                  <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-cyan-400" />
                      Ox Yükü və Dinamik Balans Göstəriciləri
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400">Yarımqoşqu Brutto Çəkisi:</span>
                        <span className="font-bold font-mono text-white">
                          {bogieResult.grossTrailerWeightTonnes} ton
                        </span>
                      </div>

                      <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400">Ümumi Qatar Vaqon Çəkisi:</span>
                        <span className="font-bold font-mono text-white">
                          {bogieResult.totalCombinedWeightTonnes} ton ({WAGON_SPECS[wagonType].axles} ox)
                        </span>
                      </div>

                      <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400">Orta Ox Yükü (Axle Load):</span>
                        <span
                          className={`font-bold font-mono ${
                            bogieResult.isAxleLoadCompliant ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {bogieResult.averageAxleLoadTonnes} ton / ox (Maks: {bogieResult.maxAllowableAxleLoadTonnes} t)
                        </span>
                      </div>

                      <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400">Arabacıq Yük Disbalansı:</span>
                        <span
                          className={`font-bold font-mono ${
                            bogieResult.isBogieBalanced ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {bogieResult.bogieImbalancePercent}% (Maks: 10%)
                        </span>
                      </div>

                      <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400">Qabarit Hündürlük Ehtiyatı:</span>
                        <span
                          className={`font-bold font-mono ${
                            clearanceResult.envelopeMarginHeightMm >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {clearanceResult.envelopeMarginHeightMm >= 0 ? '+' : ''}
                          {clearanceResult.envelopeMarginHeightMm} mm
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rejection Reasons if Any */}
                  {!clearanceResult.isFullyApproved && (
                    <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        Tələb Olunan Düzəlişlər:
                      </span>
                      <ul className="text-xs text-rose-200/90 list-disc list-inside space-y-1">
                        {clearanceResult.rejectionReasonsAz.map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Quick Action Button to Generate Certificate */}
                  <button
                    onClick={handleGenerateCertificate}
                    disabled={!clearanceResult.isFullyApproved}
                    data-testid="proceed-cert-btn"
                    className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                      clearanceResult.isFullyApproved
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 cursor-pointer shadow-cyan-950/40'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    <FileCheck className="w-4 h-4" />
                    PIGGYBACK-AZ-2026 Sertifikatı İstehsal Et
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TARIFF & GREEN SAVINGS CALCULATOR */}
          {activeTab === 'tariff' && (
            <div className="space-y-6" data-testid="tariff-tab-content">
              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <Coins className="w-5 h-5 text-cyan-400" />
                      İntermodal Kontreyler Tarifi və Yaşıl Logistika Qənaəti
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Avtomobil şosesi ilə müqayisədə dizel yanacağı, yol aşınması və CO2 tullantılarının azaldılması kalkulyatoru.
                    </p>
                  </div>
                </div>

                {/* Route Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Çıxış Terminalı (Origin)</label>
                    <select
                      value={originTerminal}
                      onChange={(e) => setOriginTerminal(e.target.value as TerminalId)}
                      data-testid="origin-terminal-select"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      {MOCK_TERMINALS_LIST.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nameAz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Təyinat Terminalı (Destination)</label>
                    <select
                      value={destinationTerminal}
                      onChange={(e) => setDestinationTerminal(e.target.value as TerminalId)}
                      data-testid="dest-terminal-select"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      {MOCK_TERMINALS_LIST.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nameAz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRoundTrip}
                        onChange={(e) => setIsRoundTrip(e.target.checked)}
                        className="w-4 h-4 accent-cyan-500 rounded"
                      />
                      <span className="font-medium">İkitərəfli Gediş-Dönüş (15% Güzəşt)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Savings Dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    Dəmir Yolu Məsafəsi:
                  </span>
                  <div className="text-xl font-bold font-mono text-white">{tariffResult.distanceKm} km</div>
                  <span className="text-[11px] text-slate-400">ADY birbaşa rels xətti</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-cyan-500/30 space-y-1">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-cyan-400" />
                    İntermodal Dəmir Yolu Tarifi:
                  </span>
                  <div className="text-xl font-bold font-mono text-cyan-300">
                    {formatCurrency(convertAzn(tariffResult.totalRailTariffAzn, currency), currency)}
                  </div>
                  <span className="text-[11px] text-slate-400">Vaqon + Terminal + Gantry kran</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-amber-400" />
                    Qənaət Edilən Dizel:
                  </span>
                  <div className="text-xl font-bold font-mono text-amber-300">{tariffResult.dieselSavedLitres} Litr</div>
                  <span className="text-[11px] text-slate-400">
                    ~{Math.round((tariffResult.dieselSavedLitres / Math.max(1, tariffResult.roadDieselConsumedLitres)) * 100)}% yanacaq azalması
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                    Azaldılan CO2 Tullantısı:
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-300">
                    {tariffResult.co2EmissionsAvoidedKg} kg CO2
                  </div>
                  <span className="text-[11px] text-emerald-400/80">Ekoloji Yaşıl Dəhliz indeksi</span>
                </div>
              </div>

              {/* Detailed Comparative Breakdown */}
              <div className="p-5 bg-slate-800/30 border border-slate-800 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Avtomobil Nəqliyyatı ilə Müqayisəli İqtisadi Təhlil
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                    <span className="font-bold text-slate-200 block border-b border-slate-800 pb-1">
                      Şose / Avtomobil Yolu Xərcləri (TIR / Dartıcı)
                    </span>
                    <div className="flex justify-between text-slate-400">
                      <span>Dizel Yanacağı ({tariffResult.roadDieselConsumedLitres} L):</span>
                      <span className="font-mono text-slate-200">
                        {formatCurrency(convertAzn(tariffResult.roadDieselConsumedLitres * 0.9, currency), currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Avtomagistral Toll & Şin Aşınması:</span>
                      <span className="font-mono text-slate-200">
                        {formatCurrency(convertAzn(tariffResult.distanceKm * 0.45, currency), currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Sürücü Ezamiyyəsi & TIR Amortizasiyası:</span>
                      <span className="font-mono text-slate-200">
                        {formatCurrency(convertAzn(tariffResult.distanceKm * 0.65, currency), currency)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-800">
                      <span>Cəmi Yol Tranzit Xərci:</span>
                      <span className="font-mono text-rose-300">
                        {formatCurrency(convertAzn(tariffResult.estimatedRoadTransitCostAzn, currency), currency)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2 text-xs">
                    <span className="font-bold text-cyan-200 block border-b border-cyan-500/30 pb-1">
                      Dəmir Yolu İntermodal Faydaları
                    </span>
                    <div className="flex justify-between text-slate-300">
                      <span>Xalis Maliyyə Qənaəti:</span>
                      <span className="font-bold font-mono text-emerald-400">
                        +{formatCurrency(convertAzn(tariffResult.netFinancialSavingsAzn, currency), currency)} ({tariffResult.savingsPercentage}%)
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Dövlət Yol Fonduna Aşınma Qənaəti:</span>
                      <span className="font-mono text-cyan-300">
                        {formatCurrency(convertAzn(tariffResult.roadWearFeesSavedAzn, currency), currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Gömrük Sərhəd Keçid Sürətləndirməsi:</span>
                      <span className="font-mono text-white">Yaşıl Dəhliz (Fast-Track)</span>
                    </div>
                    <div className="flex justify-between font-bold text-white pt-2 border-t border-cyan-500/30">
                      <span>Xalis Dəmir Yolu Ödənişi:</span>
                      <span className="font-mono text-cyan-300">
                        {formatCurrency(convertAzn(tariffResult.totalRailTariffAzn, currency), currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FASTENING CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6" data-testid="checklist-tab-content">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    10 Bəndlik Vaqon və Yarımqoşqu Bərkitmə Təhlükəsizlik Reqlamenti
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    UIC 596-2 və Beynəlxalq Dəmir Yolu Yük Daşımaları Sazişinə (SMGS) uyğun məcburi yoxlama bəndləri.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const all: Record<string, boolean> = {};
                      MOCK_FASTENING_CHECKLIST.forEach((item) => {
                        all[item.id] = true;
                      });
                      setCheckedItems(all);
                    }}
                    data-testid="check-all-checklist-btn"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all cursor-pointer"
                  >
                    Bütün Bəndləri Təsdiqlə
                  </button>

                  <div className="text-right">
                    <div className="text-xs font-bold text-cyan-300 font-mono">
                      {checklistResult.totalChecked} / {checklistResult.totalCount} ({checklistResult.scorePercent}%)
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {checklistResult.isAllMandatorySatisfied ? 'Məcburi bəndlər ödənilib' : 'Məcburi bəndlər çatışmır'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MOCK_FASTENING_CHECKLIST.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() =>
                        setCheckedItems((prev) => ({
                          ...prev,
                          [item.id]: !isChecked,
                        }))
                      }
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-slate-800/60 border-cyan-500/50'
                          : 'bg-slate-800/20 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent onClick
                        className="mt-0.5 w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-xs text-white">{item.titleAz}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                              item.isMandatory
                                ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                                : 'bg-slate-700/40 text-slate-400'
                            }`}
                          >
                            {item.isMandatory ? 'Məcburi' : 'Tövsiyə'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.descriptionAz}</p>
                        <span className="text-[10px] font-mono text-cyan-400 block pt-1">
                          Normativ: {item.uicReference}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: THEORETICAL EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6" data-testid="exam-tab-content">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-cyan-400" />
                    ADY & AYNA İntermodal Kontreyler Nəqliyyatı İmtahan Simulyatoru
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Dəmir yolu nəqliyyatı haqqında qanunvericilik, UIC 596-2 və İXM Maddə 347 üzrə bilik yoxlanışı (Keçid balı: 80%).
                  </p>
                </div>

                {isExamSubmitted && (
                  <div
                    className={`px-4 py-2 rounded-xl border text-xs font-bold font-mono ${
                      examResult.isPassed
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    Nəticə: {examResult.correctCount} / {examResult.totalCount} ({examResult.percentage}%) -{' '}
                    {examResult.isPassed ? 'İMTAHANDAN KEÇDİ' : 'KƏSİLDİ'}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {MOCK_EXAM_QUESTIONS.map((q, qIndex) => {
                  const userAnswer = examAnswers[q.id];
                  const hasAnswered = userAnswer !== undefined;
                  const isCorrect = userAnswer === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                          Sual {qIndex + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-white">{q.questionAz}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.optionsAz.map((opt, optIndex) => {
                          const isSelected = userAnswer === optIndex;
                          let btnStyle = 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800';

                          if (isExamSubmitted) {
                            if (optIndex === q.correctOptionIndex) {
                              btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-cyan-500/20 border-cyan-500 text-cyan-200 font-bold';
                          }

                          return (
                            <button
                              key={optIndex}
                              onClick={() => {
                                if (!isExamSubmitted) {
                                  setExamAnswers((prev) => ({
                                    ...prev,
                                    [q.id]: optIndex,
                                  }));
                                }
                              }}
                              data-testid={`exam-q-${q.id}-opt-${optIndex}`}
                              className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${btnStyle}`}
                            >
                              <span className="font-mono text-cyan-400 mr-2">{String.fromCharCode(65 + optIndex)})</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isExamSubmitted && (
                        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
                          Hüquqi Əsas: {q.legalBasisAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Exam Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    setExamAnswers({});
                    setIsExamSubmitted(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sıfırla
                </button>

                <button
                  onClick={() => setIsExamSubmitted(true)}
                  data-testid="submit-exam-btn"
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all cursor-pointer shadow-lg shadow-cyan-950/40"
                >
                  Cavabları Yoxla və Təsdiqlə
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: OFFICIAL CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="certificate-tab-content">
              {activeCertificate ? (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {/* Action Toolbar */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">
                      Rəsmi ADY & AYNA İntermodal Tranzit Buraxılış Vərəqəsi
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyCode(activeCertificate.certificateId, activeCertificate.certificateId)}
                        data-testid="copy-cert-btn"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                      >
                        {copiedCertId === activeCertificate.certificateId ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" /> Kopyalandı
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" /> Kodu Kopyala
                          </>
                        )}
                      </button>

                      <button
                        onClick={handlePrint}
                        data-testid="print-cert-btn"
                        className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        <Printer className="w-3.5 h-3.5" /> Çap Et
                      </button>
                    </div>
                  </div>

                  {/* Certificate Sheet */}
                  <div className="p-6 sm:p-8 rounded-2xl bg-slate-950 border-2 border-cyan-500/40 shadow-2xl relative overflow-hidden space-y-6 text-slate-200">
                    {/* Watermark Pattern */}
                    <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none">
                      <Train className="w-96 h-96 text-cyan-400" />
                    </div>

                    {/* Official Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cyan-500/30 gap-4">
                      <div>
                        <div className="text-[11px] font-bold tracking-widest text-cyan-400 uppercase">
                          Azərbaycan Dəmir Yolları QSC • AYNA • BDYP
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight">
                          İNTERMODAL KONTREYLER TRANZİT BURAXILIŞI
                        </h2>
                        <p className="text-xs text-slate-400">
                          UIC 596-2 / GOST 9238-2013 Qabarit və Yükləmə Uyğunluq Sertifikatı
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-cyan-300 px-3 py-1 bg-cyan-950/60 rounded-lg border border-cyan-500/40 inline-block">
                          {activeCertificate.certificateId}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Verilmə: {activeCertificate.issueDate} | Etibarlı: {activeCertificate.validUntil}
                        </div>
                      </div>
                    </div>

                    {/* Transport & Vehicle Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Nəqliyyat Vahidləri
                        </span>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Yarımqoşqu Dövlət Qeydiyyatı:</span>
                          <span className="font-bold font-mono text-cyan-300">{activeCertificate.trailerPlate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Dartıcı Dövlət Qeydiyyatı:</span>
                          <span className="font-bold font-mono text-white">{activeCertificate.tractorPlate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Şassi (VIN) Kodu:</span>
                          <span className="font-mono text-slate-300">{activeCertificate.vin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Daşıyıcı Operator:</span>
                          <span className="font-semibold text-white">{activeCertificate.carrierNameAz}</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Dəmir Yolu Marşrutu və Vaqon
                        </span>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Təyin Olunmuş Vaqon ID:</span>
                          <span className="font-bold font-mono text-cyan-300">{activeCertificate.wagonId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Rels Eni Standartı:</span>
                          <span className="font-mono text-white">
                            {activeCertificate.trackGauge === 'GAUGE_1520_MM' ? '1520 mm (Geniş)' : '1435 mm (Standart)'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Məsafə:</span>
                          <span className="font-bold font-mono text-white">{activeCertificate.distanceKm} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Gömrük E-Seal:</span>
                          <span className="font-mono text-emerald-400">{activeCertificate.customsSealCode}</span>
                        </div>
                      </div>
                    </div>

                    {/* Routing Corridor Banner */}
                    <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-300">Marşrut:</span>
                        <span className="text-white">{activeCertificate.originTerminalAz}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-cyan-400" />
                      <div className="text-white font-medium">{activeCertificate.destinationTerminalAz}</div>
                    </div>

                    {/* Technical & Ecological Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Ümumi Çəki</span>
                        <span className="text-sm font-bold font-mono text-white">
                          {activeCertificate.totalCombinedWeightTonnes} t
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Maks Ox Yükü</span>
                        <span className="text-sm font-bold font-mono text-cyan-300">
                          {activeCertificate.maxAxleLoadTonnes} t
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Qənaət Edilən Yanacaq</span>
                        <span className="text-sm font-bold font-mono text-amber-300">
                          {activeCertificate.dieselSavedLitres} L
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Azaldılan CO2</span>
                        <span className="text-sm font-bold font-mono text-emerald-400">
                          {activeCertificate.co2AvoidedKg} kg
                        </span>
                      </div>
                    </div>

                    {/* Security & Verification Footer */}
                    <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                      <div className="space-y-1 text-center sm:text-left">
                        <div className="font-mono text-[11px] text-cyan-400 font-bold">
                          {activeCertificate.sha256SecurityChecksum}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">
                          SİMA Rəqəmsal İmza: {activeCertificate.simaDigitalUid}
                        </div>
                        <div className="text-[10px] text-slate-400">{activeCertificate.adyStationMasterAz}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-[10px] text-emerald-400 font-bold block">QR Onlayn Doğrulama</span>
                          <span className="text-[9px] text-slate-500 font-mono">railways.gov.az</span>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
                          <div className="w-10 h-10 border-2 border-slate-950 flex items-center justify-center font-mono text-[8px] font-bold text-slate-950">
                            QR-ADY
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  Aktiv sertifikat seçilməyib. Qabarit Simulyatoru bölməsindən yeni sertifikat generasiya edin.
                </div>
              )}
            </div>
          )}

          {/* TAB 7: UNIFIED PUBLIC REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6" data-testid="registry-tab-content">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-cyan-400" />
                    ADY & AYNA Vahid Açıq İntermodal Tranzit Reyestri
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Bütün rəsmi verilmiş kontreyler və Ro-La qabarit buraxılışlarının onlayn yoxlanılması.
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Qoşqu, sertifikat ID və ya daşıyıcı..."
                    data-testid="registry-search-input"
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Sertifikat ID</th>
                      <th className="px-4 py-3">Qoşqu / Dartıcı</th>
                      <th className="px-4 py-3">Daşıyıcı</th>
                      <th className="px-4 py-3">Marşrut</th>
                      <th className="px-4 py-3">Vaqon / Ox Yükü</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 font-mono">
                    {filteredRegistry.map((cert) => (
                      <tr key={cert.certificateId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 text-cyan-300 font-bold whitespace-nowrap">
                          {cert.certificateId}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-bold text-white">{cert.trailerPlate}</div>
                          <div className="text-[10px] text-slate-400">{cert.tractorPlate}</div>
                        </td>
                        <td className="px-4 py-3 font-sans max-w-[160px] truncate" title={cert.carrierNameAz}>
                          {cert.carrierNameAz}
                        </td>
                        <td className="px-4 py-3 font-sans max-w-[200px] truncate" title={`${cert.originTerminalAz} -> ${cert.destinationTerminalAz}`}>
                          {cert.originTerminalAz} → {cert.destinationTerminalAz}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-slate-200">{cert.wagonId}</div>
                          <div className="text-[10px] text-cyan-400">{cert.maxAxleLoadTonnes} t/ox</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-sans">
                            Aktiv / Təsdiqlənib
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              setActiveCertificate(cert);
                              setActiveTab('certificate');
                            }}
                            className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-sans font-medium transition-all cursor-pointer"
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

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Azərbaycan Dəmir Yolları QSC & AYNA İntermodal Nəzarət Mərkəzi</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>UIC 596-2 / GOST 1-T</span>
            <span>İXM Maddə 347</span>
            <span>İntermodal Gateway v4.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
