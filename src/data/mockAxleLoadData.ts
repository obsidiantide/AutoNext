/**
 * Mock Data for Heavy Haulage Axle Load & Automated Weigh-in-Motion (WIM),
 * Bridge Dynamic Structural Telemetry & Official WIM-AZ-2026 Axle Load Registry
 */

import { VehicleConfigType } from '../utils/axleLoadCompliance';

export interface WimStation {
  id: string;
  code: string;
  nameAz: string;
  nameEn: string;
  highway: string;
  kilometerMark: number;
  locationAz: string;
  sensorTechnologyAz: string;
  accuracyClass: string;
  maxOperatingSpeedKmh: number;
  anprCameraType: string;
  activeLanes: number;
  dailyTruckFlow: number;
  overloadDetectionRatePercent: number;
  bridgeNameAz: string;
  bridgeSpanMeters: number;
  status: 'ONLINE_ACTIVE' | 'MAINTENANCE_CALIBRATION';
  coordinates: { lat: number; lng: number };
}

export const MOCK_WIM_STATIONS: WimStation[] = [
  {
    id: 'WIM-01',
    code: 'AZ-WIM-M1-KM54',
    nameAz: 'M1 Bakı-Quba-Rusiya Sərhədi (Giləzi WIM Postu)',
    nameEn: 'M1 Baku-Quba-Russia Border (Gilazi WIM Station)',
    highway: 'M1',
    kilometerMark: 54,
    locationAz: 'Xızı rayonu, Giləzi qəsəbəsi yaxınlığı',
    sensorTechnologyAz: 'Kvars Piezoelektrik LineA sensorları + 3D Lazer Qabarit Skaneri',
    accuracyClass: 'OIML R134 Class 5 (±3% dinamik dəqiqlik)',
    maxOperatingSpeedKmh: 120,
    anprCameraType: 'Hikvision / Vitronic Dual-spectrum 4K IR ANPR',
    activeLanes: 4,
    dailyTruckFlow: 3840,
    overloadDetectionRatePercent: 4.8,
    bridgeNameAz: 'Giləzi dəmiryol üstü estakadası (Aşırım 38m)',
    bridgeSpanMeters: 38,
    status: 'ONLINE_ACTIVE',
    coordinates: { lat: 40.8524, lng: 49.3117 },
  },
  {
    id: 'WIM-02',
    code: 'AZ-WIM-M2-KM67',
    nameAz: 'M2 Bakı-Ələt-Qazax (Hacıqabul Nəqliyyat Düyünü)',
    nameEn: 'M2 Baku-Alat-Gazakh (Hajigabul Interchange WIM)',
    highway: 'M2',
    kilometerMark: 67,
    locationAz: 'Hacıqabul rayonu, M2/M6 yol ayrıcında',
    sensorTechnologyAz: 'İkili Kvars sensor zolağı + İnduktiv maqnit dövrələri',
    accuracyClass: 'OIML R134 Class 5 (±2.5% dəqiqlik)',
    maxOperatingSpeedKmh: 110,
    anprCameraType: 'Siemens Sicore ANPR OCR + Yan Profil Kamera',
    activeLanes: 4,
    dailyTruckFlow: 5420,
    overloadDetectionRatePercent: 6.2,
    bridgeNameAz: 'Pirsaat çayı magistral körpüsü (Aşırım 52m)',
    bridgeSpanMeters: 52,
    status: 'ONLINE_ACTIVE',
    coordinates: { lat: 40.0438, lng: 48.9242 },
  },
  {
    id: 'WIM-03',
    code: 'AZ-WIM-M2-KM198',
    nameAz: 'M2 Kürdəmir-Yevlax (Kür Körpüsü Yanaşma WIM)',
    nameEn: 'M2 Kurdamir-Yevlakh (Kura River Bridge Approach WIM)',
    highway: 'M2',
    kilometerMark: 198,
    locationAz: 'Yevlax rayonu, Kür çayı körpüsünə 1 km qalmış',
    sensorTechnologyAz: 'Çoxsensorlu Piezo matrisi + Körpü Dinamik Əyilmə Sensoru',
    accuracyClass: 'OIML R134 Class A (±2% dəqiqlik)',
    maxOperatingSpeedKmh: 100,
    anprCameraType: 'FLIR TrafiBot 360° Panorama & ANPR',
    activeLanes: 4,
    dailyTruckFlow: 4680,
    overloadDetectionRatePercent: 5.4,
    bridgeNameAz: 'Kür çayı üzərində asma konstruksiyalı körpü (Aşırım 64m)',
    bridgeSpanMeters: 64,
    status: 'ONLINE_ACTIVE',
    coordinates: { lat: 40.6183, lng: 47.1511 },
  },
  {
    id: 'WIM-04',
    code: 'AZ-WIM-M3-KM112',
    nameAz: 'M3 Ələt-Astara-İran Sərhədi (Salyan WIM Keçidi)',
    nameEn: 'M3 Alat-Astara-Iran Border (Salyan WIM Gateway)',
    highway: 'M3',
    kilometerMark: 112,
    locationAz: 'Salyan rayonu, Cənub-Qərb beynəlxalq tranzit dəhlizi',
    sensorTechnologyAz: 'Əyilmə lövhəli (Bending plate) dinamik tərəzi modulu',
    accuracyClass: 'OIML R134 Class 10 (±4% dəqiqlik)',
    maxOperatingSpeedKmh: 110,
    anprCameraType: 'Dahua Smart ITS Ultra-HD ANPR kamera',
    activeLanes: 4,
    dailyTruckFlow: 3260,
    overloadDetectionRatePercent: 7.1,
    bridgeNameAz: 'Kür-Araz subasma estakadası (Aşırım 44m)',
    bridgeSpanMeters: 44,
    status: 'ONLINE_ACTIVE',
    coordinates: { lat: 39.5962, lng: 48.9833 },
  },
  {
    id: 'WIM-05',
    code: 'AZ-WIM-M4-KM82',
    nameAz: 'M4 Bakı-Şamaxı-Yevlax (Muğanlı Dağ Aşırımı Girişi)',
    nameEn: 'M4 Baku-Shamakhi-Yevlakh (Muganli Mountain Pass Entry)',
    highway: 'M4',
    kilometerMark: 82,
    locationAz: 'Şamaxı şəhər girişi, dağlıq relyef meyillik sensoru ilə',
    sensorTechnologyAz: 'Dinamik Tenzo-ölçmə yük hüceyrələri + Maili yamac kompensasiyası',
    accuracyClass: 'OIML R134 Class 5 (±3% dəqiqlik)',
    maxOperatingSpeedKmh: 90,
    anprCameraType: 'AutoVu SharpX Avtomatik Qeydiyyat Sistemi',
    activeLanes: 2,
    dailyTruckFlow: 2150,
    overloadDetectionRatePercent: 8.5,
    bridgeNameAz: 'Ağsuçay dərin dərə viaduku (Aşırım 75m)',
    bridgeSpanMeters: 75,
    status: 'ONLINE_ACTIVE',
    coordinates: { lat: 40.6315, lng: 48.6414 },
  },
  {
    id: 'WIM-06',
    code: 'AZ-WIM-M2-KM364',
    nameAz: 'M2 Gəncə Dairəvi Magistralı (Şəmkir Çıxışı WIM)',
    nameEn: 'M2 Ganja Bypass Highway (Shamkir Exit WIM Station)',
    highway: 'M2',
    kilometerMark: 364,
    locationAz: 'Gəncə şəhər ətrafı, Qərb sənaye dəhlizi',
    sensorTechnologyAz: 'Kvars LineA dinamik tərəzi + Lazer ox aralığı detektoru',
    accuracyClass: 'OIML R134 Class 5 (±2.8% dəqiqlik)',
    maxOperatingSpeedKmh: 110,
    anprCameraType: 'Kapsch TrafficCom ANPR & DSRC Sensor',
    activeLanes: 4,
    dailyTruckFlow: 4120,
    overloadDetectionRatePercent: 3.9,
    bridgeNameAz: 'Qoşqarçay dəmir-beton körpüsü (Aşırım 42m)',
    bridgeSpanMeters: 42,
    status: 'ONLINE_ACTIVE',
    coordinates: { lat: 40.7126, lng: 46.2941 },
  },
  {
    id: 'WIM-07',
    code: 'AZ-WIM-ZY-KM42',
    nameAz: 'Zəfər Yolu & Füzuli-Şuşa (Xocavənd Düyünü Ağıllı WIM)',
    nameEn: 'Victory Road & Fuzuli-Shusha (Khojavend Smart WIM Post)',
    highway: 'ZY-1',
    kilometerMark: 42,
    locationAz: 'Qarabağ İqtisadi Rayonu, Xocavənd yol ayrıcı',
    sensorTechnologyAz: 'Ağıllı Günəş panelli Piezo WIM + Körpü Sağlamlıq SHM sensoru',
    accuracyClass: 'OIML R134 Class 5 (±3% dəqiqlik)',
    maxOperatingSpeedKmh: 90,
    anprCameraType: 'Solar Powered AI ANPR + İntellektual Şlüz',
    activeLanes: 2,
    dailyTruckFlow: 1450,
    overloadDetectionRatePercent: 2.1,
    bridgeNameAz: 'Köndələnçay tağlı estakadası (Aşırım 58m)',
    bridgeSpanMeters: 58,
    status: 'ONLINE_ACTIVE',
    coordinates: { lat: 39.7345, lng: 47.0182 },
  },
];

