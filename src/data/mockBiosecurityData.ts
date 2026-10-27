/**
 * Mock Data for AQTA, DGK & Ministry of Agriculture Border Biosecurity & Cold-Chain (Reefer) Portal
 */

import {
  AtpClass,
  PerishableCargoType,
  DisinfectantAgent,
} from '../utils/biosecurityCompliance';

export interface BorderBiosecurityCheckpoint {
  id: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  locationAz: string;
  locationEn: string;
  neighborCountry: string;
  disinfectionArchType: string;
  dailyCapacityTrucks: number;
  currentQueueReefers: number;
  avgInspectionTimeMinutes: number;
  hasPcrRapidLab: boolean;
  coordinates: { lat: number; lng: number };
}

export const MOCK_BIOSECURITY_CHECKPOINTS: BorderBiosecurityCheckpoint[] = [
  {
    id: 'bcp-samur',
    nameAz: 'Samur Gömrük-Sərhəd Buraxılış Məntəqəsi',
    nameEn: 'Samur Border Customs Checkpoint',
    nameRu: 'Таможенный пограничный пункт Самур',
    locationAz: 'Qusar rayonu, Rusiya Federasiyası sərhədi',
    locationEn: 'Qusar district, border with Russian Federation',
    neighborCountry: 'Rusiya Federasiyası',
    disinfectionArchType: 'Avtomatlaşdırılmış Yüksək Təzyiqli Qoşa Qövs (60 bar / QAC)',
    dailyCapacityTrucks: 450,
    currentQueueReefers: 14,
    avgInspectionTimeMinutes: 25,
    hasPcrRapidLab: true,
    coordinates: { lat: 41.6385, lng: 48.4417 },
  },
  {
    id: 'bcp-red-bridge',
    nameAz: 'Qırmızı Körpü Gömrük-Sərhəd Buraxılış Məntəqəsi',
    nameEn: 'Red Bridge Border Customs Checkpoint',
    nameRu: 'Таможенный пограничный пункт Красный Мост',
    locationAz: 'Qazax rayonu, Gürcüstan sərhədi',
    locationEn: 'Qazax district, border with Georgia',
    neighborCountry: 'Gürcüstan',
    disinfectionArchType: 'Elektron Sensorlu Çoxistiqamətli Püskürdücü Baryer (50 bar)',
    dailyCapacityTrucks: 400,
    currentQueueReefers: 11,
    avgInspectionTimeMinutes: 20,
    hasPcrRapidLab: true,
    coordinates: { lat: 41.3312, lng: 45.0745 },
  },
  {
    id: 'bcp-astara',
    nameAz: 'Astara Gömrük-Sərhəd Buraxılış Məntəqəsi',
    nameEn: 'Astara Border Customs Checkpoint',
    nameRu: 'Таможенный пограничный пункт Астара',
    locationAz: 'Astara şəhəri, İran İslam Respublikası sərhədi',
    locationEn: 'Astara city, border with Islamic Republic of Iran',
    neighborCountry: 'İran İslam Respublikası',
    disinfectionArchType: 'Şassi və Təkər Altı İfrat-Təmizləmə Qövsü (ClO₂ / 55 bar)',
    dailyCapacityTrucks: 350,
    currentQueueReefers: 19,
    avgInspectionTimeMinutes: 30,
    hasPcrRapidLab: true,
    coordinates: { lat: 38.4526, lng: 48.8741 },
  },
  {
    id: 'bcp-bilasuvar',
    nameAz: 'Biləsuvar Gömrük-Sərhəd Buraxılış Məntəqəsi',
    nameEn: 'Bilasuvar Border Customs Checkpoint',
    nameRu: 'Таможенный пограничный пункт Билясувар',
    locationAz: 'Biləsuvar rayonu, İran sərhədi',
    locationEn: 'Bilasuvar district, border with Iran',
    neighborCountry: 'İran İslam Respublikası',
    disinfectionArchType: 'Termiki Qızdırılan Qış Baryeri (QAC / 45 bar)',
    dailyCapacityTrucks: 250,
    currentQueueReefers: 8,
    avgInspectionTimeMinutes: 18,
    hasPcrRapidLab: false,
    coordinates: { lat: 39.4608, lng: 48.5484 },
  },
  {
    id: 'bcp-alat-port',
    nameAz: 'Bakı Beynəlxalq Dəniz Ticarət Limanı (Ələt Ro-Pax Terminalı)',
    nameEn: 'Port of Baku (Alat Ro-Pax Ferry Terminal)',
    nameRu: 'Бакинский международный морской торговый порт (Алят Ro-Pax)',
    locationAz: 'Ələt qəsəbəsi, Xəzər dənizi akvatoriyası',
    locationEn: 'Alat settlement, Caspian Sea transit hub',
    neighborCountry: 'Qazaxıstan / Türkmənistan (Xəzər Ro-Ro)',
    disinfectionArchType: 'Gəmi-Rampa Çıxış Sanitariya Kanalı (QAC / 60 bar)',
    dailyCapacityTrucks: 300,
    currentQueueReefers: 6,
    avgInspectionTimeMinutes: 15,
    hasPcrRapidLab: true,
    coordinates: { lat: 39.9983, lng: 49.4045 },
  },
  {
    id: 'bcp-sadarak',
    nameAz: 'Sədərək Gömrük-Sərhəd Buraxılış Məntəqəsi',
    nameEn: 'Sadarak Border Customs Checkpoint',
    nameRu: 'Таможенный пограничный пункт Садарак',
    locationAz: 'Naxçıvan MR, Türkiyə Respublikası sərhədi ("Ümid Körpüsü")',
    locationEn: 'Nakhchivan AR, border with Republic of Turkey',
    neighborCountry: 'Türkiyə Respublikası',
    disinfectionArchType: 'Yüksək Debetli Çiləmə Kompleksi (50 bar)',
    dailyCapacityTrucks: 300,
    currentQueueReefers: 9,
    avgInspectionTimeMinutes: 22,
    hasPcrRapidLab: true,
    coordinates: { lat: 39.7128, lng: 44.8037 },
  },
  {
    id: 'bcp-mazimqara',
    nameAz: 'Mazımqara Gömrük-Sərhəd Buraxılış Məntəqəsi',
    nameEn: 'Mazimgara Border Customs Checkpoint',
    nameRu: 'Таможенный пограничный пункт Мазымгара',
    locationAz: 'Balakən rayonu, Gürcüstan şimal-şərq sərhədi',
    locationEn: 'Balakan district, border with Georgia (North-East)',
    neighborCountry: 'Gürcüstan',
    disinfectionArchType: 'Fitosanitar Avtomatlaşdırılmış Bariyer (40 bar)',
    dailyCapacityTrucks: 180,
    currentQueueReefers: 5,
    avgInspectionTimeMinutes: 17,
    hasPcrRapidLab: false,
    coordinates: { lat: 41.7486, lng: 46.4022 },
  },
];

