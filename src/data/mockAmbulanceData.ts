import {
  AmbulanceChecklistItem,
  AmbulanceVehiclePreset,
  EmsSubstation,
  RescueCorridorScenario,
  EmsExamQuestion,
  AmbulancePermitRecord
} from '../utils/ambulanceCompliance';

export const AMBULANCE_CHECKLIST_ITEMS: AmbulanceChecklistItem[] = [
  {
    id: 'stretcher_retention',
    labelAz: '10g Toqquşma Sertifikatlı Əsas və Əlavə Xərəklər (EN 1789)',
    labelEn: '10g Crash-Certified Main & Secondary Stretchers (EN 1789)',
    labelRu: 'Основные и складные носилки с сертификатом ударопрочности 10g (EN 1789)',
    category: 'mechanical',
    requiredForClasses: ['class_a', 'class_b', 'class_c'],
    penaltyAzn: 150,
    penaltyPoints: 0,
    legalBasis: 'YHQ Əlavə 1 Bənd 7.14 & EN 1789 Mad. 4.4'
  },
  {
    id: 'oxygen_system',
    labelAz: 'Mərkəzi Tibbi Oksigen Sistemi (2x 10L / 200 bar & reduktor)',
    labelEn: 'Central Medical Oxygen System (2x 10L / 200 bar & regulators)',
    labelRu: 'Центральная система подачи кислорода (2x 10L / 200 bar с редукторами)',
    category: 'medical',
    requiredForClasses: ['class_a', 'class_b', 'class_c'],
    penaltyAzn: 150,
    penaltyPoints: 0,
    legalBasis: 'TƏBİB Tibbi Təchizat Standartı & EN 1789'
  },
  {
    id: 'defibrillator_ecg',
    labelAz: 'Bifazik Defibrilyator-Monitor və 12-Kanal Telemetrik EKQ',
    labelEn: 'Biphasic Defibrillator-Monitor & 12-Lead Telemetric ECG',
    labelRu: 'Бифазный дефибриллятор-монитор и 12-канальный телеметрический ЭКГ',
    category: 'medical',
    requiredForClasses: ['class_b', 'class_c'],
    penaltyAzn: 200,
    penaltyPoints: 0,
    legalBasis: 'TƏBİB Təcili Tibbi Yardım Reqlamenti'
  },
  {
    id: 'transport_ventilator',
    labelAz: 'Süni Tənəffüs Aparatı (IVL / CPAP / PEEP) & Daşına bilən Aspirator',
    labelEn: 'Transport Mechanical Ventilator (IPPV/CPAP/PEEP) & Portable Suction',
    labelRu: 'Транспортный аппарат ИВЛ (IPPV/CPAP) и портативный электроотсос',
    category: 'medical',
    requiredForClasses: ['class_c'],
    penaltyAzn: 300,
    penaltyPoints: 0,
    legalBasis: 'EN 1789 Class C Reanimomobil Tələbi'
  },
  {
    id: 'syringe_infusion_pump',
    labelAz: 'Elektron Şprisli İnfuziya Pompası & Çoxfunksiyalı Perfuzor',
    labelEn: 'Electronic Syringe Infusion Pump & Multi-Channel Perfusor',
    labelRu: 'Электронный шприцевой дозатор и инфузионный насос',
    category: 'medical',
    requiredForClasses: ['class_c'],
    penaltyAzn: 250,
    penaltyPoints: 0,
    legalBasis: 'TƏBİB İntensiv Terapiya Protokolu'
  },
  {
    id: 'hepa_climate_sanitization',
    labelAz: 'Tibbi Bölmədə Müstəqil İqlim Nəzarəti & HEPA Bakterial Filtrləmə',
    labelEn: 'Independent Medical Cabin HVAC & HEPA Antibacterial Filtration',
    labelRu: 'Автономная климатическая система и HEPA-фильтрация медицинского отсека',
    category: 'mechanical',
    requiredForClasses: ['class_b', 'class_c'],
    penaltyAzn: 100,
    penaltyPoints: 0,
    legalBasis: 'Sanitariya-Epidemioloji Normalar & EN 1789'
  },
  {
    id: 'auxiliary_inverter_shoreline',
    labelAz: '220V Saf Sinus İnvertor Sistemi & Xarici Şəbəkə Qidalanma Rozetkası',
    labelEn: '220V Pure Sine Inverter & External Shoreline 230V Socket',
    labelRu: 'Инверторная система 220V чистый синус и внешний ввод питания',
    category: 'electrical',
    requiredForClasses: ['class_b', 'class_c'],
    penaltyAzn: 150,
    penaltyPoints: 0,
    legalBasis: 'AZS EN 1789 Bənd 5.3 Elektrik Təhlükəsizliyi'
  },
  {
    id: 'blue_beacons_siren',
    labelAz: '360° Göy LED Sayrışan Mayak & 100W Polifonik Siren (110–120 dBA)',
    labelEn: '360° Blue LED Warning Beacon Bar & 100W Multi-Tone Siren (110–120 dBA)',
    labelRu: 'Светодиодная балка синего цвета 360° и СГУ мощностью 100 Вт (110–120 дБА)',
    category: 'identification',
    requiredForClasses: ['class_a', 'class_b', 'class_c'],
    penaltyAzn: 500,
    penaltyPoints: 0,
    legalBasis: 'YHQ Maddə 48 & İXM Maddə 342.9'
  },
  {
    id: 'battenburg_retroreflective',
    labelAz: 'Battenburg Yüksək Görünüşlü Flüo-Sarı/Yaşıl Şevron İşarələnməsi',
    labelEn: 'High-Visibility Fluorescent Yellow/Green Battenburg Chevron Livery',
    labelRu: 'Высококонтрастная флуоресцентная маркировка шевронами Battenburg',
    category: 'identification',
    requiredForClasses: ['class_a', 'class_b', 'class_c'],
    penaltyAzn: 80,
    penaltyPoints: 0,
    legalBasis: 'DİN & BDYP Operativ Nəqliyyat Qaydaları'
  },
  {
    id: 'certified_driver_ems',
    labelAz: 'Sürücünün Xüsusi Fövqəladə Sürmə və İlk Tibbi Yardım Attestasiyası',
    labelEn: 'Driver Certified Emergency Response Driving & BLS Medical Attestation',
    labelRu: 'Аттестация водителя по экстремальному вождению и первой помощи',
    category: 'personnel',
    requiredForClasses: ['class_a', 'class_b', 'class_c'],
    penaltyAzn: 100,
    penaltyPoints: 3,
    legalBasis: 'YHQ Maddə 34 & TƏBİB Kadr Təlimatı'
  }
];

