import React, { useState, useId } from 'react';
import {
  Bike,
  ShieldCheck,
  MapPin,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Zap,
  HardHat,
  ExternalLink,
  Printer,
  Copy,
  Clock,
  Phone,
  Building,
  UserCheck,
  X,
  Sparkles,
  Info,
  Scale,
} from 'lucide-react';
import {
  MopedSpecInput,
  MopedRegistrationRecord,
  CourierPlatform,
  HelmetCertification,
  ChinstrapType,
  VehiclePowerType,
} from '../types/mopedRegistration';
import {
  MOCK_MOPED_MERO_CENTERS,
  MOCK_MOPED_REGISTRATIONS,
  MOCK_COURIER_SAFETY_STANDARDS,
  MOPED_PRESETS,
} from '../data/mockMopedRegistrationData';
import {
  evaluateMopedCompliance,
  formatAzerbaijanMopedPlate,
  generateMopedRegistrationCertificate,
} from '../utils/mopedRegistration';

interface MopedRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicle?: any;
}

export const MopedRegistrationModal: React.FC<MopedRegistrationModalProps> = ({
  isOpen,
  onClose,
  initialVehicle,
}) => {
  const titleId = useId();
  const [activeTab, setActiveTab] = useState<
    'calculator' | 'safety' | 'mero' | 'certificate' | 'registry'
  >('calculator');

  const [input, setInput] = useState<MopedSpecInput>({
    powerType: 'ice_combustion',
    engineDisplacementCc: 49,
    electricPowerKw: 0,
    maxSpeedKmh: 45,
    ownerAge: 20,
    courierPlatform: 'wolt',
    helmetCert: 'unece_22_06',
    chinStrap: 'double_d_ring',
    hasVisorEyeProtection: true,
    hasReflectiveVest: true,
    hasDeliveryBoxBracket: true,
    deliveryBoxOverhangMeters: 0.35,
    isPassengerPresent: false,
    passengerHasHelmet: false,
    selectedCurrency: 'AZN',
  });

  const [selectedMeroId, setSelectedMeroId] = useState<string>('mero-zabrat');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [meroSearch, setMeroSearch] = useState('');
  const [registrySearch, setRegistrySearch] = useState('');

  const [activeCertificate, setActiveCertificate] = useState<MopedRegistrationRecord>(() =>
    generateMopedRegistrationCertificate({
      plateNumber: '99-A-102',
      brandModel: initialVehicle ? `${initialVehicle.make} ${initialVehicle.model}` : 'Honda Dio 50cc',
      ownerFullName: 'Elvin Cəfərov Rəşad oğlu',
      ownerFin: '4AK892M',
    })
  );

  if (!isOpen) return null;

  const compliance = evaluateMopedCompliance(input);
  const formattedPlate = formatAzerbaijanMopedPlate(activeCertificate.plateNumber);

  const handleApplyPreset = (presetInput: MopedSpecInput) => {
    setInput(presetInput);
  };

  const handleGenerateCertificate = () => {
    const newCert = generateMopedRegistrationCertificate({
      brandModel:
        input.powerType === 'electric_motor'
          ? `E-Skuter (${input.electricPowerKw} kVt)`
          : `Moped (${input.engineDisplacementCc} sm³)`,
      category:
        input.powerType === 'electric_motor'
          ? 'electric_scooter'
          : input.engineDisplacementCc > 125
          ? 'standard_motorcycle'
          : 'moped_light',
      powerType: input.powerType,
      engineDisplacementCc: input.engineDisplacementCc,
      electricPowerKw: input.electricPowerKw,
      maxSpeedKmh: input.maxSpeedKmh,
      courierPlatform: input.courierPlatform,
    });
    setActiveCertificate(newCert);
    setActiveTab('certificate');
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print?.();
  };

  const filteredMeroCenters = MOCK_MOPED_MERO_CENTERS.filter(
    (c) =>
      c.name.toLowerCase().includes(meroSearch.toLowerCase()) ||
      c.region.toLowerCase().includes(meroSearch.toLowerCase()) ||
      c.address.toLowerCase().includes(meroSearch.toLowerCase())
  );

  const filteredRegistrations = MOCK_MOPED_REGISTRATIONS.filter(
    (r) =>
      r.plateNumber.toLowerCase().includes(registrySearch.toLowerCase()) ||
      r.brandModel.toLowerCase().includes(registrySearch.toLowerCase()) ||
      r.ownerFin.toLowerCase().includes(registrySearch.toLowerCase()) ||
      r.ownerFullName.toLowerCase().includes(registrySearch.toLowerCase()) ||
      r.frameVin.toLowerCase().includes(registrySearch.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="relative w-full max-w-5xl my-auto bg-slate-900 text-slate-100 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center justify-center shadow-inner">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  BDYP & AYNA Rəsmi Standartı
                </span>
                <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                  YHQ Maddə 27 & 33
                </span>
              </div>
              <h2 id={titleId} className="text-lg font-bold text-white mt-0.5">
                Moped, Motosiklet və Elektrik Skuter Dövlət Qeydiyyatı Portalı
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            Tənzimləmə & Rüsum Kalkulyatoru
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'safety'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardHat className="w-4 h-4" />
            Dəbilqə & Kuryer Təhlükəsizliyi
          </button>
          <button
            onClick={() => setActiveTab('mero')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'mero'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            MERO Qeydiyyat Radarı
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'certificate'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            DQN & E-Qeydiyyat Vəsiqəsi
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'registry'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            Dövlət Reyestri Axtarışı
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Quick Presets Bar */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Sürətli Təcrübə Ssenariləri (Presets):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {MOPED_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(p.input)}
                  className="text-left p-2.5 rounded-lg border border-slate-700/70 bg-slate-800/40 hover:bg-slate-800 hover:border-emerald-500/50 transition group"
                >
                  <div className="text-xs font-semibold text-white group-hover:text-emerald-400 line-clamp-1">
                    {p.label}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {p.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700">
                  <div className="text-[11px] font-medium text-slate-400">Tələb Olunan Kateqoriya</div>
                  <div className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {compliance.requiredCategory}
                    </span>
                    <span className="text-xs text-slate-400 font-normal">
                      (Min. {compliance.minimumAgeRequired} yaş)
                    </span>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700">
                  <div className="text-[11px] font-medium text-slate-400">Yol Hərəkəti Uyğunluğu</div>
                  <div className="text-sm font-bold mt-1 flex items-center gap-1.5">
                    {compliance.overallRoadLegal ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Qanuni Tam Uyğun
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Qanunsuzluq Aşkarlanıb
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700">
                  <div className="text-[11px] font-medium text-slate-400">Dövlət Qeydiyyat Rüsumları</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">
                    {compliance.totalDutiesConverted} {input.selectedCurrency}
                  </div>
                  <div className="text-[10px] text-slate-400">Nömrə + Texpasport + Texbaxış</div>
                </div>

                <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700">
                  <div className="text-[11px] font-medium text-slate-400">Cərimə / Sanksiya Riski</div>
                  <div
                    className={`text-xl font-bold mt-1 ${
                      compliance.totalFineRiskAzn > 0 ? 'text-rose-400' : 'text-slate-300'
                    }`}
                  >
                    {compliance.totalFineRiskAzn} AZN
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {compliance.potentialViolations.length} qayda pozuntusu
                  </div>
                </div>
              </div>

              {/* Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Vehicle Specs */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bike className="w-4 h-4 text-emerald-400" />
                    Nəqliyyatın Texniki Parametrləri
                  </h3>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Mühərrik Növü
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setInput({ ...input, powerType: 'ice_combustion' })}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                          input.powerType === 'ice_combustion'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                            : 'bg-slate-800/60 text-slate-400 border-slate-700'
                        }`}
                      >
                        Benzin Daxili Yanma (sm³)
                      </button>
                      <button
                        type="button"
                        onClick={() => setInput({ ...input, powerType: 'electric_motor' })}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-1 ${
                          input.powerType === 'electric_motor'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500'
                            : 'bg-slate-800/60 text-slate-400 border-slate-700'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" /> Elektrik Mühərriki (kVt)
                      </button>
                    </div>
                  </div>

                  {input.powerType === 'ice_combustion' ? (
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Mühərrik Həcmi:</span>
                        <span className="font-bold text-white">{input.engineDisplacementCc} sm³</span>
                      </div>
                      <input
                        type="range"
                        min="25"
                        max="250"
                        step="1"
                        value={input.engineDisplacementCc}
                        onChange={(e) =>
                          setInput({ ...input, engineDisplacementCc: Number(e.target.value) })
                        }
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                        <span>49 sm³ (Moped - A1)</span>
                        <span>125 sm³ (A1 həddi)</span>
                        <span>250 sm³ (Motosiklet - A)</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Elektrik Gücü:</span>
                        <span className="font-bold text-white">{input.electricPowerKw} kVt</span>
                      </div>
                      <input
                        type="range"
                        min="0.25"
                        max="20"
                        step="0.25"
                        value={input.electricPowerKw}
                        onChange={(e) =>
                          setInput({ ...input, electricPowerKw: Number(e.target.value) })
                        }
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                        <span>0.25 kVt (Min Qeydiyyat)</span>
                        <span>4.0 kVt (A1)</span>
                        <span>11+ kVt (A Kateqoriya)</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Maksimal Konstruksiya Sürəti:</span>
                      <span className="font-bold text-white">{input.maxSpeedKmh} km/s</span>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="140"
                      step="5"
                      value={input.maxSpeedKmh}
                      onChange={(e) =>
                        setInput({ ...input, maxSpeedKmh: Number(e.target.value) })
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Sürücünün Yaşı:</span>
                      <span
                        className={`font-bold ${
                          compliance.isAgeCompliant ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {input.ownerAge} yaş {!compliance.isAgeCompliant && '(Yetərsizdir)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="65"
                      step="1"
                      value={input.ownerAge}
                      onChange={(e) => setInput({ ...input, ownerAge: Number(e.target.value) })}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Subkateqoriya A1 üçün minimum 16 yaş, A kateqoriyası üçün 18 yaş tələb edilir.
                    </div>
                  </div>
                </div>

                {/* Courier & Purpose Settings */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    İstifadə Təyinatı və Kuryer Şirkəti
                  </h3>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Kuryer / Çatdırılma Platforması
                    </label>
                    <select
                      value={input.courierPlatform}
                      onChange={(e) =>
                        setInput({ ...input, courierPlatform: e.target.value as CourierPlatform })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="wolt">Wolt Azerbaijan Kuryer Xidməti</option>
                      <option value="bolt_food">Bolt Food Çatdırılma Şəbəkəsi</option>
                      <option value="express_166">166 Express Kuryer</option>
                      <option value="yango_delivery">Yango Delivery Kuryer</option>
                      <option value="independent_courier">Fərdi Kommersiya Kuryeri</option>
                      <option value="personal_use">Fərdi Şəxsi İstiqamət (Kuryer deyil)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Valyuta Seçimi
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['AZN', 'USD', 'EUR'] as const).map((curr) => (
                        <button
                          key={curr}
                          type="button"
                          onClick={() => setInput({ ...input, selectedCurrency: curr })}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                            input.selectedCurrency === curr
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                              : 'bg-slate-800/60 text-slate-400 border-slate-700'
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                    <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 flex justify-between">
                      <span>Rəsmi Dövlət Rüsumları Maddələri:</span>
                      <span className="text-emerald-400 font-bold">AR Qanunu Art. 18</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Motosiklet/Moped DQN Nömrə Nişanı:</span>
                      <span className="font-semibold text-white">30 AZN</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Qeydiyyat Şəhadətnaməsi («Texpasport»):</span>
                      <span className="font-semibold text-white">30 AZN</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Dövlət Texniki Baxış Rüsumu:</span>
                      <span className="font-semibold text-white">30 AZN</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Təxmini İcbari Sığorta (İSB):</span>
                      <span className="font-semibold text-white">
                        {compliance.compulsoryInsuranceEstimateAzn} AZN / il
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Violations Warning Bar */}
              {compliance.potentialViolations.length > 0 && (
                <div className="bg-rose-950/30 border border-rose-800/60 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Aşkarlanmış İnzibati Qayda Pozuntuları və Cərimə Riskləri ({compliance.potentialViolations.length}):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {compliance.potentialViolations.map((v, i) => (
                      <div
                        key={i}
                        className="bg-slate-900/60 p-2.5 rounded-lg border border-rose-900/40 text-xs flex justify-between items-start gap-2"
                      >
                        <div>
                          <div className="font-semibold text-rose-200">{v.article}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{v.description}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold whitespace-nowrap text-[11px] border border-rose-500/30">
                          {v.penaltyAzn} AZN
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('safety')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                >
                  Təhlükəsizlik Standartlarını Yoxla
                </button>
                <button
                  type="button"
                  onClick={handleGenerateCertificate}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-2 shadow-lg shadow-emerald-950"
                >
                  <FileText className="w-4 h-4" />
                  DQN və E-Qeydiyyat Vəsiqəsi Tərtib Et
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: HELMET & COURIER SAFETY */}
          {activeTab === 'safety' && (
            <div className="space-y-6">
              {/* Helmet Gauge Card */}
              <div className="bg-slate-950/40 p-5 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                <div className="md:col-span-1 text-center border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-4">
                  <div className="text-xs font-semibold text-slate-400 mb-1">
                    Dəbilqə Təhlükəsizlik İndeksi
                  </div>
                  <div
                    className={`text-4xl font-extrabold ${
                      compliance.helmetScore >= 80
                        ? 'text-emerald-400'
                        : compliance.helmetScore >= 50
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {compliance.helmetScore} / 100
                  </div>
                  <div className="text-xs font-semibold mt-1">
                    {compliance.helmetCompliant ? (
                      <span className="text-emerald-400 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Standarta Tam Uyğun
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Standart Pozuntusu
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    UNECE 22.06 & 22.05 Dövlət Standartı
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Dəbilqə Sertifikatı Standartı
                      </label>
                      <select
                        value={input.helmetCert}
                        onChange={(e) =>
                          setInput({ ...input, helmetCert: e.target.value as HelmetCertification })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="unece_22_06">UNECE 22.06 (Ən Yeni 2024–2026 Standartı)</option>
                        <option value="unece_22_05">UNECE 22.05 (Klassik Avropa Standartı)</option>
                        <option value="dot_fmvss_218">DOT FMVSS 218 (ABŞ Standartı)</option>
                        <option value="non_certified_novelty">Sertifikatsız / Kustar Dekorativ Kask</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Çənə Altı Qayış Bəndləmə Növü
                      </label>
                      <select
                        value={input.chinStrap}
                        onChange={(e) =>
                          setInput({ ...input, chinStrap: e.target.value as ChinstrapType })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="double_d_ring">İkili Halqa (Double D-Ring - Ən Təhlükəsiz)</option>
                        <option value="micrometric_ratchet">Mikrometrik Dişli Qayış (Ratchet)</option>
                        <option value="quick_release">Sadə Klips (Quick Release)</option>
                        <option value="broken_missing">Qırıq, Bağlanmamış və ya Yoxdur</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-850 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={input.hasVisorEyeProtection}
                        onChange={(e) =>
                          setInput({ ...input, hasVisorEyeProtection: e.target.checked })
                        }
                        className="rounded accent-emerald-500"
                      />
                      <span>Şəffaf Vizor / Qoruyucu Şüşə</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-850 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={input.hasReflectiveVest}
                        onChange={(e) =>
                          setInput({ ...input, hasReflectiveVest: e.target.checked })
                        }
                        className="rounded accent-emerald-500"
                      />
                      <span>İşıqqaytarıcı Gödəkcə (Jilet)</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-850 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={input.hasDeliveryBoxBracket}
                        onChange={(e) =>
                          setInput({ ...input, hasDeliveryBoxBracket: e.target.checked })
                        }
                        className="rounded accent-emerald-500"
                      />
                      <span>Xüsusi Metal Bərkidici Karkas</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Courier Delivery Box & Overhang Slider */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bike className="w-4 h-4 text-emerald-400" />
                    Çatdırılma Qutusu (Termoboks) Qabarit Nəzarəti (Maks. 0.50 metr)
                  </h3>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded border ${
                      input.deliveryBoxOverhangMeters <= 0.5
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {input.deliveryBoxOverhangMeters.toFixed(2)} metr{' '}
                    {input.deliveryBoxOverhangMeters > 0.5 ? '(Qadağan Edilmiş Aşma)' : '(İcazəli)'}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={input.deliveryBoxOverhangMeters}
                  onChange={(e) =>
                    setInput({ ...input, deliveryBoxOverhangMeters: Number(e.target.value) })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>0.0 m (Qutusuz)</span>
                  <span className="text-emerald-400 font-semibold">0.50 m (Statutar Maksimum)</span>
                  <span className="text-rose-400">1.0 m (Ağır Qayda Pozuntusu)</span>
                </div>

                {/* Passenger Controls */}
                <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={input.isPassengerPresent}
                      onChange={(e) =>
                        setInput({ ...input, isPassengerPresent: e.target.checked })
                      }
                      className="rounded accent-emerald-500"
                    />
                    <span>İkinci Sərnişin Daşınır</span>
                  </label>

                  {input.isPassengerPresent && (
                    <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={input.passengerHasHelmet}
                        onChange={(e) =>
                          setInput({ ...input, passengerHasHelmet: e.target.checked })
                        }
                        className="rounded accent-emerald-500"
                      />
                      <span className={input.passengerHasHelmet ? 'text-emerald-300' : 'text-rose-400'}>
                        Sərnişin Standarta Uyğun Dəbilqə Taxıb
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Regulatory Checklist */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Azərbaycan Respublikası Qanunvericilik Standartları Cədvəli
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MOCK_COURIER_SAFETY_STANDARDS.map((std) => (
                    <div
                      key={std.id}
                      className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1.5"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-white">{std.title}</span>
                        <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/40 whitespace-nowrap">
                          {std.sanctionPenalty}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium">{std.legalBasis}</div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{std.ruleRequirement}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MERO REGISTRATION RADAR */}
          {activeTab === 'mero' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={meroSearch}
                    onChange={(e) => setMeroSearch(e.target.value)}
                    placeholder="MERO şöbəsi, rayon və ya ünvan axtar..."
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="text-xs text-slate-400">
                  Cəmi: <strong className="text-white">{filteredMeroCenters.length}</strong> akkreditə
                  olunmuş MERO şöbəsi
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMeroCenters.map((mero) => (
                  <div
                    key={mero.id}
                    className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                      selectedMeroId === mero.id
                        ? 'bg-slate-850 border-emerald-500 shadow-md shadow-emerald-950/30'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-white line-clamp-1">{mero.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {mero.region}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{mero.address}</span>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{mero.contactPhone}</span>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{mero.operatingHours}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Gözləmə Müddəti:</span>
                        <span className="font-bold text-emerald-400">~{mero.currentWaitMinutes} dəqiqə</span>
                      </div>

                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Gündəlik Limit:</span>
                        <span className="font-semibold text-slate-200">{mero.dailySlotCapacity} moped/gün</span>
                      </div>

                      <div className="flex gap-1.5 pt-1">
                        {mero.acceptsElectricMopeds && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            E-Skuter Qəbulu
                          </span>
                        )}
                        {mero.hasTheoreticalExamHall && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            A1 İmtahan Zalı
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMeroId(mero.id);
                          setBookingConfirmed(true);
                          setTimeout(() => setBookingConfirmed(false), 2500);
                        }}
                        className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          selectedMeroId === mero.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {selectedMeroId === mero.id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Seçilib (Növbəyə Yazıl)
                          </>
                        ) : (
                          'Bu Şöbəni Seç'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {bookingConfirmed && (
                <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  MERO şöbəsinə elektron növbə təsdiqləndi! Texpasport və nömrə təhvil üçün SMS bildiriş
                  göndərildi.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CERTIFICATE & LICENSE PLATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {/* License Plate Visualizer */}
              <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Azərbaycan Respublikası Standartı Üzrə Moped / Motosiklet Nömrə Nişanı (DQN)
                </div>

                {/* Authentic 2-Tier Plate */}
                <div className="bg-white text-slate-900 border-4 border-slate-900 rounded-xl p-3 shadow-2xl flex flex-col items-center justify-center w-52 h-36 font-mono font-black relative select-none">
                  {/* Hologram security circle */}
                  <div className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full border border-slate-400 bg-gradient-to-tr from-slate-300 via-white to-slate-400 opacity-60"></div>

                  <div className="flex items-center justify-between w-full border-b border-slate-300 pb-1 px-1">
                    {/* Blue AZ Strip */}
                    <div className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <span>🇦🇿</span>
                      <span>AZ</span>
                    </div>
                    {/* Region Code */}
                    <div className="text-2xl tracking-widest text-slate-900 font-extrabold">
                      {formattedPlate.region}
                    </div>
                  </div>

                  {/* Series and Digits */}
                  <div className="text-3xl tracking-wider text-slate-900 mt-2 font-black">
                    {formattedPlate.series} {formattedPlate.digits}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 text-center max-w-md">
                  Dövlət Yol Polisi İdarəsinin 2024–2026 rəsmi qərarına əsasən mopedlərə verilən kiçik
                  ölçülü iki-sətrli rəsmi qeydiyyat lövhəsi.
                </div>
              </div>

              {/* Official Electronic Certificate Document */}
              <div className="bg-slate-950 p-6 rounded-2xl border-2 border-slate-700 shadow-2xl space-y-5 text-slate-200">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 text-xl font-bold">
                      🇦🇿
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                        AZƏRBAYCAN RESPUBLİKASI DAXİLİ İŞLƏR NAZİRLİYİ
                      </div>
                      <div className="text-sm font-bold text-white">
                        BAŞ DÖVLƏT YOL POLİSİ İDARƏSİ — MOPED ELEKTRON QEYDİYYAT ŞƏHADƏTNAMƏSİ
                      </div>
                      <div className="text-xs text-emerald-400 font-mono">
                        № {activeCertificate.registrationCertificateNumber}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Rəsmi Təsdiq Edilib
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">
                      QR: {activeCertificate.qrTelemetry}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400 text-[10px]">Sahibinin S.A.A.:</div>
                    <div className="font-bold text-white mt-0.5">{activeCertificate.ownerFullName}</div>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400 text-[10px]">Sahibinin FİN Kodu:</div>
                    <div className="font-mono font-bold text-emerald-400 mt-0.5">
                      {activeCertificate.ownerFin}
                    </div>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400 text-[10px]">Dövlət DQN Nömrəsi:</div>
                    <div className="font-mono font-bold text-white mt-0.5">
                      {activeCertificate.plateNumber}
                    </div>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400 text-[10px]">Marka və Model:</div>
                    <div className="font-bold text-white mt-0.5">{activeCertificate.brandModel}</div>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400 text-[10px]">Şassi / Çərçivə VIN:</div>
                    <div className="font-mono text-slate-300 mt-0.5">{activeCertificate.frameVin}</div>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400 text-[10px]">Mühərrik Nömrəsi:</div>
                    <div className="font-mono text-slate-300 mt-0.5">
                      {activeCertificate.engineSerial}
                    </div>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400 text-[10px]">Tərtib Tarixi:</div>
                    <div className="text-slate-300 mt-0.5">{activeCertificate.issueDate}</div>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400 text-[10px]">Növbəti Texbaxış:</div>
                    <div className="text-emerald-400 font-semibold mt-0.5">
                      {activeCertificate.inspectionExpiryDate}
                    </div>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="text-slate-400 text-[10px]">İcbari Sığorta Polisi:</div>
                    <div className="font-mono text-slate-300 mt-0.5">
                      {activeCertificate.insurancePolicyNumber}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>SİMA Rəqəmsal İmza ilə Təsdiqlənmiş Elektron Sənəd</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyCode(activeCertificate.registrationCertificateNumber)
                      }
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? 'Kopyalandı!' : 'Sənəd Nömrəsini Kopyala'}
                    </button>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Çap Et / PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: UNIFIED REGISTRY SEARCH */}
          {activeTab === 'registry' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="DQN nömrəsi (məs. 99-A-102), FİN və ya marka axtar..."
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="text-xs text-slate-400">
                  Reyestrdə: <strong className="text-white">{filteredRegistrations.length}</strong> qeydiyyat
                  tapıldı
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRegistrations.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm bg-slate-900 px-2 py-1 rounded border border-slate-700 text-white">
                          {rec.plateNumber}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">{rec.brandModel}</div>
                          <div className="text-[11px] text-slate-400">{rec.ownerFullName}</div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          rec.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {rec.status === 'active' ? 'Aktiv Qeydiyyat' : 'Texbaxış Gözləyir'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-850">
                      <div>
                        <span>FİN: </span>
                        <strong className="text-slate-200 font-mono">{rec.ownerFin}</strong>
                      </div>
                      <div>
                        <span>Sertifikat: </span>
                        <strong className="text-slate-200 font-mono text-[11px]">
                          {rec.registrationCertificateNumber}
                        </strong>
                      </div>
                      <div>
                        <span>Kuryer: </span>
                        <strong className="text-slate-200 capitalize">
                          {rec.courierPlatform.replace('_', ' ')}
                        </strong>
                      </div>
                      <div>
                        <span>Texbaxış Bitmə: </span>
                        <strong className="text-emerald-400">{rec.inspectionExpiryDate}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-850 flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">
                        VIN: {rec.frameVin}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCertificate(rec);
                          setActiveTab('certificate');
                        }}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                      >
                        <span>Vəsiqəyə Bax</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400" />
            <span>Milli Məclis & BDYP Moped Standartı 2024–2026. Bütün hüquqlar qorunur.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
