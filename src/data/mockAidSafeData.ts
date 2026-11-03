/**
 * AutoNext - Official State Agency of Azerbaijan Automobile Roads (AAYDA),
 * Ministry of Digital Development and Transport (AYNA) & Main State Traffic Police (BDYP)
 * Mock Data Repository for Highway Automatic Incident Detection (AID-SAFE-AZ-2026)
 */

import { AidCameraNode, IncidentType, WeatherCondition } from '../utils/aidSafeCompliance';

export const MOCK_AID_CAMERAS: AidCameraNode[] = [
  {
    id: 'aid-cam-01',
    code: 'AID-M1-KM34',
    corridor: 'M-1 Bakı - Quba - Rusiya Sərhədi',
    routeNumber: 'M-1',
    picketKm: 'Km 34+200 (Sumqayıt Şimal Qovşağı)',
    kmNumeric: 34.2,
    gpsLat: 40.6124,
    gpsLng: 49.6241,
    cameraType: '4K AI DeepLearning PTZ + Dual Optical Fixed Node',
    sensorResolution: '4K UHD (3840x2160)',
    aiFrameRateFps: 60,
    opticalZoom: '36x Laser IR Zoom',
    fiberLatencyMs: 4.8,
    status: 'ONLINE',
    activeAlertCount: 1,
    weatherCondition: 'CLEAR_DAY',
  },
  {
    id: 'aid-cam-02',
    code: 'AID-BR1-KM07',
    corridor: 'Bakı Dairəvi-1 Avtomobil Yolu',
    routeNumber: 'BR-1',
    picketKm: 'Km 7+600 (Yasamal Dərəsi Viaduku)',
    kmNumeric: 7.6,
    gpsLat: 40.3842,
    gpsLng: 49.7891,
    cameraType: 'High-Density Neural Flow Matrix Sensor',
    sensorResolution: '4K UHD (3840x2160)',
    aiFrameRateFps: 60,
    opticalZoom: '25x Optical Auto-Focus',
    fiberLatencyMs: 3.2,
    status: 'ONLINE',
    activeAlertCount: 2,
    weatherCondition: 'CLEAR_DAY',
  },
  {
    id: 'aid-cam-03',
    code: 'AID-VIP-KM08',
    corridor: 'Heydər Əliyev Beynəlxalq Hava Limanı Şosesi',
    routeNumber: 'VIP-01',
    picketKm: 'Km 8+400 (Beşmərtəbə Sürətli Dəhliz)',
    kmNumeric: 8.4,
    gpsLat: 40.4281,
    gpsLng: 49.9832,
    cameraType: 'Ultra-Low Latency Intelligent Highway CCTV',
    sensorResolution: '4K UHD (3840x2160)',
    aiFrameRateFps: 60,
    opticalZoom: '32x Starlight Optical',
    fiberLatencyMs: 2.1,
    status: 'ONLINE',
    activeAlertCount: 0,
    weatherCondition: 'CLEAR_DAY',
  },
  {
    id: 'aid-cam-04',
    code: 'AID-M2-KM182',
    corridor: 'M-2 Bakı - Ələt - Gəncə - Gürcüstan Sərhədi',
    routeNumber: 'M-2',
    picketKm: 'Km 182+500 (Kürdəmir Çöl Tranzit Dəhlizi)',
    kmNumeric: 182.5,
    gpsLat: 40.3411,
    gpsLng: 48.1523,
    cameraType: 'Solar-Backed Dual Spectrum Optical/Thermal AI',
    sensorResolution: 'QHD (2560x1440) + FLIR Thermal',
    aiFrameRateFps: 30,
    opticalZoom: '40x Long-Range Zoom',
    fiberLatencyMs: 8.4,
    status: 'ONLINE',
    activeAlertCount: 0,
    weatherCondition: 'DUST_WIND',
  },
  {
    id: 'aid-cam-05',
    code: 'AID-M4-KM127',
    corridor: 'M-4 Bakı - Şamaxı - Ağsu Aşırımı',
    routeNumber: 'M-4',
    picketKm: 'Km 127+800 (Ağsu Serpantini Qayalıq Döngəsi)',
    kmNumeric: 127.8,
    gpsLat: 40.5721,
    gpsLng: 48.4112,
    cameraType: 'Mountain All-Weather FLIR Thermal + 4K Optical AID',
    sensorResolution: '4K UHD (3840x2160)',
    aiFrameRateFps: 45,
    opticalZoom: '30x Optical with Hydrophobic Wiper',
    fiberLatencyMs: 6.9,
    status: 'ONLINE',
    activeAlertCount: 1,
    weatherCondition: 'DENSE_FOG',
  },
  {
    id: 'aid-cam-06',
    code: 'AID-ZY-KM69',
    corridor: 'Zəfər Yolu (Füzuli - Daşaltı - Şuşa)',
    routeNumber: 'ZY-01',
    picketKm: 'Km 69+300 (Daşaltı Dərəsi Dağlıq Keçidi)',
    kmNumeric: 69.3,
    gpsLat: 39.7541,
    gpsLng: 46.7412,
    cameraType: 'Ruggedized High-Altitude AI Highway Monitor',
    sensorResolution: '4K UHD (3840x2160)',
    aiFrameRateFps: 60,
    opticalZoom: '36x Laser Starlight Zoom',
    fiberLatencyMs: 9.1,
    status: 'ONLINE',
    activeAlertCount: 0,
    weatherCondition: 'RAIN_WET',
  },
];

