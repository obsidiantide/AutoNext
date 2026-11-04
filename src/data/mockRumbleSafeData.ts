import {
  RumbleCorridorStation,
  RumbleVehiclePreset,
  RumbleChecklistItem,
  RumbleExamQuestion,
  RumbleCertificate,
} from '../utils/rumbleSafeCompliance';

export const MOCK_RUMBLE_CORRIDOR_STATIONS: RumbleCorridorStation[] = [
  {
    id: 'RS-M1-01',
    code: 'M1-KM45',
    nameAz: 'M-1 Bakı – Quba – Rusiya Sərhədi (Sumqayıt Yan Keçidi)',
    nameEn: 'M-1 Baku – Guba – Russia Border (Sumgayit Bypass)',
    nameRu: 'M-1 Баку – Губа – Граница с РФ (Сумгаитский обход)',
    corridor: 'M-1 North International Transit Corridor',
    routeNumber: 'M-1',
    picketKm: 'Km 45+200',
    placement: 'SHOULDER_EDGE',
    pattern: 'MILLED_CYLINDRICAL',
    millingDepthMm: 12,
    millingWidthMm: 400,
    pitchMm: 300,
    bicycleGapPattern: true,
    stationStatus: 'OPERATIONAL_NOMINAL',
    annualRorReductionPct: 62.4,
    installedYear: 2024,
  },
  {
    id: 'RS-M2-02',
    code: 'M2-KM184',
    nameAz: 'M-2 Bakı – Ələt – Gəncə – Gürcüstan Sərhədi (Kürdəmir Çöl Sahəsi)',
    nameEn: 'M-2 Baku – Alat – Ganja – Georgia Border (Kurdamir Steppe)',
    nameRu: 'M-2 Баку – Алят – Гянджа – Граница с Грузией (Кюрдамирский участок)',
    corridor: 'M-2 East-West Silk Road Corridor',
    routeNumber: 'M-2',
    picketKm: 'Km 184+600',
    placement: 'CENTERLINE_MEDIAN',
    pattern: 'MILLED_CYLINDRICAL',
    millingDepthMm: 11,
    millingWidthMm: 350,
    pitchMm: 300,
    bicycleGapPattern: false,
    stationStatus: 'OPERATIONAL_NOMINAL',
    annualRorReductionPct: 67.8,
    installedYear: 2023,
  },
  {
    id: 'RS-BRR-03',
    code: 'BRR1-KM08',
    nameAz: 'Bakı Dairəvi-1 Avtomobil Yolu (Lökbatan – Yasamal Dərəsi Döngəsi)',
    nameEn: 'Baku Ring Road-1 (Lokbatan – Yasamal Valley Curve)',
    nameRu: 'Бакинская Кольцевая-1 (Локбатан – Ясамальский изгиб)',
    corridor: 'Baku Metropolitan Ring Highway System',
    routeNumber: 'BRR-1',
    picketKm: 'Km 8+400',
    placement: 'TRANSVERSE_APPROACH',
    pattern: 'MILLED_SINUSOIDAL',
    millingDepthMm: 9,
    millingWidthMm: 500,
    pitchMm: 600,
    bicycleGapPattern: false,
    stationStatus: 'OPERATIONAL_NOMINAL',
    annualRorReductionPct: 54.2,
    installedYear: 2025,
  },
  {
    id: 'RS-M4-04',
    code: 'M4-KM118',
    nameAz: 'M-4 Bakı – Şamaxı – Yevlax Dağ Yolu (Mərəzə – Cəngi Serpantini)',
    nameEn: 'M-4 Baku – Shamakhi – Yevlakh Mountain Highway (Maraza Serpentine)',
    nameRu: 'M-4 Баку – Шемаха – Евлах (Серпантин Мараза – Джанги)',
    corridor: 'M-4 Central Mountain Route',
    routeNumber: 'M-4',
    picketKm: 'Km 118+700',
    placement: 'SHOULDER_EDGE',
    pattern: 'MILLED_CYLINDRICAL',
    millingDepthMm: 13,
    millingWidthMm: 350,
    pitchMm: 300,
    bicycleGapPattern: true,
    stationStatus: 'HIGH_ROR_INCIDENT_ZONE',
    annualRorReductionPct: 59.5,
    installedYear: 2023,
  },
  {
    id: 'RS-ZY-05',
    code: 'ZY-KM54',
    nameAz: 'Zəfər Yolu (Füzuli – Şuşa Daşaltı Dərəsi Yanaşması)',
    nameEn: 'Victory Road (Fuzuli – Shusha Dashalti Gorge Approach)',
    nameRu: 'Дорога Победы (Подход к ущелью Дашалты, Физули – Шуша)',
    corridor: 'Karabakh Strategic Highway Corridor',
    routeNumber: 'ZY-01',
    picketKm: 'Km 54+100',
    placement: 'CENTERLINE_MEDIAN',
    pattern: 'MILLED_SINUSOIDAL',
    millingDepthMm: 10,
    millingWidthMm: 300,
    pitchMm: 300,
    bicycleGapPattern: false,
    stationStatus: 'OPERATIONAL_NOMINAL',
    annualRorReductionPct: 69.1,
    installedYear: 2024,
  },
  {
    id: 'RS-M3-06',
    code: 'M3-KM162',
    nameAz: 'M-3 Ələt – Astara – İran Sərhədi (Cəlilabad – Masallı Tranziti)',
    nameEn: 'M-3 Alat – Astara – Iran Border (Jalilabad – Masalli Transit)',
    nameRu: 'M-3 Алят – Астара – Граница с Ираном (Джалилабад – Масаллы)',
    corridor: 'North-South International Corridor',
    routeNumber: 'M-3',
    picketKm: 'Km 162+300',
    placement: 'SHOULDER_EDGE',
    pattern: 'MILLED_CYLINDRICAL',
    millingDepthMm: 12,
    millingWidthMm: 400,
    pitchMm: 300,
    bicycleGapPattern: true,
    stationStatus: 'OPERATIONAL_NOMINAL',
    annualRorReductionPct: 64.7,
    installedYear: 2024,
  },
];

