/**
 * Mock database for KTN & DAXA Agricultural & Self-Propelled Machinery Portal.
 * Adheres to Ministry of Agriculture of Azerbaijan, DAXA, and BDYP statutory standards.
 */

import { TractorCategory, TractorCertificate, TractorTechnicalChecklist } from '../utils/tractorCompliance';

export interface TractorModelPreset {
  id: string;
  brand: string;
  model: string;
  category: TractorCategory;
  enginePowerHp: number;
  enginePowerKw: number;
  displacementCc: number;
  fuelType: 'diesel' | 'biodiesel';
  chassisType: 'wheeled' | 'crawler';
  priceAzn: number;
  plateNumber: string;
  chassisSerial: string;
  engineSerial: string;
  defaultChecklist: TractorTechnicalChecklist;
}

export interface DaxaInspectionCenter {
  id: string;
  name: string;
  region: string;
  district: string;
  address: string;
  phone: string;
  chiefInspector: string;
  operatingHours: string;
  dailyCapacity: number;
  availableSlotTimes: string[];
  coordinates: { lat: number; lng: number };
}

export interface TractorTheoryQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  legalBasis: string;
  explanation: string;
}

export const MOCK_TRACTOR_MODELS: TractorModelPreset[] = [
  {
    id: 'tr_belarus_82',
    brand: 'Belarus',
    model: 'MTZ-82.1 Universal Traktor',
    category: 'B',
    enginePowerHp: 81,
    enginePowerKw: 60,
    displacementCc: 4750,
    fuelType: 'diesel',
    chassisType: 'wheeled',
    priceAzn: 42000,
    plateNumber: '99-TA-102',
    chassisSerial: 'MTZ821AZ-849120',
    engineSerial: 'D243-98214',
    defaultChecklist: {
      chassisAndEngineMatch: true,
      hydraulicSystemIntegrity: true,
      steeringBrakeFunction: true,
      emergencyBeaconLight: true,
      slowMovingVehicleSign: true,
      lightingAndReflectors: true,
      cabinRolloverProtection: true,
      fireExtinguisherAndFirstAid: true,
      ptoShaftShield: true,
      exhaustSparkArrester: true,
    },
  },
  {
    id: 'tr_claas_tucano',
    brand: 'CLAAS',
    model: 'Tucano 450 Taxılyığan Kombayn',
    category: 'F',
    enginePowerHp: 313,
    enginePowerKw: 230,
    displacementCc: 7700,
    fuelType: 'diesel',
    chassisType: 'wheeled',
    priceAzn: 385000,
    plateNumber: '20-TH-341',
    chassisSerial: 'CLAAS-TUC-450-AZE-12',
    engineSerial: 'OM936LA-55102',
    defaultChecklist: {
      chassisAndEngineMatch: true,
      hydraulicSystemIntegrity: true,
      steeringBrakeFunction: true,
      emergencyBeaconLight: true,
      slowMovingVehicleSign: true,
      lightingAndReflectors: true,
      cabinRolloverProtection: true,
      fireExtinguisherAndFirstAid: true,
      ptoShaftShield: true,
      exhaustSparkArrester: true,
    },
  },
  {
    id: 'tr_john_deere_8r',
    brand: 'John Deere',
    model: '8R 370 Ağır Şum Traktoru',
    category: 'C',
    enginePowerHp: 370,
    enginePowerKw: 272,
    displacementCc: 9000,
    fuelType: 'diesel',
    chassisType: 'wheeled',
    priceAzn: 480000,
    plateNumber: '01-TA-888',
    chassisSerial: '1RW8370AZPC0912',
    engineSerial: 'JD90L-441209',
    defaultChecklist: {
      chassisAndEngineMatch: true,
      hydraulicSystemIntegrity: true,
      steeringBrakeFunction: true,
      emergencyBeaconLight: true,
      slowMovingVehicleSign: true,
      lightingAndReflectors: true,
      cabinRolloverProtection: true,
      fireExtinguisherAndFirstAid: true,
      ptoShaftShield: true,
      exhaustSparkArrester: true,
    },
  },
  {
    id: 'tr_dt75m_crawler',
    brand: 'Volqoqrad',
    model: 'DT-75M Tırtıllı Meliorasiya Traktoru',
    category: 'D',
    enginePowerHp: 95,
    enginePowerKw: 70,
    displacementCc: 7430,
    fuelType: 'diesel',
    chassisType: 'crawler',
    priceAzn: 35000,
    plateNumber: '09-TT-045',
    chassisSerial: 'DT75M-VGTZ-7491',
    engineSerial: 'A41SI-9031',
    defaultChecklist: {
      chassisAndEngineMatch: true,
      hydraulicSystemIntegrity: true,
      steeringBrakeFunction: true,
      emergencyBeaconLight: false,
      slowMovingVehicleSign: true,
      lightingAndReflectors: true,
      cabinRolloverProtection: true,
      fireExtinguisherAndFirstAid: true,
      ptoShaftShield: false,
      exhaustSparkArrester: true,
    },
  },
  {
    id: 'tr_rostselmash_torum',
    brand: 'Rostselmash',
    model: 'Torum 785 Rotorlu Kombayn',
    category: 'F',
    enginePowerHp: 506,
    enginePowerKw: 372,
    displacementCc: 12000,
    fuelType: 'diesel',
    chassisType: 'wheeled',
    priceAzn: 520000,
    plateNumber: '54-TH-702',
    chassisSerial: 'RSM-TRM785-0941',
    engineSerial: 'KAM-740-99410',
    defaultChecklist: {
      chassisAndEngineMatch: true,
      hydraulicSystemIntegrity: true,
      steeringBrakeFunction: true,
      emergencyBeaconLight: true,
      slowMovingVehicleSign: true,
      lightingAndReflectors: true,
      cabinRolloverProtection: true,
      fireExtinguisherAndFirstAid: true,
      ptoShaftShield: true,
      exhaustSparkArrester: true,
    },
  },
  {
    id: 'tr_jcb_3cx',
    brand: 'JCB',
    model: '3CX Eco Meliorasiya Ekskavator-Yükləyici',
    category: 'E',
    enginePowerHp: 92,
    enginePowerKw: 68,
    displacementCc: 4400,
    fuelType: 'diesel',
    chassisType: 'wheeled',
    priceAzn: 115000,
    plateNumber: '50-TM-555',
    chassisSerial: 'JCB3CX-ECO-94812',
    engineSerial: 'Dieselmax-4481',
    defaultChecklist: {
      chassisAndEngineMatch: true,
      hydraulicSystemIntegrity: true,
      steeringBrakeFunction: true,
      emergencyBeaconLight: true,
      slowMovingVehicleSign: true,
      lightingAndReflectors: true,
      cabinRolloverProtection: true,
      fireExtinguisherAndFirstAid: true,
      ptoShaftShield: true,
      exhaustSparkArrester: false,
    },
  },
];