export interface AidVehiclePreset {
  id: string;
  name: string;
  plate: string;
  vehicleCategory: string;
  approachSpeedKmh: number;
  incidentType: IncidentType;
  incidentSpeedKmh: number;
  distanceMeters: number;
  affectedLane: number;
  description: string;
}

export const MOCK_AID_VEHICLES: AidVehiclePreset[] = [
  {
    id: 'veh-01',
    name: 'BMW 530i BDYP Magistral Patrul Alayı',
    plate: '99-AI-101',
    vehicleCategory: 'Operativ Polis İkili Kamera Quraşdırılmış',
    approachSpeedKmh: 110,
    incidentType: 'WRONG_WAY_DRIVER',
    incidentSpeedKmh: 65,
    distanceMeters: 400,
    affectedLane: 1,
    description: 'Qovşaqdan səhvən əks istiqamətdə sürət zolağına daxil olmuş avtomobili təcili aşkarlama və zərərsizləşdirmə ssenarisi.',
  },
  {
    id: 'veh-02',
    name: 'Mercedes-Benz Actros 1845 TIR (Ağır Yük)',
    plate: '10-AD-202',
    vehicleCategory: 'Ağır Tonnajlı Tranzit Yük Avtomobili',
    approachSpeedKmh: 85,
    incidentType: 'STOPPED_VEHICLE',
    incidentSpeedKmh: 0,
    distanceMeters: 250,
    affectedLane: 2,
    description: 'Magistralın orta hərəkət zolağında turbo borusunun qopması səbəbilə qəfil dayanmış və təhlükə törədən TIR.',
  },
  {
    id: 'veh-03',
    name: 'Lada 2107 Əks Hərəkət Edən Minik Maşını',
    plate: '77-WW-303',
    vehicleCategory: 'Klassik Sedan (İcazəsiz Geri Qayıtma)',
    approachSpeedKmh: 120,
    incidentType: 'WRONG_WAY_DRIVER',
    incidentSpeedKmh: 50,
    distanceMeters: 300,
    affectedLane: 1,
    description: 'Ötüş nöqtəsini qaçıraraq birtərəfli magistral yolda geriyə əks hərəkət edən və ölümcül qəza riski yaradan nəqliyyat.',
  },
  {
    id: 'veh-04',
    name: 'Toyota Camry Hybrid (Şəhərətrafı Avtomobil)',
    plate: '90-AZ-404',
    vehicleCategory: 'Sedan (Sürət Zolağında)',
    approachSpeedKmh: 100,
    incidentType: 'DEBRIS_OBSTACLE',
    incidentSpeedKmh: 0,
    distanceMeters: 180,
    affectedLane: 2,
    description: 'Yük maşınından yola aşmış taxta palet və qırıq təkər protektoruna yaxınlaşan minik avtomobili.',
  },
  {
    id: 'veh-05',
    name: 'Ford Transit Yük Furqonu (Yük Daşıyan)',
    plate: '99-DB-505',
    vehicleCategory: 'Orta Yük Furqonu',
    approachSpeedKmh: 90,
    incidentType: 'PEDESTRIAN_INTRUSION',
    incidentSpeedKmh: 5,
    distanceMeters: 220,
    affectedLane: 3,
    description: 'Magistral çəpərini aşaraq 3-cü zolaqdan keçməyə çalışan piyadanı AI kameralarla dərhal qeydə alma ssenarisi.',
  },
  {
    id: 'veh-06',
    name: 'Porsche Taycan 4S EV (Yüksək Sürətli Elektromobil)',
    plate: '00-YP-606',
    vehicleCategory: 'Yüksək Dinamikli İdman Elektromobili',
    approachSpeedKmh: 130,
    incidentType: 'TRAFFIC_CONGESTION_SHOCKWAVE',
    incidentSpeedKmh: 20,
    distanceMeters: 350,
    affectedLane: 1,
    description: 'İrəlidə zəncirvari şok dalğası və qəfil sürət düşməsi zamanı arxadan gələn sürətli axının VMS vasitəsilə dərhal xəbərdar edilməsi.',
  },
];

