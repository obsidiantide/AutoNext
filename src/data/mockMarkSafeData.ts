import {
  MarkCorridorAsset,
  MarkVehiclePreset,
  MarkChecklistItem,
  MarkExamQuestion,
  MarkSafeCertificate
} from '../utils/markSafeCompliance';

export const MOCK_MARK_CORRIDORS: MarkCorridorAsset[] = [
  {
    id: 'corridor-m1-sumgayit',
    nameAz: 'M-1 Bakı - Quba - Rusiya Sərhədi (Sumqayıt Dairəvi)',
    nameEn: 'M-1 Baku - Guba - Russia Border (Sumgayit Bypass)',
    route: 'M-1',
    region: 'Abşeron / Sumqayıt',
    chainageKm: 'Km 32+400',
    materialType: 'THERMOPLASTIC_EXTRUDED',
    linePattern: 'STRUCTURED_AUDIO_PROFILE',
    beadCoating: 'HIGH_INDEX_TITANIA_N19',
    currentRlDry: 360,
    currentRwWet: 185,
    currentQd: 180,
    beadApplicationRateGPerM2: 450,
    beadEmbedmentDepthPct: 56,
    aadtTraffic: 42000,
    lastRepaintDate: '2026-04-15',
    scadaSensorCode: 'SCADA-M1-RL-01'
  },
  {
    id: 'corridor-baku-ring-yasamal',
    nameAz: 'Bakı Dairəvi-1 Avtomobil Yolu (Yasamal Dərəsi)',
    nameEn: 'Baku Ring Road-1 (Yasamal Valley Highway)',
    route: 'Baku Ring-1',
    region: 'Bakı Şəhəri',
    chainageKm: 'Km 8+100',
    materialType: 'COLD_PLASTIC_MMA',
    linePattern: 'SOLID_DIVIDING_1_1',
    beadCoating: 'SILANE_ADHESION_COATED',
    currentRlDry: 410,
    currentRwWet: 195,
    currentQd: 205,
    beadApplicationRateGPerM2: 480,
    beadEmbedmentDepthPct: 58,
    aadtTraffic: 58000,
    lastRepaintDate: '2026-05-10',
    scadaSensorCode: 'SCADA-BR1-RL-02'
  },
  {
    id: 'corridor-airport-highway',
    nameAz: 'Heydər Əliyev Beynəlxalq Aeroportu Magistralı (Bülbülə-Mərdəkan)',
    nameEn: 'Heydar Aliyev Int. Airport Highway (Bulbula-Mardakan)',
    route: 'Airport Expressway',
    region: 'Bakı / Suraxanı',
    chainageKm: 'Km 14+500',
    materialType: 'COLD_PLASTIC_MMA',
    linePattern: 'DASHED_LANE_1_5',
    beadCoating: 'HIGH_INDEX_TITANIA_N19',
    currentRlDry: 435,
    currentRwWet: 220,
    currentQd: 210,
    beadApplicationRateGPerM2: 500,
    beadEmbedmentDepthPct: 54,
    aadtTraffic: 65000,
    lastRepaintDate: '2026-06-01',
    scadaSensorCode: 'SCADA-AIR-RL-03'
  },
  {
    id: 'corridor-m2-kurdamir',
    nameAz: 'M-2 Bakı - Ələt - Gəncə - Gürcüstan (Kürdəmir Düzənliyi)',
    nameEn: 'M-2 Baku - Alat - Ganja - Georgia (Kurdamir Basin)',
    route: 'M-2',
    region: 'Kürdəmir / Aran',
    chainageKm: 'Km 198+300',
    materialType: 'THERMOPLASTIC_EXTRUDED',
    linePattern: 'STRUCTURED_AUDIO_PROFILE',
    beadCoating: 'HYDROPHOBIC_DUAL_COATED',
    currentRlDry: 290,
    currentRwWet: 145,
    currentQd: 165,
    beadApplicationRateGPerM2: 420,
    beadEmbedmentDepthPct: 52,
    aadtTraffic: 28000,
    lastRepaintDate: '2026-03-20',
    scadaSensorCode: 'SCADA-M2-RL-04'
  },
  {
    id: 'corridor-m4-aghsu-pass',
    nameAz: 'M-4 Şamaxı - Ağsu Dağ Aşırımı (Serpentin Dumanlı Qövs)',
    nameEn: 'M-4 Shamakhi - Aghsu Mountain Pass (Serpentine Curve)',
    route: 'M-4',
    region: 'Ağsu / Dağlıq Şirvan',
    chainageKm: 'Km 126+700',
    materialType: 'POLYURETHANE_STRUCTURED_RIBBED',
    linePattern: 'DOUBLE_SOLID_1_3',
    beadCoating: 'HIGH_INDEX_TITANIA_N19',
    currentRlDry: 380,
    currentRwWet: 210,
    currentQd: 170,
    beadApplicationRateGPerM2: 520,
    beadEmbedmentDepthPct: 60,
    aadtTraffic: 14000,
    lastRepaintDate: '2026-05-18',
    scadaSensorCode: 'SCADA-M4-RL-05'
  },
  {
    id: 'corridor-zafar-yolu-shusha',
    nameAz: 'Zəfər Yolu (Füzuli - Daşaltı - Şuşa Dağ Dəhlizi)',
    nameEn: 'Victory Road (Fuzuli - Dashalti - Shusha Mountain Route)',
    route: 'Zəfər Yolu',
    region: 'Şuşa / Qarabağ',
    chainageKm: 'Km 64+200',
    materialType: 'POLYURETHANE_STRUCTURED_RIBBED',
    linePattern: 'EDGE_LINE_1_2',
    beadCoating: 'HYDROPHOBIC_DUAL_COATED',
    currentRlDry: 340,
    currentRwWet: 180,
    currentQd: 160,
    beadApplicationRateGPerM2: 460,
    beadEmbedmentDepthPct: 55,
    aadtTraffic: 9500,
    lastRepaintDate: '2026-07-02',
    scadaSensorCode: 'SCADA-ZY-RL-06'
  }
];