export const AMBULANCE_PRESETS: AmbulanceVehiclePreset[] = [
  {
    id: 'sprinter_class_c',
    name: 'Mercedes-Benz Sprinter 319 CDI Reanimomobil',
    make: 'Mercedes-Benz',
    model: 'Sprinter 319 CDI',
    year: 2024,
    vehicleClass: 'class_c',
    ambulanceType: 'Mobil İntensiv Terapiya və Reanimasiya (Klass C)',
    plate: '99-JH-103',
    vin: 'WDB9066351S892103',
    engine: '3.0L V6 CDI (190 a.g.)',
    baseCostAzn: 185000,
    typicalEquipment: [
      'Hamilton T1 Nəqliyyat IVL',
      'Corpuls 3 Defibrilyator-Monitor',
      'BBraun Perfüzor',
      'Stryker Power-PRO Hidravlik Xərək'
    ]
  },
  {
    id: 'transit_class_b',
    name: 'Ford Transit 350L Təcili Yardım Ambulansı',
    make: 'Ford',
    model: 'Transit 350L',
    year: 2023,
    vehicleClass: 'class_b',
    ambulanceType: 'Xətti Təcili Tibbi Yardım Ambulansı (Klass B)',
    plate: '10-PA-103',
    vin: 'WF0XXXTTFXPB10344',
    engine: '2.0L EcoBlue Diesel (170 a.g.)',
    baseCostAzn: 135000,
    typicalEquipment: [
      'Zoll AED Plus Defibrilyator',
      'Weinmann Medumat Standard IVL',
      'Fernox Çoxfunksiyalı Xərək'
    ]
  },
  {
    id: 'hiace_class_a',
    name: 'Toyota HiAce Commuter Pasient Daşıyıcı',
    make: 'Toyota',
    model: 'HiAce Commuter',
    year: 2022,
    vehicleClass: 'class_a',
    ambulanceType: 'Xəstəxana-arası Pasient Daşıma Nəqliyyatı (Klass A)',
    plate: '77-EM-103',
    vin: 'JTFFX22P70010398',
    engine: '2.8L D-4D Diesel (177 a.g.)',
    baseCostAzn: 95000,
    typicalEquipment: [
      'Standart Təkərli Xərək',
      'Oksigen İnhalyatoru',
      'İlk Yardım Çantası'
    ]
  },
  {
    id: 'staria_class_b',
    name: 'Hyundai Staria Lounge EMS Express',
    make: 'Hyundai',
    model: 'Staria Lounge EMS',
    year: 2024,
    vehicleClass: 'class_b',
    ambulanceType: 'Şəhərdaxili Çevik Təcili Yardım (Klass B)',
    plate: '90-TT-103',
    vin: 'KMHFH81WBPA10377',
    engine: '2.2L CRDi Diesel (177 a.g.)',
    baseCostAzn: 125000,
    typicalEquipment: [
      'Mindray BeneHeart D3 Defibrilyator',
      'Mərkəzi Oksigen Paneli',
      'Mobil Kardiomonitor'
    ]
  },
  {
    id: 'iveco_class_c_box',
    name: 'Iveco Daily 50C18 Box Neonatal Reanimasiya',
    make: 'Iveco',
    model: 'Daily 50C18 Box',
    year: 2025,
    vehicleClass: 'class_c',
    ambulanceType: 'Yenidoğulmuşlar üçün Xüsusi Neonatal Reanimomobil',
    plate: '99-NR-103',
    vin: 'ZCFC50A200510366',
    engine: '3.0L HPI Diesel (180 a.g.)',
    baseCostAzn: 220000,
    typicalEquipment: [
      'Atom İncubator Neonatal Küvez',
      'Fabian HFO Süni Tənəffüs',
      'Pnevmatik Asqılı Amortizasiya Platforması'
    ]
  },
  {
    id: 'uaz_patriot_mountain_4x4',
    name: 'UAZ Patriot EMS 4x4 Dağlıq Relyef Ambulansı',
    make: 'UAZ',
    model: 'Patriot 3163 EMS',
    year: 2023,
    vehicleClass: 'class_b',
    ambulanceType: 'Dağlıq və Çətin Keçilən Rayon Ambulansı (Klass B)',
    plate: '50-TY-103',
    vin: 'XTT316300P010389',
    engine: '2.7L ZMZ Pro Benzin (150 a.g.) 4x4',
    baseCostAzn: 75000,
    typicalEquipment: [
      'Amortizasiyalı Dağ Xərəyi',
      'Portativ Şok Defibrilyator',
      'Diferensial Kilidi & Qoruyucu Karkas'
    ]
  }
];