export interface AidChecklistItem {
  id: string;
  category: string;
  title: string;
  standard: string;
  requirement: string;
}

export const MOCK_AID_CHECKLIST: AidChecklistItem[] = [
  {
    id: 'chk-01',
    category: 'Optik və Təsvir Keyfiyyəti',
    title: '4K Sensor & Minimum 25 px/m Hədəf Sıxlığı (Johnson Meyarları)',
    standard: 'EN 50132-7 / EN 62676-4',
    requirement: 'Hədəf məsafəsində hərəkət edən və ya dayanmış nəqliyyat vasitəsi üçün minimum 25 piksel/metr tanıma həddi təmin edilməlidir.',
  },
  {
    id: 'chk-02',
    category: 'Gecikmə və Hesablama',
    title: 'Hadisə Aşkarlama Gecikməsi (Detection Latency ≤ 5.0 saniyə)',
    standard: 'AZS 410 / ISO 14827',
    requirement: 'Dayanmış avtomobil və ya əks istiqamət hərəkəti maksimum 5 saniyə ərzində AI neyron şəbəkəsi tərəfindən aşkar edilməlidir.',
  },
  {
    id: 'chk-03',
    category: 'Əks İstiqamət Alqoritmi',
    title: 'Wrong-Way Vektor Hərəkət İzlənməsi və Dərhal Həyəcan Siqnalı',
    standard: 'İXM Maddə 327.4 & AAYDA Qaydaları',
    requirement: 'Trafik axınının əksi istiqamətində hərəkət edən hər hansı obyekt 2.0 saniyədən az müddətdə qırmızı prioritetlə qeydə alınmalıdır.',
  },
  {
    id: 'chk-04',
    category: 'Yol Qalıqları və Maneələr',
    title: 'Debris & Düşmüş Əşyaların Statik Analizi (Ölçü ≥ 30x30 sm)',
    standard: 'İXM Maddə 327.2 / EN 12966',
    requirement: 'Zolaqda 10 saniyədən çox hərəkətsiz qalan minimum 30x30 sm ölçülü maneələr avtomatik təsnifləşdirilməlidir.',
  },
  {
    id: 'chk-05',
    category: 'Piyada İntruziyası',
    title: 'Piyada Silueti və İnsan Skelet Modeli Təyini (YHQ Maddə 60)',
    standard: 'EN ISO 20471 / YHQ 60',
    requirement: 'Magistral yolun hərəkət hissəsinə və ya çiyinə daxil olmuş insan silueti anlıq olaraq fiksə edilməli və sarı/qırmızı zona xəbərdarlığı verilməlidir.',
  },
  {
    id: 'chk-06',
    category: 'Klimatik və Ətraf Mühit',
    title: 'Hidrofobik Şüşəsilən & Qızdırıcı Linzalar (IP67 / IK10)',
    standard: 'AZS 342 / IEC 60529',
    requirement: 'Duman, yağış və qarda linzaların buxarlanmasının qarşısını almaq üçün daxili termostatlı qızdırıcı və mexaniki fırça olmalıdır.',
  },
  {
    id: 'chk-07',
    category: 'Şəbəkə və SCADA İnterfeysi',
    title: 'Optik Lifli Həlqə (Latency < 15ms) & ONVIF Profile S/G/T',
    standard: 'ISO 14827 / ONVIF Profile T',
    requirement: 'Mərkəzi SCADA serveri ilə video axın və telemetriya gecikməsi 15 millisaniyədən az olmalı, ikili fiber xəttlə ehtiyatlanmalıdır.',
  },
  {
    id: 'chk-08',
    category: 'VMS & Qantry Avtomatlaşdırması',
    title: 'Avtomatik Dəyişən Məlumat Nişanlarına (VMS) Xəbərdarlıq Çıxarışı',
    standard: 'EN 12966 / NTCIP 1203',
    requirement: 'Aşkarlanan hadisə 3 saniyə ərzində irəlidəki ən yaxın 2 dinamik qantry tablosuna xəbərdarlıq mətnini avtomatik göndərməlidir.',
  },
  {
    id: 'chk-09',
    category: 'Zolaq İdarəetməsi (LCS)',
    title: 'Zolaq Nəzarət İşıqforlarının Avtomatik Qırmızı "X" Rejiminə Keçidi',
    standard: 'YHQ Maddə 42 / İXM 327.2',
    requirement: 'Bloklanmış zolaq üzərindəki LCS işıqforu dərhal qırmızı çarpaza keçməli, yanaşı zolağa isə sarı diaqonal ox göstərilməlidir.',
  },
  {
    id: 'chk-10',
    category: 'Kiber Təhlükəsizlik və Arxivləmə',
    title: 'TLS 1.3 Şifrələmə, 90 Günlük HD Hadisə Arxivi və SİMA İmza',
    standard: 'ISO 27001 / AR Dövlət Təhlükəsizlik Standartı',
    requirement: 'Bütün qəza və pozuntu video fraqmentləri SHA-256 xülasəsi ilə 90 gün toxunulmaz arxivdə saxlanmalıdır.',
  },
];