export const MOCK_MARK_VEHICLE_PRESETS: MarkVehiclePreset[] = [
  {
    id: 'preset-sedan-corolla',
    category: 'passenger_sedan',
    nameAz: 'Toyota Corolla 1.8 Hybrid (Klassik Halogen / LED Faralar)',
    nameEn: 'Toyota Corolla 1.8 Hybrid (Standard Halogen / LED Headlights)',
    licensePlate: '99-MK-101',
    headlightLumens: 2800,
    headlightCandela: 32000,
    nominalSpeedKmH: 90,
    driverEyeHeightM: 1.15,
    headlightMountHeightM: 0.65,
    previewDemandSeconds: 2.8
  },
  {
    id: 'preset-suv-prado',
    category: 'high_riding_suv',
    nameAz: 'Toyota Land Cruiser Prado TX (Yüksək Adaptiv Bi-LED Faralar)',
    nameEn: 'Toyota Land Cruiser Prado TX (High Mount Adaptive Bi-LED)',
    licensePlate: '10-RL-202',
    headlightLumens: 4200,
    headlightCandela: 58000,
    nominalSpeedKmH: 100,
    driverEyeHeightM: 1.65,
    headlightMountHeightM: 0.95,
    previewDemandSeconds: 3.0
  },
  {
    id: 'preset-freight-actros',
    category: 'freight_semi_trailer',
    nameAz: 'Mercedes-Benz Actros 1845 TIR (Magistral Ağır Yük Yarımqoşqusu)',
    nameEn: 'Mercedes-Benz Actros 1845 TIR (Heavy Freight Long-Haul)',
    licensePlate: '77-GB-303',
    headlightLumens: 4800,
    headlightCandela: 65000,
    nominalSpeedKmH: 80,
    driverEyeHeightM: 2.45,
    headlightMountHeightM: 1.1,
    previewDemandSeconds: 3.5
  },
  {
    id: 'preset-coach-neoplan',
    category: 'intercity_coach',
    nameAz: 'Neoplan Cityliner 55-Yerlik Şəhərlərarası Sərnişin Avtobusu',
    nameEn: 'Neoplan Cityliner 55-Passenger Intercity Tourist Coach',
    licensePlate: '90-AZ-404',
    headlightLumens: 5200,
    headlightCandela: 72000,
    nominalSpeedKmH: 90,
    driverEyeHeightM: 2.1,
    headlightMountHeightM: 0.85,
    previewDemandSeconds: 3.2
  },
  {
    id: 'preset-ev-zeekr',
    category: 'electric_vehicle',
    nameAz: 'Zeekr 001 Long Range (Matrix Laser ADB Smart Beam)',
    nameEn: 'Zeekr 001 Long Range (Matrix Laser ADB Smart Beam)',
    licensePlate: '99-RW-505',
    headlightLumens: 5600,
    headlightCandela: 84000,
    nominalSpeedKmH: 110,
    driverEyeHeightM: 1.2,
    headlightMountHeightM: 0.68,
    previewDemandSeconds: 3.2
  },
  {
    id: 'preset-police-interceptor',
    category: 'police_patrol_interceptor',
    nameAz: 'BDYP BMW 530i xDrive Patrul və Yol Müfəttişliyi Avtomobili',
    nameEn: 'BDYP BMW 530i xDrive Highway Patrol Interceptor',
    licensePlate: '00-YP-606',
    headlightLumens: 5400,
    headlightCandela: 80000,
    nominalSpeedKmH: 110,
    driverEyeHeightM: 1.18,
    headlightMountHeightM: 0.66,
    previewDemandSeconds: 3.0
  }
];