export const MOCK_DAXA_INSPECTION_CENTERS: DaxaInspectionCenter[] = [
  {
    id: 'daxa_barda',
    name: 'Bərdə Regional Dövlət Aqrar Xidmətlər Mərkəzi',
    region: 'Qarabağ İqtisadi Rayonu',
    district: 'Bərdə rayonu',
    address: 'Heydər Əliyev prospekti 114, Bərdə',
    phone: '+994 (22) 365-24-10',
    chiefInspector: 'Səbuhi Məmmədov',
    operatingHours: '09:00 - 18:00 (Bazar ertəsi - Cümə)',
    dailyCapacity: 45,
    availableSlotTimes: ['09:30', '11:00', '14:00', '16:00'],
    coordinates: { lat: 40.3758, lng: 47.1261 },
  },
  {
    id: 'daxa_sheki',
    name: 'Şəki Regional DAXA Müfəttişliyi',
    region: 'Şəki-Zaqatala İqtisadi Rayonu',
    district: 'Şəki şəhəri',
    address: 'M.Ə.Rəsulzadə prospekti 42, Şəki',
    phone: '+994 (24) 244-12-85',
    chiefInspector: 'İlham Qasımov',
    operatingHours: '09:00 - 18:00 (Bazar ertəsi - Cümə)',
    dailyCapacity: 35,
    availableSlotTimes: ['10:00', '11:30', '14:30', '16:30'],
    coordinates: { lat: 41.1919, lng: 47.1706 },
  },
  {
    id: 'daxa_ganja',
    name: 'Gəncə Regional Aqrotexniki Nəzarət İdarəsi',
    region: 'Gəncə-Daşkəsən İqtisadi Rayonu',
    district: 'Gəncə şəhəri',
    address: 'Atatürk prospekti 260, Gəncə',
    phone: '+994 (22) 256-40-19',
    chiefInspector: 'Vüqar Əliyev',
    operatingHours: '09:00 - 18:00 (Bazar ertəsi - Cümə)',
    dailyCapacity: 50,
    availableSlotTimes: ['09:00', '10:30', '13:30', '15:30'],
    coordinates: { lat: 40.6828, lng: 46.3606 },
  },
  {
    id: 'daxa_khachmaz',
    name: 'Xaçmaz Regional DAXA Aqropark Mərkəzi',
    region: 'Quba-Xaçmaz İqtisadi Rayonu',
    district: 'Xaçmaz rayonu',
    address: 'Bakı prospekti 18, Xaçmaz',
    phone: '+994 (23) 325-18-92',
    chiefInspector: 'Natiq Rəhimov',
    operatingHours: '09:00 - 18:00 (Bazar ertəsi - Cümə)',
    dailyCapacity: 40,
    availableSlotTimes: ['09:30', '11:00', '14:00', '16:00'],
    coordinates: { lat: 41.4635, lng: 48.8058 },
  },
  {
    id: 'daxa_sabirabad',
    name: 'Sabirabad Regional Pambıqçılıq & Aqrotexnika İdarəsi',
    region: 'Mil-Muğan İqtisadi Rayonu',
    district: 'Sabirabad rayonu',
    address: 'Heydər Əliyev prospekti 65, Sabirabad',
    phone: '+994 (21) 235-33-04',
    chiefInspector: 'Eldəniz Həsənov',
    operatingHours: '09:00 - 18:00 (Bazar ertəsi - Cümə)',
    dailyCapacity: 45,
    availableSlotTimes: ['10:00', '12:00', '14:30', '16:30'],
    coordinates: { lat: 40.0089, lng: 48.4772 },
  },
  {
    id: 'daxa_jalilabad',
    name: 'Cəlilabad Regional Aqrar Xidmətlər Mərkəzi',
    region: 'Lənkəran-Astara İqtisadi Rayonu',
    district: 'Cəlilabad rayonu',
    address: 'Qurtuluş küçəsi 14, Cəlilabad',
    phone: '+994 (25) 245-21-70',
    chiefInspector: 'Rauf İsmayılov',
    operatingHours: '09:00 - 18:00 (Bazar ertəsi - Cümə)',
    dailyCapacity: 35,
    availableSlotTimes: ['09:30', '11:30', '14:00', '15:30'],
    coordinates: { lat: 39.2089, lng: 48.4919 },
  },
];

