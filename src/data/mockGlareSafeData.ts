import {
  GlareCorridorStation,
  GlareVehiclePreset,
  GlareChecklistItem,
  GlareExamQuestion,
  GlareCertificate,
} from '../utils/glareSafeCompliance';

export const MOCK_GLARE_CORRIDOR_STATIONS: GlareCorridorStation[] = [
  {
    id: 'station-m1-sumgayit',
    code: 'GLARE-M1-KM28',
    nameAz: 'M-1 Bakı – Quba – Rusiya (Sumqayıt Şimal Yan Dolaşması)',
    nameEn: 'M-1 Baku – Guba – Russia (Sumgayit Northern Bypass)',
    nameRu: 'M-1 Баку – Губа – Россия (Северный объезд Сумгайыта)',
    corridor: 'M-1 Şimal Magistralı',
    routeNumber: 'M-1',
    picketKm: 'Km 28+400',
    medianBarrier: 'DOUBLE_W_BEAM_GUARDRAIL',
    vaneMaterial: 'UV_HDPE_POLYMER',
    screenHeightMm: 1900,
    bladeSpacingMm: 750,
    bladeAngleDeg: 20,
    windResistanceClass: 'WL2',
    stationStatus: 'ONLINE_NOMINAL',
    dailyTrafficVehicles: 48500,
    measuredAmbientLux: 0.12,
    installedYear: 2023,
  },
  {
    id: 'station-baku-ring-yasamal',
    code: 'GLARE-BDR1-KM05',
    nameAz: 'Bakı Dairəvi-1 Avtomobil Yolu (Yasamal Dərəsi Viyaduku)',
    nameEn: 'Baku Ring Road-1 (Yasamal Valley Viaduct)',
    nameRu: 'Бакинская Кольцевая-1 (Виадук Ясамальской долины)',
    corridor: 'Bakı Dairəvi-1',
    routeNumber: 'BDR-1',
    picketKm: 'Km 5+600',
    medianBarrier: 'CONCRETE_NEW_JERSEY',
    vaneMaterial: 'UV_HDPE_POLYMER',
    screenHeightMm: 1800,
    bladeSpacingMm: 700,
    bladeAngleDeg: 18,
    windResistanceClass: 'WL2',
    stationStatus: 'ONLINE_NOMINAL',
    dailyTrafficVehicles: 64200,
    measuredAmbientLux: 0.45,
    installedYear: 2022,
  },
  {
    id: 'station-airport-surakhani',
    code: 'GLARE-AIRPORT-KM08',
    nameAz: 'Heydər Əliyev Beynəlxalq Hava Limanı Şosesi (Bülbülə – Suraxanı)',
    nameEn: 'Heydar Aliyev Int. Airport Highway (Bulbula – Surakhani)',
    nameRu: 'Шоссе Международного Аэропорта Гейдар Алиев (Бюльбюля – Сураханы)',
    corridor: 'Aeroport Şosesi Ekspress',
    routeNumber: 'HAA-H',
    picketKm: 'Km 8+300',
    medianBarrier: 'CONCRETE_NEW_JERSEY',
    vaneMaterial: 'ALUMINUM_COMPOSITE',
    screenHeightMm: 2000,
    bladeSpacingMm: 650,
    bladeAngleDeg: 22,
    windResistanceClass: 'WL2',
    stationStatus: 'ONLINE_NOMINAL',
    dailyTrafficVehicles: 72000,
    measuredAmbientLux: 0.85,
    installedYear: 2024,
  },
  {
    id: 'station-m2-kurdamir',
    code: 'GLARE-M2-KM172',
    nameAz: 'M-2 Bakı – Ələt – Gəncə – Gürcüstan (Kürdəmir Düzənlik Tranziti)',
    nameEn: 'M-2 Baku – Alat – Ganja – Georgia (Kurdamir Plain Transit)',
    nameRu: 'M-2 Баку – Алят – Гянджа – Грузия (Кюрдамирский степной транзит)',
    corridor: 'M-2 Qərb Magistralı',
    routeNumber: 'M-2',
    picketKm: 'Km 172+500',
    medianBarrier: 'DOUBLE_W_BEAM_GUARDRAIL',
    vaneMaterial: 'UV_HDPE_POLYMER',
    screenHeightMm: 1750,
    bladeSpacingMm: 800,
    bladeAngleDeg: 20,
    windResistanceClass: 'WL1',
    stationStatus: 'HIGH_GLARE_ALERT',
    dailyTrafficVehicles: 28400,
    measuredAmbientLux: 0.08,
    installedYear: 2021,
  },
  {
    id: 'station-m4-shamakhi-maraza',
    code: 'GLARE-M4-KM128',
    nameAz: 'M-4 Bakı – Şamaxı – Yevlax (Cəngi – Mərəzə Dağ Aşırımı)',
    nameEn: 'M-4 Baku – Shamakhi – Yevlakh (Jangi – Maraza Mountain Pass)',
    nameRu: 'M-4 Баку – Шемаха – Евлах (Перевал Дженги – Мараза)',
    corridor: 'M-4 Dağlıq Şirvan Yolu',
    routeNumber: 'M-4',
    picketKm: 'Km 128+900',
    medianBarrier: 'STEEL_BOX_BEAM',
    vaneMaterial: 'FIBERGLASS_REINFORCED',
    screenHeightMm: 2100,
    bladeSpacingMm: 600,
    bladeAngleDeg: 24,
    windResistanceClass: 'WL2',
    stationStatus: 'WIND_DEFLECTION_WARNING',
    dailyTrafficVehicles: 19600,
    measuredAmbientLux: 0.06,
    installedYear: 2024,
  },
  {
    id: 'station-zafar-dashalti',
    code: 'GLARE-ZY-KM62',
    nameAz: 'Zəfər Yolu (Daşaltı Dərəsi Dağ Dolaşığı və Qaya Kəsikləri)',
    nameEn: 'Victory Road (Dashalti Gorge Serpentine & Rock Cuts)',
    nameRu: 'Дорога Победы (Дашалтинский серпантин и скальные выемки)',
    corridor: 'Zəfər Yolu Qarabağ',
    routeNumber: 'ZY-01',
    picketKm: 'Km 62+400',
    medianBarrier: 'DOUBLE_W_BEAM_GUARDRAIL',
    vaneMaterial: 'UV_HDPE_POLYMER',
    screenHeightMm: 1900,
    bladeSpacingMm: 650,
    bladeAngleDeg: 22,
    windResistanceClass: 'WL2',
    stationStatus: 'VANE_MAINTENANCE_REQUIRED',
    dailyTrafficVehicles: 12800,
    measuredAmbientLux: 0.04,
    installedYear: 2022,
  },
];