export const MOCK_RUMBLE_VEHICLE_PRESETS: RumbleVehiclePreset[] = [
  {
    id: 'VP-RS-01',
    plate: '99-RS-101',
    model: 'Mercedes-Benz E 300 Sedan (Acoustic Glass)',
    tireType: 'SUMMER_PASSENGER',
    suspensionStiffnessFactor: 1.0,
    baselineCabinNoiseDba: 63.5,
    defaultSpeedKmh: 95,
    driverState: 'ALERT_NORMAL',
    violationType: 'NONE',
  },
  {
    id: 'VP-RS-02',
    plate: '10-RS-202',
    model: 'KamAZ 5490 Neo TIR (40-Ton Heavy Freight)',
    tireType: 'COMMERCIAL_TRUCK_RADIAL',
    suspensionStiffnessFactor: 1.35,
    baselineCabinNoiseDba: 71.0,
    defaultSpeedKmh: 85,
    driverState: 'SEVERE_FATIGUE_MICRO_SLEEP',
    violationType: 'SHOULDER_INCURSION',
  },
  {
    id: 'VP-RS-03',
    plate: '77-RS-303',
    model: 'Hyundai Elantra 2.0 (Standard Civilian)',
    tireType: 'SUMMER_PASSENGER',
    suspensionStiffnessFactor: 1.05,
    baselineCabinNoiseDba: 66.0,
    defaultSpeedKmh: 100,
    driverState: 'DISTRACTED_PHONE',
    violationType: 'SHOULDER_INCURSION',
  },
  {
    id: 'VP-RS-04',
    plate: '90-AZ-404',
    model: 'Toyota Land Cruiser 300 SUV (High-Profile)',
    tireType: 'WINTER_STUDLESS',
    suspensionStiffnessFactor: 0.9,
    baselineCabinNoiseDba: 65.0,
    defaultSpeedKmh: 110,
    driverState: 'MILD_DROWSINESS',
    violationType: 'CENTERLINE_CROSSOVER',
  },
  {
    id: 'VP-RS-05',
    plate: '99-RS-505',
    model: 'Ford Transit 350L (Commercial Courier Van)',
    tireType: 'COMMERCIAL_TRUCK_RADIAL',
    suspensionStiffnessFactor: 1.25,
    baselineCabinNoiseDba: 69.5,
    defaultSpeedKmh: 90,
    driverState: 'MILD_DROWSINESS',
    violationType: 'APPROACH_SPEEDING',
  },
  {
    id: 'VP-RS-06',
    plate: '00-YP-606',
    model: 'BMW 530i BDYP (State Traffic Police Interceptor)',
    tireType: 'LOW_PROFILE_SPORT',
    suspensionStiffnessFactor: 1.3,
    baselineCabinNoiseDba: 64.0,
    defaultSpeedKmh: 120,
    driverState: 'ALERT_NORMAL',
    violationType: 'NONE',
  },
];