export const EMS_SUBSTATIONS: EmsSubstation[] = [
  {
    id: 'station_1_central',
    nameAz: '1 saylı Mərkəzi Təcili Tibbi Yardım Stansiyası',
    nameEn: '#1 Central Emergency Medical Services Station',
    nameRu: 'Центральная станция скорой медицинской помощи №1',
    addressAz: 'Bakı şəh., Səbail r-nu, Nizami küç. 14',
    addressEn: 'Baku, Sabail district, Nizami st. 14',
    addressRu: 'г. Баку, Сабаильский р-н, ул. Низами 14',
    region: 'Baku',
    phone: '+994 (12) 103-01',
    activeAmbulances: 18,
    avgResponseMinutes: 6.8,
    chiefPhysician: 'Dr. Rəşad Məmmədov'
  },
  {
    id: 'station_2_yasaml',
    nameAz: '2 saylı Yasamal Təcili Tibbi Yardım Stansiyası',
    nameEn: '#2 Yasamal Emergency Medical Services Station',
    nameRu: 'Ясамальская станция скорой медицинской помощи №2',
    addressAz: 'Bakı şəh., Yasamal r-nu, Tbilisi prospekti 65',
    addressEn: 'Baku, Yasamal district, Tbilisi Ave 65',
    addressRu: 'г. Баку, Ясамальский р-н, Тбилисский проспект 65',
    region: 'Baku',
    phone: '+994 (12) 103-02',
    activeAmbulances: 14,
    avgResponseMinutes: 7.2,
    chiefPhysician: 'Dr. Samirə Əliyeva'
  },
  {
    id: 'station_4_narimanov',
    nameAz: '4 saylı Nərimanov Reanimasiya Sub-Stansiyası',
    nameEn: '#4 Narimanov Resuscitation Sub-Station',
    nameRu: 'Наримановская реанимационная подстанция №4',
    addressAz: 'Bakı şəh., Nərimanov r-nu, Heydər Əliyev pr. 115',
    addressEn: 'Baku, Narimanov district, Heydar Aliyev Ave 115',
    addressRu: 'г. Баку, Наримановский р-н, пр. Гейдара Алиева 115',
    region: 'Baku',
    phone: '+994 (12) 103-04',
    activeAmbulances: 16,
    avgResponseMinutes: 6.4,
    chiefPhysician: 'Dr. İlqar Quliyev'
  },
  {
    id: 'station_7_khatai',
    nameAz: '7 saylı Xətai & Ağ Şəhər Təcili Yardım Bölməsi',
    nameEn: '#7 Khatai & White City Emergency Medical Unit',
    nameRu: 'Хатаинское отделение скорой помощи №7 (Белый город)',
    addressAz: 'Bakı şəh., Xətai r-nu, Nobel pr. / 8 Noyabr pr. 23',
    addressEn: 'Baku, Khatai district, 8 November Ave 23',
    addressRu: 'г. Баку, Хатаинский р-н, пр. 8 Ноября 23',
    region: 'Baku',
    phone: '+994 (12) 103-07',
    activeAmbulances: 12,
    avgResponseMinutes: 7.0,
    chiefPhysician: 'Dr. Nərgiz Həsənova'
  },
  {
    id: 'station_sumgayit',
    nameAz: 'Sumqayıt Şəhər Təcili və Təxirəsalınmaz Tibbi Yardım Stansiyası',
    nameEn: 'Sumgayit City Emergency & Urgent Medical Aid Station',
    nameRu: 'Сумгаитская городская станция скорой помощи',
    addressAz: 'Sumqayıt şəh., Sülh küç. 45-ci məhəllə',
    addressEn: 'Sumgayit city, Sulh st. 45th block',
    addressRu: 'г. Сумгаит, ул. Сюльх, 45-й квартал',
    region: 'Sumgayit',
    phone: '+994 (18) 655-10-03',
    activeAmbulances: 15,
    avgResponseMinutes: 8.1,
    chiefPhysician: 'Dr. Fərid Nəzərov'
  },
  {
    id: 'station_ganja',
    nameAz: 'Gəncə Regional Təcili Tibbi Yardım və Travma Mərkəzi',
    nameEn: 'Ganja Regional Emergency Aid & Trauma Center',
    nameRu: 'Гянджинский региональный центр скорой помощи и травмы',
    addressAz: 'Gəncə şəh., Şah İsmayıl Xətai pr. 102',
    addressEn: 'Ganja city, Shah Ismail Khatai Ave 102',
    addressRu: 'г. Гянджа, пр. Шаха Исмаила Хатаи 102',
    region: 'Ganja',
    phone: '+994 (22) 256-10-03',
    activeAmbulances: 20,
    avgResponseMinutes: 7.9,
    chiefPhysician: 'Dr. Vüqar İsmayılov'
  }
];