export interface HeavyHaulagePreset {
  id: string;
  nameAz: string;
  vehiclePlate: string;
  model: string;
  vehicleConfig: VehicleConfigType;
  axleWeights: number[];
  airSuspensionAxles: boolean[];
  transitDistanceKm: number;
  speedKmh: number;
  cargoDescriptionAz: string;
  isCompliant: boolean;
  notesAz: string;
}

export const MOCK_HEAVY_PRESETS: HeavyHaulagePreset[] = [
  {
    id: 'PRESET-01',
    nameAz: 'Mercedes-Benz Actros 1845 + Schmitz Tentli Yarımqoşqu',
    vehiclePlate: '99-ZZ-990',
    model: 'Actros 1845 LS 4x2 + Schmitz Cargobull 3-oxlu',
    vehicleConfig: 'ARTICULATED_5_AXLE',
    axleWeights: [7100, 10800, 7100, 7100, 7100], // Total: 39,200 kg (Limit: 40,000 kg)
    airSuspensionAxles: [false, true, true, true, true],
    transitDistanceKm: 180,
    speedKmh: 75,
    cargoDescriptionAz: 'Paletləşdirilmiş ərzaq və sənaye malları (Tranzit TIR)',
    isCompliant: true,
    notesAz: 'Tam qanuni parametr hədləri daxilindədir. Hər bir ox normativə uyğundur.',
  },
  {
    id: 'PRESET-02',
    nameAz: 'MAN TGX 26.540 + Özüboşaldan Qaya Yarımqoşqusu (Aşırı Yüklü)',
    vehiclePlate: '10-TX-404',
    model: 'MAN TGX 26.540 6x4 + Meiller Kipper 3-oxlu',
    vehicleConfig: 'ARTICULATED_5_AXLE',
    axleWeights: [7800, 12200, 8000, 7900, 7900], // Total: 43,800 kg (Limit: 40,000 kg) -> 3,800 kg excess
    airSuspensionAxles: [false, false, false, false, false],
    transitDistanceKm: 95,
    speedKmh: 60,
    cargoDescriptionAz: 'İnşaat qırma daşı və çınqıl (Karyer daşıması)',
    isCompliant: false,
    notesAz: 'Ümumi çəkidə 3,800 kq və aparıcı oxda 12.2 ton ilə normativ aşılmışdır (İXM 322.1 cərimə tətbiq olunur).',
  },
  {
    id: 'PRESET-03',
    nameAz: 'Scania R500 6x2 Qatar + 3-oxlu Qoşqu (Həcmli Yol Qatarı)',
    vehiclePlate: '77-WM-101',
    model: 'Scania R500 6x2 + Wielton 3-oxlu dönər qoşqu',
    vehicleConfig: 'ROAD_TRAIN_6_AXLE',
    axleWeights: [6800, 9500, 6200, 7000, 7000, 7000], // Total: 43,500 kg (Limit: 44,000 kg)
    airSuspensionAxles: [false, true, true, true, true, true],
    transitDistanceKm: 240,
    speedKmh: 80,
    cargoDescriptionAz: 'Kənd təsərrüfatı taxıl və taxıl məhsulları',
    isCompliant: true,
    notesAz: '6-oxlu avtoqatar normativinə (44 ton) və fərdi ox hədlərinə tam cavab verir.',
  },
  {
    id: 'PRESET-04',
    nameAz: 'Volvo FH16 750 + Goldhofer 4-oxlu Ağır Treyler (Xüsusi İcazəli)',
    vehiclePlate: '90-TK-555',
    model: 'Volvo FH16 750 8x4 + Goldhofer MPA-K 4-oxlu Lowbed',
    vehicleConfig: 'HEAVY_SPECIAL_PERMIT',
    axleWeights: [7500, 7500, 8500, 8500, 6500, 6500, 6500, 6500], // Total: 58,000 kg
    airSuspensionAxles: [false, false, true, true, true, true, true, true],
    transitDistanceKm: 140,
    speedKmh: 50,
    cargoDescriptionAz: 'Neft-qaz qazma rotoru və transformator (Bölünməz ağır yük)',
    isCompliant: true,
    notesAz: 'AYNA Xüsusi İcazəsi və eskort müşayiəti ilə təsdiqlənmiş qanuni marşrut.',
  },
  {
    id: 'PRESET-05',
    nameAz: 'DAF XF 480 + Spitzer 2-oxlu Maye Sistern Yarımqoşqu',
    vehiclePlate: '99-DA-707',
    model: 'DAF XF 480 FT 4x2 + Spitzer Silo 2-oxlu',
    vehicleConfig: 'RIGID_4_AXLE',
    axleWeights: [6900, 10600, 9000, 9000], // Total: 35,500 kg
    airSuspensionAxles: [false, true, true, true],
    transitDistanceKm: 110,
    speedKmh: 70,
    cargoDescriptionAz: 'Quru sement xammalı və kimyəvi qatqı',
    isCompliant: true,
    notesAz: 'Ox bölgüsü balanslaşdırılmışdır və körpü dinamik parametrləri təhlükəsizdir.',
  },
  {
    id: 'PRESET-06',
    nameAz: 'KAMAZ-6520 6x4 Ağır Damper (Qoşa Arxalı Aşırı Yüklü)',
    vehiclePlate: '10-AX-888',
    model: 'KAMAZ-6520-43 6x4 İnşaat Özüboşaldanı',
    vehicleConfig: 'RIGID_3_AXLE',
    axleWeights: [6600, 10600, 10600], // Total: 27,800 kg (Limit: 26,000 kg, tandem 21.2t vs 18t limit)
    airSuspensionAxles: [false, false, false],
    transitDistanceKm: 65,
    speedKmh: 55,
    cargoDescriptionAz: 'Qum-çınqıl qarışığı və asfalt qırıntısı',
    isCompliant: false,
    notesAz: 'Arxa qoşa oxda 21.2 ton (icazə 18 ton) və ümumi kütlədə 1,800 kq aşma aşkar edilmişdir.',
  },
];