export const MOCK_THEORY_QUESTIONS: TractorTheoryQuestion[] = [
  {
    id: 1,
    question: 'Təkərli traktor ümumi istifadədə olan avtomobil yolunda hərəkət edərkən əyləc pedalları necə olmalıdır?',
    options: [
      'Əyləc pedalları bir-birindən ayrılmış olmalıdır ki, kəskin dönmək mümkün olsun',
      'Xüsusi mexaniki fiksatorla hər iki pedal mütləq bir-birinə qoşalaşdırılmalıdır (bloklanmalıdır)',
      'Pedallardan biri tam söndürülməlidir',
      'Yalnız əl əyləcindən istifadə olunmalıdır',
    ],
    correctIndex: 1,
    legalBasis: 'YHQ Əlavə 1 Bənd 1.3 & KTN Təhlükəsizlik Qaydası',
    explanation: 'Şose yolunda sürətli hərəkət zamanı tək təkərin əyləclənməsi traktorun aşmasına səbəb olduğu üçün pedallar şose fiksatoru ilə kilidlənməlidir.',
  },
  {
    id: 2,
    question: 'Metal tırtıllı traktorların asfalt örtüklü avtomobil yollarında hərəkətinə icazə verilirmi?',
    options: [
      'Bəli, sürət 20 km/saatdan çox olmadıqda icazə verilir',
      'Bəli, əgər traktor arxasında xəbərdarlıq nişanı varsa',
      'Xeyr, qəti QADAĞANDIR! Xüsusi aşağı platformalı treylerdə daşınmalı və ya rezin yastıq quraşdırılmalıdır',
      'Yalnız axşam saat 22:00-dan sonra icazə verilir',
    ],
    correctIndex: 2,
    legalBasis: 'YHQ Maddə 57 & İXM Maddə 342.2-1',
    explanation: 'Metal tırtıllar asfalt və beton yol örtüyünü dağıtdığı üçün ümumi istifadədə olan yollarda hərəkəti qadağandır.',
  },
  {
    id: 3,
    question: 'Taxılyığan kombayn ümumi avtomobil yoluna çıxarkən biçən aqreqat ("jatka") necə nəql edilməlidir?',
    options: [
      'Kombaynın önünə birləşdirilmiş və qaldırılmış vəziyyətdə',
      'Sökülərək xüsusi təkərli qoşqu arabacığına qoyulub kombaynın arxasında çəkilməlidir',
      'Yalnız sahə daxilində sökülə bilər, yolda qadağandır',
      'Yan tərəfə bərkidilərək şaquli daşınmalıdır',
    ],
    correctIndex: 1,
    legalBasis: 'YHQ Maddə 57 & İXM Maddə 353 (İriqabaritli nəqliyyat)',
    explanation: 'Biçən aqreqatın eni 4-9 metr arasında olduğundan yol qabaritini (2.55m) kəskin aşır; mütləq sökülərək arxada daşınmalıdır.',
  },
  {
    id: 4,
    question: 'EKTİS dövlət subsidiyası çərçivəsində fermer kənd təsərrüfatı texnikası alarkən dövlət hansı faizdə geri qaytarılmayan subsidiya verir?',
    options: ['10%', '25%', '40%', '60%'],
    correctIndex: 2,
    legalBasis: 'Aqrar Subsidiya Şurası & AKİA Qaydaları',
    explanation: 'Dövlət tərəfindən aqrar texnikanın ilkin dəyərinin 40%-i həcmində birdəfəlik subsidiya ayrılır, 20% fermer ödəyir, 40% isə 5 illik faizsiz lizinqə verilir.',
  },
  {
    id: 5,
    question: 'Taxıl zəmilərində məhsul yığımı zamanı kombayn və traktorların səsboğucu borusuna nə quraşdırılmalıdır?',
    options: [
      'Turbomühərrik gücləndiricisi',
      'Yanğından mühafizə məqsədilə xüsusi qığılcımsöndürən (искрогаситель)',
      'Səs gücləndirici siqnal',
      'Katalizator təmizləyici filtr',
    ],
    correctIndex: 1,
    legalBasis: 'FHN & KTN Yanğın Təhlükəsizliyi Qaydaları',
    explanation: 'Quru saman və taxılın alovlanmasının qarşısını almaq üçün bütün mühərriklərdə qığılcımsöndürən quraşdırılması məcburidir.',
  },
  {
    id: 6,
    question: 'Kənd təsərrüfatı traktorları üçün yolda icazə verilən maksimum hərəkət sürəti nə qədərdir?',
    options: ['30 km/saat', '40 km/saat (qoşqu ilə 30 km/saat)', '60 km/saat', '90 km/saat'],
    correctIndex: 1,
    legalBasis: 'YHQ Maddə 54',
    explanation: 'Traktorların təkbaşına hərəkət sürəti 40 km/saat, kənd təsərrüfatı qoşqusu ilə hərəkət sürəti isə maksimum 30 km/saatla məhdudlaşdırılır.',
  },
  {
    id: 7,
    question: 'Traktorçu-maşinist vəsiqəsinin "F" kateqoriyası hansı texnikanı idarə etmək hüququ verir?',
    options: [
      'Kiçik bağçılıq mini-traktorlarını',
      'Tırtıllı buldozerləri',
      'Özüyeriyən taxılyığan və pambıqyığan kombaynları',
      'Suvarma nasos stansiyalarını',
    ],
    correctIndex: 2,
    legalBasis: 'KTN Sürücülük Vəsiqəsi Təlimatı',
    explanation: 'F kateqoriyası bilavasitə taxılyığan, pambıqyığan və digər özüyeriyən məhsulyığan aqreqatlara aiddir.',
  },
  {
    id: 8,
    question: 'Traktorun arxasında quraşdırılan "Aşağı Sürətli Nəqliyyat" (SMV) nişanı hansı həndəsi formadadır?',
    options: [
      'Qırmızı dairə',
      'Kənarları qırmızı əks-etdirici haşiyəli narıncı bərabərtərəfli üçbucaq',
      'Sarı rəngli kvadrat',
      'Mavi rəngli romb',
    ],
    correctIndex: 1,
    legalBasis: 'YHQ Əlavə 1 Bənd 7.15 & UNECE R69',
    explanation: 'Sürəti ≤40 km/saat olan nəqliyyat vasitələri üçün arxada narıncı üçbucaq SMV lövhəsi məcburidir.',
  },
  {
    id: 9,
    question: 'Gücayıran val (VOM / PTO) işlək vəziyyətdə olarkən təhlükəsizlik qaydası nə tələb edir?',
    options: [
      'Valın tam açıq qalması ki, fırlanma sürəti görünsün',
      'Fırlanan kardan birləşməsinin mütləq bütöv qoruyucu plastmas və ya metal örtüklə əhatələnməsi',
      'Valın yağlanması üçün iş zamanı əl ilə toxunulması',
      'Yalnız su ilə soyudulması',
    ],
    correctIndex: 1,
    legalBasis: 'KTN Əmək Mühafizəsi və Təhlükəsizlik Qaydası',
    explanation: 'Açıq kardan valı geyimi və bədən üzvlərini çəkərək ağır bədbəxt hadisələrə səbəb ola bilər, qoruyucu karkas məcburidir.',
  },
  {
    id: 10,
    question: 'Traktorçu-maşinist vəsiqəsinin "D" kateqoriyasını (tırtıllı texnika) almaq üçün minimum yaş həddi neçədir?',
    options: ['16 yaş', '18 yaş', '19 yaş', '21 yaş'],
    correctIndex: 2,
    legalBasis: 'YHQ Maddə 33',
    explanation: 'Təkərli traktorlar üçün minimum yaş 18, tırtıllı traktorlar ("D" kateqoriyası) üçün isə 19 yaş tələb olunur.',
  },
];