export const RESCUE_CORRIDOR_SCENARIOS: RescueCorridorScenario[] = [
  {
    id: 'corridor_3_lanes',
    titleAz: '3 Zolaqlı Şəhər Magistralı (Heydər Əliyev və ya Ziya Bünyadov pr.)',
    titleEn: '3-Lane Urban Expressway (Heydar Aliyev or Ziya Bunyadov Ave)',
    titleRu: '3-полосная городская магистраль (пр. Гейдара Алиева)',
    roadType: '3 Zolaqlı Avtomagistral',
    lanesCount: 3,
    descriptionAz: 'Tıxac və ya sıx hərəkət zamanı arxadan göy sayrışan mayak və siren ilə 103 Reanimomobili yaxınlaşır.',
    descriptionEn: 'During heavy traffic or gridlock, a Class C 103 resuscitation ambulance approaches with blue beacon and siren.',
    descriptionRu: 'При плотном потоке или заторах сзади приближается реанимобиль 103 с включенным синим маяком и сиреной.',
    correctDriverActionAz: '1-ci (sol) zolaqdakı sürücülər dərhal mümkün qədər sola sıxılmalı, 2-ci və 3-cü zolaqdakılar isə sağa sıxılmalıdır. 1-ci və 2-ci zolaqlar arasında "Həyat Dəhlizi" açılmalıdır.',
    correctDriverActionEn: 'Vehicles in lane 1 (far left) steer hard left, while lanes 2 and 3 steer right, opening a central Rescue Corridor between lane 1 and 2.',
    correctDriverActionRu: 'Водители крайней левой полосы прижимаются максимально влево, а 2-й и 3-й полос — вправо, образуя центральный коридор спасения.',
    legalPenaltyAzn: 100,
    legalPenaltyPoints: 3,
    legalArticle: 'İXM Maddə 327.3 & YHQ Maddə 42'
  },
  {
    id: 'corridor_2_lanes',
    titleAz: '2 Zolaqlı Şəhərdaxili Küçə (Tbilisi pr. və ya İnşaatçılar pr.)',
    titleEn: '2-Lane Urban Thoroughfare (Tbilisi Ave or Inshaatchilar Ave)',
    titleRu: '2-полосная городская улица (Тбилисский проспект)',
    roadType: '2 Zolaqlı Yol',
    lanesCount: 2,
    descriptionAz: 'Hər istiqamətdə 2 hərəkət zolağı olan yolda təcili yardım çağırışa tələsir.',
    descriptionEn: 'On a dual-lane roadway, emergency ambulance is responding to an urgent code red distress call.',
    descriptionRu: 'На двухполосной дороге скорая помощь спешит на экстренный вызов с звуковой сигнализацией.',
    correctDriverActionAz: 'Sol zolaqdakı avtomobil sola, sağ zolaqdakı avtomobil tam sağ kənara çıxaraq orta xətti sərbəst buraxır.',
    correctDriverActionEn: 'Left lane vehicles shift fully left; right lane shifts tightly to the right shoulder, leaving the lane divider clear.',
    correctDriverActionRu: 'Левая полоса смещается влево, правая полоса максимально вправо, освобождая осевую полосу.',
    legalPenaltyAzn: 100,
    legalPenaltyPoints: 3,
    legalArticle: 'İXM Maddə 327.3 & YHQ Maddə 42'
  },
  {
    id: 'corridor_red_light',
    titleAz: 'İşıqforun Qırmızı İşığı Qarşısında Dayanan Avtomobillər',
    titleEn: 'Vehicles Stopped at a Red Traffic Signal',
    titleRu: 'Автомобили на запрещающий красный сигнал светофора',
    roadType: 'Tənzimlənən Yolayrıcı',
    lanesCount: 3,
    descriptionAz: 'Qırmızı işıqda dayanan avtomobillərin arxasında təcili reanimasiya maşını təcili keçid tələb edir.',
    descriptionEn: 'An ambulance requires immediate passage behind a row of vehicles stopped at a red signal.',
    descriptionRu: 'Реанимобиль требует проезда за автомобилями, остановившимися на красный сигнал светофора.',
    correctDriverActionAz: 'Öndə dayanan sürücülər piyada və digər hərəkət iştirakçılarının təhlükəsizliyini təmin edərək ehtiyatla irəli-sağa və ya sola manevr edərək ambulansa yol verməlidir (Kamera cəriməsi avtomatik ləğv edilir).',
    correctDriverActionEn: 'Front drivers carefully roll forward to the sides without endangering cross traffic to yield; ANPR radar camera tickets are automatically exonerated.',
    correctDriverActionRu: 'Водители впереди осторожно смещаются вперед и в стороны для пропуска скорой; штраф камеры за стоп-линию аннулируется.',
    legalPenaltyAzn: 100,
    legalPenaltyPoints: 3,
    legalArticle: 'YHQ Maddə 42.2 & İXM Maddə 327.3'
  },
  {
    id: 'corridor_tunnel',
    titleAz: 'Tunel və ya Estakada Körpü Sahəsi (Məs: Bağırov və ya Qələbə dairəsi)',
    titleEn: 'Tunnel or Elevated Flyover Section (e.g. Baghirov Tunnel)',
    titleRu: 'Туннель или эстакадный путепровод (Багировский мост)',
    roadType: 'Tunel / Qapalı Məkan',
    lanesCount: 2,
    descriptionAz: 'Məhdud kənar boşluqlu tuneldə siren səsi eşidildikdə təhlükəsiz davranış.',
    descriptionEn: 'Hearing siren inside a narrow tunnel with limited emergency shoulders.',
    descriptionRu: 'Приближение скорой внутри узкого туннеля с ограниченными обочинами.',
    correctDriverActionAz: 'Heç bir halda tuneldə qəfil tormozlamaq olmaz; sabit sürətlə zolağın kənarına çəkilərək ambulansın keçidinə şərait yaradılmalıdır.',
    correctDriverActionEn: 'Never slam on brakes abruptly in a tunnel; decelerate predictably, steer toward tunnel walls, and maintain forward headway.',
    correctDriverActionRu: 'Ни в коем случае не применять экстренное торможение; плавно прижаться к стенкам туннеля и освободить проезд.',
    legalPenaltyAzn: 100,
    legalPenaltyPoints: 3,
    legalArticle: 'YHQ Maddə 42.4 & Tunel Təhlükəsizlik Reqlamenti'
  }
];