export interface ReeferPreset {
  id: string;
  nameAz: string;
  nameEn: string;
  plateNumber: string;
  tractorModel: string;
  trailerModel: string;
  atpClass: AtpClass;
  cargoType: PerishableCargoType;
  cargoWeightTons: number;
  measuredTempC: number;
  humidityPercent: number;
  carrierCompany: string;
  originCountry: string;
  destinationCity: string;
  inspectionCheckpointId: string;
}

export const MOCK_REEFER_PRESETS: ReeferPreset[] = [
  {
    id: 'reefer-1',
    nameAz: 'Dondurulmuş Quş Əti Tranziti (FRC)',
    nameEn: 'Deep-Frozen Poultry Transit (FRC)',
    plateNumber: '99-AQ-101',
    tractorModel: 'Volvo FH 500 I-Save Euro-6',
    trailerModel: 'Schmitz Cargobull SKO COOL (Thermo King SLXi 400)',
    atpClass: 'FRC',
    cargoType: 'DEEP_FROZEN_MEAT',
    cargoWeightTons: 21.5,
    measuredTempC: -19.2,
    humidityPercent: 86,
    carrierCompany: 'Silk Way Cold Logistics MMC',
    originCountry: 'Braziliya (Poti Limanı tranziti)',
    destinationCity: 'Bakı Logistika Mərkəzi',
    inspectionCheckpointId: 'bcp-red-bridge',
  },
  {
    id: 'reefer-2',
    nameAz: 'Təzə Pomidor və Gilas İxracı (FNA)',
    nameEn: 'Fresh Tomatoes & Cherries Export (FNA)',
    plateNumber: '10-FR-505',
    tractorModel: 'Mercedes-Benz Actros 1845 LS',
    trailerModel: 'Krone Cool Liner (Carrier Vector 1550)',
    atpClass: 'FNA',
    cargoType: 'FRESH_FRUITS_VEG',
    cargoWeightTons: 19.8,
    measuredTempC: 4.8,
    humidityPercent: 91,
    carrierCompany: 'Aqro-Vest Trans QSC',
    originCountry: 'Azərbaycan (Xaçmaz İstixana Kompleksi)',
    destinationCity: 'Moskva, Rusiya Federasiyası',
    inspectionCheckpointId: 'bcp-samur',
  },
  {
    id: 'reefer-3',
    nameAz: 'Ekvador Banan Koridoru (Soyuq Zədəsi Nəzarəti)',
    nameEn: 'Ecuadorian Banana Corridor (Chilling Injury Control)',
    plateNumber: '77-CC-202',
    tractorModel: 'Scania R450 Streamline Euro-6',
    trailerModel: 'Chereau INOGAM Reefer (Thermo King Advancer A-400)',
    atpClass: 'FNA',
    cargoType: 'TROPICAL_BANANAS',
    cargoWeightTons: 20.4,
    measuredTempC: 13.8,
    humidityPercent: 92,
    carrierCompany: 'Caspian Tropic Express MMC',
    originCountry: 'Ekvador (Bəndər-Abbas vasitəsilə)',
    destinationCity: 'Bakı Meyvəli Bazası',
    inspectionCheckpointId: 'bcp-astara',
  },
  {
    id: 'reefer-4',
    nameAz: 'Soyudulmuş Qara Mal Əti (FRC)',
    nameEn: 'Chilled Prime Beef (FRC)',
    plateNumber: '90-VT-777',
    tractorModel: 'MAN TGX 18.510 EfficientLine 3',
    trailerModel: 'Kögel Cool PurFerro (Carrier Vector 1950 MT)',
    atpClass: 'FRC',
    cargoType: 'CHILLED_BEEF_LAMB',
    cargoWeightTons: 18.2,
    measuredTempC: 1.6,
    humidityPercent: 89,
    carrierCompany: 'Qafqaz Ət Təchizat MMC',
    originCountry: 'Gürcüstan (Kaxeti)',
    destinationCity: 'Sumqayıt Ət Emalı Fabriki',
    inspectionCheckpointId: 'bcp-red-bridge',
  },
  {
    id: 'reefer-5',
    nameAz: 'Biotibbi Peyvəndlər və İnsulin (FRA)',
    nameEn: 'Biomedical Vaccines & Insulin (FRA)',
    plateNumber: '99-FS-303',
    tractorModel: 'DAF XF 480 Super Space Cab',
    trailerModel: 'Lamberet SR2 Heavy Pharma Cold-Chain',
    atpClass: 'FRA',
    cargoType: 'VACCINES_BIOMEDICAL',
    cargoWeightTons: 5.4,
    measuredTempC: 4.1,
    humidityPercent: 58,
    carrierCompany: 'BioPharma Logistics AZ MMC',
    originCountry: 'Almaniya (Frankfurt Tranziti)',
    destinationCity: 'Bakı Mərkəzi Səhiyyə Anbarı',
    inspectionCheckpointId: 'bcp-alat-port',
  },
  {
    id: 'reefer-6',
    nameAz: 'Ultra-Dondurulmuş Dondurma və Desertlər (FRC)',
    nameEn: 'Ultra-Deep Frozen Ice Cream & Desserts (FRC)',
    plateNumber: '10-ZL-888',
    tractorModel: 'Iveco S-Way 490 NP',
    trailerModel: 'Schmitz Cargobull SKO MultiTemp (-25°C)',
    atpClass: 'FRC',
    cargoType: 'ICE_CREAM_FROZEN_CONFECTIONERY',
    cargoWeightTons: 16.5,
    measuredTempC: -23.4,
    humidityPercent: 78,
    carrierCompany: 'Aysberq Şirinlik Daşıma MMC',
    originCountry: 'Türkiyə Respublikası (İzmir)',
    destinationCity: 'Bakı və Abşeron Şəbəkəsi',
    inspectionCheckpointId: 'bcp-sadarak',
  },
];