export const MOCK_REGISTERED_TRACTOR_CERTIFICATES: TractorCertificate[] = [
  {
    certificateNumber: 'KTN-TEX-2026-91204',
    daxaDivisionName: 'Bərdə Regional Dövlət Aqrar Xidmətlər Mərkəzi',
    plateNumber: '99-TA-102',
    chassisNumber: 'MTZ821AZ-849120',
    engineSerial: 'D243-98214',
    category: 'B',
    ownerName: 'Məhərrəm Quliyev (Fermer Təsərrüfatı)',
    ownerVoenOrFin: 'VÖEN: 3201498112',
    issueDate: '2026-03-15',
    expiryDate: '2027-03-15',
    safetyScore: 100,
    annualInspectionTalonNumber: 'DAXA-TB-91204',
    securityChecksum: 'SHA256:KTN:B:99-TA-102:91204',
    status: 'valid',
  },
  {
    certificateNumber: 'KTN-TEX-2026-84310',
    daxaDivisionName: 'Şəki Regional DAXA Müfəttişliyi',
    plateNumber: '20-TH-341',
    chassisNumber: 'CLAAS-TUC-450-AZE-12',
    engineSerial: 'OM936LA-55102',
    category: 'F',
    ownerName: '"Şəki Aqropark" QSC',
    ownerVoenOrFin: 'VÖEN: 4100984321',
    issueDate: '2026-02-20',
    expiryDate: '2027-02-20',
    safetyScore: 95,
    annualInspectionTalonNumber: 'DAXA-TB-84310',
    securityChecksum: 'SHA256:KTN:F:20-TH-341:84310',
    status: 'valid',
  },
  {
    certificateNumber: 'KTN-TEX-2026-78152',
    daxaDivisionName: 'Gəncə Regional Aqrotexniki Nəzarət İdarəsi',
    plateNumber: '01-TA-888',
    chassisNumber: '1RW8370AZPC0912',
    engineSerial: 'JD90L-441209',
    category: 'C',
    ownerName: '"Gəncə Taxıl Aqro" MMC',
    ownerVoenOrFin: 'VÖEN: 1802941103',
    issueDate: '2026-01-10',
    expiryDate: '2027-01-10',
    safetyScore: 100,
    annualInspectionTalonNumber: 'DAXA-TB-78152',
    securityChecksum: 'SHA256:KTN:C:01-TA-888:78152',
    status: 'valid',
  },
  {
    certificateNumber: 'KTN-TEX-2026-62049',
    daxaDivisionName: 'Xaçmaz Regional DAXA Aqropark Mərkəzi',
    plateNumber: '50-TM-555',
    chassisNumber: 'JCB3CX-ECO-94812',
    engineSerial: 'Dieselmax-4481',
    category: 'E',
    ownerName: 'Azər Meliorasiya Su Təsərrüfatı ASC',
    ownerVoenOrFin: 'VÖEN: 9900148201',
    issueDate: '2026-04-01',
    expiryDate: '2027-04-01',
    safetyScore: 90,
    annualInspectionTalonNumber: 'DAXA-TB-62049',
    securityChecksum: 'SHA256:KTN:E:50-TM-555:62049',
    status: 'valid',
  },
];