export const EMS_EXAM_QUESTIONS: EmsExamQuestion[] = [
  {
    id: 1,
    questionAz: 'Göy rəngli sayrışan mayak və xüsusi səs siqnalı (siren) qoşulmuş Təcili Tibbi Yardım avtomobili yaxınlaşarkən digər sürücülər nə etməlidir?',
    questionEn: 'What must drivers do when approached by an emergency ambulance with blue flashing beacon and siren activated?',
    questionRu: 'Что обязаны сделать водители при приближении автомобиля скорой помощи с включенным синим маяком и сиреной?',
    optionsAz: [
      'Sürəti artırıb onun qabağında hərəkət etmək',
      'Hərəkət zolağını dərhal boşaltmalı və maneəsiz keçid üçün yol verməlidir',
      'Yalnız işıqforda qırmızı yandıqda yol vermək',
      'Səs siqnalı verərək ambulansı xəbərdar etmək'
    ],
    optionsEn: [
      'Accelerate and drive in front of it',
      'Immediately vacate the traffic lane and yield right-of-way for unimpeded passage',
      'Yield only when stopping at a red signal',
      'Sound vehicle horn to warn the ambulance'
    ],
    optionsRu: [
      'Увеличить скорость и ехать впереди него',
      'Немедленно освободить полосу движения и уступить дорогу для беспрепятственного проезда',
      'Уступать дорогу только на красный сигнал светофора',
      'Подать звуковой сигнал для предупреждения скорой'
    ],
    correctIndex: 1,
    explanationAz: 'YHQ Maddə 42-yə əsasən, operativ nəqliyyat vasitəsi göy sayrışan mayak və xüsusi səs siqnalını qoşduqda digər sürücülər ona yol verməli və maneəsiz keçidi təmin etməlidir.',
    explanationEn: 'Under Article 42 of the Law on Road Traffic, all road users must yield right-of-way and vacate the lane for operative emergency vehicles.',
    explanationRu: 'Согласно ст. 42 Закона О дорожном движении, водители обязаны уступить дорогу оперативному транспорту с включенным синим маяком и сиреной.',
    legalBasis: 'YHQ Maddə 42 & İXM Maddə 327.3'
  },
  {
    id: 2,
    questionAz: 'Operativ nəqliyyat vasitəsinə (Ambulans 103) yol verməməyə görə İnzibati Xətalar Məcəlləsi (İXM) hansı məsuliyyəti nəzərdə tutur?',
    questionEn: 'What administrative sanction is prescribed for failure to yield right-of-way to an operative emergency vehicle?',
    questionRu: 'Какая административная ответственность предусмотрена за непредоставление преимущества автомобилю скорой помощи?',
    optionsAz: [
      '20 AZN cərimə',
      '50 AZN cərimə və 1 bal',
      '100 AZN cərimə və 3 cərimə balı',
      'Nəqliyyat vasitəsinin müsadirəsi'
    ],
    optionsEn: [
      '20 AZN fine',
      '50 AZN fine and 1 demerit point',
      '100 AZN fine and 3 demerit points',
      'Confiscation of vehicle'
    ],
    optionsRu: [
      'Штраф 20 AZN',
      'Штраф 50 AZN и 1 штрафной балл',
      'Штраф 100 AZN и 3 штрафных балла',
      'Конфискация транспортного средства'
    ],
    correctIndex: 2,
    explanationAz: 'İXM Maddə 327.3-ə əsasən operativ nəqliyyat vasitəsinə yol verməməyə görə 100 manat məbləğində cərimə və 3 cərimə balı tətbiq olunur.',
    explanationEn: 'Under Code of Administrative Offences Art. 327.3, failure to yield carries a 100 AZN fine and 3 demerit points.',
    explanationRu: 'Согласно ст. 327.3 КоАП, непредоставление преимущества влечет штраф в 100 манатов и 3 штрафных балла.',
    legalBasis: 'İXM Maddə 327.3'
  },
  {
    id: 3,
    questionAz: 'Avropa EN 1789 standartına görə "Klass C" ambulans nəyi ifadə edir?',
    questionEn: 'According to European Standard EN 1789, what does "Class C" ambulance designate?',
    questionRu: 'Что обозначает классификация скорой помощи "Класс C" по стандарту EN 1789?',
    optionsAz: [
      'Yalnız xəstələrin planlı daşınması üçün miniven',
      'Reanimomobil — İntensiv terapiya və həyati vacib funksiyaların bərpası üçün mobil reanimasiya palatası',
      'Həkimin çağırışa çatması üçün kiçik minik maşını',
      'Aptek dərmanları çatdıran təchizat mikroavtobusu'
    ],
    optionsEn: [
      'Minivan solely for scheduled patient transport',
      'Mobile Intensive Care Unit (MICU) / Resuscitation vehicle equipped for advanced critical life support',
      'Compact passenger car for doctor transit',
      'Supply minibus delivering pharmacy items'
    ],
    optionsRu: [
      'Минивэн исключительно для плановой перевозки больных',
      'Реанимобиль — Мобильное отделение интенсивной терапии для спасения критических пациентов',
      'Легковой автомобиль для доставки дежурного врача',
      'Фургон для развозки медикаментов'
    ],
    correctIndex: 1,
    explanationAz: 'EN 1789 Klass C (Mobile Intensive Care Unit - MICU) ən yüksək təchizatlı reanimomobildir (süni tənəffüs, perfuzorlar, invaziv monitorinq).',
    explanationEn: 'EN 1789 Class C specifies Mobile Intensive Care Units (MICU) equipped with transport ventilators, infusion pumps, and telemetry.',
    explanationRu: 'Класс C по EN 1789 — это реанимобиль высшей категории с аппаратом ИВЛ, мониторами и инфузоматами.',
    legalBasis: 'EN 1789 Table 1'
  },
  {
    id: 4,
    questionAz: 'Çoxzolaqlı yollarda "Həyat Dəhlizi" (Rescue Corridor / Rettungsgasse) hansı zolaqlar arasında formalaşdırılmalıdır?',
    questionEn: 'On multi-lane roads, between which lanes must the Rescue Corridor (Rettungsgasse) be formed?',
    questionRu: 'На многополосных дорогах между какими полосами должен формироваться «Коридор спасения»?',
    optionsAz: [
      'Yalnız ən sağdakı səki boyunca',
      'Ən sol zolaq ilə ondan sağdakı qonşu zolaq arasında',
      'Avtomobillərin istədiyi ixtiyari yerdə',
      'Yalnız yolayrıcı kəsişmələrində'
    ],
    optionsEn: [
      'Along the far right pavement only',
      'Between the far left lane and the adjacent lane to its right',
      'Any random spot drivers choose',
      'Only at intersection crossings'
    ],
    optionsRu: [
      'Только вдоль самого правого бордюра',
      'Между крайней левой полосой и соседней полосой справа от нее',
      'В любом произвольном месте по выбору водителей',
      'Только на регулируемых перекрестках'
    ],
    correctIndex: 1,
    explanationAz: 'Beynəlxalq və milli qaydalara əsasən, ən sol zolaq sola sıxılır, qalan bütün zolaqlar isə sağa sıxılaraq ən sol və 2-ci zolaq arasında dəhliz yaradır.',
    explanationEn: 'The international standard mandates the leftmost lane moves left, all other lanes move right, creating the rescue channel between lane 1 and lane 2.',
    explanationRu: 'Крайняя левая полоса прижимается влево, все остальные полосы вправо, освобождая проезд между 1-й и 2-й полосами.',
    legalBasis: 'YHQ Maddə 42 & Beynəlxalq Təcrübə'
  },
  {
    id: 5,
    questionAz: 'Operativ ambulans sürücüsü yol hərəkəti qaydalarının tələblərindən nə vaxt və necə yayına bilər?',
    questionEn: 'When and how may an emergency ambulance driver deviate from general road traffic regulations?',
    questionRu: 'Когда и при каких условиях водитель скорой помощи может отступать от требований ПДД?',
    optionsAz: [
      'İstənilən vaxt heç bir siqnal qoşmadan',
      'Təxirəsalınmaz xidməti tapşırığı yerinə yetirərkən, göy sayrışan mayakı qoşduqda və hərəkət təhlükəsizliyinə tam əmin olduqda',
      'Yalnız gecə saat 02:00-dan sonra',
      'Yalnız polisin müşayiəti olduqda'
    ],
    optionsEn: [
      'At any time without using any signals',
      'When performing an urgent official mission, with blue beacon activated, and only after ensuring traffic safety',
      'Only after 02:00 at night',
      'Only when escorted by police'
    ],
    optionsRu: [
      'В любое время без включения каких-либо сигналов',
      'При выполнении неотложного служебного задания, со включенным синим маяком и убедившись в безопасности движения',
      'Только ночью после 02:00',
      'Только в сопровождении дорожной полиции'
    ],
    correctIndex: 1,
    explanationAz: 'YHQ Maddə 42.1-ə əsasən göy mayak qoşulduqda işıqfor, sürət və zolaq qaydalarından yayına bilər, lakin digər hərəkət iştirakçıları üçün təhlükə yaratmamalıdır.',
    explanationEn: 'Under Article 42.1, the driver may deviate from traffic signals and markings only when blue beacon is active and safe passage is assured.',
    explanationRu: 'Согласно ст. 42.1 ПДД, отступать от сигналов светофора и разметки разрешено только с синим маяком при обеспечении безопасности.',
    legalBasis: 'YHQ Maddə 42.1'
  },
  {
    id: 6,
    questionAz: 'Ambulansın ardınca yaxın məsafədən ("parovoz" rejimində) sürətlə hərəkət edərək tıxacı yarmağa çalışan mülki sürücü hansı məsuliyyətə cəlb olunur?',
    questionEn: 'What legal liability does a civilian driver face when tailgating behind an ambulance to bypass traffic gridlock?',
    questionRu: 'К какой ответственности привлекается водитель за движение вплотную за скорой помощью для объезда затора?',
    optionsAz: [
      'Heç bir cərimə tətbiq edilmir',
      'Təhlükəli manevr, ara məsafəsi və sürət həddini aşma qaydalarını pozduğuna görə cərimələnir və qəza şəraiti yaratdıqda 150 AZN cərimə olunur',
      'Yalnız şifahi xəbərdarlıq edilir',
      'Dövlət tərəfindən mükafatlandırılır'
    ],
    optionsEn: [
      'No penalty is applied',
      'Penalized for dangerous tailgating, aggressive maneuvering, and creating crash hazard (up to 150 AZN + points)',
      'Verbal warning only',
      'Rewarded by municipality'
    ],
    optionsRu: [
      'Штраф не предусмотрен',
      'Штрафуется за несоблюдение дистанции, опасное маневрирование и создание аварийной ситуации (до 150 AZN + баллы)',
      'Только устное предупреждение',
      'Награждается муниципалитетом'
    ],
    correctIndex: 1,
    explanationAz: 'Operativ nəqliyyatın ardınca sıx məsafə ilə hərəkət etmək ("parovoz" sürmə) qəza şəraiti yaratmağa görə İXM Maddə 327.4 və 327.8 ilə cəzalandırılır.',
    explanationEn: 'Tailgating an emergency vehicle in code-3 transit creates severe collision hazard and is prosecuted under aggressive driving statutes.',
    explanationRu: 'Движение в хвосте машины скорой помощи наказывается по статьям 327.4 и 327.8 за опасное вождение и создание аварийной обстановки.',
    legalBasis: 'İXM Maddə 327.4 & 327.8'
  },
  {
    id: 7,
    questionAz: 'TƏBİB və EN 1789 standartına görə reanimomobildəki xərəklər hansı qəza zərbəsi yükünə tab gətirməlidir?',
    questionEn: 'According to TƏBİB and EN 1789, what deceleration crash force must ambulance stretchers withstand?',
    questionRu: 'Какую силу ударной перегрузки должны выдерживать носилки реанимобиля по EN 1789?',
    optionsAz: [
      'Yalnız 2g yükə',
      'Heç bir zərbə tələbi yoxdur',
      'Bütün istiqamətlərdə minimum 10g zərbə yükünə tab gətirməlidir',
      'Yalnız 50 kq statik çəkiyə'
    ],
    optionsEn: [
      'Only 2g load',
      'No crash load specification',
      'Must withstand a minimum dynamic deceleration of 10g in all directions',
      'Only 50 kg static weight'
    ],
    optionsRu: [
      'Только перегрузку 2g',
      'Требований к ударопрочности нет',
      'Обязаны выдерживать динамическую перегрузку не менее 10g во всех направлениях',
      'Только 50 кг статического веса'
    ],
    correctIndex: 2,
    explanationAz: 'EN 1789 Bənd 4.4 tələbinə əsasən, ambulans xərəkləri və tibbi aparat fiksatorları 10g zərbə sınağından uğurla keçməlidir.',
    explanationEn: 'EN 1789 Clause 4.4 mandates dynamic 10g crash testing for patient stretchers and medical equipment mounts.',
    explanationRu: 'Пункт 4.4 стандарта EN 1789 требует обязательного тестирования фиксаторов и носилок на перегрузку 10g.',
    legalBasis: 'EN 1789 Bənd 4.4'
  },
  {
    id: 8,
    questionAz: 'Ambulansın operativ səs siqnalı (siren) hansı səs təzyiqi səviyyəsində (dBA) olmalıdır?',
    questionEn: 'What acoustic sound pressure level (dBA) must an operative emergency siren deliver?',
    questionRu: 'Каков нормативный уровень звукового давления сирены оперативного автомобиля (дБА)?',
    optionsAz: [
      '60–75 dBA',
      '110–120 dBA (2 metr məsafədə)',
      '150 dBA-dan yuxarı',
      '40–50 dBA'
    ],
    optionsEn: [
      '60–75 dBA',
      '110–120 dBA (measured at 2 meters)',
      'Above 150 dBA',
      '40–50 dBA'
    ],
    optionsRu: [
      '60–75 дБА',
      '110–120 дБА (на расстоянии 2 метра)',
      'Свыше 150 дБА',
      '40–50 дБА'
    ],
    correctIndex: 1,
    explanationAz: 'AZS və UNECE standartlarına əsasən fövqəladə səs siqnalı 2 metr məsafədə 110–120 dBA səs təzyiqinə malik olmalıdır ki, salonda musiqi dinləyən sürücülər də eşitsin.',
    explanationEn: 'Operative sirens must output 110–120 dBA at 2m so motorists in sound-insulated vehicles can detect approaching EMS.',
    explanationRu: 'По стандартам AZS/UNECE мощность сирены должна составлять 110–120 дБА на расстоянии 2 метров.',
    legalBasis: 'AZS Standartı & UNECE R28'
  },
  {
    id: 9,
    questionAz: 'Ambulans sürücüsünün sükan arxasında iş və istirahət rejimi necə tənzimlənir?',
    questionEn: 'How are driving shift hours and rest periods regulated for emergency ambulance drivers?',
    questionRu: 'Как регулируется режим труда и отдыха водителей скорой медицинской помощи?',
    optionsAz: [
      'Fasiləsiz 24 saat sükan arxasında sürməlidir',
      'Növbə zamanı hər 4 saatdan bir istirahət, reysarası reanimasiya hazırlığı və növbə müddəti 12 saatdan artıq olmamalıdır',
      'Rejim məhdudiyyəti yoxdur',
      'Yalnız xəstə olmadıqda yatmaq olar'
    ],
    optionsEn: [
      'Must drive 24 hours continuously without break',
      'Shifts must not exceed 12 hours with mandatory rest intervals to ensure psycho-motor alertness',
      'No rest regulations apply',
      'Sleep allowed only with zero patients'
    ],
    optionsRu: [
      'Обязан непрерывно управлять 24 часа без смены',
      'Смена не должна превышать 12 часов с обязательными перерывами для поддержания внимания',
      'Ограничений по труду нет',
      'Отдых разрешен только при отсутствии пациентов'
    ],
    correctIndex: 1,
    explanationAz: 'Əmək Məcəlləsi və TƏBİB təlimatına əsasən təcili yardım sürücülərinin operativ diqqətini saxlamaq üçün növbələr 12 saatlıq rejimdə təşkil edilir.',
    explanationEn: 'Under Labor Code and TƏBİB safety protocols, EMS drivers operate under 12-hour structured shift rotations to prevent fatigue.',
    explanationRu: 'По Трудовому кодексу и нормативам TƏBİB смены водителей скорой регламентированы 12 часами с обязательным отдыхом.',
    legalBasis: 'AR Əmək Məcəlləsi & TƏBİB Təlimatı'
  },
  {
    id: 10,
    questionAz: 'İşıqforun qırmızı işığında dayanarkən arxadan gələn təcili yardıma yol vermək üçün stop-xətti keçən sürücünün MMX radar cəriməsi necə silinir?',
    questionEn: 'How is an ANPR camera red-light fine exonerated when a driver crosses the stop-line to yield to an ambulance?',
    questionRu: 'Как аннулируется штраф камеры за стоп-линию, если водитель пересек её для пропуска скорой помощи?',
    optionsAz: [
      'Cərimə heç vaxt silinmir, sürücü mütləq ödəməlidir',
      'BDYP videoqeydiyyat və TƏBİB GPS dispetçer jurnalı vasitəsilə operativ zərurət təsdiqlənir və cərimə qərarı ləğv edilir (İXM Maddə 19)',
      'Sürücü 10 gün həbs edilir',
      'Avtomobil cərimə meydançasına aparılır'
    ],
    optionsEn: [
      'Ticket is never cancelled and must be paid',
      'BDYP CCTV review and 103 GPS dispatch logs confirm extreme necessity and the penalty is legally exonerated (İXM Art. 19)',
      'Driver is detained for 10 days',
      'Vehicle is towed to impound lot'
    ],
    optionsRu: [
      'Штраф не аннулируется и подлежит оплате',
      'На основе видеозаписи BDYP и GPS-трекинга скорой подтверждается крайняя необходимость, и постановление аннулируется (КоАП ст. 19)',
      'Водитель подвергается аресту на 10 суток',
      'Автомобиль эвакуируется на штрафстоянку'
    ],
    correctIndex: 1,
    explanationAz: 'İXM Maddə 19 (Son zərurət) əsasında operativ nəqliyyat vasitəsinin həyat qurtarması üçün yol verən sürücünün MMX protokolu BDYP tərəfindən dərhal xitam olunur.',
    explanationEn: 'Under Administrative Code Article 19 (Extreme Necessity), tickets triggered while vacating the way for emergency sirens are cancelled upon review.',
    explanationRu: 'В силу статьи 19 КоАП (Крайняя необходимость) постановление за пересечение стоп-линии при пропуске скорой помощи подлежит отмене.',
    legalBasis: 'İXM Maddə 19 & BDYP YPX Təlimatı'
  }
];