export const MOCK_MARK_CHECKLIST_ITEMS: MarkChecklistItem[] = [
  {
    id: 'chk-geom-width',
    titleAz: 'Nişanlama Xəttinin Həndəsi Eni və Düzgünlüyü',
    titleEn: 'Marking Line Geometric Width & Straightness',
    category: 'geometry',
    standardRef: 'AZS 410 / GOST R 51256',
    descriptionAz: 'Bütöv (1.1) və qırıq-qırıq (1.5) xətlərin eni 15 sm, qabarit zolaq kənar xətlərinin (1.2) eni 20 sm olmalıdır. Kənaraçıxma maks. 5 mm-dir.',
    descriptionEn: 'Dividing line width must be 15 cm, edge line width 20 cm. Maximum deviation allowed is 5 mm.',
    mandatory: true
  },
  {
    id: 'chk-thickness-layer',
    titleAz: 'Termoplastik / Soyuq Plastik Qat Qalınlığı',
    titleEn: 'Thermoplastic / Cold Plastic Layer Thickness',
    category: 'durability',
    standardRef: 'AZS 342 / EN 1436',
    descriptionAz: 'Magistral yollarda termoplastik qatının quru qalınlığı ən azı 3.0 mm, səsli profillərdə (ribbed) daraq hündürlüyü 7.0-9.0 mm təşkil etməlidir.',
    descriptionEn: 'Dry layer thickness must be at least 3.0 mm for thermoplastic, ribbed audio profiles 7.0-9.0 mm.',
    mandatory: true
  },
  {
    id: 'chk-dry-retro-rl',
    titleAz: 'Quru Halda Retrorefleksiya Əmsalı (RL >= 150 mcd/m²/lx)',
    titleEn: 'Dry Retroreflectivity Coefficient (RL >= 150 mcd/m²/lx)',
    category: 'optics',
    standardRef: 'AZS 410 / ASTM E1710 (CEN 30m)',
    descriptionAz: 'CEN 30 metr müşahidə həndəsəsində ağ xətlər üçün RL ən azı 150 mcd/(m²·lx) (Class R3), sarı xətlər üçün ən azı 100 mcd/(m²·lx) olmalıdır.',
    descriptionEn: 'Under CEN 30m geometry, white lines must achieve RL >= 150 mcd/(m²*lx) (Class R3), yellow lines >= 100.',
    mandatory: true
  },
  {
    id: 'chk-wet-retro-rw',
    titleAz: 'Yağışda və Nəm Səthdə Retrorefleksiya (Rw >= 35 mcd/m²/lx)',
    titleEn: 'Wet Road Surface Retroreflectivity (Rw >= 35 mcd/m²/lx)',
    category: 'optics',
    standardRef: 'EN 1436 (Class RW2) / ASTM E2177',
    descriptionAz: '1 dəqiqəlik su drenajından sonra ölçülən qalıq retrorefleksiya Class RW2 (>= 35 mcd/(m²·lx)) tələbini ödəməlidir.',
    descriptionEn: 'After 1-min water draining, residual wet retroreflectivity must meet Class RW2 (>= 35 mcd/(m²*lx)).',
    mandatory: true
  },
  {
    id: 'chk-daytime-qd',
    titleAz: 'Gündüz Parlaqlıq Əmsalı (Qd >= 130 mcd/m²/lx)',
    titleEn: 'Daytime Luminance Factor (Qd >= 130 mcd/m²/lx)',
    category: 'optics',
    standardRef: 'EN 1436 (Class Q3)',
    descriptionAz: 'Gündüz işıqlanma şəraitində diffuz əks olunma parlaqlığı Class Q3 (>= 130 mcd/(m²·lx)) standartına uyğun olmalıdır.',
    descriptionEn: 'Daytime diffuse luminance under ambient daylight must meet Class Q3 (>= 130 mcd/(m²*lx)).',
    mandatory: true
  },
  {
    id: 'chk-bead-embedment',
    titleAz: 'Şüşə Mikrosferlərin Batma Dərinliyi (50% - 60%)',
    titleEn: 'Glass Bead Embedment Depth (50% - 60%)',
    category: 'optics',
    standardRef: 'EN 1423 / EN 1424',
    descriptionAz: 'Mikrosferlər boya qatına 50-60% batmalıdır. 40%-dən az olduqda qopma, 70%-dən çox olduqda optik korlaşma yaranır.',
    descriptionEn: 'Beads must be embedded to 50-60% depth. Less than 40% leads to detachment, over 70% obscures reflection.',
    mandatory: true
  },
  {
    id: 'chk-bead-roundness',
    titleAz: 'Mikrosferlərin Sferiklik Dərəcəsi (Dairəvilik >= 80%)',
    titleEn: 'Glass Bead Sphericity (Roundness >= 80%)',
    category: 'optics',
    standardRef: 'EN 1423 Class A',
    descriptionAz: 'İşıq şüasını fənərə geri fokuslamaq üçün şüşə kürəciklərin ən azı 80%-i qüsursuz dairəvi sferik olmalıdır.',
    descriptionEn: 'At least 80% of glass beads must possess true spherical roundness for Snell collimation.',
    mandatory: true
  },
  {
    id: 'chk-skid-resistance',
    titleAz: 'Sürüşmə Müqaviməti və Şəbəkə Qovuşması (SRT >= 45 BPN)',
    titleEn: 'Skid Resistance Value (SRT >= 45 BPN)',
    category: 'skid',
    standardRef: 'EN 1436 (Class S1) / ASTM E303',
    descriptionAz: 'Təkərin nişanlama xətti üzərində sürüşməməsi üçün kvars/korund dənələri qatılmalı, Britaniya Rəqqas Qiyməti (BPN) >= 45 olmalıdır.',
    descriptionEn: 'Markings must contain anti-skid bauxite/corundum grains achieving British Pendulum Number >= 45 BPN.',
    mandatory: true
  },
  {
    id: 'chk-adhesion-asphalt',
    titleAz: 'Asfalt Örtüyünə Yapışma Gücü (Adheziya >= 1.5 MPa)',
    titleEn: 'Adhesion Strength to Asphalt (Adhesion >= 1.5 MPa)',
    category: 'durability',
    standardRef: 'AZS 410 / ISO 4624',
    descriptionAz: 'Dartma yolu ilə adheziya sınağında nişanlama xətti asfaltdan qopmamalı, ən azı 1.5 MPa dartılma gücünə tab gətirməlidir.',
    descriptionEn: 'Tensile pull-off adhesion strength must exceed 1.5 MPa with cohesive failure within asphalt substrate.',
    mandatory: true
  },
  {
    id: 'chk-scada-telemetry',
    titleAz: 'Dinamik SCADA Lazer Retroreflektometr Monitorinqi',
    titleEn: 'Dynamic SCADA Mobile Laser Retroreflectometer Monitoring',
    category: 'durability',
    standardRef: 'AAYDA İnnovativ SCADA Əsasnaməsi',
    descriptionAz: 'Magistral yolda quraşdırılmış optik sensorlar və ya mobil lazer ölçmə avtomobili ilə ayda ən azı 1 dəfə yoxlama aparılmalıdır.',
    descriptionEn: 'Monthly verification required via continuous mobile laser retroreflectometer patrol van or embedded sensors.',
    mandatory: true
  }
];

