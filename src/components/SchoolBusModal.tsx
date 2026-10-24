import React, { useState } from 'react';
import {
  X,
  Award,
  Search,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Copy,
  Check,
  MapPin,
  Clock,
  Shield,
  FileText,
  Bus,
  Users,
  AlertOctagon,
  Gauge,
  Sparkles,
  Phone,
  School,
  Activity,
  Calculator,
} from 'lucide-react';
import { Currency, Vehicle } from '../types/vehicle';
import {
  SchoolBusCategory,
  SchoolBusCertificate,
  SchoolBusDriverProfile,
  SchoolBusServiceTier,
  SchoolBusTechnicalChecklist,
  auditSchoolBusDriver,
  auditSchoolBusTechnical,
  calculateSchoolRoutePricing,
  generateSchoolBusCertificate,
} from '../utils/schoolBusCompliance';
import {
  MOCK_ACCREDITED_SCHOOLS,
  MOCK_SCHOOL_BUS_PRESETS,
  MOCK_VERIFIED_PERMITS_REGISTRY,
  SCHOOL_BUS_STATUTORY_RULES,
} from '../data/mockSchoolBusData';

interface SchoolBusModalProps {
  isOpen: boolean;
  vehicle?: Vehicle | null;
  currency?: Currency;
  onClose: () => void;
}

type TabType = 'audit' | 'driver' | 'routes' | 'registry' | 'certificate';