export const SAMPLE_AMBULANCE_PERMITS: AmbulancePermitRecord[] = [
  {
    permitNumber: 'TABIB-EMS-2026-10301',
    issueDate: '2026-01-15',
    expiryDate: '2027-01-15',
    plateNumber: '99-JH-103',
    vin: 'WDB9066351S892103',
    organizationName: 'TƏBİB Bakı Şəhər Təcili və Təxirəsalınmaz Tibbi Yardım Stansiyası',
    voen: '1401234561',
    vehicleClass: 'class_c',
    ambulanceType: 'Mobil İntensiv Terapiya və Reanimasiya (Klass C)',
    assignedStation: '1 saylı Mərkəzi Təcili Tibbi Yardım Stansiyası',
    oxygenInspectionDate: '2026-01-10',
    chiefPhysicianSignature: 'Dr. Rəşad Məmmədov (Baş Həkim)',
    status: 'valid',
    verificationHash: 'SHA256:EMS:7A9F32BC'
  },
  {
    permitNumber: 'TABIB-EMS-2026-10302',
    issueDate: '2026-02-01',
    expiryDate: '2027-02-01',
    plateNumber: '10-PA-103',
    vin: 'WF0XXXTTFXPB10344',
    organizationName: 'TƏBİB 2 saylı Yasamal Təcili Tibbi Yardım Sub-Stansiyası',
    voen: '1401234562',
    vehicleClass: 'class_b',
    ambulanceType: 'Xətti Təcili Tibbi Yardım Ambulansı (Klass B)',
    assignedStation: '2 saylı Yasamal Təcili Tibbi Yardım Stansiyası',
    oxygenInspectionDate: '2026-01-28',
    chiefPhysicianSignature: 'Dr. Samirə Əliyeva (Baş Həkim)',
    status: 'valid',
    verificationHash: 'SHA256:EMS:8F14D011'
  },
  {
    permitNumber: 'TABIB-EMS-2026-10303',
    issueDate: '2026-03-10',
    expiryDate: '2027-03-10',
    plateNumber: '99-NR-103',
    vin: 'ZCFC50A200510366',
    organizationName: 'Elmi-Tədqiqat Pediatriya İnstitutu & TƏBİB',
    voen: '1409876541',
    vehicleClass: 'class_c',
    ambulanceType: 'Yenidoğulmuşlar üçün Xüsusi Neonatal Reanimomobil',
    assignedStation: '4 saylı Nərimanov Reanimasiya Sub-Stansiyası',
    oxygenInspectionDate: '2026-03-05',
    chiefPhysicianSignature: 'Dr. İlqar Quliyev (Baş Həkim)',
    status: 'valid',
    verificationHash: 'SHA256:EMS:92EE45AA'
  },
  {
    permitNumber: 'TABIB-EMS-2026-10304',
    issueDate: '2026-01-05',
    expiryDate: '2027-01-05',
    plateNumber: '77-EM-103',
    vin: 'JTFFX22P70010398',
    organizationName: 'Respublika Müalicəvi Diaqnostika Mərkəzi (RMDM)',
    voen: '1405556677',
    vehicleClass: 'class_a',
    ambulanceType: 'Xəstəxana-arası Pasient Daşıma Nəqliyyatı (Klass A)',
    assignedStation: '7 saylı Xətai & Ağ Şəhər Təcili Yardım Bölməsi',
    oxygenInspectionDate: '2025-12-28',
    chiefPhysicianSignature: 'Dr. Nərgiz Həsənova (Baş Həkim)',
    status: 'valid',
    verificationHash: 'SHA256:EMS:B4C09912'
  }
];