export const MOCK_RUMBLE_CHECKLIST_ITEMS: RumbleChecklistItem[] = [
  {
    id: 'RCL-01',
    titleAz: 'EN 1436 II Tip Quruluşlu Nişanlanma və Toxunma (Taktil) Rejimi',
    titleEn: 'EN 1436 Type II Structured Marking & Tactile Alert Compliance',
    descriptionAz:
      'Yol nişanlanması xətlərinin qaranlıqda və yağışlı hava şəraitində retrorefleksiyası və təkər toxunuşunda qabarıq taktil xəbərdarlıq yaratması təsdiqlənir.',
    descriptionEn:
      'Road marking retroreflectivity under darkness/rain and tactile alert ribs upon tire traversal are verified.',
    standardRef: 'EN 1436 Clause 5.2 / AZS 410',
    category: 'ACOUSTIC_TACTILE',
    isMandatory: true,
  },
  {
    id: 'RCL-02',
    titleAz: 'FHWA T 5040.39 Frezlənmə Həndəsi Ölçüləri və Dərinlik Toleransı',
    titleEn: 'FHWA T 5040.39 Milling Geometric Dimensions & Depth Tolerances',
    descriptionAz:
      'Frezlənmə dərinliyi 10-13 mm, eni 350-400 mm, addımı (pitch) 300 mm ± 10 mm aralığında dəqiq AAYDA rotorlu frez maşınları ilə icra olunur.',
    descriptionEn:
      'Milling depth 10-13 mm, width 350-400 mm, pitch 300 mm ± 10 mm executed precisely with AAYDA cold milling machinery.',
    standardRef: 'FHWA T 5040.39 Section 4',
    category: 'MILLING_GEOMETRY',
    isMandatory: true,
  },
  {
    id: 'RCL-03',
    titleAz: 'Minimum Akustik Səs Artımı Həddi (ΔdBA ≥ 6.0 dBA)',
    titleEn: 'Minimum Cabin Acoustic Sound Elevation (ΔdBA ≥ 6.0 dBA)',
    descriptionAz:
      'Akustik izolyasiyalı müasir avtomobillərdə belə sürücünü yuxudan oyatmaq üçün təkər təmasındakı daxili səs artımı fon səsindən ən azı 6-12 dBA yüksək olmalıdır.',
    descriptionEn:
      'To alert drowsy drivers even in sound-isolated vehicles, cabin sound elevation must be at least 6-12 dBA above ambient noise.',
    standardRef: 'ISO 10844 / FHWA Sound Advisory',
    category: 'ACOUSTIC_TACTILE',
    isMandatory: true,
  },
  {
    id: 'RCL-04',
    titleAz: 'Sükan Mexanizmində Taktil Titrəyiş Təcili (avib ≥ 1.0 m/s²)',
    titleEn: 'Steering Wheel Tactile Vibration Acceleration (avib ≥ 1.0 m/s²)',
    descriptionAz:
      'Sürücünün əlləri vasitəsilə hiss ediləcək titrəyiş təcili sükan çarxında 1.0 - 2.5 m/s² arasında təmin edilərək ani oyanmanı stimullaşdırır.',
    descriptionEn:
      'Vibration acceleration felt through driver hands on the steering wheel must reach 1.0 - 2.5 m/s² to trigger immediate sensory awakening.',
    standardRef: 'ISO 2631-1 / EN 1436',
    category: 'ACOUSTIC_TACTILE',
    isMandatory: true,
  },
  {
    id: 'RCL-05',
    titleAz: 'Velosiped və İkitəkərli Vasitələr üçün Qanuni Boşluqlar (Gap Pattern)',
    titleEn: 'Statutory Bicycle & Two-Wheeler Gap Patterns (3.0 - 3.6m Cycles)',
    descriptionAz:
      'Çiyin zolağında hər 15-18 metrdən bir 3.0-3.6 metr fasiləsiz düz asfalt boşluğu buraxılır ki, velosipedçilər zolaqlar arası sərbəst manevr edə bilsin.',
    descriptionEn:
      'A 3.0-3.6 meter uninterrupted gap is left every 15-18 meters on shoulders allowing cyclists and two-wheelers to maneuver safely.',
    standardRef: 'AASHTO Bike Guide / AAYDA Standard',
    category: 'ROAD_SAFETY',
    isMandatory: true,
  },
  {
    id: 'RCL-06',
    titleAz: 'Qar Təmizləyən Texnikanın Kotanlarına Qarşı Dayanıqlıq (Recessed Profile)',
    titleEn: 'Winter Snowplow Blade Durability (Sub-Surface Recessed Milling)',
    descriptionAz:
      'Zolaqlar asfalt səthindən aşağı frezləndiyi üçün qışda AAYDA qar kürəyən maşınlarının polad bıçaqları tərəfindən qırılmır və zədələnmir.',
    descriptionEn:
      'Because milled indentations are recessed beneath road grade, steel snowplow cutting edges pass over without shear damage.',
    standardRef: 'PIARC Winter Maintenance Manual',
    category: 'MILLING_GEOMETRY',
    isMandatory: true,
  },
  {
    id: 'RCL-07',
    titleAz: 'Asfalt Örtüyünün Qalınlığı və Struktur Yoxlanışı (≥ 40 mm Aşınma Qatı)',
    titleEn: 'Pavement Thickness & Structural Verification (≥ 40 mm Wearing Course)',
    descriptionAz:
      'Frezlənmə aparılmazdan əvvəl üst aşınma qatının (SMA) qalınlığının ən azı 40 mm olması və çatlama riskinin olmaması georadarla təsdiqlənir.',
    descriptionEn:
      'Before milling, wearing course (SMA) thickness must be verified at ≥ 40 mm with ground penetrating radar to avoid delamination.',
    standardRef: 'AAYDA Magistral Yol İnşaatı Təlimatı',
    category: 'MILLING_GEOMETRY',
    isMandatory: true,
  },
  {
    id: 'RCL-08',
    titleAz: 'Su Yığılmasının və Hidroplanlaşmanın Qarşısının Alınması (Drenaj Meyli)',
    titleEn: 'Prevention of Water Ponding & Hydroplaning (Cross-Slope Drainage)',
    descriptionAz:
      'Frezlənmiş çalaların daxilində su və buz təbəqəsi toplanmaması üçün eninə drenaj meyli (≥ 2.0%) və kənar sızma kanalları təmin edilir.',
    descriptionEn:
      'To prevent water ponding and ice accretion inside milled cavities, transverse roadway cross-slope (≥ 2.0%) and drainage escape are maintained.',
    standardRef: 'AZS 342 / EN 12697-36',
    category: 'ROAD_SAFETY',
    isMandatory: true,
  },
  {
    id: 'RCL-09',
    titleAz: 'Sinusoidal Frezlənmə ilə Yaşayış Ərazilərində Səs-Küyün İdarəsi',
    titleEn: 'Sinusoidal Mumble Strips for Noise Mitigation Near Settlements',
    descriptionAz:
      'Yaşayış məntəqələrinə yaxın məsafələrdə (≤ 500 m) xarici ətraf səs-küyünü 6-8 dBA azaldan, lakin kabin daxilində eyni vibrasiyanı verən sinusoidal frez tətbiq olunur.',
    descriptionEn:
      'Near residential areas (≤ 500 m), sinusoidal mumble strips are used to reduce external wayside noise by 6-8 dBA while maintaining cabin tactile stimulus.',
    standardRef: 'FHWA Low-Noise Rumbles / EN ISO 11819',
    category: 'ACOUSTIC_TACTILE',
    isMandatory: true,
  },
  {
    id: 'RCL-10',
    titleAz: 'AAYDA & BDYP Vahid Elektron Qeydiyyat və SİMA Rəqəmsal Arxivi',
    titleEn: 'Unified Electronic Registry & SİMA Digital Signature Integration',
    descriptionAz:
      'Bütün magistral səs-küy zolaqlarının coğrafi koordinatları, frezlənmə dərinlikləri və texniki aktları SİMA rəqəmsal imzası ilə mərkəzi bazada qeydə alınır.',
    descriptionEn:
      'All highway rumble strip GIS coordinates, milling depths, and inspection protocols are certified with SİMA digital signature in the central database.',
    standardRef: 'AR Rəqəmsal İnkişaf və Nəqliyyat Nazirliyi Standartı',
    category: 'ROAD_SAFETY',
    isMandatory: true,
  },
];

