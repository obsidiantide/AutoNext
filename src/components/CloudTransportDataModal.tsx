import React, { useState, useMemo } from 'react';
import {
  Cloud,
  Server,
  Database,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Activity,
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
  HardDrive,
  Network,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';
import { Vehicle } from '../types/vehicle';
import {
  Currency,
  formatCurrency,
  CloudZoneId,
  AiPipelineTier,
  CloudRedundancyOption,
  StorageRetentionMonths,
  CloudTransportCertificate,
  CLOUD_ZONES,
  STREAMING_PIPELINE_PRESETS,
  MOCK_AI_ANOMALY_SAMPLES,
  CLOUD_SECURITY_CHECKLIST,
  CLOUD_EXAM_QUESTIONS,
  calculateCloudTransportTariff,
  evaluateCloudSecurityChecklist,
  evaluateCloudExam,
  issueCloudTransportCertificate,
} from '../utils/cloudTransportDataCompliance';
import {
  MOCK_COMPANY_PRESETS,
  MOCK_VERIFIED_CLOUD_CERTIFICATES,
  FleetCompanyPreset,
} from '../data/mockCloudTransportData';

interface CloudTransportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCar?: Vehicle | null;
}

export type CloudTabId =
  | 'radar'
  | 'ingestion'
  | 'ai-fleet'
  | 'calculator'
  | 'checklist'
  | 'exam'
  | 'certificate'
  | 'registry';