export interface BiosecurityChecklistItem {
  id: string;
  titleAz: string;
  titleEn: string;
  legalBasis: string;
  category: 'ATP_TECHNICAL' | 'BIOSECURITY_BARRIER' | 'VETERINARY_PHYTOSANITARY';
}

export const BIOSECURITY_CHECKLIST_ITEMS: BiosecurityChecklistItem[] = [
  {
    id: 'chk-1',
    titleAz: 'EN 12830 Rəqəmsal Termoqraf və Fasiləsiz Temperatur Telemetriya Jurnalı',
    titleEn: 'EN 12830 Digital Thermograph & Continuous Temperature Telemetry Log',
    legalBasis: 'UNECE ATP Sazişi Əlavə 2 və Qida Təhlükəsizliyi Qanunu',
    category: 'ATP_TECHNICAL',
  },
  {
    id: 'chk-2',
    titleAz: 'ATP Sertifikat Lövhəsi və İstilik Ötürmə Əmsalı (K ≤ 0.40 W/m²·K)',
    titleEn: 'ATP Certificate Plate & Insulation Heat Transfer Coefficient (K ≤ 0.40 W/m²·K)',
    legalBasis: 'ATP Sazişi Əlavə 1 Bənd 1 (FRC / FRA tələbləri)',
    category: 'ATP_TECHNICAL',
  },
  {
    id: 'chk-3',
    titleAz: 'Qapı Rezin Kipləşdiriciləri, Hava Drenaj Klapanları və Soyuq Axın Hermetikliyi',
    titleEn: 'Door Rubber Seals, Air Drain Valves & Cold Air Flow Hermeticity',
    legalBasis: 'AQTA Sanitar-Gigiyena Qaydaları № 11',
    category: 'ATP_TECHNICAL',
  },
  {
    id: 'chk-4',
    titleAz: 'Avtomatlaşdırılmış Sərhəd Dezinfeksiya Çəpərindən Keçid (≤10 km/saat)',
    titleEn: 'Automated Border Disinfection Arch Transit (Speed ≤10 km/h)',
    legalBasis: 'NK Qərarı № 213 "Sərhəd Keçid Məntəqələrində Sanitariya Rejimi"',
    category: 'BIOSECURITY_BARRIER',
  },
  {
    id: 'chk-5',
    titleAz: 'Təkər Tağları, Şassi və Palçıqqoruyanların 100% Antivirus Çiləmə Örtüyü',
    titleEn: 'Wheel Arches, Chassis & Mudguards 100% Antiviral Spray Coverage',
    legalBasis: 'WOAH Terrestrial Animal Health Code Chapter 4.4',
    category: 'BIOSECURITY_BARRIER',
  },
  {
    id: 'chk-6',
    titleAz: 'Sertifikatlaşdırılmış Dezinfeksiya Məhlulu Konsentrasiyası (QAC ≥1200 ppm / ClO₂ ≥500 ppm)',
    titleEn: 'Certified Disinfectant Concentration (QAC ≥1200 ppm / ClO₂ ≥500 ppm)',
    legalBasis: 'AQTA Dövlət Baytarlıq Nəzarəti Təlimatı',
    category: 'BIOSECURITY_BARRIER',
  },
  {
    id: 'chk-7',
    titleAz: 'Mənşə Ölkəsinin Rəsmi Baytarlıq / Fitosanitar Sertifikatı (Forma 1/2)',
    titleEn: 'Official Veterinary / Phytosanitary Certificate of Origin (Form 1/2)',
    legalBasis: 'IPPC ISPM 12 və Qida Təhlükəsizliyi Qanunu Maddə 24',
    category: 'VETERINARY_PHYTOSANITARY',
  },
  {
    id: 'chk-8',
    titleAz: 'Karantin Zərərvericilərinin Yoxlanışı (Qəhvəyi mərmər bağacığı, meyvə milçəyi)',
    titleEn: 'Quarantine Pest Inspection (Brown Marmorated Stink Bug, Fruit Fly)',
    legalBasis: 'AR Dövlət Fitosanitar Karantin Siyahısı',
    category: 'VETERINARY_PHYTOSANITARY',
  },
  {
    id: 'chk-9',
    titleAz: 'Antibiotik və Pestisid Qalıqlarının MRL Normativinə Uyğunluğu (≤100%)',
    titleEn: 'Antibiotic & Pesticide Residue Maximum Residue Limit (MRL ≤100%)',
    legalBasis: 'Codex Alimentarius & AQTA Qərarı № 34',
    category: 'VETERINARY_PHYTOSANITARY',
  },
  {
    id: 'chk-10',
    titleAz: 'DGK və AQTA İkili Elektron Barkodlu Plomb Nəzarəti (ISO 17712)',
    titleEn: 'DGK & AQTA Dual Electronic Barcoded Security Seal Verification (ISO 17712)',
    legalBasis: 'Gömrük Məcəlləsi Maddə 188 və İXM Maddə 498',
    category: 'VETERINARY_PHYTOSANITARY',
  },
];

