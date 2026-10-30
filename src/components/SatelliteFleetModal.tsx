import React, { useState, useMemo } from 'react';
import {
  Satellite,
  Radio,
  Globe,
  ShieldCheck,
  ShieldAlert,
  Crosshair,
  MapPin,
  Search,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Navigation,
  Copy,
  Printer,
  Award,
  Zap,
  Truck,
  Building,
  RefreshCw,
  ExternalLink,
  X,
  Sliders,
  Layers,
  Activity,
  Compass,
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';
import {
  Currency,
  formatCurrency,
  GroundStationId,
  SatelliteAssetId,
  FleetVehicleCategory,
  RtkFixMode,
  SATELLITE_ASSETS,
  FLEET_VEHICLE_PRESETS,
  evaluateRtkFixTelemetry,
  evaluateJammingSpoofing,
  calculateSatelliteFleetTariff,
  evaluateSpaceChecklist,
  evaluateSpaceExam,
  issueSatelliteFleetCertificate,
  SatelliteFleetCertificate,
} from '../utils/satelliteFleetCompliance';
import {
  MOCK_GROUND_STATIONS,
  MOCK_ACTIVE_TRACKED_FLEET,
  MOCK_SPACE_CHECKLIST,
  MOCK_SPACE_EXAM_QUESTIONS,
  MOCK_VERIFIED_CERTIFICATES,
} from '../data/mockSatelliteFleetData';

interface SatelliteFleetModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCar?: Vehicle | null;
}

type TabType = 'radar' | 'rtk' | 'calculator' | 'checklist' | 'exam' | 'registry';