export const MOCK_GLARE_VEHICLE_PRESETS: GlareVehiclePreset[] = [
  {
    id: 'veh-mercedes-s500',
    plate: '99-GL-101',
    model: 'Mercedes-Benz S 500 4MATIC (Digital Matrix LED High-Beam)',
    headlightType: 'MATRIX_LED',
    luminousIntensityCd: 85000,
    driverEyeHeightMm: 1200,
    defaultSpeedKmh: 110,
    violationType: 'NONE',
  },
  {
    id: 'veh-hyundai-elantra',
    plate: '10-GL-202',
    model: 'Hyundai Elantra 2.0 (OEM Projector Halogen/LED)',
    headlightType: 'FACTORY_HALOGEN',
    luminousIntensityCd: 35000,
    driverEyeHeightMm: 1220,
    defaultSpeedKmh: 90,
    violationType: 'NONE',
  },
  {
    id: 'veh-toyota-prius-illegal',
    plate: '77-GL-303',
    model: 'Toyota Prius 1.8 (Qanunsuz Standartdankənar Ksenon/LED Faralar)',
    headlightType: 'ILLEGAL_AFTERMARKET_LED',
    luminousIntensityCd: 120000,
    driverEyeHeightMm: 1210,
    defaultSpeedKmh: 80,
    violationType: 'ILLEGAL_UNHOMOLOGATED_LIGHTS',
  },
  {
    id: 'veh-kamaz-tir',
    plate: '90-AZ-404',
    model: 'KamAZ 5490 Neo TIR 40t (Yüksək Kabinalı Magistral Çəkici)',
    headlightType: 'FACTORY_BI_XENON',
    luminousIntensityCd: 60000,
    driverEyeHeightMm: 1480,
    defaultSpeedKmh: 85,
    violationType: 'NONE',
  },
  {
    id: 'veh-bmw-patrol',
    plate: '99-GL-505',
    model: 'BMW 530i xDrive BDYP Yol Patrul Xidməti İntellektual Avtomobili',
    headlightType: 'LASER_HIGH_BEAM',
    luminousIntensityCd: 110000,
    driverEyeHeightMm: 1190,
    defaultSpeedKmh: 120,
    violationType: 'FAILURE_TO_DIP_HIGH_BEAM',
  },
  {
    id: 'veh-porsche-gt3',
    plate: '00-YP-606',
    model: 'Porsche 911 GT3 (Aşağı İdman Oturuşlu Kupe - 1,060 mm)',
    headlightType: 'MATRIX_LED',
    luminousIntensityCd: 75000,
    driverEyeHeightMm: 1080,
    defaultSpeedKmh: 110,
    violationType: 'BARRIER_COLLISION_DAMAGE',
  },
];