export interface BiosecurityExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  questionRu: string;
  optionsAz: string[];
  optionsEn: string[];
  optionsRu: string[];
  correctOptionIndex: number;
  explanationAz: string;
  explanationEn: string;
  legalCitation: string;
}

export const BIOSECURITY_EXAM_QUESTIONS: BiosecurityExamQuestion[] = [
  {
    id: 1,
    questionAz: 'UNECE ATP Sazişinə əsasən, "FRC" dərəcəli dondurulmuş reefer üçün istilik ötürmə əmsalı (K-value) ən çox nə qədər ola bilər?',
    questionEn: 'According to UNECE ATP Agreement, what is the maximum heat transfer coefficient (K-value) for an "FRC" class reefer?',
    questionRu: 'Согласно соглашению СПС/ATP, каков максимальный коэффициент теплопередачи (значение K) для рефрижератора класса "FRC"?',
    optionsAz: ['K ≤ 0.20 W/m²·K', 'K ≤ 0.40 W/m²·K', 'K ≤ 0.70 W/m²·K', 'K ≤ 0.90 W/m²·K'],
    optionsEn: ['K ≤ 0.20 W/m²·K', 'K ≤ 0.40 W/m²·K', 'K ≤ 0.70 W/m²·K', 'K ≤ 0.90 W/m²·K'],
    optionsRu: ['K ≤ 0.20 Вт/м²·К', 'K ≤ 0.40 Вт/м²·К', 'K ≤ 0.70 Вт/м²·К', 'K ≤ 0.90 Вт/м²·К'],
    correctOptionIndex: 1,
    explanationAz: 'FRC və FRA sinifli gücləndirilmiş izolyasiyalı nəqliyyat vasitələri üçün istilik ötürmə əmsalı K ≤ 0.40 W/m²·K olmalıdır.',
    explanationEn: 'Heavy insulated equipment (FRC/FRA) must have a heat transfer coefficient of K ≤ 0.40 W/m²·K.',
    legalCitation: 'UNECE ATP Sazişi Əlavə 1 Bənd 1',
  },
  {
    id: 2,
    questionAz: 'Dərin dondurulmuş ət və quş ətinin beynəlxalq daşınmasında icazə verilən ən yüksək temperatur normativi neçə dərəcədir?',
    questionEn: 'What is the maximum permissible temperature for the international transport of deep-frozen meat and poultry?',
    questionRu: 'Какова максимально допустимая температура при международной перевозке глубокозамороженного мяса и птицы?',
    optionsAz: ['-10°C', '-12°C', '-15°C (qısa fasilələrlə)', '-18°C və ya daha soyuq'],
    optionsEn: ['-10°C', '-12°C', '-15°C (brief fluctuations allowed)', '-18°C or colder'],
    optionsRu: ['-10°C', '-12°C', '-15°C (допускаются краткие колебания)', '-18°C или холоднее'],
    correctOptionIndex: 3,
    explanationAz: 'Dərin dondurulmuş ət üçün standart temperatur -18°C-dir. Yükləmə/boşaltma zamanı qısa müddətə ən çox -15°C-yə qədər artıma icazə verilir.',
    explanationEn: 'Standard baseline is -18°C or colder; brief operational temperature spikes up to -15°C are legally tolerated.',
    legalCitation: 'UNECE ATP Əlavə 2 Şərt A',
  },
  {
    id: 3,
    questionAz: 'Banan və tropik meyvələrin daşınmasında temperatur +12°C-dən aşağı düşərsə hansı ciddi texnoloji fəsad baş verir?',
    questionEn: 'What critical physiological defect occurs if bananas or tropical produce drop below +12°C during transit?',
    questionRu: 'Какой физиологический дефект возникает, если температура бананов при перевозке опускается ниже +12°C?',
    optionsAz: [
      'Meyvələr dərhal çürüyür və maye buraxır',
      'Soyuq zədəsi ("Chilling injury") səbəbindən qabıq qaralır və meyvə yetişmə qabiliyyətini itirir',
      'Meyvənin şəkərliliyi həddən artıq yüksəlir',
      'Heç bir dəyişiklik baş vermir, saxlama müddəti artır',
    ],
    optionsEn: [
      'Produce rots immediately and liquifies',
      'Chilling injury occurs causing skin blackening and permanent loss of ripening ability',
      'Sugar content rises excessively',
      'No effect, shelf life is prolonged',
    ],
    optionsRu: [
      'Плоды немедленно загнивают',
      'Холодовое повреждение (Chilling injury), кожура чернеет и плод теряет способность созревать',
      'Сахаристость резко возрастает',
      'Никакого эффекта, срок хранения продлевается',
    ],
    correctOptionIndex: 1,
    explanationAz: 'Bananlar tropik meyvə olduğundan +12°C-dən aşağıda hüceyrə strukturu pozulur (chilling injury), qabığı bozarır və qaz kameralarında yetişmir.',
    explanationEn: 'Bananas are susceptible to chilling injury below +12°C, causing irreversible peel discoloration and inability to ripen properly.',
    legalCitation: 'FAO & ATP Meyvə Daşıma Təlimatları',
  },
  {
    id: 4,
    questionAz: 'Sərhəd bioloji təhlükəsizlik dezinfeksiya çəpərindən keçərkən avtomobilin maksimal hərəkət sürəti nə qədər olmalıdır?',
    questionEn: 'What is the maximum vehicle transit speed through a border biosecurity disinfection arch?',
    questionRu: 'Какова максимальная скорость движения автомобиля через пограничный дезинфекционный барьер?',
    optionsAz: ['≤ 10 km/saat', '≤ 25 km/saat', '≤ 40 km/saat', 'Sürət məhdudiyyəti yoxdur'],
    optionsEn: ['≤ 10 km/h', '≤ 25 km/h', '≤ 40 km/h', 'No speed restriction'],
    optionsRu: ['≤ 10 км/ч', '≤ 25 км/ч', '≤ 40 км/ч', 'Нет ограничений по скорости'],
    correctOptionIndex: 0,
    explanationAz: 'Dezinfeksiya məhlulunun təkər və şassiyə tam təmas etməsi üçün sürət 10 km/saatdan artıq olmamalıdır.',
    explanationEn: 'Speed must not exceed 10 km/h to allow 100% spray coverage and sufficient chemical contact time.',
    legalCitation: 'Nazirlər Kabinetinin 213 №-li Qərarı',
  },
  {
    id: 5,
    questionAz: 'AQTA qaydalarına görə hansı zərərverici növü ölkəyə daxil olan bitki məhsullarında aşkarlandıqda partiya dərhal karantinə alınır və ya məhv edilir?',
    questionEn: 'According to AQTA rules, detection of which quarantine pest triggers an immediate quarantine hold or destruction of produce?',
    questionRu: 'Обнаружение какого карантинного вредителя приводит к немедленному задержанию или уничтожению партии?',
    optionsAz: [
      'Adi tor gənəsi',
      'Qəhvəyi mərmər bağacığı (Halyomorpha halys)',
      'Şirə biti (Aphid)',
      'Torpaq qurdu',
    ],
    optionsEn: [
      'Common spider mite',
      'Brown Marmorated Stink Bug (Halyomorpha halys)',
      'Common aphid',
      'Earthworm',
    ],
    optionsRu: [
      'Обыкновенный паутинный клещ',
      'Коричнево-мраморный клоп (Halyomorpha halys)',
      'Обыкновенная тля',
      'Дождевой червь',
    ],
    correctOptionIndex: 1,
    explanationAz: 'Qəhvəyi mərmər bağacığı (Halyomorpha halys) AR ərazisində ciddi karantin obyektidir və aşkarlandıqda bütün yük saxlanılır.',
    explanationEn: 'Brown Marmorated Stink Bug is a high-priority quarantine pest causing catastrophic agricultural damage.',
    legalCitation: 'AQTA Fitosanitar Karantin Qaydaları',
  },
  {
    id: 6,
    questionAz: 'EN 12830 standartına uyğun temperatur qeydedici cihazının (termoqraf) məlumat saxlama müddəti ən azı nə qədər olmalıdır?',
    questionEn: 'Under EN 12830 standard, what is the minimum duration a temperature recorder must store data logs?',
    questionRu: 'Каков минимальный срок хранения данных регистратора температуры в соответствии со стандартом EN 12830?',
    optionsAz: ['Ən azı 7 gün', 'Ən azı 30 gün', 'Ən azı 1 il', 'Yalnız səfər bitənə qədər'],
    optionsEn: ['At least 7 days', 'At least 30 days', 'At least 1 year', 'Only until trip completion'],
    optionsRu: ['Не менее 7 дней', 'Не менее 30 дней', 'Не менее 1 года', 'Только до окончания рейса'],
    correctOptionIndex: 2,
    explanationAz: 'EN 12830 standartı dondurulmuş və soyudulmuş yüklərin temperatur tarixçəsinin ən azı 1 il yaddaşda saxlanılmasını tələb edir.',
    explanationEn: 'EN 12830 mandates that temperature telemetry logs must be safely stored for at least 1 year for traceability and audit.',
    legalCitation: 'EN 12830 / EN 13486 Avropa Standartı',
  },
  {
    id: 7,
    questionAz: 'Ət məhsullarında baytarlıq laboratoriyası tərəfindən antibiotik qalıqlarının maksimal həddi (MRL) adətən nə qədər müəyyən edilir?',
    questionEn: 'What is the maximum residue limit (MRL) threshold for veterinary antibiotics typically enforced in meat testing?',
    questionRu: 'Каков типичный максимальный предел остаточного содержания (MRL) антибиотиков при анализе мяса?',
    optionsAz: ['≤ 50 ppb (hissəcik milyardda)', '≤ 500 ppm', '≤ 5 %', 'Məhdudiyyət qoyulmur'],
    optionsEn: ['≤ 50 ppb (parts per billion)', '≤ 500 ppm', '≤ 5 %', 'No restriction enforced'],
    optionsRu: ['≤ 50 ppb (частей на миллиард)', '≤ 500 ppm', '≤ 5 %', 'Ограничений нет'],
    correctOptionIndex: 0,
    explanationAz: 'Baytarlıq antibiotikləri üçün normativ adətən 50 ppb (0.05 mg/kg) səviyyəsində tənzimlənir.',
    explanationEn: 'Veterinary antibiotic residues are strictly regulated at trace levels, typically ≤ 50 ppb (0.05 mg/kg).',
    legalCitation: 'Codex Alimentarius & AQTA Gigiyena Tələbləri',
  },
  {
    id: 8,
    questionAz: 'Qida məhsulları daşıyan reeferin iç divarlarının təmizliyi və yuyulması üçün hansı tələb məcburidir?',
    questionEn: 'Which requirement is mandatory for washing and sanitizing the interior walls of a food reefer?',
    questionRu: 'Какое требование обязательно при мойке и дезинфекции внутренних стенок пищевого рефрижератора?',
    optionsAz: [
      'Adi çay suyu ilə yaxalamaq kifayətdir',
      'Qida ilə təmasa yararlı sertifikatlı dezinfektantla yuyulmalı və qalıq qoxu buraxmamalıdır',
      'Yalnız xlorlu əhənglə ağardılmalıdır',
      'Heç vaxt yuyulmamalıdır, buzlanma kifayətdir',
    ],
    optionsEn: [
      'Rinsing with river water is sufficient',
      'Must be sanitized with food-contact certified detergent and leave zero chemical or foreign odor',
      'Must be whitewashed with chlorinated lime',
      'Must never be washed; frosting is adequate',
    ],
    optionsRu: [
      'Достаточно ополоснуть речной водой',
      'Обработка сертифицированным дезинфектантом, пригодным для контакта с пищевыми продуктами, без запаха',
      'Только побелка хлорной известью',
      'Никогда не мыть',
    ],
    correctOptionIndex: 1,
    explanationAz: 'Furqonun daxili səthi qida təhlükəsizliyi sertifikatlı məhlulla təmizlənməli, yad qoxu və allergen izləri qalmamalıdır.',
    explanationEn: 'Reefer cargo bays must be washed with food-grade non-tainting sanitizers with zero toxic residue.',
    legalCitation: 'AQTA Sanitar Tələblər Maddə 18',
  },
  {
    id: 9,
    questionAz: 'Bioloji təhlükəsizlik baryerində istifadə edilən "Dördlü Ammonium Birləşməsi" (QAC) hansı əsas üstünlüyə malikdir?',
    questionEn: 'What is the primary advantage of Quaternary Ammonium Compounds (QAC) used in biosecurity spray arches?',
    questionRu: 'Каково главное преимущество четвертичных аммониевых соединений (ЧАС), используемых в биодезбарьерах?',
    optionsAz: [
      'Metalı tez aşındırır',
      'Geniş spektrli bakterisid və virulisid təsirə malikdir, metalı korroziyaya uğratmır',
      'Tez buxarlanaraq təsirini dərhal itirir',
      'Yalnız bitkilərə qarşı təsirlidir',
    ],
    optionsEn: [
      'It quickly corrodes steel',
      'Broad spectrum bactericidal & virucidal efficacy without corrosive harm to truck chassis',
      'Evaporates instantly with no residual effect',
      'Only effective against weeds',
    ],
    optionsRu: [
      'Быстро разъедает металл',
      'Широкий спектр бактерицидного и вирулицидного действия, не вызывает коррозии шасси',
      'Мгновенно испаряется без эффекта',
      'Действует только на сорняки',
    ],
    correctOptionIndex: 1,
    explanationAz: 'QAC dezinfektantları avtomobil şassisi və təkərlərini zədələmədən təhlükəli virusları (aftoz, quş qripi) effektiv neytrallaşdırır.',
    explanationEn: 'QACs offer broad-spectrum pathogen neutralization while remaining non-corrosive to vehicle suspension and electrical harnesses.',
    legalCitation: 'WOAH Terrestrial Manual Disinfection Standards',
  },
  {
    id: 10,
    questionAz: 'AQTA-BIO elektron bioloji təhlükəsizlik sertifikatı hansı dövlət orqanları ilə real vaxtda sinxronlaşdırılır?',
    questionEn: 'With which state bodies is the AQTA-BIO electronic biosecurity certificate synchronized in real-time?',
    questionRu: 'С какими государственными органами синхронизируется электронный сертификат биобезопасности AQTA-BIO в реальном времени?',
    optionsAz: [
      'Yalnız bələdiyyələrlə',
      'AQTA, Dövlət Gömrük Komitəsi (DGK) və Kənd Təsərrüfatı Nazirliyi (KTN)',
      'Yalnız xarici səfirliklərlə',
      'Heç bir orqanla sinxronlaşdırılmır',
    ],
    optionsEn: [
      'Only municipalities',
      'Food Safety Agency (AQTA), State Customs Committee (DGK), and Ministry of Agriculture (KTN)',
      'Only foreign embassies',
      'Not synchronized with any authority',
    ],
    optionsRu: [
      'Только с муниципалитетами',
      'Агентство пищевой безопасности (AQTA), Государственный таможенный комитет (ГТК) и Минсельхоз (КТН)',
      'Только с иностранными посольствами',
      'Ни с кем не синхронизируется',
    ],
    correctOptionIndex: 1,
    explanationAz: 'AQTA-BIO elektron sistemi "Bir Pəncərə" (Single Window) çərçivəsində AQTA, DGK və KTN vahid bazasına inteqrasiya olunub.',
    explanationEn: 'The AQTA-BIO clearance is interlinked via the Unified State Single Window connecting AQTA, Customs, and Agriculture.',
    legalCitation: 'Prezident Fərmanı: "Bir Pəncərə" İnteqrasiyası',
  },
];