export const MOCK_MARK_EXAM_QUESTIONS: MarkExamQuestion[] = [
  {
    id: 'q-mark-1',
    questionAz: 'Azərbaycan qanunvericiliyinə (AZS 410 və İXM 327.1) əsasən, 1.1 bütöv xəttin tələbini pozaraq onu tapdalamağın cəriməsi nə qədərdir?',
    questionEn: 'According to Azerbaijani legislation (AZS 410 & Code Art. 327.1), what is the penalty for crossing a single solid dividing line 1.1?',
    optionsAz: [
      '20 AZN və 1 cərimə balı',
      '40 AZN cərimə (cərimə balı tətbiq edilmir)',
      '60 AZN və 3 cərimə balı',
      '100 AZN və sürücülük hüququnun məhdudlaşdırılması'
    ],
    optionsEn: [
      '20 AZN and 1 penalty point',
      '40 AZN fine (no penalty points)',
      '60 AZN and 3 penalty points',
      '100 AZN and license suspension'
    ],
    correctIndex: 1,
    legalCitation: 'İXM Maddə 327.1: Yol nişanlarının və ya yolun hərəkət hissəsinin nişanlanması tələblərinə riayət edilməməsinə görə qırx manat məbləğində cərimə edilir.',
    explanationAz: 'İXM 327.1-ci maddəsinə əsasən, bütöv 1.1 xəttini tapdamaq 40 AZN cərimə ilə nəticələnir. 30 gün ərzində ödənildikdə İXM 38-ə əsasən 50% güzəştlə 20 AZN təşkil edir.',
    explanationEn: 'Under Article 327.1, failing to obey road markings incurs a 40 AZN fine (20 AZN if paid within 30 days under Article 38).'
  },
  {
    id: 'q-mark-2',
    questionAz: '1.3 ikiqat bütöv xəttin tələblərini pozaraq qarşı hərəkət zolağına çıxma hansı inzibati məsuliyyətə səbəb olur?',
    questionEn: 'What administrative sanction applies for crossing a double solid line 1.3 into the oncoming traffic lane?',
    optionsAz: [
      '40 AZN cərimə',
      '60 AZN cərimə və 3 cərimə balı (İXM Maddə 327.2)',
      '100 AZN və 4 cərimə balı',
      'İnzibati həbs 15 gün'
    ],
    optionsEn: [
      '40 AZN fine',
      '60 AZN fine and 3 penalty points (Article 327.2)',
      '100 AZN and 4 penalty points',
      'Administrative arrest for 15 days'
    ],
    correctIndex: 1,
    legalCitation: 'İXM Maddə 327.2: 1.1 və ya 1.3 ikiqat bütöv xəttin tələblərini pozaraq qarşı hərəkət zolağına çıxmağa görə altmış manat məbləğində cərimə və 3 cərimə balı tətbiq edilir.',
    explanationAz: 'İkiqat bütöv xətti pozmaq ciddi təhlükəsizlik xətası hesab olunur və 60 AZN cərimə ilə yanaşı sürücüyə 3 cərimə balı yazılır.',
    explanationEn: 'Crossing a double solid line 1.3 incurs a 60 AZN fine and 3 penalty points under Article 327.2.'
  },
  {
    id: 'q-mark-3',
    questionAz: 'Avropa standartı EN 1436 və AZS 410-a əsasən magistral sürət yollarında ağ xətlər üçün quru halda minimum retrorefleksiya (RL) hansı sinifdən aşağı olmamalıdır?',
    questionEn: 'According to EN 1436 and AZS 410, what is the minimum dry retroreflectivity (RL) class for white markings on expressways?',
    optionsAz: [
      'Class R1 (RL >= 80 mcd/m²/lx)',
      'Class R2 (RL >= 100 mcd/m²/lx)',
      'Class R3 (RL >= 150 mcd/m²/lx)',
      'Class R5 (RL >= 300 mcd/m²/lx)'
    ],
    optionsEn: [
      'Class R1 (RL >= 80 mcd/m²/lx)',
      'Class R2 (RL >= 100 mcd/m²/lx)',
      'Class R3 (RL >= 150 mcd/m²/lx)',
      'Class R5 (RL >= 300 mcd/m²/lx)'
    ],
    correctIndex: 2,
    legalCitation: 'AZS 410 / EN 1436 Cədvəl 2: Magistral və yüksək sürətli yollarda istismar zamanı ağ xəttin RL əmsalı minimum 150 mcd/(m²·lx) (Class R3) təşkil etməlidir.',
    explanationAz: 'Magistral yollarda gecə vaxtı sürücünün zolağı ən azı 3 saniyə öncədən görməsi üçün RL mütləq Class R3 (150 mcd/m²/lx) səviyyəsində saxlanmalıdır.',
    explanationEn: 'Expressways require at least Class R3 (150 mcd/(m²*lx)) dry retroreflectivity to ensure 3-second preview time at speed.'
  },
  {
    id: 'q-mark-4',
    questionAz: 'Şüşə mikrosferlərin (glass beads) termoplastik boya qatına optimal batma dərinliyi neçə faiz təşkil etməlidir?',
    questionEn: 'What is the optimal embedment depth percentage of glass beads in thermoplastic paint?',
    optionsAz: [
      '20% - 30%',
      '50% - 60% (EN 1423 standartı)',
      '80% - 90%',
      'Tamamilə 100% batmalıdır'
    ],
    optionsEn: [
      '20% - 30%',
      '50% - 60% (EN 1423 standard)',
      '80% - 90%',
      '100% fully submerged'
    ],
    correctIndex: 1,
    legalCitation: 'EN 1423 / EN 1424: Glass beads optimal embedment ratio is 55% +/- 5% for maximum retroreflection and bond adhesion.',
    explanationAz: 'Kürəciyin 50-60%-i boyanın içində qaldıqda arxa yarımkürə güzgü effekti yaradır və işıq şüası Snell qanununa əsasən fənərə geri qayıdır.',
    explanationEn: 'At 50-60% embedment, the back hemisphere acts as a reflector, returning light back toward vehicle headlights.'
  },
  {
    id: 'q-mark-5',
    questionAz: 'Gecə vaxtı yağış yağarkən standart düz xətlərin görünməz olmasının əsas fiziki səbəbi nədir?',
    questionEn: 'What is the primary physical cause of standard flat road markings becoming invisible in night rain?',
    optionsAz: [
      'Boya qatının dərhal həll olub yuyulması',
      'Su təbəqəsinin mikrosferləri örtərək güzgü tipli spekulyar səpilmə yaratması',
      'Fənər şüasının su tərəfindən tam udulması',
      'Asfaltın rənginin ağarması'
    ],
    optionsEn: [
      'The paint dissolving and washing away immediately',
      'Water film submerging beads and causing specular forward reflection',
      'Headlight light being completely absorbed by water',
      'The asphalt turning white'
    ],
    correctIndex: 1,
    legalCitation: 'ASTM E2177 / EN 1436 Annexe B: Water film over standard glass beads eliminates refractive index differential and causes forward glare specular reflection.',
    explanationAz: 'Su pərdəsi şüşə mikrosferin üzərini örtdükdə işıq şüası arxaya qayıtmır, irəli tərəfə ayna kimi əks olunaraq sürücünün gözünə gəlmir.',
    explanationEn: 'A continuous water film creates specular reflection directed away from the driver rather than retroreflection.'
  },
  {
    id: 'q-mark-6',
    questionAz: 'Yağışlı gecələrdə su pərdəsindən xilas olmaq və akustik xəbərdarlıq yaratmaq üçün hansı tipli nişanlama xətti tətbiq edilir?',
    questionEn: 'Which marking profile is used to elevate beads above water films and provide audible rumbling warnings?',
    optionsAz: [
      'Sadə su əsaslı akril boya',
      'Strukturlu profilli səsli xətt (Structured Audio-Ribbed Profile)',
      'Bitum mastikası',
      'Metal parlaq lent'
    ],
    optionsEn: [
      'Simple waterborne acrylic paint',
      'Structured audio-ribbed profile marking',
      'Bitumen mastic',
      'Metallic shiny tape'
    ],
    correctIndex: 1,
    legalCitation: 'EN 1436 / AZS 410: Type II structured markings feature ribs up to 7-9 mm high allowing lateral water drainage and tactile rumble.',
    explanationAz: 'Profilli səsli xətlər (ribbed profile) 7-9 mm hündürlükdə qabarıqlardan ibarətdir; su aradakı novlardan axıb gedir və mikrosferlər suyun üstündə qalır.',
    explanationEn: 'Structured ribbed markings elevate optical beads above water films and alert drowsy drivers via tactile audible vibration.'
  },
  {
    id: 'q-mark-7',
    questionAz: 'Şüşə mikrosferlərin sınma əmsalı (Refractive Index n) hansı aralıqda olduqda ən yüksək retrorefleksiya əldə edilir?',
    questionEn: 'Which glass bead refractive index (n) range delivers highest retroreflectivity?',
    optionsAz: [
      'n = 1.00 (hava ilə eyni)',
      'n = 1.33 (su ilə eyni)',
      'n = 1.90 - 1.93 (Yüksək indeksli Titan şüşəsi)',
      'n = 2.50'
    ],
    optionsEn: [
      'n = 1.00 (same as air)',
      'n = 1.33 (same as water)',
      'n = 1.90 - 1.93 (High-index Titania glass)',
      'n = 2.50'
    ],
    correctIndex: 2,
    legalCitation: 'EN 1423 Class B: High-index glass beads (n >= 1.90) achieve optimal focal convergence on the back painted surface of the bead.',
    explanationAz: 'Titanium dioksidlə zənginləşdirilmiş n=1.90 indeksli mikrosferlər işığı birbaşa kürənin arxa kənarına fokuslayır və əksər şüanı 100% geri qaytarır.',
    explanationEn: 'Beads with refractive index n=1.90 achieve near-ideal optical focus on the rear painted sphere wall, returning maximum light.'
  },
  {
    id: 'q-mark-8',
    questionAz: '110 km/saat sürətlə hərəkət edən avtomobilin sürücüsü üçün təhlükəsiz reaksiya və zolaq baxış məsafəsi (preview time) ən azı neçə saniyə olmalıdır?',
    questionEn: 'What is the minimum safe driver preview time required for lane keeping at 110 km/h?',
    optionsAz: [
      '0.5 saniyə',
      '1.0 saniyə',
      'Ən azı 2.8 - 3.0 saniyə (təqribən 85-92 metr məsafə)',
      '10 saniyə'
    ],
    optionsEn: [
      '0.5 seconds',
      '1.0 seconds',
      'At least 2.8 - 3.0 seconds (approx. 85-92 meters distance)',
      '10 seconds'
    ],
    correctIndex: 2,
    legalCitation: 'CIE Publication 73 & PIARC Road Safety: 3.0 seconds preview time is necessary for driver perception-reaction and steering guidance.',
    explanationAz: '110 km/saatda avtomobil saniyədə 30.5 metr qət edir. 3 saniyəlik baxış təmin etmək üçün nişanlama xətti ən azı 90 metrdən aydın görünməlidir.',
    explanationEn: 'At 110 km/h (30.5 m/s), a 3-second preview requires visible markings at least 90 meters ahead of the vehicle.'
  },
  {
    id: 'q-mark-9',
    questionAz: 'Motosiklet və avtomobil təkərlərinin xətlər üzərində sürüşməsinin qarşısını almaq üçün hansı göstərici tələb olunur?',
    questionEn: 'Which metric measures skid resistance to prevent vehicles and motorcycles from sliding on road markings?',
    optionsAz: [
      'Sürüşmə Müqaviməti SRT / BPN >= 45 (Britaniya Rəqqası)',
      'Yalnız parlaqlıq dərəcəsi',
      'Termoplastikin ərimə temperaturu',
      'Külək təzyiqi'
    ],
    optionsEn: [
      'Skid Resistance Value SRT / BPN >= 45 (British Pendulum)',
      'Luminance only',
      'Thermoplastic melting temperature',
      'Wind pressure'
    ],
    correctIndex: 0,
    legalCitation: 'EN 1436 Class S1: Minimum Skid Resistance Tester (SRT) value is 45 BPN to safeguard two-wheeled and four-wheeled vehicles.',
    explanationAz: 'Nişanlama xəttinə kvars və boksit dənəcikləri qatılaraq BPN əmsalı 45-dən yuxarı saxlanılır, əks halda tormozlama zamanı sürüşmə baş verir.',
    explanationEn: 'Anti-skid aggregates such as bauxite are blended into the marking matrix to guarantee SRT >= 45 BPN.'
  },
  {
    id: 'q-mark-10',
    questionAz: 'Dövlət yol infrastrukturuna, o cümlədən təzə çəkilmiş termoplastik nişanlama xətlərinə qanunsuz zərər yetirmək hansı məsuliyyətə səbəb olur?',
    questionEn: 'What sanction is imposed for illegally damaging highway road markings and thermoplastic infrastructure?',
    optionsAz: [
      'Şifahi xəbərdarlıq',
      'İXM Maddə 353.1: 100-150 AZN cərimə və dəymiş ziyanın tam bərpası',
      'Yalnız 10 AZN cərimə',
      'Nəqliyyat vasitəsinin müsadirəsi'
    ],
    optionsEn: [
      'Verbal warning',
      'Article 353.1: 100-150 AZN fine plus full restitution of repair costs',
      'Only 10 AZN fine',
      'Vehicle confiscation'
    ],
    correctIndex: 1,
    legalCitation: 'İXM Maddə 353.1: Avtomobil yollarına, yol qurğularına və yol nişanlama xətlərinə qəsdən və ya səhlənkarlıqla ziyan vurulması fiziki şəxslər üçün 100-150 manatadək cəriməyə səbəb olur.',
    explanationAz: 'İXM 353.1-ci maddəsinə əsasən dövlət yol fondunun əmlakına xələl gətirilməsi cərimələnir və vurulmuş zərər bərpa edilməlidir.',
    explanationEn: 'Article 353.1 imposes a 100-150 AZN fine and obligates restitution for damage inflicted upon highway infrastructure.'
  }
];