export const MOCK_GLARE_CHECKLIST_ITEMS: GlareChecklistItem[] = [
  {
    id: 'check-01-cutoff-angle',
    titleAz: 'EN 12676-1 Maddə 4.2 Optik Daldalanma Bucaq Sınağı',
    titleEn: 'EN 12676-1 Clause 4.2 Optical Cutoff Screening Angle Verification',
    descriptionAz:
      'Pərdələrin quraşdırılma bucağı (15°-25°) və ara məsafəsi (600-800 mm) qarşıdan gələn avtomobilin faralarını minimum 18° daldalanma bucağında tam bloklamalıdır.',
    descriptionEn:
      'Vane mounting angle (15°-25°) and blade spacing (600-800 mm) must completely occlude oncoming high-beam rays at minimum 18° cutoff screening angle.',
    standardRef: 'EN 12676-1 / AZS 410',
    category: 'OPTICAL_DESIGN',
    isMandatory: true,
  },
  {
    id: 'check-02-height-eye-level',
    titleAz: 'Mərkəzi Ayrıcı Zolaq Hündürlük və Göz Səviyyəsi Marjası',
    titleEn: 'Median Barrier Height & Driver Eye-Level Envelope Margin',
    descriptionAz:
      'Anti-glare çəpərin yuxarı kənarı yol səthindən ən azı 1,750 mm - 2,100 mm hündürlükdə olmalı, idman avtomobillərindən SUV və mikroavtobus sürücülərinin baxış bucağını tam örtməlidir.',
    descriptionEn:
      'Top edge of anti-glare screen must measure 1,750 mm - 2,100 mm above road level, shielding visual sightlines of low sedans and high-riding vehicles.',
    standardRef: 'AZS 342 / PIARC Glare Guidelines',
    category: 'OPTICAL_DESIGN',
    isMandatory: true,
  },
  {
    id: 'check-03-wind-load-wl2',
    titleAz: 'EN 12676-1 WL2 Xəzri Külək Yükü və Dinamik Əyilmə Dayanıqlığı',
    titleEn: 'EN 12676-1 Class WL2 Khazri Wind Load & Flexural Durability',
    descriptionAz:
      'Abşeron və dənizsahili zonalarda 120-140 km/saat sürətli külək qasırğalarına qarşı pərdə panelləri qopmamalı və 15°-dən artıq qalıcı plastik deformasiyaya uğramamalıdır.',
    descriptionEn:
      'Panels must withstand coastal Khazri wind gusts of 120-140 km/h without dislodgement or permanent plastic deformation exceeding 15° flexure.',
    standardRef: 'EN 12676-1 Clause 5.3 (Class WL2)',
    category: 'STRUCTURAL_WIND',
    isMandatory: true,
  },
  {
    id: 'check-04-uv-weathering',
    titleAz: 'ISO 4892-2 UV Radiasiya və İstilik Yaşlanma Testi',
    titleEn: 'ISO 4892-2 UV Radiation & Accelerated Solar Weathering',
    descriptionAz:
      'HDPE polimer və kompozit pərdə materialları minimum 5,000 saat intensiv UV şüalanmasına və +45°C yay istisinə qarşı rəng solması və kövrəkləşməyə davamlı olmalıdır.',
    descriptionEn:
      'HDPE polymer and composite vanes must endure minimum 5,000 hours of UV radiation and +45°C heat without brittleness or significant color fading.',
    standardRef: 'ISO 4892-2 / EN 12676-2',
    category: 'OPTICAL_DESIGN',
    isMandatory: true,
  },
  {
    id: 'check-05-impact-safety',
    titleAz: 'Qəza Anında Qəlpələnməyən Elastik Polimer Təhlükəsizliyi',
    titleEn: 'Non-Shattering Impact Safety & Crash Resilience',
    descriptionAz:
      'Avtomobil toqquşması zamanı pərdələr iti metal və ya şüşə qəlpələrinə parçalanmamalı, avtomobilin salonuna nüfuz təhlükəsi yaratmamalıdır.',
    descriptionEn:
      'In vehicle crashes, vanes must bend or yield without shattering into dangerous sharp projectiles that could penetrate passenger cabins.',
    standardRef: 'EN 1317-2 / EN 12676-1',
    category: 'STRUCTURAL_WIND',
    isMandatory: true,
  },
  {
    id: 'check-06-galvanized-brackets',
    titleAz: 'ISO 1461 İsti Sinklənmiş Bərkidici Kronşteynlər və Klipslər',
    titleEn: 'ISO 1461 Hot-Dip Galvanized Mounting Brackets & Rail Clamps',
    descriptionAz:
      'W-beam metal sürahilərə və ya Nyu-Cersi beton bloklarına bərkidilən polad elementlər minimum 85 mkm qalınlığında isti sink örtüklə korroziyadan qorunmalıdır.',
    descriptionEn:
      'Steel mounting clamps and base brackets affixed to W-beam or New Jersey barriers must feature minimum 85 µm hot-dip galvanized coating.',
    standardRef: 'ISO 1461 / AZS 410',
    category: 'STRUCTURAL_WIND',
    isMandatory: true,
  },
  {
    id: 'check-07-color-green-grey',
    titleAz: 'Yol Landşaftına Uyğun Yaşıl/Boz Neytral Rəng Tonu (RAL 6005 / 7042)',
    titleEn: 'Neutral Landscape Color Integration (RAL 6005 Dark Green / RAL 7042)',
    descriptionAz:
      'Pərdələrin rəngi parıltı yaratmayan tutqun (mat) yaşıl və ya boz rəngdə olmalı, gündüz vaxtı sürücünün diqqətini yayındırmamalıdır.',
    descriptionEn:
      'Panels must display matte non-reflective dark green or traffic grey finish to prevent daylight distraction and harmonize with highway landscape.',
    standardRef: 'EN 12676-1 Clause 4.4',
    category: 'OPTICAL_DESIGN',
    isMandatory: false,
  },
  {
    id: 'check-08-scada-illuminance-sensor',
    titleAz: 'IoT SCADA Lüksmetr və Optik Parıltı Monitorinq Sensorları',
    titleEn: 'IoT SCADA Luxmeter & Optical Glare Monitoring Sensors',
    descriptionAz:
      'Hər 2 km məsafədə quraşdırılmış rəqəmsal lüksmetr sensorları həm qarşı tərəfin işıq sızmasını, həm də ətraf mühit işıqlanmasını mərkəzə ötürməlidir.',
    descriptionEn:
      'Digital luxmeter sensors spaced every 2 km must stream real-time oncoming headlight leakage and ambient illuminance to AAYDA SCADA center.',
    standardRef: 'AZS 410 / AAYDA SCADA-ITS-2026',
    category: 'MAINTENANCE_INSPECTION',
    isMandatory: true,
  },
  {
    id: 'check-09-rapid-replacement-clip',
    titleAz: 'Operativ Bərpa: Tez-açılan Mexaniki Kilid Klipsləri (SOP 30 Dəqiqə)',
    titleEn: 'Rapid Repair: Quick-Release Clip Mechanism (SOP 30-Minute Turnaround)',
    descriptionAz:
      'Zədələnmiş pərdə panelləri magistralda hərəkəti tam bağlamadan 30 dəqiqə ərzində tez dəyişdirilə bilən xüsusi kilid sisteminə malik olmalıdır.',
    descriptionEn:
      'Damaged individual vanes must be field-replaceable within 30 minutes using quick-release locking clips without major traffic disruption.',
    standardRef: 'AAYDA Magistral İstismar Reqlamenti',
    category: 'MAINTENANCE_INSPECTION',
    isMandatory: false,
  },
  {
    id: 'check-10-sima-digital-inspection',
    titleAz: 'SİMA Rəqəmsal Dövlət Reyestr İnteqrasiyası və Qüsurların Aradan Qaldırılması',
    titleEn: 'SİMA Digital State Registry Integration & Defect Remediation Tracking',
    descriptionAz:
      'BDYP və AAYDA tərəfindən aparılan dövri gecə optik auditləri elektron akt şəklində SİMA rəqəmsal imzası ilə vahid dövlət bazasına daxil edilməlidir.',
    descriptionEn:
      'Periodic night optical inspections conducted by BDYP and AAYDA must be cryptographically recorded with SİMA digital signature in state registry.',
    standardRef: 'AR Rəqəmsal İnkişaf və Nəqliyyat Nazirliyi Reqlamenti',
    category: 'MAINTENANCE_INSPECTION',
    isMandatory: true,
  },
];