export interface VerifiedBiosecurityCertificate {
  certificateSerial: string;
  plateNumber: string;
  tractorTrailer: string;
  carrierCompany: string;
  cargoType: PerishableCargoType;
  atpClass: AtpClass;
  measuredTempC: number;
  checkpointName: string;
  issueDate: string;
  expiryDate: string;
  disinfectionPassed: boolean;
  quarantineLabStatus: 'APPROVED' | 'CONDITIONAL_HOLD' | 'REJECTED';
  inspectorName: string;
  inspectorBadge: string;
  securityHash: string;
  simaSignatureUid: string;
}

export const MOCK_VERIFIED_BIOSECURITY_CERTIFICATES: VerifiedBiosecurityCertificate[] = [
  {
    certificateSerial: 'AQTA-BIO-2026-48192',
    plateNumber: '99-AQ-101',
    tractorTrailer: 'Volvo FH 500 / Schmitz SKO COOL',
    carrierCompany: 'Silk Way Cold Logistics MMC',
    cargoType: 'DEEP_FROZEN_MEAT',
    atpClass: 'FRC',
    measuredTempC: -19.2,
    checkpointName: 'Qırmızı Körpü Gömrük-Sərhəd Buraxılış Məntəqəsi',
    issueDate: '2026-10-25 09:40',
    expiryDate: '2026-11-25 23:59',
    disinfectionPassed: true,
    quarantineLabStatus: 'APPROVED',
    inspectorName: 'Baytarlıq Baş Müfəttişi Rövşən Məmmədov',
    inspectorBadge: 'AQTA-VET-771',
    securityHash: '0x4f9a12c8b7e3d109f5a',
    simaSignatureUid: 'SIMA-AZ-VET-99214',
  },
  {
    certificateSerial: 'AQTA-BIO-2026-92841',
    plateNumber: '10-FR-505',
    tractorTrailer: 'Mercedes Actros 1845 / Krone Cool Liner',
    carrierCompany: 'Aqro-Vest Trans QSC',
    cargoType: 'FRESH_FRUITS_VEG',
    atpClass: 'FNA',
    measuredTempC: 4.8,
    checkpointName: 'Samur Gömrük-Sərhəd Buraxılış Məntəqəsi',
    issueDate: '2026-10-26 14:15',
    expiryDate: '2026-11-26 23:59',
    disinfectionPassed: true,
    quarantineLabStatus: 'APPROVED',
    inspectorName: 'Fitosanitar Baş Müfəttişi Günel Əliyeva',
    inspectorBadge: 'AQTA-FTO-314',
    securityHash: '0x81b49f2ca07e63b15dc',
    simaSignatureUid: 'SIMA-AZ-FTO-10842',
  },
  {
    certificateSerial: 'AQTA-BIO-2026-61034',
    plateNumber: '77-CC-202',
    tractorTrailer: 'Scania R450 / Chereau INOGAM',
    carrierCompany: 'Caspian Tropic Express MMC',
    cargoType: 'TROPICAL_BANANAS',
    atpClass: 'FNA',
    measuredTempC: 13.8,
    checkpointName: 'Astara Gömrük-Sərhəd Buraxılış Məntəqəsi',
    issueDate: '2026-10-27 11:20',
    expiryDate: '2026-11-27 23:59',
    disinfectionPassed: true,
    quarantineLabStatus: 'APPROVED',
    inspectorName: 'Qida Təhlükəsizliyi Müfəttişi Fərid Qasımov',
    inspectorBadge: 'AQTA-FTO-889',
    securityHash: '0x9924c8da117b3ef652a',
    simaSignatureUid: 'SIMA-AZ-BIO-44190',
  },
];