export const CloudTransportDataModal: React.FC<CloudTransportDataModalProps> = ({
  isOpen,
  onClose,
  targetCar,
}) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<CloudTabId>('radar');
  const [currency, setCurrency] = useState<Currency>('AZN');

  // Tab 1: Cloud Radar state
  const [selectedZoneId, setSelectedZoneId] = useState<CloudZoneId>('ZONE_BAKU_PRIMARY');
  const [zoneSearchQuery, setZoneSearchQuery] = useState('');

  // Tab 2: Streaming Ingestion Pipeline state
  const [selectedPipelineId, setSelectedPipelineId] = useState('PIPE_COMMERCIAL_FLEET_CORE');
  const [customPacketMultiplier, setCustomPacketMultiplier] = useState(1.0);

  // Tab 3: AI Fleet Anomaly State
  const [selectedAnomalyIndex, setSelectedAnomalyIndex] = useState(0);
  const [vibrationFilterThreshold, setVibrationFilterThreshold] = useState(0);

  // Tab 4: Calculator state
  const [calcVehicleCount, setCalcVehicleCount] = useState<number>(targetCar ? 45 : 120);
  const [calcRetentionMonths, setCalcRetentionMonths] = useState<StorageRetentionMonths>(12);
  const [calcAiTier, setCalcAiTier] = useState<AiPipelineTier>('ADVANCED_FLEET_AI');
  const [calcRedundancy, setCalcRedundancy] = useState<CloudRedundancyOption>('DUAL_ZONE_ACTIVE_ACTIVE');
  const [calcHasSubsidy, setCalcHasSubsidy] = useState<boolean>(true);

  // Tab 5: Checklist state
  const [checkedListIds, setCheckedListIds] = useState<string[]>([
    'SEC_01_DATA_RESIDENCY',
    'SEC_02_AES_256_ENCRYPTION',
    'SEC_03_SIMA_MFA_AUTH',
    'SEC_05_TIER_IV_REDUNDANCY',
    'SEC_06_SOC_SIEM_MONITORING',
    'SEC_07_DISASTER_RECOVERY_RPO_RTO',
    'SEC_08_WORM_IMMUTABLE_LOGS',
  ]);

  // Tab 6: Exam state
  const [examAnswers, setExamAnswers] = useState<Record<number, string>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);

  // Tab 7 & 8: Certificate & Registry state
  const [companyNameInput, setCompanyNameInput] = useState(
    targetCar ? `${targetCar.make} ${targetCar.model} Loqistika MMC` : 'Baku Express Fleet QSC'
  );
  const [voenInput, setVoenInput] = useState('1402948210');
  const [registryCertificates, setRegistryCertificates] = useState<CloudTransportCertificate[]>(
    MOCK_VERIFIED_CLOUD_CERTIFICATES
  );
  const [activeCertificate, setActiveCertificate] = useState<CloudTransportCertificate>(
    MOCK_VERIFIED_CLOUD_CERTIFICATES[0]
  );
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [registrySearch, setRegistrySearch] = useState('');

  // Calculations
  const activeZone = CLOUD_ZONES[selectedZoneId];

  const filteredZones = useMemo(() => {
    return Object.values(CLOUD_ZONES).filter(
      (z) =>
        z.nameAz.toLowerCase().includes(zoneSearchQuery.toLowerCase()) ||
        z.regionAz.toLowerCase().includes(zoneSearchQuery.toLowerCase()) ||
        z.nameEn.toLowerCase().includes(zoneSearchQuery.toLowerCase())
    );
  }, [zoneSearchQuery]);

  const activePipeline = useMemo(() => {
    const found = STREAMING_PIPELINE_PRESETS.find((p) => p.pipelineId === selectedPipelineId);
    return found || STREAMING_PIPELINE_PRESETS[0];
  }, [selectedPipelineId]);

  const scaledPacketsPerSec = Math.round(
    activePipeline.currentIngestionPacketsPerSec * customPacketMultiplier
  );
  const scaledIngressMbps = Math.round(
    activePipeline.dataIngressMbps * customPacketMultiplier * 10
  ) / 10;

  const filteredAnomalies = useMemo(() => {
    return MOCK_AI_ANOMALY_SAMPLES.filter(
      (s) => s.vibrationFftAmplitudeMmPerSec >= vibrationFilterThreshold
    );
  }, [vibrationFilterThreshold]);

  const activeAnomaly = filteredAnomalies[selectedAnomalyIndex] || MOCK_AI_ANOMALY_SAMPLES[0];

  const tariffResult = useMemo(() => {
    return calculateCloudTransportTariff(
      calcVehicleCount,
      calcRetentionMonths,
      calcAiTier,
      calcRedundancy,
      calcHasSubsidy,
      currency
    );
  }, [calcVehicleCount, calcRetentionMonths, calcAiTier, calcRedundancy, calcHasSubsidy, currency]);

  const checklistEvaluation = useMemo(() => {
    return evaluateCloudSecurityChecklist(checkedListIds);
  }, [checkedListIds]);

  const examResult = useMemo(() => {
    return evaluateCloudExam(examAnswers);
  }, [examAnswers]);

  const filteredRegistry = useMemo(() => {
    const q = registrySearch.toLowerCase().trim();
    if (!q) return registryCertificates;
    return registryCertificates.filter(
      (cert) =>
        cert.certificateId.toLowerCase().includes(q) ||
        cert.fleetCompany.toLowerCase().includes(q) ||
        cert.taxPayerIdVoen.includes(q) ||
        cert.assignedCloudZone.toLowerCase().includes(q)
    );
  }, [registryCertificates, registrySearch]);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedNotification(label);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const handleToggleChecklist = (id: string) => {
    setCheckedListIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllChecklist = () => {
    if (checkedListIds.length === CLOUD_SECURITY_CHECKLIST.length) {
      setCheckedListIds([]);
    } else {
      setCheckedListIds(CLOUD_SECURITY_CHECKLIST.map((item) => item.id));
    }
  };

  const handleAnswerExam = (questionId: number, optionKey: string) => {
    setExamAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleQuickFillExam = () => {
    const perfectAnswers: Record<number, string> = {};
    CLOUD_EXAM_QUESTIONS.forEach((q) => {
      const correct = q.options.find((o) => o.isCorrect);
      if (correct) {
        perfectAnswers[q.id] = correct.key;
      }
    });
    setExamAnswers(perfectAnswers);
    setExamSubmitted(true);
  };

  const handleIssueNewCertificate = () => {
    const newCert = issueCloudTransportCertificate(
      companyNameInput,
      voenInput,
      calcVehicleCount,
      selectedZoneId,
      calcAiTier,
      calcRedundancy,
      checklistEvaluation.percentage
    );
    setRegistryCertificates((prev) => [newCert, ...prev]);
    setActiveCertificate(newCert);
    setActiveTab('certificate');
  };

  const handleApplyPreset = (preset: FleetCompanyPreset) => {
    setCompanyNameInput(preset.companyName);
    setVoenInput(preset.voen);
    setCalcVehicleCount(preset.vehicleCount);
    setSelectedZoneId(preset.assignedZone);
    setCalcAiTier(preset.defaultTier);
    setCalcRedundancy(preset.defaultRedundancy);
    setCalcHasSubsidy(preset.isMunicipalOrGov);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      data-testid="cloud-transport-modal"
    >
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 p-4 sm:p-6 border-b border-sky-500/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 shadow-inner">
              <Cloud className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  RİNN & AzInTelecom
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Tier III / IV G-Cloud
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  AZINTELECOM-CLOUD-AZ-2026
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide mt-1">
                Dövlət Nəqliyyat Bulud Məlumat Mərkəzi & Telemetriya Big Data Gövdəsi
              </h2>
              <p className="text-xs text-slate-400">
                AzInTelecom Suveren G-Cloud, Kafka/Flink axın şini, AI qəza proqnozlaşdırma və ISO 27001 kiber-mühafizə portalı
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency selector */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs">
              {(['AZN', 'USD', 'EUR'] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-1 rounded font-medium transition-all ${
                    currency === c
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c === 'AZN' ? '₼ AZN' : c === 'USD' ? '$ USD' : '€ EUR'}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              data-testid="cloud-modal-close-btn"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
              title="Bağla"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-900/95 border-b border-slate-800 px-3 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {[
            { id: 'radar' as CloudTabId, label: 'Bulud Radar (6 Qovşaq)', icon: Server, testId: 'tab-radar' },
            { id: 'ingestion' as CloudTabId, label: 'Axın Telemetriyası (Kafka/Flink)', icon: Activity, testId: 'tab-ingestion' },
            { id: 'ai-fleet' as CloudTabId, label: 'AI Qəza & Vibrasiya Standı', icon: Cpu, testId: 'tab-ai-fleet' },
            { id: 'calculator' as CloudTabId, label: 'Saxlama & SLA Kalkulyatoru', icon: Sliders, testId: 'tab-calculator' },
            { id: 'checklist' as CloudTabId, label: '10-Nöqtə Kiber Təhlükəsizlik', icon: ShieldCheck, testId: 'tab-checklist' },
            { id: 'exam' as CloudTabId, label: 'İdarəetmə İmtahanı', icon: Award, testId: 'tab-exam' },
            { id: 'certificate' as CloudTabId, label: 'Rəsmi Sertifikat', icon: Layers, testId: 'tab-certificate' },
            { id: 'registry' as CloudTabId, label: 'Vahid Reyestr', icon: Database, testId: 'tab-registry' },
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={tab.testId}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: RADAR */}
          {activeTab === 'radar' && (
            <div className="space-y-6" data-testid="tab-content-radar">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm font-semibold text-sky-300 flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    AzInTelecom Milli Suveren Məlumat Mərkəzləri Şəbəkəsi (6 Strateji Qovşaq)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tier III və Tier IV Uptime Institute standartı, 2N+1 ehtiyat elektrik və Hökumət Buludu inteqrasiyası
                  </p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={zoneSearchQuery}
                    onChange={(e) => setZoneSearchQuery(e.target.value)}
                    placeholder="Qovşaq və ya region axtar..."
                    className="pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-full sm:w-64"
                  />
                </div>
              </div>

              {/* Grid of 6 Zones */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredZones.map((zone) => {
                  const isSelected = zone.id === selectedZoneId;
                  return (
                    <div
                      key={zone.id}
                      onClick={() => setSelectedZoneId(zone.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-950/40 border-sky-500 shadow-lg shadow-sky-500/10'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-2 rounded-lg ${
                              zone.tierClassification === 'TIER_IV_MISSION_CRITICAL'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-sky-500/20 text-sky-300'
                            }`}
                          >
                            <Server className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white line-clamp-1">{zone.nameAz}</h4>
                            <p className="text-[11px] text-slate-400">{zone.regionAz}</p>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            zone.status === 'ONLINE_ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {zone.status === 'ONLINE_ACTIVE' ? 'Aktiv' : 'Yüksək Yük'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">SLA Uptime</span>
                          <span className="font-bold text-emerald-400">{zone.uptimeSlaPercentage}%</span>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">NVMe Yaddaş</span>
                          <span className="font-bold text-sky-300">{zone.nvmeStoragePetabytes} PB</span>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Orta Gecikmə</span>
                          <span className="font-bold text-indigo-300">{zone.averageIngestionLatencyMs} ms</span>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Yaşıl PUE</span>
                          <span className="font-bold text-teal-300">{zone.greenPowerPUE}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-3 line-clamp-2">{zone.descriptionAz}</p>
                    </div>
                  );
                })}
              </div>

              {/* Selected Zone Deep Dive Card */}
              {activeZone && (
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-sky-500/40 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
                    <div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                        {activeZone.tierClassification.replace(/_/g, ' ')}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">{activeZone.nameAz}</h3>
                      <p className="text-xs text-slate-400">{activeZone.nameEn} • {activeZone.coordinates.dmsString}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">NOC Qaynar Xətt:</span>
                      <span className="text-xs font-mono font-semibold text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-800">
                        {activeZone.emergencyNocHotline}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Server Racks</span>
                      <span className="text-lg font-bold text-white">{activeZone.totalComputeRacks} Kabinet</span>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Optik Şəbəkə Şini</span>
                      <span className="text-lg font-bold text-indigo-400">{activeZone.redundantBackboneFiberBandwidthGbps} Gbps</span>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">SLA Zəmanəti</span>
                      <span className="text-lg font-bold text-emerald-400">{activeZone.uptimeSlaPercentage}%</span>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Enerji Effektivliyi</span>
                      <span className="text-lg font-bold text-teal-400">{activeZone.greenPowerPUE} PUE</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                    {activeZone.descriptionAz}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INGESTION PIPELINE */}
          {activeTab === 'ingestion' && (
            <div className="space-y-6" data-testid="tab-content-ingestion">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-sky-300 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Real Vaxt Telemetriya Axını (Kafka & Apache Flink Streaming Engine)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Nəqliyyat vasitələrinin CAN-bus sensorları, GPS koordinatları və rəqəmsal taxoqraf paketlərinin milisaniyəlik emalı
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Yük Multiplikatoru:</span>
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
                    {[0.5, 1.0, 2.0, 4.0].map((m) => (
                      <button
                        key={m}
                        onClick={() => setCustomPacketMultiplier(m)}
                        className={`px-2 py-0.5 text-xs rounded font-medium transition-all ${
                          customPacketMultiplier === m
                            ? 'bg-sky-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {m}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Streaming Pipelines Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STREAMING_PIPELINE_PRESETS.map((pipeline) => {
                  const isSelected = pipeline.pipelineId === selectedPipelineId;
                  const curPackets = Math.round(pipeline.currentIngestionPacketsPerSec * customPacketMultiplier);
                  const curMbps = Math.round(pipeline.dataIngressMbps * customPacketMultiplier * 10) / 10;
                  return (
                    <div
                      key={pipeline.pipelineId}
                      onClick={() => setSelectedPipelineId(pipeline.pipelineId)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-950/40 border-sky-500 shadow-lg shadow-sky-500/10'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                            {pipeline.sourceStream}
                          </span>
                          <h4 className="text-xs font-bold text-white mt-1.5">{pipeline.pipelineNameAz}</h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                          {pipeline.storageTier}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Paket / Saniyə</span>
                          <span className="font-bold text-sky-400">{curPackets.toLocaleString()} pkt/s</span>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Şəbəkə Girişi</span>
                          <span className="font-bold text-indigo-300">{curMbps} Mbps</span>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">İstehlakçı Gecikməsi</span>
                          <span className="font-bold text-emerald-400">{pipeline.consumerLagMilliseconds} ms</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Mühərrik: {pipeline.streamProcessingEngine}</span>
                        <span className="text-emerald-400 font-semibold">İtki: {pipeline.droppedPacketsRatePercentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Streaming Diagnostics Dashboard */}
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Network className="w-4 h-4 text-sky-400" />
                    Seçilmiş Axın Şini: {activePipeline.pipelineNameAz}
                  </h4>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Axın Normal (0 İtki)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Real Vaxt Giriş Paketi</span>
                    <span className="text-xl font-mono font-bold text-sky-400">{scaledPacketsPerSec.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Bant Genişliyi İstismarı</span>
                    <span className="text-xl font-mono font-bold text-indigo-400">{scaledIngressMbps} Mb/s</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Kafka Partisiya Sayı</span>
                    <span className="text-xl font-mono font-bold text-teal-400">32 Partisiya</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Flink İş İstehlakı</span>
                    <span className="text-xl font-mono font-bold text-emerald-400">{activePipeline.consumerLagMilliseconds} ms</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                  <div className="text-sky-400 font-semibold">[KAFKA-CONSUMER-LOG] Stream Pipeline Heartbeat: ACTIVE</div>
                  <div>TOPIC: telematics.commercial.fleet.v1 | PARTITIONS: 32 | REPLICATION_FACTOR: 3</div>
                  <div>STORAGE_TIER: {activePipeline.storageTier} (AES-256 GCM NVMe Storage Pool)</div>
                  <div className="text-emerald-400">STATUS: Flink checkpointing healthy (last checkpoint completed in 18ms)</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI FLEET ANOMALY DETECTION */}
          {activeTab === 'ai-fleet' && (
            <div className="space-y-6" data-testid="tab-content-ai-fleet">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-sky-300 flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    Süni İntellekt Avtopark Qəza & Vibrasiya Proqnozlaşdırma Standı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mühərrik FFT vibrasiyası, batareya hüceyrə balansı, əyləc aşınması və CAN-bus anomaliyalarının maşın öyrənməsi ilə təhlili
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Min Vibrasiya (mm/s):</span>
                  <input
                    type="range"
                    min="0"
                    max="4.5"
                    step="0.5"
                    value={vibrationFilterThreshold}
                    onChange={(e) => {
                      setVibrationFilterThreshold(parseFloat(e.target.value));
                      setSelectedAnomalyIndex(0);
                    }}
                    className="w-28 accent-sky-500"
                  />
                  <span className="text-xs font-mono font-semibold text-sky-400 w-8">
                    {vibrationFilterThreshold}
                  </span>
                </div>
              </div>

              {/* Anomaly Sample Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredAnomalies.map((item, idx) => {
                  const isSelected = idx === selectedAnomalyIndex;
                  const isCritical = item.predictedRiskLevel === 'CRITICAL';
                  const isHigh = item.predictedRiskLevel === 'HIGH';
                  return (
                    <div
                      key={item.vehicleVin}
                      onClick={() => setSelectedAnomalyIndex(idx)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-950/40 border-sky-500 shadow-lg shadow-sky-500/10'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-white">{item.plateNumber}</span>
                          <p className="text-[11px] text-slate-400">{item.model}</p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isCritical
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : isHigh
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {item.predictedRiskLevel}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Vibrasiya (FFT):</span>
                          <span className={`font-mono font-bold ${item.vibrationFftAmplitudeMmPerSec > 4.5 ? 'text-rose-400' : 'text-slate-200'}`}>
                            {item.vibrationFftAmplitudeMmPerSec} mm/s
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Batareya SOH:</span>
                          <span className="font-mono font-semibold text-slate-200">
                            {item.batteryStateOfHealthPercentage}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Əyləc Qalıq Vaxtı:</span>
                          <span className={`font-mono font-semibold ${item.brakePadWearPredictedLifeDays < 15 ? 'text-rose-400' : 'text-slate-200'}`}>
                            {item.brakePadWearPredictedLifeDays} gün
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detailed AI Intervention Report */}
              {activeAnomaly && (
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                          VIN: {activeAnomaly.vehicleVin}
                        </span>
                        <span className="text-xs text-slate-400">{activeAnomaly.fleetCompany}</span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">
                        {activeAnomaly.model} ({activeAnomaly.plateNumber})
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">AI Risk İndeksi:</span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-lg ${
                          activeAnomaly.predictedRiskLevel === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500'
                            : activeAnomaly.predictedRiskLevel === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500'
                        }`}
                      >
                        {activeAnomaly.predictedRiskLevel} LEVEL
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Kardan FFT Vibrasiyası</span>
                      <span className="text-lg font-mono font-bold text-rose-400">
                        {activeAnomaly.vibrationFftAmplitudeMmPerSec} mm/s
                      </span>
                      <span className="text-[10px] text-slate-500 block">Hədd: &lt; 2.5 mm/s</span>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Batareya Sağlamlıq SOH</span>
                      <span className="text-lg font-mono font-bold text-sky-400">
                        {activeAnomaly.batteryStateOfHealthPercentage}%
                      </span>
                      <span className="text-[10px] text-slate-500 block">Hədd: &gt; 85%</span>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Əyləc Bəndi Proqnozu</span>
                      <span className="text-lg font-mono font-bold text-amber-400">
                        {activeAnomaly.brakePadWearPredictedLifeDays} Gün
                      </span>
                      <span className="text-[10px] text-slate-500 block">Kritik: &lt; 15 gün</span>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[11px]">CAN-Bus Xəta Freymi</span>
                      <span className="text-lg font-mono font-bold text-teal-400">
                        {activeAnomaly.canBusErrorFrameRatePerMinute} / dəq
                      </span>
                      <span className="text-[10px] text-slate-500 block">Hədd: &lt; 5 / dəq</span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                    <span className="font-bold flex items-center gap-1.5 text-amber-300">
                      <AlertTriangle className="w-4 h-4" />
                      AzInTelecom AI İntellektual Tövsiyəsi:
                    </span>
                    <p className="mt-1 leading-relaxed">{activeAnomaly.recommendedInterventionAz}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6" data-testid="tab-content-calculator">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <h3 className="text-sm font-semibold text-sky-300 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  Rəsmi Bulud Telemetriya Saxlama və Hesablama SLA Xərc Kalkulyatoru
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  RİNN dövlət tarifləri, NVMe yaddaş saxlama həcmi, AI axın modeli və G-Cloud 2N+1 ehtiyat təbəqəsi üzrə rəsmi qiymətləndirmə
                </p>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">Tez Doldurma Avtopark Şablonları:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {MOCK_COMPANY_PRESETS.slice(0, 3).map((p) => (
                    <button
                      key={p.companyName}
                      onClick={() => handleApplyPreset(p)}
                      className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-left transition-all"
                    >
                      <div className="text-xs font-bold text-white line-clamp-1">{p.companyName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {p.vehicleCount} Nəqliyyat • {p.defaultTier.replace(/_/g, ' ')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders and Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800/40 p-5 rounded-2xl border border-slate-700">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Avtopark Nəqliyyat Vasitəsi Sayı:</span>
                      <span className="font-mono font-bold text-sky-400">{calcVehicleCount} Avtomobil</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="1000"
                      step="1"
                      value={calcVehicleCount}
                      onChange={(e) => setCalcVehicleCount(parseInt(e.target.value) || 1)}
                      className="w-full accent-sky-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Məlumat Saxlama Müddəti (Retention):</span>
                      <span className="font-mono font-bold text-indigo-400">{calcRetentionMonths} Ay</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {([1, 6, 12, 24] as StorageRetentionMonths[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => setCalcRetentionMonths(m)}
                          className={`py-1 text-xs rounded-lg font-medium transition-all ${
                            calcRetentionMonths === m
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {m} Ay
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-300 font-medium block mb-1">Süni İntellekt (AI) Emal Təbəqəsi:</span>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { id: 'BASIC_TELEMETRY' as AiPipelineTier, label: 'Baza Telemetriya', fee: '4 ₼/ay' },
                        { id: 'ADVANCED_FLEET_AI' as AiPipelineTier, label: 'AI Anomaliya', fee: '10 ₼/ay' },
                        { id: 'ENTERPRISE_MISSION_CRITICAL' as AiPipelineTier, label: 'Kritik V2X', fee: '22 ₼/ay' },
                      ].map((tier) => (
                        <button
                          key={tier.id}
                          onClick={() => setCalcAiTier(tier.id)}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            calcAiTier === tier.id
                              ? 'bg-sky-950/60 border-sky-500 text-white'
                              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="font-bold block text-[11px]">{tier.label}</span>
                          <span className="text-[10px] text-sky-400">{tier.fee}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-300 font-medium block mb-1">Coğrafi Ehtiyat və SLA Təbəqəsi:</span>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { id: 'GEO_REDUNDANT_STANDARD' as CloudRedundancyOption, label: 'Tier III Standard', surcharge: '+0%' },
                        { id: 'DUAL_ZONE_ACTIVE_ACTIVE' as CloudRedundancyOption, label: 'Active-Active', surcharge: '+25%' },
                        { id: 'G_CLOUD_SOVEREIGN_TIER_IV' as CloudRedundancyOption, label: 'Tier IV G-Cloud', surcharge: '+50%' },
                      ].map((red) => (
                        <button
                          key={red.id}
                          onClick={() => setCalcRedundancy(red.id)}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            calcRedundancy === red.id
                              ? 'bg-indigo-950/60 border-indigo-500 text-white'
                              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="font-bold block text-[11px]">{red.label}</span>
                          <span className="text-[10px] text-indigo-400">{red.surcharge}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="govSubsidyToggle"
                      checked={calcHasSubsidy}
                      onChange={(e) => setCalcHasSubsidy(e.target.checked)}
                      className="w-4 h-4 accent-sky-500 rounded"
                    />
                    <label htmlFor="govSubsidyToggle" className="text-xs text-slate-300 cursor-pointer">
                      Dövlət / Bələdiyyə Nəqliyyatı 15% Subsidiyasını Tətbiq Et
                    </label>
                  </div>
                </div>

                {/* Calculation Output Card */}
                <div className="bg-slate-900/90 p-5 rounded-xl border border-sky-500/30 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                      Rəsmi RİNN & AzInTelecom Hesablaması
                    </span>
                    <h4 className="text-base font-bold text-white mt-2">Tarif Xülasəsi</h4>
                    <p className="text-xs text-slate-400">{tariffResult.guaranteedSlaUptime}</p>
                  </div>

                  <div className="space-y-2 text-xs border-y border-slate-800 py-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Baza Platforma İcarəsi:</span>
                      <span className="font-mono text-white">{formatCurrency(tariffResult.baseMonthlySubscriptionAzn, currency)} / ay</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">NVMe Yaddaş ({tariffResult.storageVolumeTerabytesMonthly} TB):</span>
                      <span className="font-mono text-white">{formatCurrency(tariffResult.storageCostMonthlyAzn, currency)} / ay</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">AI Hesablama Mühərriki:</span>
                      <span className="font-mono text-white">{formatCurrency(tariffResult.aiComputeProcessingCostMonthlyAzn, currency)} / ay</span>
                    </div>
                    {tariffResult.highAvailabilityRedundancyCostMonthlyAzn > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ehtiyat / SLA Əlavəsi:</span>
                        <span className="font-mono text-indigo-400">+{formatCurrency(tariffResult.highAvailabilityRedundancyCostMonthlyAzn, currency)} / ay</span>
                      </div>
                    )}
                    {tariffResult.subsidyDiscountAmountAzn > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Dövlət Subsidiyası (15%):</span>
                        <span className="font-mono">-{formatCurrency(tariffResult.subsidyDiscountAmountAzn, currency)} / ay</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-400">Aylıq Xalis Məbləğ:</span>
                      <span className="text-xl font-mono font-bold text-sky-400">
                        {formatCurrency(tariffResult.netMonthlyConverted, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="text-xs text-slate-400">İllik Ümumi Xərc:</span>
                      <span className="text-base font-mono font-semibold text-emerald-400">
                        {formatCurrency(tariffResult.netAnnualConverted, currency)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('certificate')}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20"
                  >
                    Bu Konfiqurasiya ilə Sertifikat Tərtib Et
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-6" data-testid="tab-content-checklist">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm font-semibold text-sky-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    10-Nöqtə Suveren Bulud Təhlükəsizlik & ISO/IEC 27001 Yoxlama Siyahısı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    "Fərdi məlumatlar haqqında" Qanun, AES-256 şifrələmə, WORM loqları və Tier IV fiziki kiber-mühafizə
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Uyğunluq Reytinqi:</span>
                    <span
                      className={`text-sm font-bold ${
                        checklistEvaluation.isCompliant ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {checklistEvaluation.percentage}% ({checklistEvaluation.complianceGrade})
                    </span>
                  </div>
                  <button
                    onClick={handleSelectAllChecklist}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-all cursor-pointer"
                  >
                    {checkedListIds.length === CLOUD_SECURITY_CHECKLIST.length ? 'Hamısını Sil' : 'Hamısını Seç'}
                  </button>
                </div>
              </div>

              {/* Checklist items list */}
              <div className="space-y-3">
                {CLOUD_SECURITY_CHECKLIST.map((item) => {
                  const isChecked = checkedListIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'border-slate-600 bg-slate-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="flex-1 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className={`font-bold ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                            {item.order}. {item.titleAz}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-sky-400 border border-slate-800">
                            {item.legalReference}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-1 leading-relaxed">{item.descriptionAz}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: EXAM */}
          {activeTab === 'exam' && (
            <div className="space-y-6" data-testid="tab-content-exam">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm font-semibold text-sky-300 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Bulud Hesablama & Nəqliyyat Məlumatlarının İdarə Edilməsi İmtahan Simulyatoru (10 Sual)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    RİNN, AzInTelecom və BDYP rəsmi hüquqi və texnoloji sertifikatlaşdırma sualları
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleQuickFillExam}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-all shadow-md shadow-sky-600/20"
                  >
                    100% Nəticə ilə Doldur
                  </button>
                </div>
              </div>

              {/* Questions list */}
              <div className="space-y-4">
                {CLOUD_EXAM_QUESTIONS.map((q) => {
                  const selectedKey = examAnswers[q.id];
                  const hasAnswered = !!selectedKey;
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/70 space-y-3 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-white text-sm">
                          Sual {q.id}: {q.questionAz}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {q.legalReference}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt) => {
                          const isSelected = selectedKey === opt.key;
                          let btnStyle = 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800';

                          if (examSubmitted || hasAnswered) {
                            if (opt.isCorrect) {
                              btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                            } else if (isSelected && !opt.isCorrect) {
                              btnStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-sky-950/60 border-sky-500 text-white';
                          }

                          return (
                            <button
                              key={opt.key}
                              onClick={() => handleAnswerExam(q.id, opt.key)}
                              className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all ${btnStyle}`}
                            >
                              <span className="font-mono font-bold text-xs">{opt.key})</span>
                              <span className="flex-1">{opt.textAz}</span>
                            </button>
                          );
                        })}
                      </div>

                      {examSubmitted && (
                        <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 text-slate-400 text-[11px]">
                          <span className="text-sky-300 font-semibold">İzah: </span>
                          {q.explanationAz}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit / Results Bar */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">İmtahan Qiymətləndirməsi:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl font-bold font-mono text-white">
                      {examResult.correctCount} / {examResult.totalQuestions} ({examResult.percentage}%)
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        examResult.isPassed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {examResult.scoreGrade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{examResult.feedbackAz}</p>
                </div>

                <button
                  onClick={() => setExamSubmitted(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  Cavabları Təsdiqlə və Qiymətləndir
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6" data-testid="tab-content-certificate">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-sky-300 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Rəsmi Elektron Nəqliyyat Bulud Qeydiyyat Sertifikatı
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    AZINTELECOM-CLOUD-AZ-2026 rəsmi sertifikat sənədi, SİMA rəqəmsal imzası və SHA-256 heş təsdiqi
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(activeCertificate.certificateId, 'Sertifikat Nömrəsi')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Nömrəni Kopyala</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-all shadow-sm cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Çap Et</span>
                  </button>
                </div>
              </div>

              {copiedNotification && (
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{copiedNotification} uğurla buferə kopyalandı!</span>
                </div>
              )}

              {/* Form to issue a new certificate */}
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 space-y-3">
                <span className="text-xs font-semibold text-slate-300 block">Yeni Sertifikat Rekvizitləri:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Müəssisə Adı:</label>
                    <input
                      type="text"
                      value={companyNameInput}
                      onChange={(e) => setCompanyNameInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">VÖEN:</label>
                    <input
                      type="text"
                      value={voenInput}
                      onChange={(e) => setVoenInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleIssueNewCertificate}
                      className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                    >
                      Yeni Sertifikat Generasiya Et
                    </button>
                  </div>
                </div>
              </div>

              {/* Formal Certificate Layout */}
              <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl border-2 border-sky-500/40 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="text-center border-b border-slate-800 pb-5">
                  <div className="text-xs font-mono tracking-widest text-sky-400 uppercase">
                    Azərbaycan Respublikası Rəqəmsal İnkişaf və Nəqliyyat Nazirliyi
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                    "AzInTelecom" MMC DÖVLƏT NƏQLİYYAT BULUD SERTİFİKATI
                  </h2>
                  <div className="text-xs font-mono text-emerald-400 mt-1 font-bold">
                    SERİYA: {activeCertificate.certificateId}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Daşıyıcı Şirkət</span>
                    <span className="font-bold text-white text-xs">{activeCertificate.fleetCompany}</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Vergi Ödəyicisi VÖEN</span>
                    <span className="font-mono font-bold text-sky-400">{activeCertificate.taxPayerIdVoen}</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Nəqliyyat Sayı</span>
                    <span className="font-mono font-bold text-teal-400">{activeCertificate.fleetVehicleCount} Avtomobil</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Təhkim Olunmuş Zona</span>
                    <span className="font-bold text-indigo-400 text-xs">{activeCertificate.assignedCloudZone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">SLA Zəmanəti</span>
                    <span className="font-semibold text-emerald-400">{activeCertificate.slaUptimeCommitment}</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Aylıq NVMe Həcmi</span>
                    <span className="font-mono font-semibold text-sky-300">{activeCertificate.monthlyStorageVolumeTb} TB / Ay</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">ISO 27001 Uyğunluq Balı</span>
                    <span className="font-bold text-teal-300">{activeCertificate.iso27001ComplianceScore} / 100</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-2 font-mono">
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-slate-400">SİMA Rəqəmsal İmza UID:</span>
                    <span className="text-sky-400">{activeCertificate.simaDigitalUid}</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-slate-400">Verilmə Tarixi:</span>
                    <span className="text-slate-200">{activeCertificate.issueDateIso}</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-slate-400">Etibarlılıq Müddəti:</span>
                    <span className="text-slate-200">{activeCertificate.expiryDateIso}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">SHA-256 Kriptoqrafik Heş Kodu:</span>
                    <span className="text-[10px] text-teal-400 break-all">{activeCertificate.sha256VerificationHash}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-4">
                  <span className="text-[11px]">QR Təsdiqləmə: {activeCertificate.qrVerificationUrl}</span>
                  <span className="text-emerald-400 font-bold uppercase tracking-wider">Hökumət Buludu Təsdiqləndi</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-6" data-testid="tab-content-registry">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <h3 className="text-sm font-semibold text-sky-300 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Vahid Nəqliyyat Bulud Qeydiyyat və Telemetriya Reyestri
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    AzInTelecom, AYNA və BDYP tərəfindən rəsmi qeydiyyata alınmış avtoparkların reyestr bazası
                  </p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Sertifikat, VÖEN və ya şirkət axtar..."
                    className="pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-full sm:w-64"
                  />
                </div>
              </div>

              {/* Registry Table */}
              <div className="overflow-x-auto bg-slate-800/40 rounded-xl border border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="p-3 font-semibold">Sertifikat ID</th>
                      <th className="p-3 font-semibold">Müəssisə / Şirkət</th>
                      <th className="p-3 font-semibold">VÖEN</th>
                      <th className="p-3 font-semibold">Avtopark</th>
                      <th className="p-3 font-semibold">Zona</th>
                      <th className="p-3 font-semibold">ISO 27001 Balı</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold text-right">Əməliyyat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredRegistry.map((cert) => (
                      <tr key={cert.certificateId} className="hover:bg-slate-800/60 transition-colors">
                        <td className="p-3 font-mono font-bold text-sky-400">{cert.certificateId}</td>
                        <td className="p-3 font-medium text-white">{cert.fleetCompany}</td>
                        <td className="p-3 font-mono text-slate-300">{cert.taxPayerIdVoen}</td>
                        <td className="p-3 font-mono text-teal-400">{cert.fleetVehicleCount} avto</td>
                        <td className="p-3 text-slate-300">{cert.assignedCloudZone.replace('ZONE_', '')}</td>
                        <td className="p-3 font-bold text-emerald-400">{cert.iso27001ComplianceScore}%</td>
                        <td className="p-3">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            {cert.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setActiveCertificate(cert);
                              setActiveTab('certificate');
                            }}
                            className="px-2.5 py-1 rounded bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 text-[11px] font-semibold transition-all"
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
        <div className="bg-slate-900 border-t border-slate-800 p-4 px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AzInTelecom G-Cloud Uptime: 99.995% • Sabail & Yevlax Replikasiyası Aktivdir</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all cursor-pointer"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