export interface AxleChecklistItem {
  id: string;
  categoryAz: string;
  titleAz: string;
  descriptionAz: string;
  legalReferenceAz: string;
  isCritical: boolean;
  isChecked: boolean;
}

export const MOCK_AXLE_CHECKLIST: AxleChecklistItem[] = [
  {
    id: 'CHK-01',
    categoryAz: 'Ox Yükü və Çəki İntizamı',
    titleAz: 'Tək İdarəedici və Aparıcı Ox Çəki Yoxlanışı',
    descriptionAz: 'Qabaq idarəedici oxun 10 ton, arxa aparıcı oxun 11.5 ton normativini aşmadığının yoxlanılması.',
    legalReferenceAz: 'Nazirlər Kabinetinin 104 nömrəli Qərarı, Əlavə 1',
    isCritical: true,
    isChecked: true,
  },
  {
    id: 'CHK-02',
    categoryAz: 'Ox Yükü və Çəki İntizamı',
    titleAz: 'Qoşa və Üçoxlu Araba Oxlararası Məsafə Uyğunluğu',
    descriptionAz: 'Qoşa oxların (1.3-1.8m) 18t (hava asqısı ilə 19t), üçoxlu arabanın 24t həddinə riayət olunması.',
    legalReferenceAz: 'Nazirlər Kabinetinin 104 nömrəli Qərarı, Əlavə 2',
    isCritical: true,
    isChecked: true,
  },
  {
    id: 'CHK-03',
    categoryAz: 'Qabarit Ölçüləri',
    titleAz: 'Avtonəqliyyat Vasitəsinin Hündürlük və En Ölçüləri',
    descriptionAz: 'Yükün və banın hündürlüyünün 4.00 metri, eninin 2.55 metri (izotermik 2.60m) aşmadığının ölçülməsi.',
    legalReferenceAz: '"Yol hərəkəti haqqında" AR Qanunu, Maddə 37',
    isCritical: true,
    isChecked: true,
  },
  {
    id: 'CHK-04',
    categoryAz: 'Asqı və Təkər Təzyiqi',
    titleAz: 'Pnevmatik Hava Asqısı Təzyiq Kalibrasiyası',
    descriptionAz: 'Hava balonu manometrlərinin və avtomatik səviyyə tənzimləyici ECAS klapanlarının sazlığı.',
    legalReferenceAz: 'SNiP 2.05.03-84 və İstehsalçı Texniki Təlimatı',
    isCritical: false,
    isChecked: true,
  },
  {
    id: 'CHK-05',
    categoryAz: 'Yük Bərkidilməsi',
    titleAz: 'Yükün Bərabər Paylanması və Sürüşməyə Qarşı Bağlanması',
    descriptionAz: 'Yükün ağırlıq mərkəzinin oxlar arasında simmetrik bölüşdürülməsi və sertifikatlı kəmərlərlə bərkidilməsi.',
    legalReferenceAz: 'EN 12195-1 Yük Bərkitmə Beynəlxalq Standartı',
    isCritical: true,
    isChecked: false,
  },
  {
    id: 'CHK-06',
    categoryAz: 'Sənədləşmə və İcazə',
    titleAz: 'Elektron Əmtəə-Nəqliyyat Qaiməsi (e-TTN) və Çəki Bəyannaməsi',
    descriptionAz: 'AYNA rəqəmsal sistemində qeydiyyatdan keçmiş elektron qaimə və daşıyıcı məlumatlarının mövcudluğu.',
    legalReferenceAz: 'AR Rəqəmsal İnkişaf və Nəqliyyat Nazirliyi e-TTN Qaydaları',
    isCritical: true,
    isChecked: true,
  },
  {
    id: 'CHK-07',
    categoryAz: 'Körpü Keçid Rejimi',
    titleAz: 'Körpü və Viaduklarda Sürət və Distansiya Məhdudiyyəti',
    descriptionAz: 'Körpü aşırımlarında dinamik vibrasiyanı azaltmaq üçün təyin edilmiş maksimal 60 km/saat sürətə əməl olunması.',
    legalReferenceAz: 'AAYDA Magistral Körpü İstismar Qaydaları',
    isCritical: false,
    isChecked: true,
  },
  {
    id: 'CHK-08',
    categoryAz: 'Dinamik WIM Şlüzü',
    titleAz: 'Dinamik Tərəzidən Tək Sıra ilə Keçid İntizamı',
    descriptionAz: 'WIM sensor zolağında manevr etmədən və kəskin tormozlama etmədən sabit sürətlə keçid edilməsi.',
    legalReferenceAz: 'OIML R134 Avtomatik Çəki Nəzarət Protokolu',
    isCritical: false,
    isChecked: true,
  },
  {
    id: 'CHK-09',
    categoryAz: 'İntellektual Nəzarət',
    titleAz: 'Dövlət Qeydiyyat Nişanının Təmizliyi və ANPR Oxunması',
    descriptionAz: 'Qabaq və arxa dövlət nömrə nişanlarının təmiz, infraqırmızı ANPR kameraları üçün maneəsiz olması.',
    legalReferenceAz: 'AR İnzibati Xətalar Məcəlləsi, Maddə 342.1',
    isCritical: true,
    isChecked: true,
  },
  {
    id: 'CHK-10',
    categoryAz: 'Xüsusi Rejim',
    titleAz: 'Ağır Bölünməz Yüklər üçün Xüsusi İcazə və İşıq-Siqnal Sistemi',
    descriptionAz: 'Normativdən artıq yüklərdə sarı yanıb-sönən mayak və AYNA razılaşdırılmış marşrut vərəqəsi.',
    legalReferenceAz: '"Avtomobil yolları haqqında" AR Qanunu, Maddə 24',
    isCritical: true,
    isChecked: false,
  },
];