export const MOCK_ACTIVE_MARK_CERTIFICATES: MarkSafeCertificate[] = [
  {
    certificateUid: 'MARK-SAFE-AZ-2026-A101BF',
    verificationPin: '4192',
    vehiclePlate: '99-MK-101',
    corridorId: 'corridor-m1-sumgayit',
    measuredRlDry: 360,
    measuredRwWet: 185,
    measuredQd: 180,
    tier: 'CLASS_R4_GOOD',
    previewDistanceMeters: 88,
    previewTimeSeconds: 3.5,
    safetyStatus: 'ADEQUATE_SAFETY_MARGIN',
    inspectionDateIso: '2026-10-14T09:30:00Z',
    validUntilIso: '2027-04-14T09:30:00Z',
    simaDigitalUid: 'SIMA-MARK-78BA9921',
    sha256Checksum: 'SHA256-42E1FA08-A101BF'
  },
  {
    certificateUid: 'MARK-SAFE-AZ-2026-B202CD',
    verificationPin: '6743',
    vehiclePlate: '10-RL-202',
    corridorId: 'corridor-baku-ring-yasamal',
    measuredRlDry: 410,
    measuredRwWet: 195,
    measuredQd: 205,
    tier: 'CLASS_R5_EXCEPTIONAL',
    previewDistanceMeters: 105,
    previewTimeSeconds: 3.8,
    safetyStatus: 'EXCELLENT_PREVIEW',
    inspectionDateIso: '2026-10-20T14:15:00Z',
    validUntilIso: '2027-04-20T14:15:00Z',
    simaDigitalUid: 'SIMA-MARK-12FF4410',
    sha256Checksum: 'SHA256-88BC19A4-B202CD'
  },
  {
    certificateUid: 'MARK-SAFE-AZ-2026-C303EF',
    verificationPin: '8219',
    vehiclePlate: '77-GB-303',
    corridorId: 'corridor-m2-kurdamir',
    measuredRlDry: 290,
    measuredRwWet: 145,
    measuredQd: 165,
    tier: 'CLASS_R4_GOOD',
    previewDistanceMeters: 92,
    previewTimeSeconds: 4.1,
    safetyStatus: 'EXCELLENT_PREVIEW',
    inspectionDateIso: '2026-10-25T11:45:00Z',
    validUntilIso: '2027-04-25T11:45:00Z',
    simaDigitalUid: 'SIMA-MARK-5533AA90',
    sha256Checksum: 'SHA256-1188D412-C303EF'
  }
];