export const MOCK_RUMBLE_EXAM_QUESTIONS: RumbleExamQuestion[] = [
  {
    id: 'REQ-01',
    questionAz:
      'Magistral yollarda frezlənmiş çiyin səs-küy zolaqlarının (Shoulder Rumble Strips) əsas təhlükəsizlik funksiyası nədir?',
    questionEn: 'What is the primary road safety function of milled shoulder rumble strips on highways?',
    optionsAz: [
      'Avtomobilin yanacaq sərfiyyatını azaltmaq',
      'Yuxulayan və ya diqqəti yayınan sürücünü vibrasiya və səslə xəbərdar edərək yoldan kənara çıxma (ROR) qəzalarının qarşısını almaq',
      'Yol kənarında yağış sularını buxarlandırmaq',
      'Yalnız velosipedçilərin hərəkət sürətini məhdudlaşdırmaq',
    ],
    optionsEn: [
      'To reduce vehicle fuel consumption',
      'To alert drowsy or distracted drivers via vibration and acoustic rumble, preventing run-off-road (ROR) crashes',
      'To evaporate rainwater at road edges',
      'Exclusively to limit bicyclist travel speed',
    ],
    correctIndex: 1,
    explanationAz:
      'Səs-küy zolaqları təkərlər xətti tapdaladıqda güclü taktil vibrasiya və kabin səs artımı yaradaraq yoldan çıxma qəzalarını 50-65% azaldır.',
    explanationEn:
      'Rumble strips generate strong tactile vibration and cabin sound elevation when tires traverse the strip, reducing run-off-road crashes by 50-65%.',
    legalCitation: 'AAYDA Magistral Yol Təhlükəsizliyi Qaydaları & FHWA T 5040.39',
  },
  {
    id: 'REQ-02',
    questionAz:
      'FHWA T 5040.39 və AAYDA standartlarına əsasən optimal frezlənmə dərinliyi hansı aralıqda olmalıdır?',
    questionEn: 'According to FHWA T 5040.39 and AAYDA standards, what is the optimal milling depth range?',
    optionsAz: ['2 - 4 mm', '5 - 7 mm', '10 - 13 mm', '25 - 35 mm'],
    optionsEn: ['2 - 4 mm', '5 - 7 mm', '10 - 13 mm', '25 - 35 mm'],
    correctIndex: 2,
    explanationAz:
      '10-13 mm dərinlik (3/8 - 1/2 düym) sürücüyə zəruri vibrasiyanı təmin etməklə yanaşı, avtomobilin asqı sistemini zədələməyən və qar kotanına mane olmayan ideal ölçüdür.',
    explanationEn:
      'A depth of 10-13 mm (3/8 to 1/2 inch) delivers necessary sensory alert without damaging vehicle suspension or impeding snowplow blades.',
    legalCitation: 'FHWA Technical Advisory T 5040.39 Section 4.1',
  },
  {
    id: 'REQ-03',
    questionAz:
      'Azərbaycan Respublikası İnzibati Xətalar Məcəlləsinin 327.4-cü maddəsinə əsasən, mərkəzi səs-küy zolağını və bütöv 1.1 / 1.3 xəttini tapdalayaraq ötmə əməliyyatı aparan sürücüyə hansı cəza tətbiq edilir?',
    questionEn:
      'Under Article 327.4 of the Azerbaijan Code of Administrative Offences, what penalty applies for crossing a centerline rumble strip and continuous 1.1/1.3 line into oncoming traffic?',
    optionsAz: [
      'Yalnız xəbərdarlıq',
      '40 AZN cərimə, bal verilmir',
      '100 AZN məbləğində cərimə və 4 cərimə balı',
      'Sürücülük hüququndan 2 il müddətinə məhrumetmə',
    ],
    optionsEn: [
      'Warning only',
      '40 AZN fine, 0 penalty points',
      '100 AZN fine and 4 penalty points',
      '2 years driver license revocation',
    ],
    correctIndex: 2,
    explanationAz:
      'İXM Maddə 327.4-ə görə, qarşıdan gələn nəqliyyatın hərəkət zolağına çıxmaqla ötmə və ya manevr etmə qaydalarının pozulması 100 manat cərimə və 4 cərimə balı ilə cəzalandırılır.',
    explanationEn:
      'Under Article 327.4 of the Code of Administrative Offences, overtaking by crossing into the oncoming traffic lane incurs a 100 AZN fine and 4 penalty points.',
    legalCitation: 'AR İnzibati Xətalar Məcəlləsi Maddə 327.4',
  },
  {
    id: 'REQ-04',
    questionAz:
      'Səs-küy zolağının yaratdığı akustik xəbərdarlıq səviyyəsi (ΔdBA) avtomobil salonunda baza fon səsindən ən azı neçə desibel yüksək olmalıdır?',
    questionEn:
      'What minimum acoustic sound elevation (ΔdBA) above ambient cabin noise must a rumble strip provide to ensure effectiveness?',
    optionsAz: ['≥ 1.0 dBA', '≥ 6.0 dBA', '≥ 25.0 dBA', '≥ 40.0 dBA'],
    optionsEn: ['≥ 1.0 dBA', '≥ 6.0 dBA', '≥ 25.0 dBA', '≥ 40.0 dBA'],
    correctIndex: 1,
    explanationAz:
      'Beynəlxalq tədqiqatlara görə, daxili salon səs təzyiqinin ən azı 6-12 dBA artması yuxulu və ya diqqətsiz sürücünün təcili reaksiyasını təmin etmək üçün tələb olunan minimal həddir.',
    explanationEn:
      'According to international studies, a sound pressure rise of at least 6-12 dBA is the threshold required to provoke an immediate sensory reaction in a drowsy driver.',
    legalCitation: 'ISO 10844 / FHWA Roadway Safety Research',
  },
  {
    id: 'REQ-05',
    questionAz:
      'Çiyin səs-küy zolaqlarında velosiped və ikitəkərli nəqliyyat vasitələri üçün qanuni boşluq sxemi (Bicycle Gap Pattern) hansı parametrlərdə olmalıdır?',
    questionEn:
      'What are the statutory parameters for bicycle gap patterns on shoulder rumble strips?',
    optionsAz: [
      'Heç bir boşluq buraxılmır, bütöv frezlənməlidir',
      'Hər 15-18 metrdən bir 3.0 - 3.6 metr fasiləsiz hamar asfalt boşluğu buraxılmalıdır',
      'Hər 100 metrdən bir 50 metr boşluq',
      'Yalnız qış aylarında boşluq açılır',
    ],
    optionsEn: [
      'No gaps allowed; it must be completely continuous',
      'A 3.0 to 3.6 meter smooth asphalt gap must be provided every 15-18 meters',
      'A 50 meter gap every 100 meters',
      'Gaps are only provided during winter months',
    ],
    correctIndex: 1,
    explanationAz:
      '3.0-3.6 metrlik dövri boşluqlar velosipedçilərə və motosikletçilərə titrəyiş zolağına düşmədən yol çiyini ilə hərəkət zolağı arasında təhlükəsiz keçid imkanı yaradır.',
    explanationEn:
      'Periodic gaps of 3.0-3.6 meters allow bicyclists and motorcyclists to safely cross between the paved shoulder and the travel lane without losing control.',
    legalCitation: 'AASHTO Bike Guide & FHWA T 5040.39 Clause 5.3',
  },
  {
    id: 'REQ-06',
    questionAz:
      'Qış aylarında qar təmizləyən texnikanın (qar kotanlarının) bıçaqları tərəfindən zədələnməmək üçün hansı növ səs-küy zolağı ən yüksək dayanıqlığa malikdir?',
    questionEn:
      'Which type of rumble strip exhibits the highest durability against winter snowplow cutting edges?',
    optionsAz: [
      'Asfalt səthindən yuxarı qabarıq quraşdırılmış termoplastik zolaqlar',
      'Asfalt səthindən aşağı frezlənmiş (Milled Recessed) zolaqlar',
      'Yol üzərinə yapışdırılmış rezin lövhələr',
      'Boya ilə çəkilmiş standart 1.1 xətti',
    ],
    optionsEn: [
      'Raised thermoplastic ribs protruding above pavement grade',
      'Sub-surface milled recessed indentations',
      'Glued rubber pads on roadway surface',
      'Standard paint line marking 1.1',
    ],
    correctIndex: 1,
    explanationAz:
      'Frezlənmiş zolaqlar asfalt səthinin içinə batıq şəkildə oyulduğu üçün qar təmizləyən maşınların polad bıçaqları onların üzərindən sərbəst keçir və zolaqları qopara bilmir.',
    explanationEn:
      'Because milled rumble strips are recessed below the roadway surface, snowplow steel blades slide smoothly across without shearing or damaging the indentations.',
    legalCitation: 'PIARC Winter Service Manual / AAYDA Standartı',
  },
  {
    id: 'REQ-07',
    questionAz:
      'Yaşayış məntəqələri yaxınlığında ətraf mühitin səs-küy çirklənməsini azaltmaq üçün hansı frezlənmə növü tətbiq olunur?',
    questionEn:
      'Which milling design pattern is utilized near residential communities to minimize external wayside noise pollution?',
    optionsAz: [
      'Düzbucaqlı dərin frezlənmə',
      'Sinusoidal frezlənmə ("mumble strips")',
      'Çınqıl səpilməsi',
      'Polad lövhələrin bərkidilməsi',
    ],
    optionsEn: [
      'Rectangular deep plunge milling',
      'Sinusoidal milling ("mumble strips")',
      'Gravel scattering',
      'Steel plate bolting',
    ],
    correctIndex: 1,
    explanationAz:
      'Sinusoidal profil xarici ətraf səs-küyünü 6-8 dBA azaldır, lakin təkər keçidində avtomobil kabinəsi daxilində eyni dərəcədə güclü oyanma taktil təcili yaradır.',
    explanationEn:
      'Sinusoidal profiles reduce external wayside sound emissions by 6-8 dBA while delivering an equally sharp tactile alerting stimulus inside the passenger cabin.',
    legalCitation: 'EN ISO 11819 Acoustic Characterization of Road Surfaces',
  },
  {
    id: 'REQ-08',
    questionAz:
      'Avtomobil 90 km/saat sürətlə (25 m/s) hərəkət edərkən 300 mm addımlı (0.3 m) səs-küy zolağına daxil olduqda yaranan akustik həyəcanlama tezliyi (f) nə qədərdir?',
    questionEn:
      'What is the excitation frequency (f) generated when a vehicle travels at 90 km/h (25 m/s) over rumble strips with 300 mm (0.3 m) spacing?',
    optionsAz: ['12.5 Hz', '45.0 Hz', '83.3 Hz', '250.0 Hz'],
    optionsEn: ['12.5 Hz', '45.0 Hz', '83.3 Hz', '250.0 Hz'],
    correctIndex: 2,
    explanationAz:
      'f = v / p düsturuna əsasən: f = 25 m/s / 0.3 m = 83.3 Hz. Bu aşağı tezlikli akustik rezonans qulaq pərdəsinə və sükan vasitəsilə bədənə aydın zərbə dalğası ötürür.',
    explanationEn:
      'Using the formula f = v / p: f = 25 m/s / 0.3 m = 83.3 Hz. This low-frequency resonant drumming effectively penetrates vehicle insulation to alert the driver.',
    legalCitation: 'Acoustic Road Physics & EN 1436 Testing Protocols',
  },
  {
    id: 'REQ-09',
    questionAz:
      'Azərbaycan Respublikası İnzibati Xətalar Məcəlləsinin 38-ci maddəsinə əsasən, səs-küy zolaqları pozuntusu üzrə tətbiq edilən cərimə 30 gün ərzində ödənildikdə hansı güzəşt hüququ yaranır?',
    questionEn:
      'Under Article 38 of the Code of Administrative Offences, what discount applies if a traffic fine is settled within 30 days?',
    optionsAz: ['10% güzəşt', '25% güzəşt', '50% məbləğində qanuni endirim', 'Güzəşt tətbiq edilmir'],
    optionsEn: ['10% discount', '25% discount', '50% statutory prompt discount', 'No discount applies'],
    correctIndex: 2,
    explanationAz:
      'İXM Maddə 38-ə əsasən, elektron qərarın rəsmi qüvvəyə mindiyi gündən 30 gün ərzində cərimə ödənildikdə məbləğin 50 faizi ödənilir.',
    explanationEn:
      'Under Article 38 of the Code of Administrative Offences, paying the penalty within 30 days of notification grants a 50% statutory reduction.',
    legalCitation: 'AR İnzibati Xətalar Məcəlləsi Maddə 38',
  },
  {
    id: 'REQ-10',
    questionAz:
      'Yol ayrıclarında, dairəvi hərəkət qovşaqlarında və təhlükəli enişlərdə quraşdırılan eninə (transverse) səs-küy zolaqlarının təyinatı nədir?',
    questionEn:
      'What is the purpose of transverse rumble strips installed before intersections, roundabouts, and hazardous descents?',
    optionsAz: [
      'Qəza baş verəndə maşını dayandırmaq',
      'Yanaşan sürücülərə qabaqcadan təhlükə barədə taktil-akustik xəbərdarlıq vermək və sürəti tədricən azaltmağa məcbur etmək',
      'Yolda hərəkət zolaqlarının sayını artırmaq',
      'Yalnız yük maşınlarını qeydiyyata almaq',
    ],
    optionsEn: [
      'To catch and arrest vehicles during an accident',
      'To deliver advance auditory-tactile alerts warning drivers of approaching hazards and prompting gradual deceleration',
      'To increase the number of highway travel lanes',
      'Exclusively to log heavy commercial trucks',
    ],
    correctIndex: 1,
    explanationAz:
      'Eninə zolaqlar hərəkət istiqamətinə perpendikulyar yerləşdirilərək qarşıda dayanma, kəskin döngə və ya ödəmə məntəqəsi barədə sürücüləri əvvəlcədən ayıq salır.',
    explanationEn:
      'Transverse rumble strips are placed perpendicular to traffic flow to warn inattentive drivers of upcoming stop intersections, toll plazas, or sharp curves.',
    legalCitation: 'AAYDA Texniki Təhlükəsizlik Təlimatı & AZS 410',
  },
];