export const MOCK_GLARE_EXAM_QUESTIONS: GlareExamQuestion[] = [
  {
    id: 'exam-01-dip-distance',
    questionAz:
      'AR "Yol Hərəkəti Haqqında" Qanununun 50-ci maddəsinə əsasən, qaranlıq vaxtı qarşıdan gələn nəqliyyat vasitəsinə ən azı hansı məsafə qalmış uzaq vuran işıqlar yaxın vuran işıqlara keçirilməlidir?',
    questionEn:
      'According to Article 50 of the Law "On Road Traffic", at what minimum distance from an oncoming vehicle must high beams be switched to low beams at night?',
    optionsAz: [
      'Ən azı 150 metr qalmış (və ya qarşıdakı sürücü işıqları vaxtaşırı keçirməklə bunu tələb etdikdə daha uzaqdan)',
      'Ən azı 50 metr qalmış',
      'Yalnız avtomobillər tam yan-yana çatdıqda',
      'Magistral yollarda uzaq vuran işıqları dəyişmək tələb olunmur',
    ],
    optionsEn: [
      'At least 150 meters away (or further if oncoming driver signals by switching beams)',
      'At least 50 meters away',
      'Only when vehicles are directly abreast',
      'High beams are never required to be dipped on motorways',
    ],
    correctIndex: 0,
    explanationAz:
      'YHQ 50-ci maddəsinə əsasən, qarşıdan gələn nəqliyyata ən azı 150 metr qalmış, habelə qarşıdakı sürücünün gözünü qamaşdırmaq ehtimalı olduqda daha uzaq məsafədə uzaq vuran işıqlar yaxın vuran işıqlara keçirilməlidir.',
    explanationEn:
      'Under Law On Road Traffic Article 50, drivers must switch high beams to low beams at least 150m from oncoming vehicles or sooner if there is any glare risk.',
    legalCitation: 'AR Yol Hərəkəti Haqqında Qanun, Maddə 50',
  },
  {
    id: 'exam-02-glare-action',
    questionAz:
      'Gecə vaxtı qarşıdan gələn avtomobilin işıqları sürücünün gözünü qamaşdırdıqda, sürücü qanunvericiliyə görə hansı hərəkətləri etməlidir?',
    questionEn:
      'If a driver suffers sudden disabling glare from oncoming headlights at night, what mandatory action must they take under traffic laws?',
    optionsAz: [
      'Qəza dayanma işıq siqnalını (avariynini) yandırmalı və hərəkət zolağını dəyişmədən sürəti azaldaraq dayanmalıdır',
      'Dərhal sol zolağa keçərək ötmə əməliyyatına başlamalıdır',
      'Qarşı tərəfə etiraz olaraq uzaq vuran işıqları yandırıb yüksək sürətlə sürməlidir',
      'Yolun kənarına çıxmaq üçün kəskin sükan manevri etməlidir',
    ],
    optionsEn: [
      'Activate hazard warning flashers and slow down to a stop without changing the lane of travel',
      'Immediately change to the left lane and overtake',
      'Retaliate by switching on high beams and accelerating',
      'Make an abrupt steering maneuver onto the shoulder',
    ],
    correctIndex: 0,
    explanationAz:
      'YHQ 50-ci maddəsinin 4-cü hissəsinə əsasən, sürücünün gözü qamaşdıqda qəza dayanma siqnalı yandırılmalı və hərəkət zolağı dəyişdirilmədən sürət azaldılaraq tam dayandırılmalıdır.',
    explanationEn:
      'Under Article 50(4) of Road Traffic Law, when dazzled by glare, the driver must activate hazard flashers and decelerate to a complete stop without changing lanes.',
    legalCitation: 'AR Yol Hərəkəti Haqqında Qanun, Maddə 50, Hissə 4',
  },
  {
    id: 'exam-03-ixm-329-fine',
    questionAz:
      'AR İnzibati Xətalar Məcəlləsinin 329-cu maddəsinə əsasən, faralardan qaydalara zidd istifadə edilməsi və ya qarşıdan gələn sürücünün gözünün qamaşdırılmasına görə hansı cərimə tətbiq edilir?',
    questionEn:
      'Under Article 329 of the Code of Administrative Offences, what fine is imposed for improper use of headlights or causing oncoming driver glare?',
    optionsAz: [
      '30 AZN məbləğində cərimə (30 gün ərzində ödənildikdə 15 AZN güzəştlə)',
      '150 AZN və 4 cərimə balı',
      '500 AZN və nəqliyyat vasitəsinin cərimə meydançasına aparılması',
      'Yalnız şifahi xəbərdarlıq',
    ],
    optionsEn: [
      '30 AZN fine (15 AZN with 50% prompt discount within 30 days under Article 38)',
      '150 AZN fine and 4 demerit points',
      '500 AZN fine and vehicle impoundment',
      'Verbal warning only',
    ],
    correctIndex: 0,
    explanationAz:
      'İXM Maddə 329-a əsasən, xarici işıq cihazlarından qaydalara zidd istifadə və ya gözqamaşdırmaya görə 30 AZN cərimə müəyyən edilmişdir. 30 gün ərzində ödənildikdə 50% endirim tətbiq edilir.',
    explanationEn:
      'Under Article 329 of the Code of Administrative Offences, improper lighting usage or dazzling oncoming drivers incurs a 30 AZN fine (15 AZN with prompt discount).',
    legalCitation: 'AR İXM Maddə 329 və Maddə 38',
  },
  {
    id: 'exam-04-illegal-led-xenon',
    questionAz:
      'Avtomobilə zavod konstruksiyasında nəzərdə tutulmayan qanunsuz ksenon və ya standartdankənar LED faralar quraşdırılması İXM-in hansı maddəsi ilə cəzalandırılır?',
    questionEn:
      'Installing illegal non-homologated aftermarket Xenon or glaring LED bulbs not designed by the manufacturer is penalized under which article?',
    optionsAz: [
      'İXM Maddə 342.1 — 150 AZN məbləğində cərimə',
      'İXM Maddə 327.1 — 40 AZN cərimə',
      'İXM Maddə 353.1 — 600 AZN cərimə',
      'Heç bir məsuliyyət yaratmır',
    ],
    optionsEn: [
      'Code of Administrative Offences Article 342.1 — 150 AZN fine',
      'Article 327.1 — 40 AZN fine',
      'Article 353.1 — 600 AZN fine',
      'No liability is incurred',
    ],
    correctIndex: 0,
    explanationAz:
      'İXM Maddə 342.1-ə əsasən, normativ tələblər pozulmaqla avadanlığın quraşdırılması və ya dəyişdirilməsi (qanunsuz ksenon/LED daxil olmaqla) 150 AZN cəriməyə səbəb olur.',
    explanationEn:
      'Article 342.1 specifies a 150 AZN fine for operating a vehicle with non-compliant technical equipment, including illegal blinding aftermarket LEDs.',
    legalCitation: 'AR İXM Maddə 342.1',
  },
  {
    id: 'exam-05-en-12676-cutoff',
    questionAz:
      'Avropa Standartı EN 12676-1-ə görə, magistral yollarda anti-glare pərdələrinin effektiv daldalanma bucağı (screening cutoff angle) hansı həndəsi parametrlərdən asılıdır?',
    questionEn:
      'According to European Standard EN 12676-1, what geometric parameters determine the effective screening cutoff angle of highway anti-glare vanes?',
    optionsAz: [
      'Pərdələrin eni (width), pərdələr arası məsafə (spacing) və quraşdırma meyil bucağı (angle of inclination)',
      'Yalnız magistralın asfalt qalınlığı',
      'Yalnız avtomobilin şin təzyiqi',
      'Sürücünün eynək dərəcəsi',
    ],
    optionsEn: [
      'Vane blade width, spacing pitch between vanes, and mounting inclination angle',
      'Only highway asphalt thickness',
      'Only vehicle tire pressure',
      'Driver eyeglass prescription',
    ],
    correctIndex: 0,
    explanationAz:
      'EN 12676-1 standartına görə, optik daldalanma bucağı pərdənin eni (w), şaquli oxa nisbətən bucağı (theta) və lövhələr arasındakı addım məsafəsindən (s) asılı olaraq hesablanır.',
    explanationEn:
      'Per EN 12676-1 Clause 4, optical cutoff angle is calculated from vane width (w), mounting tilt angle (theta), and center-to-center pitch spacing (s).',
    legalCitation: 'EN 12676-1: Anti-glare screens for roads, Clause 4',
  },
  {
    id: 'exam-06-de-boer-scale',
    questionAz:
      'Beynəlxalq İşıqlandırma Komissiyası (CIE) De Boer gözqamaşdırma şkalasında 1 və 9 qiymətləri nəyi ifadə edir?',
    questionEn:
      'In the International Commission on Illumination (CIE) De Boer discomfort glare rating scale, what do scores 1 and 9 represent?',
    optionsAz: [
      '1 = Dözülməz qamaşma (Unbearable glare), 9 = Hiss olunmaz daldalanma (Unnoticeable glare)',
      '1 = Ən yüksək rahatlıq, 9 = Qəza riski',
      '1 = Gündüz rejimi, 9 = Gecə rejimi',
      '1 = 100 km/saat sürət, 9 = 900 km/saat sürət',
    ],
    optionsEn: [
      '1 = Unbearable glare, 9 = Unnoticeable / perfectly shielded vision',
      '1 = Highest comfort, 9 = Extreme accident hazard',
      '1 = Day mode, 9 = Night mode',
      '1 = 100 km/h speed, 9 = 900 km/h speed',
    ],
    correctIndex: 0,
    explanationAz:
      'De Boer 9 ballıq şkalasında 1 dözülməz korluq yaradan qamaşmanı, 5 minimum yolverilən həddi, 9 isə sürücünün heç bir parıltı hiss etmədiyi ideal daldalanmanı bildirir.',
    explanationEn:
      'On the De Boer 9-point scale, 1 is intolerable glare, 5 is just admissible threshold, and 9 denotes completely unnoticeable, pristine light screening.',
    legalCitation: 'CIE Publication No. 31 / PIARC Road Safety',
  },
  {
    id: 'exam-07-blind-distance',
    questionAz:
      '110 km/saat sürətlə hərəkət edən avtomobilin sürücüsü 2.5 saniyəlik qəfil gözqamaşma korluğu yaşayarsa, o, tamamilə kor şəkildə neçə metr məsafə qət edər?',
    questionEn:
      'If a driver traveling at 110 km/h suffers a 2.5-second acute temporary glare blindness, how many meters do they travel completely blind?',
    optionsAz: [
      'Təxminən 76.4 metr (v = 30.56 m/s * 2.5 s)',
      'Təxminən 10 metr',
      'Təxminən 250 metr',
      'Heç bir metr qət etməz, avtomobil dərhal dayanar',
    ],
    optionsEn: [
      'Approximately 76.4 meters (v = 30.56 m/s * 2.5 s)',
      'Approximately 10 meters',
      'Approximately 250 meters',
      'Zero meters; vehicle halts instantly',
    ],
    correctIndex: 0,
    explanationAz:
      '110 km/saat sürət saniyədə 30.56 metr deməkdir. 2.5 saniyəlik görmə itkisi zamanı avtomobil heç bir idarəetmə olmadan 76.4 metr məsafə gedir.',
    explanationEn:
      'At 110 km/h (30.56 m/s), a 2.5s visual blackout corresponds to 76.4 meters of uncontrolled blind travel on high-speed motorways.',
    legalCitation: 'Avtomobil Yollarının Hərəkət Təhlükəsizliyi Fizikası',
  },
  {
    id: 'exam-08-barrier-damage',
    questionAz:
      'Nəqliyyat vasitəsi mərkəzi ayrıcı zolaqdakı anti-glare çəpər panellərinə çırpılaraq zədələdikdə, sürücü hansı hüquqi məsuliyyəti daşıyır?',
    questionEn:
      'When a vehicle crashes into and damages median anti-glare screen panels, what statutory liabilities does the driver face?',
    optionsAz: [
      'İXM Maddə 353.1 üzrə 600 AZN cərimə və Mülki Məcəllənin 1108-ci maddəsinə əsasən AAYDA-ya vurulmuş ziyanın tam bərpası',
      'Yalnız 20 AZN inzibati cərimə',
      'Heç bir cərimə tətbiq olunmur, sığorta şirkəti avtomatik bağışlayır',
      'Sürücülük hüququndan 5 il məhrumetmə',
    ],
    optionsEn: [
      '600 AZN fine under Code of Admin Offences Art. 353.1 plus full asset restitution to AAYDA under Civil Code Art. 1108',
      'Only 20 AZN administrative fine',
      'No fine applies; insurance waives all claims',
      '5-year driver license suspension',
    ],
    correctIndex: 0,
    explanationAz:
      'İXM Maddə 353.1 yol mühəndis qurğularına ziyan vurulmasına görə 600 AZN cərimə nəzərdə tutur. Mülki Məcəllənin 1108-ci maddəsinə əsasən dövlət yol infrastrukturuna dəyən zərər də tam ödənilməlidir.',
    explanationEn:
      'Article 353.1 imposes a 600 AZN fine for damaging road infrastructure, while Civil Code Art. 1108 requires full financial restitution for road asset restoration.',
    legalCitation: 'AR İXM Maddə 353.1 və AR Mülki Məcəlləsi Maddə 1108',
  },
  {
    id: 'exam-09-wind-class',
    questionAz:
      'Abşeron yarımadasında və Xəzərsahili magistrallarda güclü Xəzri küləklərinə görə anti-glare çəpərləri EN 12676-1 üzrə hansı külək dayanıqlığı sinfinə cavab verməlidir?',
    questionEn:
      'On Absheron peninsula and Caspian coastal freeways subjected to intense Khazri gales, anti-glare screens must meet which EN 12676-1 wind load class?',
    optionsAz: [
      'Sinif WL2 (Qasırğalı külək təzyiqinə və dinamik yorulmaya yüksək davamlılıq)',
      'Sinif WL0 (Külək tələbi yoxdur)',
      'Yalnız qapalı tunel sinfi',
      'Yalnız taxta dirək standartı',
    ],
    optionsEn: [
      'Class WL2 (High resistance to gale force dynamic wind pressure and fatigue)',
      'Class WL0 (No wind resistance requirement)',
      'Enclosed tunnel class only',
      'Wooden post standard only',
    ],
    correctIndex: 0,
    explanationAz:
      'EN 12676-1 standartına görə, küləkli zonalarda Class WL2 pərdələri tətbiq olunur ki, bu da panellərin 140 km/saat küləkdə möhkəm qalmasını təmin edir.',
    explanationEn:
      'Under EN 12676-1, Class WL2 is designated for high wind exposure zones, ensuring stability under hurricane-force wind gusts up to 140 km/h.',
    legalCitation: 'EN 12676-1 Clause 5.3 Wind Resistance Classification',
  },
  {
    id: 'exam-10-maintenance-threshold',
    questionAz:
      'AAYDA SCADA reqlamentinə əsasən, magistral anti-glare çəpərində çatışmayan və ya qırıq pərdə faizi neçə faizi keçdikdə operativ təmir briqadası çağırılmalıdır?',
    questionEn:
      'Under AAYDA SCADA regulations, when missing or damaged vanes exceed what percentage threshold must an emergency repair team be dispatched?',
    optionsAz: [
      '5% həddini keçdikdə (işıq sızması və qəza riski artdığı üçün)',
      'Yalnız 80% pərdə qırıldıqda',
      'Heç vaxt təmir tələb olunmur',
      'Yalnız 10 ildən bir baxış keçirilir',
    ],
    optionsEn: [
      'Exceeding 5% threshold (due to excessive light spillage and glare hazard)',
      'Only when 80% of vanes are broken',
      'Maintenance is never required',
      'Only inspected once every 10 years',
    ],
    correctIndex: 0,
    explanationAz:
      'Pərdələrin 5%-dən çoxu qırıq və ya çatışmayan olduqda kəskin işıq sızması baş verir və qarşıdan gələn sürücülərin gözü qamaşır. AAYDA operativ bərpa briqadası 24 saat ərzində təmir aparmalıdır.',
    explanationEn:
      'When vane defects exceed 5%, direct light beams penetrate through gaps, causing sudden glare flashes. AAYDA rapid response squads must rectify within 24h.',
    legalCitation: 'AAYDA Magistral Yol Avadanlıqlarının İstismar Qaydaları',
  },
];