export interface AidExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  legalCitation: string;
}

export const MOCK_AID_EXAM_QUESTIONS: AidExamQuestion[] = [
  {
    id: 'q-01',
    question: 'Magistral avtomobil yolunda birtərəfli hərəkət axınının əksi istiqamətinə çıxaraq hərəkət etməyə görə İXM-də hansı cəza nəzərdə tutulur?',
    options: [
      '40 AZN cərimə, bal verilmir',
      '80 AZN cərimə və 3 cərimə balı',
      '100 AZN cərimə və 4 cərimə balı',
      '150 AZN cərimə və sürücülük hüququnun məhdudlaşdırılması',
    ],
    correctIndex: 2,
    explanation: 'İnzibati Xətalar Məcəlləsinin 327.4-cü maddəsinə əsasən, birtərəfli hərəkət təşkil edilmiş yollarda əks istiqamətdə hərəkət etməyə görə 100 manat cərimə və 4 cərimə balı tətbiq olunur.',
    legalCitation: 'İXM Maddə 327.4',
  },
  {
    id: 'q-02',
    question: 'Yol hərəkəti hissəsinə yük tökərək, zibil və ya digər qəza maneəsi yaradaraq təhlükə törətməyə görə hansı cəza tətbiq edilir?',
    options: [
      '20 AZN cərimə',
      '80 AZN cərimə və 3 cərimə balı',
      '50 AZN cərimə, bal verilmir',
      '120 AZN cərimə və 5 cərimə balı',
    ],
    correctIndex: 1,
    explanation: 'İXM Maddə 327.2-yə əsasən, yolda hərəkət üçün maneə yaratmağa və ya hərəkət hissəsinə yük tökməyə görə 80 AZN məbləğində cərimə və 3 cərimə balı nəzərdə tutulur.',
    legalCitation: 'İXM Maddə 327.2',
  },
  {
    id: 'q-03',
    question: 'Magistral avtomobil yolunda məcburi dayanma zamanı sürücü qəza dayanma nişanını nəqliyyat vasitəsindən minimum hansı məsafədə quraşdırmalıdır?',
    options: [
      'Yaşayış məntəqəsindən kənarda ən azı 15 metr',
      'Magistral yollarda ən azı 30 metr',
      'Magistral yollarda ən azı 50 metr məsafədə',
      'İstənilən məsafədə, təki görünən olsun',
    ],
    correctIndex: 2,
    explanation: 'Yol Hərəkəti Haqqında Qanunun 43-cü maddəsinə əsasən, magistral yollarda və yüksək sürətli dəhlizlərdə qəza dayanma nişanı nəqliyyat vasitəsindən ən azı 50 metr məsafədə quraşdırılmalıdır.',
    legalCitation: 'YHQ Maddə 43 / İXM Maddə 330',
  },
  {
    id: 'q-04',
    question: 'Piyadaların magistral avtomobil yollarının hərəkət hissəsinə daxil olmasına görə hansı inzibati məsuliyyət müəyyən edilmişdir?',
    options: [
      'Yalnız şifahi xəbərdarlıq edilir',
      '20 AZN cərimə',
      '40 AZN məbləğində cərimə',
      '100 AZN cərimə və 15 gün ictimai işlər',
    ],
    correctIndex: 2,
    explanation: 'İXM Maddə 338.1-ə əsasən, piyadalar tərəfindən yol hərəkəti qaydalarının pozulmasına, o cümlədən magistral yollarda piyada üçün nəzərdə tutulmayan yerlərdən keçməyə görə 40 AZN cərimə tətbiq edilir.',
    legalCitation: 'İXM Maddə 338.1',
  },
  {
    id: 'q-05',
    question: 'Johnson meyarlarına (Johnson\'s Criteria) əsasən, intellektual kamerada nəqliyyat vasitəsini etibarlı tanımaq (Recognition) üçün hədəf üzərində minimum hansı piksel sıxlığı tələb olunur?',
    options: [
      'Minimum 2 piksel/metr',
      'Minimum 6 piksel/metr (Yalnız aşkarlama)',
      'Minimum 25 piksel/metr (Tanıma - Recognition)',
      'Minimum 120 piksel/metr',
    ],
    correctIndex: 2,
    explanation: 'EN 62676-4 və Johnson meyarlarına əsasən: aşkarlama üçün 6 px/m, tanıma (nəqliyyat növünü ayırd etmə) üçün 25 px/m, identifikasiya (nömrə nişanını oxuma) üçün isə 60 px/m sıxlıq lazımdır.',
    legalCitation: 'EN 62676-4 / EN 50132-7 Standartı',
  },
  {
    id: 'q-06',
    question: 'Magistral yolda avtomatik hadisə aşkarlama (AID) sistemi zolaqda dayanmış avtomobil qeydə aldıqda SCADA hansı tədbiri avtomatik görməlidir?',
    options: [
      'Yalnız BDYP patruluna e-poçt bildirişi göndərməlidir',
      'İrəlidəki VMS tablolarında xəbərdarlıq yaymalı və aidiyyəti LCS işıqforunda qırmızı "X" yandırmalıdır',
      'Magistral yoldakı bütün zolaqları dərhal bağlamalıdır',
      'Heç bir tədbir görmür, yalnız 1 saat sonra arxivləşdirir',
    ],
    correctIndex: 1,
    explanation: 'AAYDA və AYNA SCADA protokoluna əsasən, təhlükə aşkarlanan kimi irəlidəki VMS tablolarına xəbərdarlıq çıxarılır və bloklanmış zolaq LCS işıqforunda qırmızı "X" ilə bağlanır.',
    legalCitation: 'AAYDA ITS SCADA Reqlamenti & EN 12966',
  },
  {
    id: 'q-07',
    question: 'İnzibati cərimə qərarı qüvvəyə mindikdən sonra 30 gün ərzində AsanPay və ya bank vasitəsilə ödənildikdə hansı güzəşt tətbiq olunur?',
    options: [
      '10% endirim tətbiq edilir',
      '50% məbləğində qanuni endirim tətbiq edilir',
      'Cərimə balları silinir, məbləğ dəyişmir',
      'Güzəşt yalnız bayram günlərində verilir',
    ],
    correctIndex: 1,
    explanation: 'İXM Maddə 38 və Yol Hərəkəti Qanunvericiliyinə əsasən, qərarın çıxarılmasından 30 gün ərzində cərimə ödənildikdə məbləğin 50%-i ödənilir.',
    legalCitation: 'İXM Maddə 38 (50% Güzəşt Qaydası)',
  },
  {
    id: 'q-08',
    question: 'Magistral yolda qəza və ya nasazlıq səbəbilə məcburi dayanan sürücü avtomobildən düşərkən hansı fərdi mühafizə vasitəsini mütləq geyinməlidir?',
    options: [
      'İstənilən idman geyimi kifayətdir',
      'EN ISO 20471 standartına uyğun işıqqaytarıcı jilet',
      'Yalnız dəbilqə və eynək',
      'Heç bir vasitə tələb olunmur',
    ],
    correctIndex: 1,
    explanation: 'YHQ Maddə 37 və AAYDA təhlükəsizlik qaydalarına əsasən, qaranlıqda və ya məhdudiyyətli görmə şəraitində magistral yolda avtomobildən enən şəxs işıqqaytarıcı jilet geyinməlidir.',
    legalCitation: 'YHQ Maddə 37 / EN ISO 20471',
  },
  {
    id: 'q-09',
    question: 'AID sistemlərində "Time-to-Collision" (TTC) nəyi ifadə edir?',
    options: [
      'Kameranın mərkəzə siqnal çatdırma müddətini',
      'Yaxınlaşan nəqliyyat vasitəsinin mövcud sürətlə maneəyə çırpılmasına qalan vaxtı',
      'Qəza baş verdikdən sonra evakuatorun çatma vaxtını',
      'Sürücünün tormoz pedalına basma tezliyini',
    ],
    correctIndex: 1,
    explanation: 'TTC (Time-to-Collision) yaxınlaşan avtomobilin mövcud nisbi sürət və məsafə ilə maneə ilə toqquşmasına qalan kritik zaman kəsiyidir (saniyələrlə).',
    legalCitation: 'ISO 15623 & PIARC Təhlükəsizlik Standartı',
  },
  {
    id: 'q-10',
    question: 'Zolaqda baş verən ilkin hadisə vaxtında aradan qaldırılmadıqda ikinci dərəcəli zəncirvari qəza (Secondary Crash) ehtimalı necə dəyişir?',
    options: [
      'Zaman keçdikcə azalır və sıfıra enir',
      'Dəyişməz qalır',
      'Hadisənin həll olunmadığı hər dəqiqə və nəqliyyat sıxlığı artdıqca eksponensial olaraq artır',
      'Yalnız yağış yağdıqda artır',
    ],
    correctIndex: 2,
    explanation: 'Nəqliyyat axını intensiv olan magistrallarda ilkin hadisənin açıq qaldığı hər dəqiqə arxadan gələn şok dalğası səbəbilə ikinci qəza ehtimalını kəskin artırır.',
    legalCitation: 'Federal Highway Administration (FHWA) & PIARC Modeli',
  },
];