export const MOCK_RUMBLE_CERTIFICATES: RumbleCertificate[] = [
  {
    certificateId: 'RUMBLE-SAFE-AZ-2026-M1901',
    issueDate: '2026-10-15',
    expiryDate: '2027-10-15',
    vehiclePlate: '99-RS-101',
    corridorCode: 'M1-KM45',
    corridorName: 'M-1 Baku – Guba – Russia Border (Km 45+200)',
    excitationFrequencyHz: 87.9,
    measuredDeltaDba: 11.4,
    vibrationAccMs2: 1.85,
    simaDigitalUid: 'SIMA-RUMBLE-A94F2B01',
    verificationPin: '482910',
    sha256Checksum: '8f73b194a205ce418c99de19842a59f13e74b281',
    authorizedInspector: 'AAYDA Magistral Yollar Texniki Təhlükəsizlik Müfəttişliyi #14',
    status: 'ACTIVE',
  },
  {
    certificateId: 'RUMBLE-SAFE-AZ-2026-M2902',
    issueDate: '2026-10-28',
    expiryDate: '2027-10-28',
    vehiclePlate: '10-RS-202',
    corridorCode: 'M2-KM184',
    corridorName: 'M-2 Baku – Ganja – Georgia Border (Km 184+600)',
    excitationFrequencyHz: 78.7,
    measuredDeltaDba: 14.8,
    vibrationAccMs2: 2.45,
    simaDigitalUid: 'SIMA-RUMBLE-B77E3C99',
    verificationPin: '930184',
    sha256Checksum: '419ca62df18847bc09139a0efba117906d2891ec',
    authorizedInspector: 'BDYP Xüsusi Hərəkət Təhlükəsizliyi Şöbəsi #07',
    status: 'ACTIVE',
  },
  {
    certificateId: 'RUMBLE-SAFE-AZ-2026-ZY903',
    issueDate: '2026-11-01',
    expiryDate: '2027-11-01',
    vehiclePlate: '90-AZ-404',
    corridorCode: 'ZY-KM54',
    corridorName: 'Victory Road (Fuzuli – Shusha Km 54+100)',
    excitationFrequencyHz: 101.8,
    measuredDeltaDba: 9.6,
    vibrationAccMs2: 1.42,
    simaDigitalUid: 'SIMA-RUMBLE-C12D8840',
    verificationPin: '284719',
    sha256Checksum: 'c52084bfe94d812ca493f0b83c74901a5e128dfa',
    authorizedInspector: 'AAYDA Qarabağ Magistral Yollar Regional İdarəsi #01',
    status: 'ACTIVE',
  },
];