export const MOCK_GLARE_CERTIFICATES: GlareCertificate[] = [
  {
    certificateId: 'GLARE-SAFE-AZ-2026-9E4B11A2',
    issueDate: '2026-03-15',
    expiryDate: '2027-03-15',
    vehiclePlate: '99-GL-101',
    corridorCode: 'GLARE-M1-KM28',
    corridorName: 'M-1 Bakı – Quba – Rusiya (Sumqayıt Şimal Yan Dolaşması)',
    screeningEfficiencyPct: 96.8,
    deBoerScore: 8.4,
    calculatedVeilingCdM2: 0.042,
    simaDigitalUid: 'SIMA-GLARE-A8F4301B79E1',
    verificationPin: '482915',
    sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb924',
    authorizedInspector: 'AAYDA Magistral Yol Avadanlıqları İdarəsi / BDYP DYP Mühəndis Nəzarəti',
    status: 'ACTIVE',
  },
  {
    certificateId: 'GLARE-SAFE-AZ-2026-7A12C09F',
    issueDate: '2026-04-02',
    expiryDate: '2027-04-02',
    vehiclePlate: '10-GL-202',
    corridorCode: 'GLARE-BDR1-KM05',
    corridorName: 'Bakı Dairəvi-1 Avtomobil Yolu (Yasamal Dərəsi Viyaduku)',
    screeningEfficiencyPct: 94.2,
    deBoerScore: 7.8,
    calculatedVeilingCdM2: 0.065,
    simaDigitalUid: 'SIMA-GLARE-F7309B1A428C',
    verificationPin: '821049',
    sha256Checksum: 'b7f920da83c6144e59f2014ac890b17e',
    authorizedInspector: 'AAYDA Magistral Yol Avadanlıqları İdarəsi / BDYP DYP Mühəndis Nəzarəti',
    status: 'ACTIVE',
  },
  {
    certificateId: 'GLARE-SAFE-AZ-2026-3C88E44D',
    issueDate: '2026-02-18',
    expiryDate: '2027-02-18',
    vehiclePlate: '90-AZ-404',
    corridorCode: 'GLARE-M4-KM128',
    corridorName: 'M-4 Bakı – Şamaxı – Yevlax (Cəngi – Mərəzə Dağ Aşırımı)',
    screeningEfficiencyPct: 91.5,
    deBoerScore: 7.2,
    calculatedVeilingCdM2: 0.098,
    simaDigitalUid: 'SIMA-GLARE-38C7A0941F2E',
    verificationPin: '315792',
    sha256Checksum: '19da529f032ec84b11f710599a0e671c',
    authorizedInspector: 'AAYDA Magistral Yol Avadanlıqları İdarəsi / BDYP DYP Mühəndis Nəzarəti',
    status: 'ACTIVE',
  },
];