export interface AxleExamQuestion {
  id: string;
  questionAz: string;
  optionsAz: string[];
  correctAnswerIndex: number;
  explanationAz: string;
  legalCitationAz: string;
}

export const MOCK_AXLE_EXAM_QUESTIONS: AxleExamQuestion[] = [
  {
    id: 'Q-01',
    questionAz: 'Nazirlər Kabinetinin 104 nömrəli Qərarına əsasən, 5-oxlu qoşqulu TIR (avtoqatar) üçün ümumi icazə verilən maksimal kütlə nə qədərdir?',
    optionsAz: [
      '38 ton',
      '40 ton',
      '44 ton',
      '48 ton',
    ],
    correctAnswerIndex: 1,
    explanationAz: 'Ümumi istifadədə olan avtomobil yollarında 2-oxlu dartıcı və 3-oxlu yarımqoşqudan ibarət 5-oxlu avtoqatar üçün standart icazə verilən ümumi çəki həddi 40 tondur.',
    legalCitationAz: 'AR Nazirlər Kabinetinin 7 iyul 2009-cu il tarixli 104 nömrəli Qərarı, Əlavə 1',
  },
  {
    id: 'Q-02',
    questionAz: 'Avtonəqliyyat vasitəsinin tək aparıcı oxu (qoşa təkərlərlə) üçün yol verilən maksimal ox yükü neçə tondur?',
    optionsAz: [
      '10.0 ton',
      '11.5 ton',
      '12.5 ton',
      '14.0 ton',
    ],
    correctAnswerIndex: 1,
    explanationAz: 'Qanunvericiliyə əsasən, qoşa təkərlərlə təchiz edilmiş tək aparıcı ox üçün maksimal yük normativi 11.5 tondur (idarəedici tək ox üçün isə 10 tondur).',
    legalCitationAz: 'AR Nazirlər Kabinetinin 104 nömrəli Qərarı, Cədvəl 1.1',
  },
  {
    id: 'Q-03',
    questionAz: 'Oxlararası məsafəsi 1.3 m - 1.8 m olan standart qoşa oxlarda pnevmatik hava asqısı olduqda maksimal normativ nə qədər artırılır?',
    optionsAz: [
      'Normativ dəyişmir (18 ton)',
      '1 ton artırılaraq 19 tona çatdırılır',
      '2 ton artırılaraq 20 tona çatdırılır',
      '3 ton artırılaraq 21 tona çatdırılır',
    ],
    correctAnswerIndex: 1,
    explanationAz: 'Pnevmatik (hava) asqısı yol örtüyünə düşən dinamik zərbə yükünü azaltdığı üçün qanunvericiliklə standart 18 tonluq hədd 1 ton artırılaraq 19 ton qəbul edilir.',
    legalCitationAz: 'Nazirlər Kabinetinin 104 nömrəli Qərarı və Avropa Standartı 96/53/EC uyğunlaşması',
  },
  {
    id: 'Q-04',
    questionAz: 'İnzibati Xətalar Məcəlləsinin 322.1-ci maddəsinə əsasən, çəki və ya ox parametrinin 5%-dən 15%-dək aşılmasına görə fiziki şəxslər nə qədər cərimə edilir?',
    optionsAz: [
      '200 AZN',
      '400 AZN',
      '600 AZN',
      '1000 AZN',
    ],
    correctAnswerIndex: 2,
    explanationAz: 'İXM Maddə 322.1-ə əsasən, icazə verilən qabarit, çəki və ox parametrlərini 5 faizdən 15 faizədək aşmaqla avtonəqliyyat vasitələrini idarə etməyə görə fiziki şəxslər 600 manat cərimə edilir.',
    legalCitationAz: 'Azərbaycan Respublikasının İnzibati Xətalar Məcəlləsi, Maddə 322.1',
  },
  {
    id: 'Q-05',
    questionAz: 'Avtonəqliyyat vasitəsinin çəkisi və ya ox yükü normativi 25%-dən çox aşdıqda hansı qanuni tədbir görülür?',
    optionsAz: [
      'Yalnız xəbərdarlıq edilir',
      '2000 manat cərimə tətbiq olunur və artıq yük boşaldılanadək hərəkət qadağan edilir',
      'Sürücülük hüququ dərhal 2 il müddətinə ləğv olunur',
      'Avtomobil dərhal dövlət nəfinə müsadirə edilir',
    ],
    correctAnswerIndex: 1,
    explanationAz: 'İXM 322.3-ə əsasən, 25%-dən çox aşmaya görə fiziki şəxs 2000 AZN cərimə olunur və normadan artıq yük boşaldılana qədər avtomobilin yol hərəkəti qadağan olunur.',
    legalCitationAz: 'AR İnzibati Xətalar Məcəlləsi, Maddə 322.3 və "Yol hərəkəti haqqında" Qanun, Maddə 85',
  },
  {
    id: 'Q-06',
    questionAz: 'Yol örtüyünə vurulan ziyanın hesablanmasında "Dördüncü Qüvvə Qanunu" (Fourth Power Law / ESAL) nəyi ifadə edir?',
    optionsAz: [
      'Yol örtüyünün qalınlığının dörd qat artırılmasını',
      'Ox yükünün artması ilə yol örtüyünə dəyən zərərin yükün 4-cü dərəcəsi ilə eksponensial artmasını',
      'Nəqliyyat vasitəsinin dörd təkərinin təzyiqini',
      'Körpü aşırımlarının dörd dayaq üzərində yerləşməsini',
    ],
    correctAnswerIndex: 1,
    explanationAz: 'AASHTO yol sınaqlarına əsasən, ox yükü məsələn 20% artdıqda yol örtüyünün aşınması və dağılması (1.2)^4 = 2.07 dəfə, yəni ikiqatdan çox artır.',
    legalCitationAz: 'AASHTO Road Test & Yol örtüyünə dəyən ziyanın hesablanması Metodikası',
  },
  {
    id: 'Q-07',
    questionAz: 'Körpü konstruksiyalarında icazə verilən maksimal dinamik əyilmə (deflection) normativ olaraq necə hesablanır?',
    optionsAz: [
      'Aşırım uzunluğu bölünsün 200 (L / 200)',
      'Aşırım uzunluğu bölünsün 500 (L / 500)',
      'Aşırım uzunluğu bölünsün 800 (L / 800)',
      'Aşırım uzunluğu bölünsün 1500 (L / 1500)',
    ],
    correctAnswerIndex: 2,
    explanationAz: 'Körpü tikinti normalarına (SNiP 2.05.03-84 və Eurocode EN 1991-2) əsasən, avtomobil körpülərində dinamik yük altında elastik əyilmə aşırımın 1/800 hissəsindən çox olmamalıdır.',
    legalCitationAz: 'SNiP 2.05.03-84 Körpülər və Borular, Bənd 1.42',
  },
  {
    id: 'Q-08',
    questionAz: 'Avtomobil yollarında hərəkət edən yük nəqliyyat vasitəsinin yüklə birlikdə icazə verilən maksimal hündürlüyü nə qədərdir?',
    optionsAz: [
      '3.80 metr',
      '4.00 metr',
      '4.20 metr',
      '4.50 metr',
    ],
    correctAnswerIndex: 1,
    explanationAz: 'Azərbaycan qanunvericiliyinə əsasən, ümumi istifadədə olan avtomobil yollarında hərəkət edən bütün avtonəqliyyat vasitələrinin maksimal hündürlüyü yol səthindən 4.00 metrdir.',
    legalCitationAz: '"Yol hərəkəti haqqında" AR Qanunu, Maddə 37 və NK 104 nömrəli Qərarı',
  },
  {
    id: 'Q-09',
    questionAz: 'Dinamik tərəzi (WIM - Weigh-in-Motion) sistemlərinin ənənəvi stasionar tərəzilərdən əsas üstünlüyü nədir?',
    optionsAz: [
      'Nəqliyyat vasitəsini saxlamadan (120 km/saatadək sürətdə) çəki və ox yükünü ölçməsi',
      'Tərəzidə heç bir sensor və ya kabelin olmaması',
      'Bütün cərimələri dərhal bank kartından silməsi',
      'Avtomobilin mühərrik nömrəsini dərhal dəyişdirməsi',
    ],
    correctAnswerIndex: 0,
    explanationAz: 'WIM texnologiyası yüksək sürətli kvars və piezo sensorlar vasitəsilə yük maşınlarını dayandırmadan, magistral hərəkət axınını kəsmədən avtomatik çəkir və ANPR ilə nömrəni oxuyur.',
    legalCitationAz: 'OIML R134 Avtomatik Hərəkətdə Çəkmə Beynəlxalq Standartı',
  },
  {
    id: 'Q-10',
    questionAz: 'Bölünməz ağır sənaye yükü daşıyan xüsusi avtoqatar ümumi çəki normativini aşdıqda daşımanı həyata keçirmək üçün nə tələb olunur?',
    optionsAz: [
      'Heç bir sənəd tələb olunmur, gecə hərəkət etmək kifayətdir',
      'AYNA və BDYP tərəfindən verilən Xüsusi İcazə və razılaşdırılmış təhlükəsiz marşrut vərəqəsi',
      'Yalnız gömrük bəyannaməsi',
      'Yanacaqdoldurma məntəqəsinin qəbzi',
    ],
    correctAnswerIndex: 1,
    explanationAz: 'İcazə verilən qabarit və çəki hədlərindən artıq olan bölünməz yüklərin daşınması AYNA ilə razılaşdırılmış xüsusi marşrut, yol kompensasiya rüsumunun ödənişi və xüsusi icazə əsasında aparılır.',
    legalCitationAz: '"Avtomobil yolları haqqında" AR Qanunu, Maddə 24',
  },
];