export const SchoolBusModal: React.FC<SchoolBusModalProps> = ({
  isOpen,
  vehicle,
  currency = 'AZN',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('audit');
  const [copiedCode, setCopiedCode] = useState(false);

  // Active Vehicle Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>(MOCK_SCHOOL_BUS_PRESETS[0].id);
  const activePreset = MOCK_SCHOOL_BUS_PRESETS.find((p) => p.id === selectedPresetId) || MOCK_SCHOOL_BUS_PRESETS[0];

  // Tab 1: Technical Checklist State
  const [checklist, setChecklist] = useState<SchoolBusTechnicalChecklist>(activePreset.checklist);

  // Tab 2: Driver Profile State
  const [driver, setDriver] = useState<SchoolBusDriverProfile>(activePreset.driver);
  const [chaperoneName, setChaperoneName] = useState<string>(activePreset.chaperoneName);

  // Tab 3: Route & Pricing Calculator State
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(activePreset.schoolId);
  const [calcCategory, setCalcCategory] = useState<SchoolBusCategory>(activePreset.category);
  const [calcDistanceKm, setCalcDistanceKm] = useState<number>(12);
  const [calcStudentsCount, setCalcStudentsCount] = useState<number>(activePreset.capacitySeats - 2);
  const [calcServiceTier, setCalcServiceTier] = useState<SchoolBusServiceTier>('standard');
  const [hasSiblingDiscount, setHasSiblingDiscount] = useState<boolean>(false);
  const [activeCurrency, setActiveCurrency] = useState<Currency>(currency);

  // Tab 4: Registry Search State
  const [registrySearchQuery, setRegistrySearchQuery] = useState<string>('');

  // Tab 5: Official Certificate State
  const [activeCertificate, setActiveCertificate] = useState<SchoolBusCertificate>(
    MOCK_VERIFIED_PERMITS_REGISTRY[0]
  );

  if (!isOpen) return null;

  // Handle Preset Selection
  const handleSelectPreset = (presetId: string) => {
    const found = MOCK_SCHOOL_BUS_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setSelectedPresetId(found.id);
    setChecklist({ ...found.checklist });
    setDriver({ ...found.driver });
    setChaperoneName(found.chaperoneName);
    setSelectedSchoolId(found.schoolId);
    setCalcCategory(found.category);
    setCalcStudentsCount(found.capacitySeats - 2);
  };

  // Run Real-time Audits
  const technicalAudit = auditSchoolBusTechnical(checklist);
  const driverAudit = auditSchoolBusDriver(driver);

  // Pricing Calculation
  const pricingResult = calculateSchoolRoutePricing({
    category: calcCategory,
    oneWayDistanceKm: calcDistanceKm,
    studentsCount: calcStudentsCount,
    serviceTier: calcServiceTier,
    hasSiblingDiscount,
    currency: activeCurrency,
  });

  const selectedSchool =
    MOCK_ACCREDITED_SCHOOLS.find((s) => s.id === selectedSchoolId) || MOCK_ACCREDITED_SCHOOLS[0];

  // Filtered Registry Permits
  const filteredPermits = MOCK_VERIFIED_PERMITS_REGISTRY.filter((cert) => {
    const q = registrySearchQuery.toLowerCase();
    return (
      cert.plateNumber.toLowerCase().includes(q) ||
      cert.certificateNumber.toLowerCase().includes(q) ||
      cert.schoolName.toLowerCase().includes(q) ||
      cert.driverFullName.toLowerCase().includes(q)
    );
  });

  // Generate Certificate Handler
  const handleGenerateCertificate = () => {
    const newCert = generateSchoolBusCertificate({
      schoolId: selectedSchool.id,
      schoolName: selectedSchool.name,
      vehicleMakeModel: vehicle ? `${vehicle.make} ${vehicle.model}` : activePreset.makeModel,
      plateNumber: vehicle?.plateNumber || activePreset.plateNumber,
      vinCode: vehicle?.vin || activePreset.vinCode,
      capacitySeats: activePreset.capacitySeats,
      driverFullName: driver.fullName,
      driverFin: driver.finCode,
      chaperoneFullName: chaperoneName,
      isFullyCompliant: technicalAudit.isCompliant && driverAudit.isEligible,
    });
    setActiveCertificate(newCert);
    setActiveTab('certificate');
  };

  const handleCopyCertificate = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(
        `AYNA & ELM VƏ TƏHSİL NAZİRLİYİ MƏKTƏBLİ NƏQLİYYAT VƏSİQƏSİ\nVəsiqə №: ${activeCertificate.certificateNumber}\nMarşrut Pasportu: ${activeCertificate.routePassportNumber}\nMəktəb: ${activeCertificate.schoolName}\nAvtobus: ${activeCertificate.vehicleMakeModel} (${activeCertificate.plateNumber})\nSürücü: ${activeCertificate.driverFullName} (${activeCertificate.driverFin})\nBələdçi: ${activeCertificate.chaperoneFullName}\nReytinq: ${activeCertificate.complianceRating}\nTəhlükəsizlik Həddi: Maksimal ${activeCertificate.speedCapKmh} km/saat\nYoxlama Linki: ${activeCertificate.qrVerificationUrl}`
      );
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Məktəbli Avtobusları və Şagird Daşınması Portalı
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  AYNA & BDYP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Elm və Təhsil Nazirliyi, AYNA & BDYP — UNECE R107 & NK Qərarı № 141 Məktəbli Nəqliyyat Təhlükəsizliyi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="school-bus-close-btn"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 sm:px-6 overflow-x-auto gap-2 py-2">
          {[
            { id: 'audit', label: '1. Texniki Təhlükəsizlik Standı', icon: Shield },
            { id: 'driver', label: '2. Sürücü & Bələdçi Attestasiyası', icon: Users },
            { id: 'routes', label: '3. Məktəblər & Marşrut Kalkulyatoru', icon: Calculator },
            { id: 'registry', label: '4. Vahid İcazə Reyestri', icon: Search },
            { id: 'certificate', label: '5. Elektron Buraxılış Vəsiqəsi', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                data-testid={`school-bus-tab-${tab.id}`}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: TECHNICAL SAFETY & YELLOW BUS AUDITOR */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {/* Presets Bar */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Sınaq Məktəbli Avtobus Modelləri və Flot Presetləri
                  </span>
                  <span className="text-[11px] text-amber-400/90 font-mono">
                    Aktiv: {activePreset.plateNumber}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {MOCK_SCHOOL_BUS_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.id)}
                        data-testid={`preset-btn-${preset.id}`}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500/50 text-white shadow-md shadow-amber-500/10'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-[11px] font-bold truncate">{preset.makeModel.split(' ')[0]}</div>
                        <div className="text-[10px] font-mono text-amber-400">{preset.plateNumber}</div>
                        <div className="text-[9px] text-slate-500">{preset.capacitySeats} yerlik</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Yellow Bus Visual Simulator Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-slate-950 border border-amber-500/30 p-5">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-xs tracking-wider flex items-center gap-1 shadow-md">
                        <Bus className="w-3.5 h-3.5" />
                        RAL 1023 SARI MƏKTƏB AVTOBUSU
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-amber-400/30 font-mono text-xs">
                        Maksimal Sürət: 60 km/saat
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white">
                      {vehicle ? `${vehicle.make} ${vehicle.model}` : activePreset.makeModel}
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl">
                      Qanunvericiliyə əsasən, mütəşəkkil uşaq daşınması həyata keçirən bütün nəqliyyat vasitələri
                      xüsusi sarı rəng, "UŞAQLAR" identifikasiya nişanları və qatlanan "STOP" qanadı ilə təchiz edilməlidir.
                    </p>
                  </div>

                  {/* Safety Score Meter */}
                  <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shrink-0 shadow-lg">
                    <div className="text-center">
                      <div
                        className={`text-3xl font-black ${
                          technicalAudit.score === 100
                            ? 'text-emerald-400'
                            : technicalAudit.score >= 80
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                        data-testid="technical-score"
                      >
                        {technicalAudit.score}%
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Təhlükəsizlik İndeksi
                      </div>
                    </div>
                    <div className="h-10 w-px bg-slate-800" />
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{technicalAudit.passedItemsCount} Tələb Ödənilib</span>
                      </div>
                      {technicalAudit.deficiencies.length > 0 ? (
                        <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{technicalAudit.deficiencies.length} Qüsur Aşkarlandı</span>
                        </div>
                      ) : (
                        <div className="text-slate-400 text-[11px]">Qüsur yoxdur</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 11-Point Technical Checklist Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-400" />
                    UNECE R107 & Nazirlər Kabinetinin 141 №-li Qərarı — 11 Məcburi Meyar
                  </h4>
                  <span className="text-xs text-slate-400">
                    {technicalAudit.passedItemsCount} / {technicalAudit.totalItemsCount} təsdiqlənib
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      key: 'yellowBodyColor',
                      title: 'RAL 1023 Sarı Kuzov Rəngi',
                      desc: 'Məktəbli identifikatoru; trafikdə dərhal fərqlənməni təmin edən sarı örtük',
                      badge: 'YHQ Maddə 54',
                    },
                    {
                      key: 'reflectiveStripes',
                      title: 'İşıqqaytarıcı Kontur Xətləri',
                      desc: 'Qaranlıqda və dumanlı havada görünən mikroprizmatik kontur lenti',
                      badge: 'YHQ Əlavə 1',
                    },
                    {
                      key: 'childIdentifierSigns',
                      title: 'Ön və Arxa "UŞAQLAR" Nişanları',
                      desc: 'Qırmızı haşiyəli, uşaq silueti olan 400x400 mm kvadrat nişanlar',
                      badge: 'İXM Maddə 324-1',
                    },
                    {
                      key: 'foldingStopArm',
                      title: 'Qatlanan LED "STOP" Qanadı (Stop Arm)',
                      desc: 'Qapı açıldıqda avtomatik yana çıxan sayrışan qırmızı STOP qanadı',
                      badge: 'NK Qərarı № 141',
                    },
                    {
                      key: 'speedLimiter60kmh',
                      title: '60 km/saat Sürət Məhdudlaşdırıcısı',
                      desc: 'Mühərrik beyninə (ECU) proqramlaşdırılmış aparat sürət qapağı',
                      badge: 'İXM Maddə 342.2-2',
                    },
                    {
                      key: 'alcolockInstalled',
                      title: 'Alko-Kilid (Alcolock) Cihazı',
                      desc: 'Reysdən əvvəl 0.00‰ spirt testi; spirt aşkarlandıqda mühərrik bloklanır',
                      badge: 'İXM Maddə 333',
                    },
                    {
                      key: 'threePointSeatbelts',
                      title: '3-Nöqtəli Təhlükəsizlik Kəmərləri',
                      desc: 'Bütün sərnişin oturacaqlarında uşaq anatomiyasına uyğun kəmərlər',
                      badge: 'YHQ Maddə 37',
                    },
                    {
                      key: 'lowStepOrRamp',
                      title: 'Aşağı Giriş Pilləsi (≤250 mm)',
                      desc: 'Kiçikyaşlı məktəblilər üçün aşağı və ya hidravlik enən pillə',
                      badge: 'UNECE R107',
                    },
                    {
                      key: 'cctvAndGpsTelemetry',
                      title: '4-Kameralı CCTV & AYNA GPS İzləmə',
                      desc: 'Salon daxili 30 günlük arxivli video qeydiyyat və canlı xəritə telemetriyası',
                      badge: 'NK Qərarı № 141',
                    },
                    {
                      key: 'emergencyRoofHatches',
                      title: 'Damda Təcili Çıxış Lyuku',
                      desc: 'Çevrilmə və ya qəza zamanı şagirdlərin dərhal təxliyəsi üçün qəza qapağı',
                      badge: 'UNECE R107',
                    },
                    {
                      key: 'fireExtinguishersAndAidKits',
                      title: '2x OP-5 Yanğınsöndürən & Uşaq Aptekçəsi',
                      desc: 'Sürücü kabinəsində və salonun arxa hissəsində sertifikatlı vasitələr',
                      badge: 'YHQ Əlavə 1',
                    },
                  ].map((item) => {
                    const isChecked = checklist[item.key as keyof SchoolBusTechnicalChecklist];
                    return (
                      <div
                        key={item.key}
                        onClick={() =>
                          setChecklist((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key as keyof SchoolBusTechnicalChecklist],
                          }))
                        }
                        data-testid={`checklist-item-${item.key}`}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isChecked
                            ? 'bg-slate-900/90 border-slate-700/80 hover:border-amber-500/50'
                            : 'bg-rose-950/20 border-rose-800/40 hover:border-rose-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs sm:text-sm">{item.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by parent div
                          className="mt-1 h-5 w-5 rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sanctions & Recommendations Alert */}
              {technicalAudit.deficiencies.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50 space-y-2">
                  <div className="flex items-center justify-between text-rose-300 font-bold text-xs sm:text-sm">
                    <span className="flex items-center gap-1.5">
                      <AlertOctagon className="w-4 h-4 text-rose-400" />
                      Qanunsuz Şagird Daşınması Riski və İnzibati Məsuliyyət
                    </span>
                    <span className="text-rose-400 font-mono font-black" data-testid="fine-amount">
                      Cərimə: {technicalAudit.fineAmountAzn} AZN
                    </span>
                  </div>
                  <p className="text-xs text-rose-200/80 leading-relaxed">
                    Pozulan qanunvericilik maddələri: {technicalAudit.legalArticlesViolated.join(', ')}.
                    Bu texniki qüsurlarla şagirdlərin daşınması qadağandır və nəqliyyat vasitəsi cərimə meydançasına
                    təxliyə oluna bilər.
                  </p>
                  <ul className="text-xs text-slate-300 list-disc list-inside space-y-1 pt-1">
                    {technicalAudit.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    // Reset to all true (100% compliant)
                    setChecklist({
                      yellowBodyColor: true,
                      reflectiveStripes: true,
                      childIdentifierSigns: true,
                      foldingStopArm: true,
                      speedLimiter60kmh: true,
                      alcolockInstalled: true,
                      threePointSeatbelts: true,
                      lowStepOrRamp: true,
                      cctvAndGpsTelemetry: true,
                      emergencyRoofHatches: true,
                      fireExtinguishersAndAidKits: true,
                    });
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  Hamısını Standarta Uyğunlaşdır (100%)
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('driver')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Növbəti: Sürücü & Bələdçi Attestasiyası →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DRIVER & CHAPERONE QUALIFICATION AUDITOR */}
          {activeTab === 'driver' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-mono text-xs font-bold">
                      YHQ Maddə 20.3 & NK 141
                    </span>
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      Məktəbli Sürücüsü və Müşayiətçi (Bələdçi) Standartları
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Uşaqların daşınmasında yalnız xüsusi kateqoriyalı, ən azı 3 illik fasiləsiz təcrübəyə malik və
                    psixoloji müayinədən keçmiş sürücülərə icazə verilir.
                  </p>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 ${
                    driverAudit.isEligible
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                  data-testid="driver-eligibility-badge"
                >
                  {driverAudit.isEligible ? 'SÜRÜCÜ VƏ BƏLƏDÇİ TƏSDİQLƏNDİ' : 'UYĞUNSUZLUQ AŞKARLANDI'}
                </div>
              </div>

              {/* Driver & Chaperone Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Driver Dossier Inputs */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    Sürücü Şəxsi Dosyesi
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                        Sürücünün S.A.A.
                      </label>
                      <input
                        type="text"
                        value={driver.fullName}
                        onChange={(e) => setDriver((prev) => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                          FİN Kod
                        </label>
                        <input
                          type="text"
                          value={driver.finCode}
                          onChange={(e) => setDriver((prev) => ({ ...prev, finCode: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                          Vəsiqə №
                        </label>
                        <input
                          type="text"
                          value={driver.licenseNumber}
                          onChange={(e) => setDriver((prev) => ({ ...prev, licenseNumber: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                          Kateqoriya
                        </label>
                        <select
                          value={driver.licenseCategory}
                          onChange={(e) =>
                            setDriver((prev) => ({
                              ...prev,
                              licenseCategory: e.target.value as 'B' | 'C' | 'D1' | 'D',
                            }))
                          }
                          data-testid="driver-license-category-select"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                        >
                          <option value="D">D (Avtobus &gt;16 yer)</option>
                          <option value="D1">D1 (Mikroavtobus ≤16 yer)</option>
                          <option value="C">C (Yük - Qadağandır)</option>
                          <option value="B">B (Minik - Qadağandır)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                          Sürücü Yaşı: {driver.driverAge}
                        </label>
                        <input
                          type="range"
                          min="20"
                          max="70"
                          value={driver.driverAge}
                          onChange={(e) => setDriver((prev) => ({ ...prev, driverAge: Number(e.target.value) }))}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase">
                          Fasiləsiz "D" Təcrübəsi (İl):
                        </label>
                        <span className="text-xs font-bold text-amber-400 font-mono">
                          {driver.drivingExperienceYears} il (Tələb: ≥ 3 il)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        value={driver.drivingExperienceYears}
                        onChange={(e) =>
                          setDriver((prev) => ({ ...prev, drivingExperienceYears: Number(e.target.value) }))
                        }
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Statutory Attestations & Chaperone */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    Attestasiyalar & Bələdçi Təyinatı
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                        Təyin Olunmuş Müşayiətçi (Pedaqoq / Bələdçi)
                      </label>
                      <input
                        type="text"
                        value={chaperoneName}
                        onChange={(e) => setChaperoneName(e.target.value)}
                        placeholder="Məsələn: Sevinc Quliyeva (Pedaqoq)"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-2 pt-1">
                      {[
                        {
                          key: 'medicalAttestationValid',
                          title: 'İllik Tibbi Arayış (Form № 083/y)',
                          desc: 'Sürücünün sağlamlıq və narkoloji arayışı qüvvədədir',
                        },
                        {
                          key: 'psychologicalEvaluationPassed',
                          title: 'Psixofizioloji Uyğunluq Sertifikatı',
                          desc: 'Uşaqlarla ünsiyyət, stress və diqqət sınağından keçib',
                        },
                        {
                          key: 'hasViolationsPast2Years',
                          title: 'Son 2 İldə Kobud İXM Qayda Pozuntusu',
                          desc: 'Sürət həddinin aşılması və ya qəza törədilməsi qeydi',
                          isNegative: true,
                        },
                        {
                          key: 'hasCertifiedChaperone',
                          title: 'Sertifikatlı Müşayiətçi (Bələdçi) Mövcudluğu',
                          desc: 'Avtobusda təlim keçmiş yetkin bələdçi heyəti iştirak edir',
                        },
                      ].map((item) => {
                        const isChecked = driver[item.key as keyof SchoolBusDriverProfile] as boolean;
                        return (
                          <div
                            key={item.key}
                            onClick={() =>
                              setDriver((prev) => ({
                                ...prev,
                                [item.key]: !prev[item.key as keyof SchoolBusDriverProfile],
                              }))
                            }
                            data-testid={`driver-toggle-${item.key}`}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              item.isNegative
                                ? isChecked
                                  ? 'bg-rose-950/30 border-rose-800 text-rose-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-300'
                                : isChecked
                                ? 'bg-slate-900 border-slate-700 text-slate-200'
                                : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                            }`}
                          >
                            <div className="text-xs">
                              <div className="font-bold">{item.title}</div>
                              <div className="text-[10px] text-slate-400">{item.desc}</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver Audit Summary */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Attestasiya Nəticələri ({driverAudit.passedCount} / {driverAudit.totalRequirements})
                </div>
                {driverAudit.disqualifications.length > 0 ? (
                  <div className="space-y-1">
                    {driverAudit.disqualifications.map((disq, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{disq}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Sürücü və müşayiətçi şagird daşınması üçün tam təsdiqlənib və buraxılış icazəsinə malikdir.</span>
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('audit')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  ← Geri: Texniki Standartlar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('routes')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Növbəti: Məktəblər & Tarif Kalkulyatoru →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ACCREDITED SCHOOLS & ROUTE PRICING CALCULATOR */}
          {activeTab === 'routes' && (
            <div className="space-y-6">
              {/* School Selection Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <School className="w-4 h-4 text-amber-400" />
                  Bakı və Abşeron üzrə Akkreditə Olunmuş Təhsil Müəssisələri
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {MOCK_ACCREDITED_SCHOOLS.map((school) => {
                    const isSelected = selectedSchoolId === school.id;
                    return (
                      <div
                        key={school.id}
                        onClick={() => setSelectedSchoolId(school.id)}
                        data-testid={`school-card-${school.id}`}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">
                              {school.district}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {school.activeBusCount} Aktiv Avtobus
                            </span>
                          </div>
                          <h5 className="font-bold text-white text-xs sm:text-sm">{school.name}</h5>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            {school.address}
                          </p>
                        </div>

                        <div className="pt-2.5 mt-2.5 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                          <span>{school.studentCount} şagird</span>
                          <span className="text-amber-400/90 font-mono">{school.contactPhone}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Route Pricing Calculator */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-amber-400" />
                      Məktəbli Marşrutu və Aylıq Xidmət Haqqı Kalkulyatoru
                    </h4>
                    <p className="text-xs text-slate-400">
                      Məsafə, şagird sayı, yanacaq (Dizel 0.80 ₼/L), sürücü və bələdçi maaşlarına əsaslanan tarif
                    </p>
                  </div>

                  {/* Currency Switcher */}
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 p-1 rounded-xl">
                    {(['AZN', 'USD', 'EUR'] as Currency[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setActiveCurrency(c)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          activeCurrency === c
                            ? 'bg-amber-400 text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      Avtobus Sinfi
                    </label>
                    <select
                      value={calcCategory}
                      onChange={(e) => setCalcCategory(e.target.value as SchoolBusCategory)}
                      data-testid="calc-category-select"
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                    >
                      <option value="minivan">Minivan (10–18 yer, Sprinter/Transit)</option>
                      <option value="midibus">Midibus (19–32 yer, Isuzu/Iveco)</option>
                      <option value="coach">Böyük Avtobus (33–55 yer, Otokar/Karsan)</option>
                    </select>
                  </div>

                  {/* Service Tier Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      Xidmət Paketi
                    </label>
                    <select
                      value={calcServiceTier}
                      onChange={(e) => setCalcServiceTier(e.target.value as SchoolBusServiceTier)}
                      data-testid="calc-tier-select"
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                    >
                      <option value="standard">Standart Məktəbli Marşrutu (1.0x)</option>
                      <option value="subsidized_public">Dövlət Subsidiyalı Məktəb (0.65x)</option>
                      <option value="premium_door_to_door">Qapıdan-Qapıya Fərdi Servis (1.4x)</option>
                    </select>
                  </div>

                  {/* Sibling Discount Checkbox */}
                  <div className="flex flex-col justify-end">
                    <label
                      onClick={() => setHasSiblingDiscount((prev) => !prev)}
                      className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-700 flex items-center justify-between cursor-pointer"
                    >
                      <div className="text-xs">
                        <div className="font-bold text-white">Ailədə 2+ Şagird Endirimi</div>
                        <div className="text-[10px] text-amber-400 font-semibold">-20% Güzəşt</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={hasSiblingDiscount}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Distance & Students Sliders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-400 uppercase">Tək Yön Məsafə:</span>
                      <span className="font-bold text-amber-400 font-mono">{calcDistanceKm} km</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="35"
                      value={calcDistanceKm}
                      onChange={(e) => setCalcDistanceKm(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>1 km (Məhəllə)</span>
                      <span>15 km (Şəhər mərkəzi)</span>
                      <span>35 km (Qəsəbələr)</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-400 uppercase">Daşınan Şagird Sayı:</span>
                      <span className="font-bold text-amber-400 font-mono">{calcStudentsCount} nəfər</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={calcStudentsCount}
                      onChange={(e) => setCalcStudentsCount(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>5 şagird</span>
                      <span>25 şagird</span>
                      <span>50 şagird</span>
                    </div>
                  </div>
                </div>

                {/* Calculation Output Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Yanacaq & Texniki Servis</div>
                    <div className="text-base font-black text-white mt-1 font-mono">
                      {pricingResult.fuelAndMaintenanceAzn} ₼
                    </div>
                    <div className="text-[9px] text-slate-500">22 tədris günü / ay</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Sürücü & Bələdçi Fondu</div>
                    <div className="text-base font-black text-white mt-1 font-mono">
                      {pricingResult.driverAndAttendantSalaryAzn} ₼
                    </div>
                    <div className="text-[9px] text-slate-500">Maaş və sosial ödəniş</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Cəmi Aylıq Marşrut Büdcəsi</div>
                    <div className="text-base font-black text-amber-400 mt-1 font-mono">
                      {pricingResult.formattedTotalCost}
                    </div>
                    <div className="text-[9px] text-slate-500">Dispetçer daxil</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                    <div className="text-[10px] font-bold text-amber-300 uppercase">1 Şagird üçün Aylıq Haqq</div>
                    <div
                      className="text-lg font-black text-amber-400 mt-1 font-mono"
                      data-testid="monthly-student-fee"
                    >
                      {pricingResult.formattedMonthlyFee}
                    </div>
                    <div className="text-[9px] text-amber-300/80">Valideyn ödənişi</div>
                  </div>
                </div>
              </div>

              {/* Statutory Rules Accordion Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SCHOOL_BUS_STATUTORY_RULES.map((rule) => (
                  <div key={rule.id} className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-white text-xs">{rule.title}</h5>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                        {rule.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{rule.description}</p>
                    <div className="text-[10px] text-slate-500 font-mono pt-1">{rule.legalBasis}</div>
                  </div>
                ))}
              </div>

              {/* Generate Certificate Quick Action */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleGenerateCertificate}
                  data-testid="generate-cert-btn"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Rəsmi AYNA-SCH-2026 Buraxılış Vəsiqəsi Hazırla</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: UNIFIED AYNA & BDYP PUBLIC REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={registrySearchQuery}
                    onChange={(e) => setRegistrySearchQuery(e.target.value)}
                    placeholder="Qeydiyyat nişanı (məs: 99-JS-412), vəsiqə nömrəsi və ya məktəb adı..."
                    data-testid="registry-search-input"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400 placeholder-slate-500"
                  />
                </div>

                <span className="text-xs text-slate-400 self-center">
                  Cəmi <strong>{filteredPermits.length}</strong> təsdiqlənmiş vəsiqə
                </span>
              </div>

              {/* Permits Table / Cards */}
              <div className="space-y-3">
                {filteredPermits.map((cert) => (
                  <div
                    key={cert.certificateNumber}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                          {cert.plateNumber}
                        </span>
                        <span className="text-xs font-mono text-amber-400 font-bold">
                          {cert.certificateNumber}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {cert.routePassportNumber}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                          {cert.complianceRating}
                        </span>
                      </div>
                      <h5 className="font-bold text-white text-sm">{cert.schoolName}</h5>
                      <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Avtobus: <strong className="text-slate-300">{cert.vehicleMakeModel}</strong></span>
                        <span>Sürücü: <strong className="text-slate-300">{cert.driverFullName}</strong></span>
                        <span>Bələdçi: <strong className="text-slate-300">{cert.chaperoneFullName}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <div className="text-right text-xs">
                        <div className="text-slate-500">Müddət:</div>
                        <div className="font-mono text-slate-300">{cert.validUntil}-dək</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCertificate(cert);
                          setActiveTab('certificate');
                        }}
                        data-testid={`view-cert-btn-${cert.certificateNumber}`}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Vəsiqəyə Bax</span>
                      </button>
                    </div>
                  </div>
                ))}

                {filteredPermits.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Sorğuya uyğun məktəbli nəqliyyat vəsiqəsi tapılmadı.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL AYNA-SCH-2026 ELECTRONIC PERMIT CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {/* Certificate Document Container */}
              <div
                id="school-bus-printable-certificate"
                className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl overflow-hidden"
              >
                {/* Decorative Seal Background */}
                <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                  <Bus className="w-96 h-96 text-amber-400" />
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between border-b border-amber-500/30 pb-6 gap-4 text-center sm:text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20">
                      <Bus className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                        Azərbaycan Respublikası Rəqəmsal İnkişaf və Nəqliyyat Nazirliyi
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        Azərbaycan Yerüstü Nəqliyyat Agentliyi (AYNA) & Elm və Təhsil Nazirliyi
                      </h3>
                      <p className="text-xs text-slate-400">
                        Məktəbli Nəqliyyat Vasitəsinin Rəsmi Dövlət Buraxılış Vəsiqəsi
                      </p>
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <div className="text-xs text-slate-400">Vəsiqə Qeydiyyat №</div>
                    <div
                      className="text-base sm:text-lg font-mono font-black text-amber-400 tracking-wider"
                      data-testid="cert-number-display"
                    >
                      {activeCertificate.certificateNumber}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400">
                      {activeCertificate.routePassportNumber}
                    </div>
                  </div>
                </div>

                {/* Key Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block uppercase font-bold text-[10px]">Təhsil Müəssisəsi</span>
                    <strong className="text-white text-xs">{activeCertificate.schoolName}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block uppercase font-bold text-[10px]">Avtobus Marka & Model</span>
                    <strong className="text-white text-xs">{activeCertificate.vehicleMakeModel}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block uppercase font-bold text-[10px]">Dövlət Qeydiyyat Nişanı</span>
                    <strong className="text-amber-400 font-mono text-xs font-black">
                      {activeCertificate.plateNumber}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block uppercase font-bold text-[10px]">VIN Şassi Kodu</span>
                    <strong className="text-slate-300 font-mono text-xs">{activeCertificate.vinCode}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block uppercase font-bold text-[10px]">Sürücü S.A.A. (FİN)</span>
                    <strong className="text-white text-xs">
                      {activeCertificate.driverFullName} ({activeCertificate.driverFin})
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block uppercase font-bold text-[10px]">Müşayiətçi (Bələdçi)</span>
                    <strong className="text-white text-xs">{activeCertificate.chaperoneFullName}</strong>
                  </div>
                </div>

                {/* Safety & Compliance Telemetry Banner */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Dövlət Təhlükəsizlik Zəmanəti & Standart Uyğunluğu
                    </div>
                    <p className="text-xs text-slate-300">
                      Bu nəqliyyat vasitəsi Elm və Təhsil Nazirliyi və AYNA-nın 11-bəndlik uşaq təhlükəsizliyi
                      auditindən keçmişdir. Sürət həddi 60 km/saat, Alko-Kilid aktivdir.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs font-mono">
                      60 KM/H QAPAQLI
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs">
                      {activeCertificate.complianceRating}
                    </div>
                  </div>
                </div>

                {/* Dates & Security Seal */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-800 gap-4 text-xs">
                  <div className="space-y-1 text-slate-400 font-mono text-[11px] text-center sm:text-left">
                    <div>Verilmə Tarixi: <strong>{activeCertificate.issueDate}</strong></div>
                    <div>Etibarlılıq: <strong className="text-amber-400">{activeCertificate.validUntil}</strong></div>
                    <div className="text-[10px] text-slate-500">Təhlükəsizlik İmzası: {activeCertificate.securityHash}</div>
                  </div>

                  {/* QR & Verification Link */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white text-slate-950 font-mono text-[9px] text-center font-bold">
                      [ QR KOD ]<br />AYNA-SCH
                    </div>
                    <div className="text-[10px] text-slate-400 text-left">
                      <div className="font-bold text-slate-200">Elektron Yoxlama:</div>
                      <a
                        href={activeCertificate.qrVerificationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:underline break-all"
                      >
                        ayna.gov.az/verify/school-bus
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate Actions Bar */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyCertificate}
                  data-testid="copy-cert-btn"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Məlumatlar Kopyalandı!' : 'Məlumatları Kopyala'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  data-testid="print-cert-btn"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Vəsiqəni Çap Et</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