export interface AidRegistryRecord {
  id: string;
  certificateId: string;
  cameraCode: string;
  corridor: string;
  vehiclePlate: string;
  incidentType: IncidentType;
  severity: string;
  mttdSec: number;
  ttcSec: number;
  issuedAt: string;
  operator: string;
  status: 'ACTIVE_RESOLVED' | 'UNDER_DISPATCH' | 'ARCHIVED';
}

export const MOCK_AID_REGISTRY: AidRegistryRecord[] = [
  {
    id: 'reg-01',
    certificateId: 'AID-SAFE-AZ-2026-F4B192A0',
    cameraCode: 'AID-M1-KM34',
    corridor: 'M-1 Bakı - Quba - Rusiya Sərhədi',
    vehiclePlate: '99-AI-101',
    incidentType: 'WRONG_WAY_DRIVER',
    severity: 'CRITICAL_EMERGENCY',
    mttdSec: 2.4,
    ttcSec: 7.8,
    issuedAt: '2026-11-02T14:32:10Z',
    operator: 'Kapitan R. Əliyev (BDYP)',
    status: 'ACTIVE_RESOLVED',
  },
  {
    id: 'reg-02',
    certificateId: 'AID-SAFE-AZ-2026-C8A04312',
    cameraCode: 'AID-BR1-KM07',
    corridor: 'Bakı Dairəvi-1 Avtomobil Yolu',
    vehiclePlate: '10-AD-202',
    incidentType: 'STOPPED_VEHICLE',
    severity: 'HIGH_PRIORITY',
    mttdSec: 3.1,
    ttcSec: 10.6,
    issuedAt: '2026-11-02T16:15:40Z',
    operator: 'Mühəndis E. Məmmədov (AAYDA SCADA)',
    status: 'ACTIVE_RESOLVED',
  },
  {
    id: 'reg-03',
    certificateId: 'AID-SAFE-AZ-2026-72D310BC',
    cameraCode: 'AID-VIP-KM08',
    corridor: 'Heydər Əliyev Beynəlxalq Hava Limanı Şosesi',
    vehiclePlate: '90-AZ-404',
    incidentType: 'DEBRIS_OBSTACLE',
    severity: 'MODERATE_ALERT',
    mttdSec: 2.8,
    ttcSec: 14.2,
    issuedAt: '2026-11-03T07:45:00Z',
    operator: 'Baş Leytenant S. Qasımov (BDYP)',
    status: 'ACTIVE_RESOLVED',
  },
  {
    id: 'reg-04',
    certificateId: 'AID-SAFE-AZ-2026-B19E5F22',
    cameraCode: 'AID-M4-KM127',
    corridor: 'M-4 Bakı - Şamaxı - Ağsu Aşırımı',
    vehiclePlate: '99-DB-505',
    incidentType: 'PEDESTRIAN_INTRUSION',
    severity: 'HIGH_PRIORITY',
    mttdSec: 3.6,
    ttcSec: 8.8,
    issuedAt: '2026-11-03T09:12:30Z',
    operator: 'Operator T. İsmayılov (AYNA ITS)',
    status: 'UNDER_DISPATCH',
  },
];