export const SatelliteFleetModal: React.FC<SatelliteFleetModalProps> = ({
  isOpen,
  onClose,
  targetCar,
}) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('radar');
  const [currency, setCurrency] = useState<Currency>('AZN');

  // Tab 1: Radar & Stations
  const [selectedStationId, setSelectedStationId] = useState<GroundStationId>('STATION_BAKU_PRIMARY');
  const [selectedAssetId, setSelectedAssetId] = useState<SatelliteAssetId>('AZERSPACE_1');
  const [fleetSearchQuery, setFleetSearchQuery] = useState('');

  // Tab 2: RTK & Anti-Jamming Simulator
  const [trackedSatellites, setTrackedSatellites] = useState<number>(24);
  const [correctionAge, setCorrectionAge] = useState<number>(1);
  const [carrierToNoiseRatio, setCarrierToNoiseRatio] = useState<number>(45);
  const [agcAttenuation, setAgcAttenuation] = useState<number>(12);
  const [clockDriftNs, setClockDriftNs] = useState<number>(10);
  const [isNtripConnected, setIsNtripConnected] = useState<boolean>(true);

  // Tab 3: Tariff Calculator
  const [fleetCategory, setFleetCategory] = useState<FleetVehicleCategory>('HEAVY_FREIGHT_TIR');
  const [fleetUnits, setFleetUnits] = useState<number>(12);
  const [serviceMonths, setServiceMonths] = useState<number>(12);
  const [includeRtk, setIncludeRtk] = useState<boolean>(true);
  const [includeSpaceAis, setIncludeSpaceAis] = useState<boolean>(false);
  const [includeAzerspace, setIncludeAzerspace] = useState<boolean>(true);
  const [includeGeofence, setIncludeGeofence] = useState<boolean>(true);

  // Tab 4: Cyber Checklist
  const [checklistChecks, setChecklistChecks] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    MOCK_SPACE_CHECKLIST.forEach((item, idx) => {
      initial[item.id] = idx !== 4; // Check almost all by default
    });
    return initial;
  });

  // Tab 5: Exam Simulator
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
  });
  const [hasSubmittedExam, setHasSubmittedExam] = useState<boolean>(false);

  // Tab 6: Certificates & Registry
  const [registryList, setRegistryList] = useState<SatelliteFleetCertificate[]>(MOCK_VERIFIED_CERTIFICATES);
  const [registrySearch, setRegistrySearch] = useState('');
  const [copiedCertId, setCopiedCertId] = useState<string | null>(null);

  // New Certificate Form
  const [newPlate, setNewPlate] = useState(targetCar?.plateNumber || '99-ZA-841');
  const [newVinOrImo, setNewVinOrImo] = useState(targetCar?.vin || 'VF624GPA7KC881920');
  const [newCompanyName, setNewCompanyName] = useState('AzLogistics Global Transit QSC');
  const [newCategory, setNewCategory] = useState<FleetVehicleCategory>('HEAVY_FREIGHT_TIR');
  const [newStation, setNewStation] = useState<GroundStationId>('STATION_BAKU_PRIMARY');
  const [newAsset, setNewAsset] = useState<SatelliteAssetId>('AZERSPACE_1');
  const [newRtkMode, setNewRtkMode] = useState<RtkFixMode>('RTK_FIXED_CENTIMETER');
  const [newSpaceAis, setNewSpaceAis] = useState(false);
  const [newAntiJamming, setNewAntiJamming] = useState(true);
  const [activeCertificate, setActiveCertificate] = useState<SatelliteFleetCertificate>(
    MOCK_VERIFIED_CERTIFICATES[0]
  );

  // Pre-fill if targetCar changes
  React.useEffect(() => {
    if (targetCar?.plateNumber) {
      setNewPlate(targetCar.plateNumber);
    }
    if (targetCar?.vin) {
      setNewVinOrImo(targetCar.vin);
    }
  }, [targetCar]);

  // Derived state
  const selectedStation = useMemo(() => {
    return MOCK_GROUND_STATIONS.find(s => s.id === selectedStationId) || MOCK_GROUND_STATIONS[0];
  }, [selectedStationId]);

  const selectedAsset = useMemo(() => {
    return SATELLITE_ASSETS[selectedAssetId];
  }, [selectedAssetId]);

  const filteredFleet = useMemo(() => {
    if (!fleetSearchQuery.trim()) return MOCK_ACTIVE_TRACKED_FLEET;
    const q = fleetSearchQuery.toLowerCase();
    return MOCK_ACTIVE_TRACKED_FLEET.filter(
      v =>
        v.vehiclePlate.toLowerCase().includes(q) ||
        v.companyNameAz.toLowerCase().includes(q) ||
        v.currentLocationNameAz.toLowerCase().includes(q) ||
        v.geofenceZone.toLowerCase().includes(q)
    );
  }, [fleetSearchQuery]);

  const rtkTelemetry = useMemo(() => {
    return evaluateRtkFixTelemetry(
      trackedSatellites,
      correctionAge,
      carrierToNoiseRatio,
      isNtripConnected
    );
  }, [trackedSatellites, correctionAge, carrierToNoiseRatio, isNtripConnected]);

  const jammingTelemetry = useMemo(() => {
    return evaluateJammingSpoofing(carrierToNoiseRatio, agcAttenuation, clockDriftNs);
  }, [carrierToNoiseRatio, agcAttenuation, clockDriftNs]);

  const tariffCalculation = useMemo(() => {
    return calculateSatelliteFleetTariff(
      fleetUnits,
      fleetCategory,
      serviceMonths,
      includeRtk,
      includeSpaceAis,
      includeAzerspace,
      includeGeofence,
      currency
    );
  }, [
    fleetUnits,
    fleetCategory,
    serviceMonths,
    includeRtk,
    includeSpaceAis,
    includeAzerspace,
    includeGeofence,
    currency,
  ]);

  const checklistEvaluation = useMemo(() => {
    return evaluateSpaceChecklist(MOCK_SPACE_CHECKLIST, checklistChecks);
  }, [checklistChecks]);

  const examEvaluation = useMemo(() => {
    return evaluateSpaceExam(MOCK_SPACE_EXAM_QUESTIONS, examAnswers);
  }, [examAnswers]);

  const filteredRegistry = useMemo(() => {
    if (!registrySearch.trim()) return registryList;
    const q = registrySearch.toLowerCase();
    return registryList.filter(
      cert =>
        cert.certificateId.toLowerCase().includes(q) ||
        cert.vehiclePlate.toLowerCase().includes(q) ||
        cert.companyNameAz.toLowerCase().includes(q) ||
        cert.vinOrImo.toLowerCase().includes(q)
    );
  }, [registryList, registrySearch]);

  const handleChecklistToggle = (id: string) => {
    setChecklistChecks(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCheckAllChecklist = () => {
    const nextChecks: Record<string, boolean> = {};
    MOCK_SPACE_CHECKLIST.forEach(item => {
      nextChecks[item.id] = true;
    });
    setChecklistChecks(nextChecks);
  };

  const handleExamOptionSelect = (questionId: number, optionIdx: number) => {
    setExamAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleQuickFillExam = () => {
    const perfect: Record<number, number> = {};
    MOCK_SPACE_EXAM_QUESTIONS.forEach(q => {
      perfect[q.id] = q.correctOptionIndex;
    });
    setExamAnswers(perfect);
    setHasSubmittedExam(true);
  };

  const handleIssueCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim()) return;

    const cert = issueSatelliteFleetCertificate(
      newPlate,
      newVinOrImo,
      newCompanyName,
      newCategory,
      newStation,
      newAsset,
      newRtkMode,
      newSpaceAis,
      newAntiJamming
    );

    setRegistryList(prev => [cert, ...prev]);
    setActiveCertificate(cert);
    setActiveTab('registry');
  };

  const handleCopyCertId = (certId: string) => {
    navigator.clipboard.writeText(certId);
    setCopiedCertId(certId);
    setTimeout(() => setCopiedCertId(null), 2500);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="satellite-fleet-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-inner">
              <Satellite className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Azərkosmos • RİNN • AYNA • BDYP
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  S-AIS & RTK CANLI
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Peyk Donanma Telemetriyası & RTK S-AIS Rəqəmsal Portalı
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    currency === c
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              data-testid="satellite-modal-close-btn"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto scrollbar-none px-4">
          {[
            { id: 'radar', label: 'Yerüstü Şəbəkə & Peyklər', icon: Radio },
            { id: 'rtk', label: 'RTK Dəqiqlik & Anti-Spoofing', icon: Crosshair },
            { id: 'calculator', label: 'Tarif & Geozona Hesablayıcı', icon: Sliders },
            { id: 'checklist', label: 'Kiberdayanıqlıq Yoxlaması', icon: ShieldCheck },
            { id: 'exam', label: 'İmtahan Simulyatoru', icon: Award },
            { id: 'registry', label: 'Sertifikat & Reyestr', icon: Layers },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-testid={`satellite-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: RADAR & GROUND STATIONS */}
          {activeTab === 'radar' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Top Banner KPI */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-xs text-slate-400 font-medium">Yerüstü Qəbul Stansiyaları</div>
                  <div className="text-xl font-bold text-indigo-400 mt-1">6 Əsas Mərkəz</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Bakı, Şamaxı, Naxçıvan, Gəncə, Qəbələ, Füzuli</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-xs text-slate-400 font-medium">Orbital Peyk Qruplaşması</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">Azerspace 1 & 2</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">46.0°E & 45.0°E GEO + LEO S-AIS</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-xs text-slate-400 font-medium">RTK Diferensial Dəqiqlik</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">1.8 sm (Santimetr)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">NTRIP RTCM 3.3 İP yayımı</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-xs text-slate-400 font-medium">Aktiv İzlənən Donanma</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">5 Canlı Vahid</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">TIR, ADR Tanker, Avtobus, Gəmi</div>
                </div>
              </div>

              {/* Station Selection Cards */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-indigo-400" />
                  <span>Strateji Yerüstü Peyk İdarəetmə və Telemetriya Mərkəzləri</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {MOCK_GROUND_STATIONS.map(st => {
                    const isSelected = st.id === selectedStationId;
                    return (
                      <div
                        key={st.id}
                        data-testid={`station-card-${st.id}`}
                        onClick={() => setSelectedStationId(st.id)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-950/30 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                            : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300">
                              {st.regionAz}
                            </span>
                            <h4 className="text-sm font-bold text-white mt-1.5">{st.nameAz}</h4>
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            {st.status}
                          </span>
                        </div>
                        <div className="mt-3 text-xs text-slate-300 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Antena Çapı:</span>
                            <span className="font-semibold text-white">{st.dishAntennaDiameterMeters} metr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Uplink Gücü (EIRP):</span>
                            <span className="font-semibold text-indigo-300">{st.uplinkEIRPdBW} dBW</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Telemetriya Gecikməsi:</span>
                            <span className="font-mono text-cyan-300">{st.telemetryLatencyMs} ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Koordinat:</span>
                            <span className="font-mono text-[11px] text-slate-400">{st.coordinates.dmsString}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Station Detail Box */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col md:flex-row items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                    Seçilmiş Mərkəz: {selectedStation.nameEn}
                  </div>
                  <h4 className="text-base font-bold text-white mt-0.5">{selectedStation.nameAz}</h4>
                  <p className="text-xs text-slate-300 mt-1">{selectedStation.descriptionAz}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedStation.frequencyBands.map((band, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-300"
                      >
                        {band}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-left md:text-right shrink-0">
                  <div className="text-xs text-slate-400">24/7 Əməliyyat Qaynar Xətti</div>
                  <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                    {selectedStation.emergencyHotline}
                  </div>
                  <div className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 mt-2 inline-block">
                    {selectedStation.redundancyTier}
                  </div>
                </div>
              </div>

              {/* Orbital Assets Selector */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Milli & Qlobal Orbital Peyk Şəbəkəsi Aktivləri</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.values(SATELLITE_ASSETS).map(asset => {
                    const isSelected = asset.id === selectedAssetId;
                    return (
                      <div
                        key={asset.id}
                        data-testid={`asset-card-${asset.id}`}
                        onClick={() => setSelectedAssetId(asset.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/30 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                            : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {asset.orbitType} Orbit
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{asset.orbitalSlot}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-2">{asset.satelliteName}</h4>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2">{asset.primaryMissionAz}</p>
                        <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
                          <span>Tezlik: {asset.frequencyRange}</span>
                          <span className="text-cyan-300 font-semibold">{asset.transponderCount} Transponder</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Fleet Live Table */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-amber-400" />
                    <span>Real Vaxtda Peyklə İzlənən Strateji Donanma Vahidləri</span>
                  </h3>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      data-testid="fleet-search-input"
                      value={fleetSearchQuery}
                      onChange={e => setFleetSearchQuery(e.target.value)}
                      placeholder="Nömrə, şirkət, marşrut axtar..."
                      className="pl-8 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
                    />
                  </div>
                </div>

                <div className="border border-slate-700/80 rounded-xl overflow-hidden bg-slate-900/60">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="px-3 py-2.5">Qeydiyyat / Nəqliyyat</th>
                          <th className="px-3 py-2.5">Şirkət / Operator</th>
                          <th className="px-3 py-2.5">Mövqe / Geozona</th>
                          <th className="px-3 py-2.5">Sürət & Kurs</th>
                          <th className="px-3 py-2.5">Peyk & RTK Rejimi</th>
                          <th className="px-3 py-2.5">C/N0 Siqnal</th>
                          <th className="px-3 py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredFleet.map(item => (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-3 py-2.5 font-bold text-white whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-indigo-300">
                                  {item.vehiclePlate}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-slate-300 whitespace-nowrap">{item.companyNameAz}</td>
                            <td className="px-3 py-2.5 text-slate-300">
                              <div>{item.currentLocationNameAz}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {item.coordinates.lat.toFixed(4)}°N, {item.coordinates.lng.toFixed(4)}°E
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-slate-200 font-mono whitespace-nowrap">
                              {item.speedKmH} km/s • {item.headingDeg}°
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <div className="text-slate-300 text-[11px]">{item.connectedSatellite}</div>
                              <div className="text-[10px] font-semibold text-emerald-400">{item.rtkStatusAz}</div>
                            </td>
                            <td className="px-3 py-2.5 font-mono text-cyan-300 whitespace-nowrap">
                              {item.carrierToNoiseDbHz} dB-Hz (PDOP {item.pdopValue})
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                {item.geofenceStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RTK & ANTI-SPOOFING SIMULATOR */}
          {activeTab === 'rtk' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex items-start gap-3">
                <Crosshair className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-white text-sm">
                    Yüksək Dəqiqlikli Real-Time Kinematic (RTK) & Kiber-Maneə (Jamming/Spoofing) Simulyasiyası
                  </div>
                  <div>
                    Azərkosmos CORS baza stansiyaları, NTRIP RTCM 3.3 axını və CRPA adaptiv antenaları sayəsində avtonom və strateji avtonəqliyyat santimetrlik dəqiqliklə izlənir və elektron siqnal boğulmasından müdafiə olunur.
                  </div>
                </div>
              </div>

              {/* Simulation Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Control sliders */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span>GNSS Telemetriya Parametrləri</span>
                  </h4>

                  {/* Satellites Tracked */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>İzlənən Peyk Sayı (Multi-Constellation):</span>
                      <span className="font-bold text-indigo-400 font-mono">{trackedSatellites} Peyk</span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={36}
                      data-testid="satellites-tracked-slider"
                      value={trackedSatellites}
                      onChange={e => setTrackedSatellites(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>4 Peyk (Kritik Minimum)</span>
                      <span>16 Peyk</span>
                      <span>36 Peyk (Multi-Band Maksimum)</span>
                    </div>
                  </div>

                  {/* Correction Age */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>NTRIP Diferensial Düzəliş Yaşı (Age of Differential):</span>
                      <span className="font-bold text-cyan-400 font-mono">{correctionAge} saniyə</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={45}
                      data-testid="correction-age-slider"
                      value={correctionAge}
                      onChange={e => setCorrectionAge(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>0-1 san (RTK Fixed)</span>
                      <span>10 san (DGPS)</span>
                      <span>45 san (Autonom)</span>
                    </div>
                  </div>

                  {/* C/N0 Ratio */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Daşıyıcı-Küy Nisbəti (C/N0 Signal Level):</span>
                      <span className="font-bold text-emerald-400 font-mono">{carrierToNoiseRatio} dB-Hz</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={52}
                      data-testid="cn0-slider"
                      value={carrierToNoiseRatio}
                      onChange={e => setCarrierToNoiseRatio(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>&lt;28 dB-Hz (Boğulma)</span>
                      <span>38 dB-Hz (Standart)</span>
                      <span>52 dB-Hz (Kristal Təmiz)</span>
                    </div>
                  </div>

                  {/* NTRIP Connection Toggle */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-700/60">
                    <span className="text-xs text-slate-300 font-medium">NTRIP Caster TLS Bağlantısı:</span>
                    <button
                      type="button"
                      onClick={() => setIsNtripConnected(!isNtripConnected)}
                      data-testid="ntrip-toggle-btn"
                      className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        isNtripConnected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {isNtripConnected ? 'BAĞLIDIR (Aktiv)' : 'KƏSİLİB (Off-line)'}
                    </button>
                  </div>
                </div>

                {/* Anti-Jamming & Spoofing Anomaly Sliders */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Elektron Müharibə & Jamming/Spoofing Parametrləri</span>
                  </h4>

                  {/* AGC Attenuation */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Qəbuledici AGC Attenuasiya (Jammer güc artımı):</span>
                      <span className="font-bold text-amber-400 font-mono">{agcAttenuation}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={95}
                      data-testid="agc-slider"
                      value={agcAttenuation}
                      onChange={e => setAgcAttenuation(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>0-20% (Nominal)</span>
                      <span>50% (İnterferensiya)</span>
                      <span>95% (Güclü Jammer)</span>
                    </div>
                  </div>

                  {/* Clock drift ns */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Psevdo-məsafə Saat Sürüşməsi (Clock Drift / Spoofing Anomaly):</span>
                      <span className="font-bold text-rose-400 font-mono">{clockDriftNs} ns</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={120}
                      data-testid="clock-drift-slider"
                      value={clockDriftNs}
                      onChange={e => setClockDriftNs(Number(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>0-25 ns (Normal)</span>
                      <span>60 ns (Şübhəli)</span>
                      <span>&gt;85 ns (Kritik Spoofing)</span>
                    </div>
                  </div>

                  {/* Reset Presets */}
                  <div className="pt-3 border-t border-slate-700/60 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTrackedSatellites(28);
                        setCorrectionAge(1);
                        setCarrierToNoiseRatio(48);
                        setAgcAttenuation(10);
                        setClockDriftNs(8);
                        setIsNtripConnected(true);
                      }}
                      className="px-2.5 py-1 text-[11px] bg-slate-700 hover:bg-slate-600 rounded text-slate-200 transition-colors"
                    >
                      Nominal Rejim
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTrackedSatellites(10);
                        setCorrectionAge(25);
                        setCarrierToNoiseRatio(24);
                        setAgcAttenuation(85);
                        setClockDriftNs(15);
                        setIsNtripConnected(true);
                      }}
                      className="px-2.5 py-1 text-[11px] bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 rounded border border-amber-500/30 transition-colors"
                    >
                      Jamming Hücumu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTrackedSatellites(20);
                        setCorrectionAge(2);
                        setCarrierToNoiseRatio(50);
                        setAgcAttenuation(15);
                        setClockDriftNs(105);
                        setIsNtripConnected(true);
                      }}
                      className="px-2.5 py-1 text-[11px] bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 rounded border border-rose-500/30 transition-colors"
                    >
                      Spoofing Tələsi
                    </button>
                  </div>
                </div>
              </div>

              {/* Real-Time Assessment Telemetry Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* RTK Telemetry Result */}
                <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      RTK Mövqetmə Analizi
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        rtkTelemetry.fixMode === 'RTK_FIXED_CENTIMETER'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : rtkTelemetry.fixMode === 'RTK_FLOAT'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {rtkTelemetry.fixMode}
                    </span>
                  </div>

                  <div className="text-base font-bold text-white">{rtkTelemetry.statusBadgeAz}</div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-slate-400">Üfüqi (Horizontal) Xəta:</div>
                      <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                        {rtkTelemetry.horizontalAccuracyMeters >= 1
                          ? `${rtkTelemetry.horizontalAccuracyMeters.toFixed(2)} metr`
                          : `${(rtkTelemetry.horizontalAccuracyMeters * 100).toFixed(1)} sm`}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-slate-400">Şaquli (Vertical) Xəta:</div>
                      <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
                        {rtkTelemetry.verticalAccuracyMeters >= 1
                          ? `${rtkTelemetry.verticalAccuracyMeters.toFixed(2)} metr`
                          : `${(rtkTelemetry.verticalAccuracyMeters * 100).toFixed(1)} sm`}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-slate-400">Həndəsi Dəqiqlik (PDOP):</div>
                      <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                        {rtkTelemetry.pdop} (HDOP: {rtkTelemetry.hdop})
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-slate-400">SAE Level 4 Avtonom Uyğunluq:</div>
                      <div
                        className={`text-sm font-bold mt-0.5 ${
                          rtkTelemetry.isSafeForAutonomousLevel4 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {rtkTelemetry.isSafeForAutonomousLevel4 ? 'TƏSDİQ OLUNUR' : 'QEYRİ-MƏQBUL'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Jamming & Spoofing Result */}
                <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Elektron Təhdid & Müdafiə Statusu
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        jammingTelemetry.threatLevel === 'NOMINAL_SAFE'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : jammingTelemetry.threatLevel === 'INTERFERENCE_CAUTION'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {jammingTelemetry.threatLevel}
                    </span>
                  </div>

                  <div className="text-base font-bold text-white">{jammingTelemetry.statusBadgeAz}</div>
                  <p className="text-xs text-slate-300">{jammingTelemetry.recommendedActionAz}</p>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-slate-400">CRPA Null-Steering Antena:</div>
                      <div
                        className={`text-sm font-bold mt-0.5 ${
                          jammingTelemetry.antiJammingCrpaFilterActive ? 'text-rose-400' : 'text-slate-300'
                        }`}
                      >
                        {jammingTelemetry.antiJammingCrpaFilterActive ? 'İŞƏ SALINDI (Aktiv Filtr)' : 'Gözləmə Rejimi'}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="text-slate-400">IMU / Dead-Reckoning Füzyon:</div>
                      <div
                        className={`text-sm font-bold mt-0.5 ${
                          jammingTelemetry.imuDeadReckoningEngaged ? 'text-amber-400' : 'text-slate-300'
                        }`}
                      >
                        {jammingTelemetry.imuDeadReckoningEngaged ? 'FÖVQƏLADƏ İDARƏETMƏDƏ' : 'Ehtiyat Hazırlıqda'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TARIFF & GEOFENCING CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span>Dövlət Peyk Telemetriyası və Geozona İllik Tarif Kalkulyatoru</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    "Kosmik fəaliyyət haqqında" Qanuna və Nazirlər Kabinetinin GNSS qərarına uyğun transponder icarəsi, RTK düzəliş və polis dispetçer şlüzü.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Yekun Xidmət Haqqı:</div>
                  <div className="text-2xl font-black text-indigo-400 font-mono">
                    {formatCurrency(tariffCalculation.totalFeeConverted, currency)}
                  </div>
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Donanma Nəqliyyat Kateqoriyası:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {Object.values(FLEET_VEHICLE_PRESETS).map(p => {
                    const isSelected = p.category === fleetCategory;
                    return (
                      <button
                        key={p.category}
                        type="button"
                        onClick={() => {
                          setFleetCategory(p.category);
                          setIncludeRtk(p.requiresRtkCentimeter);
                          setIncludeSpaceAis(p.requiresSpaceBasedAis);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500 text-white'
                            : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="text-xs font-bold">{p.categoryNameAz}</div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Yenilənmə: {p.requiredUpdateIntervalSec} san • Kvota: {p.monthlyBandwidthQuotaMb} MB/ay
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders for Units and Months */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Donanma Vahidlərinin Sayı:</span>
                    <span className="font-bold text-indigo-400 font-mono">{fleetUnits} Nəqliyyat Vahidi</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={150}
                    data-testid="fleet-units-slider"
                    value={fleetUnits}
                    onChange={e => setFleetUnits(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1 Vahid</span>
                    <span>50 Vahid (%15 Endirim)</span>
                    <span>150 Vahid</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Xidmət Müddəti:</span>
                    <span className="font-bold text-cyan-400 font-mono">{serviceMonths} Ay</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={36}
                    data-testid="service-months-slider"
                    value={serviceMonths}
                    onChange={e => setServiceMonths(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1 Ay</span>
                    <span>12 Ay (1 İl)</span>
                    <span>36 Ay (3 İl)</span>
                  </div>
                </div>
              </div>

              {/* Add-on toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/80 flex items-center justify-between cursor-pointer hover:bg-slate-800/60">
                  <div>
                    <div className="text-xs font-bold text-white">RTK Santimetr Dəqiqlik Düzəlişi (NTRIP)</div>
                    <div className="text-[11px] text-slate-400">35 ₼ / ay / vahid</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeRtk}
                    onChange={e => setIncludeRtk(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 cursor-pointer"
                  />
                </label>

                <label className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/80 flex items-center justify-between cursor-pointer hover:bg-slate-800/60">
                  <div>
                    <div className="text-xs font-bold text-white">Space-Based AIS Orbital Ping (S-AIS)</div>
                    <div className="text-[11px] text-slate-400">50 ₼ / ay / vahid (Dənizçilik)</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeSpaceAis}
                    onChange={e => setIncludeSpaceAis(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 cursor-pointer"
                  />
                </label>

                <label className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/80 flex items-center justify-between cursor-pointer hover:bg-slate-800/60">
                  <div>
                    <div className="text-xs font-bold text-white">Azerspace Ehtiyat Peyk Rabitəsi Uplink</div>
                    <div className="text-[11px] text-slate-400">20 ₼ / ay / vahid</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeAzerspace}
                    onChange={e => setIncludeAzerspace(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 cursor-pointer"
                  />
                </label>

                <label className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/80 flex items-center justify-between cursor-pointer hover:bg-slate-800/60">
                  <div>
                    <div className="text-xs font-bold text-white">24/7 Geozona Pozuntusu & BDYP SLA Şlüzü</div>
                    <div className="text-[11px] text-slate-400">10 ₼ / ay / vahid</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeGeofence}
                    onChange={e => setIncludeGeofence(e.target.checked)}
                    className="w-4 h-4 accent-indigo-500 cursor-pointer"
                  />
                </label>
              </div>

              {/* Itemized Calculation Table */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Baza Peyk Telemetriyası ({fleetUnits} vahid × {serviceMonths} ay × 25 ₼):</span>
                  <span className="font-mono text-slate-200">
                    {formatCurrency(tariffCalculation.baseTelematicsFeeAzn, currency)}
                  </span>
                </div>
                {includeRtk && (
                  <div className="flex justify-between text-slate-400">
                    <span>RTK Santimetr Düzəlişləri (35 ₼/ay):</span>
                    <span className="font-mono text-slate-200">
                      {formatCurrency(tariffCalculation.rtkCentimeterCorrectionFeeAzn, currency)}
                    </span>
                  </div>
                )}
                {includeSpaceAis && (
                  <div className="flex justify-between text-slate-400">
                    <span>Space-Based AIS Orbital Ping (50 ₼/ay):</span>
                    <span className="font-mono text-slate-200">
                      {formatCurrency(tariffCalculation.spaceBasedAisSatellitePingFeeAzn, currency)}
                    </span>
                  </div>
                )}
                {includeAzerspace && (
                  <div className="flex justify-between text-slate-400">
                    <span>Azerspace Peyk Uplink İcarəsi (20 ₼/ay):</span>
                    <span className="font-mono text-slate-200">
                      {formatCurrency(tariffCalculation.azerspaceBackupLinkFeeAzn, currency)}
                    </span>
                  </div>
                )}
                {includeGeofence && (
                  <div className="flex justify-between text-slate-400">
                    <span>24/7 Geozona və BDYP SOS Xəbərdarlıq SLA (10 ₼/ay):</span>
                    <span className="font-mono text-slate-200">
                      {formatCurrency(tariffCalculation.geofenceRealtimeAlertFeeAzn, currency)}
                    </span>
                  </div>
                )}
                {tariffCalculation.volumeDiscountAzn > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Həcm Endirimi (Donanma Güzəşti):</span>
                    <span className="font-mono">
                      -{formatCurrency(tariffCalculation.volumeDiscountAzn, currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Dövlət Qeydiyyat və Lisenziya Rüsumu (RİNN):</span>
                  <span className="font-mono text-slate-200">
                    {formatCurrency(tariffCalculation.stateRegulatoryDutyAzn, currency)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>Cəmi Ödəniləcək Məbləğ:</span>
                  <span className="font-mono text-indigo-400">
                    {formatCurrency(tariffCalculation.totalFeeConverted, currency)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CYBER RESILIENCE CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>10 Bəndlik Kosmik Rabitə və GNSS Kiberdayanıqlıq Standartı</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Azərkosmos, RİNN və BDYP tərəfindən müəyyən edilmiş texniki və kiber-təhlükəsizlik tələbləri.
                  </p>
                </div>
                <button
                  type="button"
                  data-testid="check-all-btn"
                  onClick={handleCheckAllChecklist}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shrink-0"
                >
                  Hamısını Təsdiqlə (100%)
                </button>
              </div>

              {/* Progress and Verdict */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">
                    Yoxlama İcrası: {checklistEvaluation.completedItemsCount} / {checklistEvaluation.totalItems} Bənd
                  </span>
                  <span className="font-bold text-indigo-400 font-mono">
                    {checklistEvaluation.complianceScorePercent}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      checklistEvaluation.isEligibleForPermit ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${checklistEvaluation.complianceScorePercent}%` }}
                  />
                </div>
                <div className="text-xs pt-1">
                  <span
                    className={`font-semibold ${
                      checklistEvaluation.isEligibleForPermit ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {checklistEvaluation.verdictAz}
                  </span>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5">
                {MOCK_SPACE_CHECKLIST.map(item => {
                  const isChecked = !!checklistChecks[item.id];
                  return (
                    <div
                      key={item.id}
                      data-testid={`checklist-item-${item.id}`}
                      onClick={() => handleChecklistToggle(item.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'bg-slate-800/60 border-slate-700'
                          : 'bg-rose-950/20 border-rose-900/40 hover:bg-rose-950/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div
                        className="mt-0.5 w-4 h-4 accent-indigo-500 cursor-pointer"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{item.titleAz}</span>
                          {item.isMandatory ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              MƏCBURİ
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                              TÖVSİYƏ
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">({item.category})</span>
                        </div>
                        <p className="text-slate-300 mt-1">{item.descriptionAz}</p>
                        <div className="text-[10px] text-indigo-400 mt-1 font-mono">{item.statutoryBasisAz}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: EXAM SIMULATOR */}
          {activeTab === 'exam' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Kosmik Rabitə və Peyk Naviqasiyası İmtahan Simulyatoru</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Azərkosmos və AYNA rəsmi sertifikat imtahanı (10 sual, minimum 80% keçid balı).
                  </p>
                </div>
                <button
                  type="button"
                  data-testid="quick-fill-exam-btn"
                  onClick={handleQuickFillExam}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shrink-0"
                >
                  Düzgün Cavablarla Tamamla (10/10)
                </button>
              </div>

              {/* Exam Score Summary */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">
                    Düzgün Cavablar: {examEvaluation.correctAnswersCount} / {examEvaluation.totalQuestions}
                  </span>
                  <span
                    className={`font-bold font-mono ${
                      examEvaluation.isPassed ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {examEvaluation.scorePercent}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      examEvaluation.isPassed ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${examEvaluation.scorePercent}%` }}
                  />
                </div>
                <div className="text-xs pt-1">
                  <span
                    className={`font-semibold ${
                      examEvaluation.isPassed ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {examEvaluation.statusSummaryAz}
                  </span>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {MOCK_SPACE_EXAM_QUESTIONS.map(q => {
                  const selectedOpt = examAnswers[q.id];
                  const hasAnswered = selectedOpt !== undefined;
                  const isCorrect = selectedOpt === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      data-testid={`exam-question-${q.id}`}
                      className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {q.id}
                        </span>
                        <div className="text-xs sm:text-sm font-semibold text-white">{q.questionAz}</div>
                      </div>

                      <div className="space-y-1.5 pl-7">
                        {q.optionsAz.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          return (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                                isOptionSelected
                                  ? isCorrect
                                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                                    : 'bg-rose-950/40 border-rose-500 text-rose-200'
                                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                checked={isOptionSelected}
                                onChange={() => handleExamOptionSelect(q.id, optIdx)}
                                className="accent-indigo-500 cursor-pointer"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>

                      {hasAnswered && (
                        <div className="pl-7 text-[11px] text-slate-400 pt-1">
                          <span className="font-semibold text-indigo-300">İzah:</span> {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: CERTIFICATE & REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Issue New Certificate Form */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span>Rəsmi Peyk Donanma Telemetriya Sertifikatı Verilməsi</span>
                </h3>

                <form onSubmit={handleIssueCertificate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Qeydiyyat Nişanı (Dövlət Nömrəsi):</label>
                    <input
                      type="text"
                      data-testid="cert-plate-input"
                      value={newPlate}
                      onChange={e => setNewPlate(e.target.value)}
                      placeholder="99-ZA-841"
                      className="mt-1 w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">VIN Kodu və ya IMO Nömrəsi:</label>
                    <input
                      type="text"
                      data-testid="cert-vin-input"
                      value={newVinOrImo}
                      onChange={e => setNewVinOrImo(e.target.value)}
                      placeholder="VF624GPA7KC881920"
                      className="mt-1 w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Şirkət / Operator Adı:</label>
                    <input
                      type="text"
                      data-testid="cert-company-input"
                      value={newCompanyName}
                      onChange={e => setNewCompanyName(e.target.value)}
                      placeholder="AzLogistics Global QSC"
                      className="mt-1 w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Nəqliyyat Kateqoriyası:</label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value as FleetVehicleCategory)}
                      className="mt-1 w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    >
                      {Object.values(FLEET_VEHICLE_PRESETS).map(p => (
                        <option key={p.category} value={p.category}>
                          {p.categoryNameAz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Baza Yerüstü İdarəetmə Mərkəzi:</label>
                    <select
                      value={newStation}
                      onChange={e => setNewStation(e.target.value as GroundStationId)}
                      className="mt-1 w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    >
                      {MOCK_GROUND_STATIONS.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nameAz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">Təhkim Olunan Peyk Qruplaşması:</label>
                    <select
                      value={newAsset}
                      onChange={e => setNewAsset(e.target.value as SatelliteAssetId)}
                      className="mt-1 w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    >
                      {Object.values(SATELLITE_ASSETS).map(a => (
                        <option key={a.id} value={a.id}>
                          {a.satelliteName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-end pt-2">
                    <button
                      type="submit"
                      data-testid="generate-cert-btn"
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Rəsmi Sertifikat Yarat və SİMA ilə İmzala</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Verified Certificate Display Card */}
              {activeCertificate && (
                <div
                  data-testid="active-certificate-card"
                  className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-500/40 shadow-xl space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/20 pb-3">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
                        Azərbaycan Respublikası Kosmik Agentliyi (Azərkosmos)
                      </span>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Peyk Donanma Telemetriya Şəhadətnaməsi</span>
                        <span className="text-xs font-mono text-emerald-400 font-semibold">
                          ({activeCertificate.certificateId})
                        </span>
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        data-testid="copy-cert-btn"
                        onClick={() => handleCopyCertId(activeCertificate.certificateId)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedCertId === activeCertificate.certificateId ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePrintCertificate}
                        className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Çap Et</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-slate-400 text-[11px]">Nəqliyyat Nişanı:</div>
                      <div className="text-sm font-mono font-bold text-white mt-0.5">
                        {activeCertificate.vehiclePlate}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">VIN / IMO:</div>
                      <div className="text-sm font-mono text-indigo-300 mt-0.5">
                        {activeCertificate.vinOrImo}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Operator:</div>
                      <div className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
                        {activeCertificate.companyNameAz}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Etibarlılıq:</div>
                      <div className="text-xs font-mono text-emerald-400 mt-0.5">
                        {activeCertificate.issueDate} — {activeCertificate.validUntil}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <div className="text-slate-400 text-[11px]">Peyk Aktiv:</div>
                      <div className="text-xs font-semibold text-cyan-300 mt-0.5">
                        {activeCertificate.allocatedSatelliteAsset}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">RTK Standartı:</div>
                      <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                        {activeCertificate.rtkFixCapability}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">Space-AIS:</div>
                      <div className="text-xs font-mono text-slate-300 mt-0.5">
                        {activeCertificate.spaceBasedAisStatus}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[11px]">CRPA Qalxanı:</div>
                      <div className="text-xs font-semibold text-indigo-300 mt-0.5">
                        {activeCertificate.antiJammingCrpaShield ? 'Qoşulub' : 'Yoxdur'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
                    <div className="truncate">SHA-256: {activeCertificate.sha256Digest}</div>
                    <div className="text-emerald-400 shrink-0">SİMA İmza: {activeCertificate.simaUid}</div>
                  </div>
                </div>
              )}

              {/* Public Registry Table */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Azərkosmos Vahid Açıq Peyk Telemetriya Reyestri</span>
                  </h4>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      data-testid="registry-search-input"
                      value={registrySearch}
                      onChange={e => setRegistrySearch(e.target.value)}
                      placeholder="Sertifikat, nömrə, VIN axtar..."
                      className="pl-8 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
                    />
                  </div>
                </div>

                <div className="border border-slate-700/80 rounded-xl overflow-hidden bg-slate-900/60">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="px-3 py-2.5">Sertifikat ID</th>
                          <th className="px-3 py-2.5">Qeydiyyat Nişanı</th>
                          <th className="px-3 py-2.5">Operator</th>
                          <th className="px-3 py-2.5">Peyk & RTK</th>
                          <th className="px-3 py-2.5">Etibarlılıq</th>
                          <th className="px-3 py-2.5">Status</th>
                          <th className="px-3 py-2.5 text-right">Əməliyyat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredRegistry.map(cert => (
                          <tr key={cert.certificateId} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-3 py-2.5 font-mono font-bold text-indigo-300 whitespace-nowrap">
                              {cert.certificateId}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-white font-semibold whitespace-nowrap">
                              {cert.vehiclePlate}
                            </td>
                            <td className="px-3 py-2.5 text-slate-300 whitespace-nowrap">{cert.companyNameAz}</td>
                            <td className="px-3 py-2.5 text-slate-300 whitespace-nowrap">
                              {cert.allocatedSatelliteAsset} • {cert.rtkFixCapability}
                            </td>
                            <td className="px-3 py-2.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                              {cert.validUntil}
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                {cert.status}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setActiveCertificate(cert)}
                                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                              >
                                Şəhadətnaməyə Bax
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Status Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Azərkosmos Teleport & RTK CORS Şəbəkəsi 24/7 Aktivdir</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">Milli Kosmik Şura & ITU Qaydaları</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