export interface VerifiedWimRecord {
  id: string;
  certificateId: string;
  vehiclePlate: string;
  stationNameAz: string;
  highwayCode: string;
  date: string;
  totalWeightKg: number;
  legalLimitKg: number;
  complianceRating: 'COMPLIANT' | 'MINOR_WARNING' | 'SUBSTANTIAL_OVERWEIGHT' | 'CRITICAL_HAZARD';
  fineAzn: number;
  roadCompensationAzn: number;
  simaDigitalUid: string;
}

export const MOCK_VERIFIED_WIM_RECORDS: VerifiedWimRecord[] = [
  {
    id: 'REC-01',
    certificateId: 'WIM-AZ-2026-88192',
    vehiclePlate: '99-ZZ-990',
    stationNameAz: 'M1 Bakı-Quba-Rusiya Sərhədi (Giləzi WIM Postu)',
    highwayCode: 'M1',
    date: '2026-10-27',
    totalWeightKg: 39200,
    legalLimitKg: 40000,
    complianceRating: 'COMPLIANT',
    fineAzn: 0,
    roadCompensationAzn: 0,
    simaDigitalUid: 'SIMA-WIM-AZ-ACTROS-7721-2026',
  },
  {
    id: 'REC-02',
    certificateId: 'WIM-AZ-2026-44319',
    vehiclePlate: '10-TX-404',
    stationNameAz: 'M2 Bakı-Ələt-Qazax (Hacıqabul Nəqliyyat Düyünü)',
    highwayCode: 'M2',
    date: '2026-10-27',
    totalWeightKg: 43800,
    legalLimitKg: 40000,
    complianceRating: 'SUBSTANTIAL_OVERWEIGHT',
    fineAzn: 600,
    roadCompensationAzn: 124,
    simaDigitalUid: 'SIMA-WIM-AZ-MAN-4412-2026',
  },
  {
    id: 'REC-03',
    certificateId: 'WIM-AZ-2026-55902',
    vehiclePlate: '77-WM-101',
    stationNameAz: 'M2 Kürdəmir-Yevlax (Kür Körpüsü Yanaşma WIM)',
    highwayCode: 'M2',
    date: '2026-10-26',
    totalWeightKg: 43500,
    legalLimitKg: 44000,
    complianceRating: 'COMPLIANT',
    fineAzn: 0,
    roadCompensationAzn: 0,
    simaDigitalUid: 'SIMA-WIM-AZ-SCANIA-9092-2026',
  },
  {
    id: 'REC-04',
    certificateId: 'WIM-AZ-2026-12048',
    vehiclePlate: '10-AX-888',
    stationNameAz: 'M4 Bakı-Şamaxı-Yevlax (Muğanlı Dağ Aşırımı Girişi)',
    highwayCode: 'M4',
    date: '2026-10-25',
    totalWeightKg: 27800,
    legalLimitKg: 26000,
    complianceRating: 'SUBSTANTIAL_OVERWEIGHT',
    fineAzn: 600,
    roadCompensationAzn: 58,
    simaDigitalUid: 'SIMA-WIM-AZ-KAMAZ-1088-2026',
  },
  {
    id: 'REC-05',
    certificateId: 'WIM-AZ-2026-90311',
    vehiclePlate: '90-TK-555',
    stationNameAz: 'M2 Gəncə Dairəvi Magistralı (Şəmkir Çıxışı WIM)',
    highwayCode: 'M2',
    date: '2026-10-24',
    totalWeightKg: 58000,
    legalLimitKg: 60000,
    complianceRating: 'COMPLIANT',
    fineAzn: 0,
    roadCompensationAzn: 0,
    simaDigitalUid: 'SIMA-WIM-AZ-VOLVO-8830-2026',
  },
];
