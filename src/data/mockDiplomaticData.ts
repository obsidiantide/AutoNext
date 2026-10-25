import {
  ViennaChecklistItem,
  DiplomaticMission,
  DiplomaticVehiclePreset,
  DiplomaticProtocolExamQuestion,
  DiplomaticCertificate
} from '../utils/diplomaticCompliance';

export const MOCK_VIENNA_CHECKLIST: ViennaChecklistItem[] = [
  {
    id: 'chk_xin_accreditation',
    titleAz: 'XİN Dövlət Protokolu İdarəsində Rəsmi Akkreditasiya',
    titleEn: 'MFA State Protocol Department Official Accreditation',
    titleRu: 'Официальная аккредитация в Управлении Госпротокола МИД',
    descriptionAz: 'Nəqliyyat vasitəsi və sürücü Xarici İşlər Nazirliyinin Diplomatik Qeydiyyat Reystrində qeydiyyata alınmışdır.',
    descriptionEn: 'Vehicle and assigned driver are duly registered in the official Ministry of Foreign Affairs diplomatic roll.',
    descriptionRu: 'Транспортное средство и закрепленный водитель внесены в реестр аккредитации МИД Азербайджана.',
    viennaArticle: '1961-ci il Vyana Konvensiyası Maddə 10',
    required: true
  },
  {
    id: 'chk_diplomatic_id',
    titleAz: 'Etibarlı Diplomatik Şəxsiyyət Vəsiqəsi (XİN Diplomat Kartı)',
    titleEn: 'Valid Diplomatic Identity Card (MFA Diplomat Card)',
    titleRu: 'Действительное дипломатическое удостоверение личности (МИД)',
    descriptionAz: 'Sürücü və ya sərnişin diplomatik, konsulluq və ya xidməti kateqoriyalı rəsmi XİN vəsiqəsinə malikdir.',
    descriptionEn: 'Driver or principal occupant holds a diplomatic, consular, or service identity card issued by MFA.',
    descriptionRu: 'Водитель или главный пассажир обладает дипломатической картой, выданной МИД АР.',
    viennaArticle: 'Vyana Konvensiyası Maddə 39',
    required: true
  },
  {
    id: 'chk_inviolability',
    titleAz: 'Nəqliyyat Vasitəsinin Toxunulmazlıq Rejimi (Axtarış və Tutulma Qadağası)',
    titleEn: 'Vehicle Inviolability Status (Immunity from Search and Seizure)',
    titleRu: 'Неприкосновенность транспорта (Запрет на обыск и задержание)',
    descriptionAz: 'Diplomatik avtomobil axtarış, müsadirə, həbs və ya icra tədbirlərindən mütləq toxunulmazlığa malikdir.',
    descriptionEn: 'Diplomatic vehicle enjoys full immunity from search, requisition, attachment, or execution.',
    descriptionRu: 'Транспорт дипломата пользуется иммунитетом от обыска, реквизиции, ареста и исполнительных мер.',
    viennaArticle: 'Vyana Konvensiyası Maddə 22.3 və Maddə 30.2',
    required: true
  },
  {
    id: 'chk_red_plate',
    titleAz: 'Qırmızı Diplomatik Dövlət Qeydiyyat Nişanı (SFR / CD / D / T / CC)',
    titleEn: 'Red Diplomatic State Registration Plate Standard',
    titleRu: 'Красный государственный регистрационный знак дипкорпуса',
    descriptionAz: 'DİN BDYP tərəfindən verilmiş xüsusi qırmızı fonlu, ağ hərfli və ölkə şifrəli standart nömrə nişanı.',
    descriptionEn: 'Special red background registration plate with white lettering and 3-digit country code issued by BDYP.',
    descriptionRu: 'Специальный красный номерной знак с белыми литерами и 3-значным кодом страны от BDYP.',
    viennaArticle: 'AR "Yol Hərəkəti Haqqında" Qanun Maddə 27',
    required: true
  },
  {
    id: 'chk_customs_tax_free',
    titleAz: 'Gömrük İdxal Rüsumu və ƏDV-dən 100% Azad Olunma Sertifikatı',
    titleEn: '100% Customs Duty, Excise and VAT Exemption Certificate',
    titleRu: 'Сертификат 100% освобождения от таможенных пошлин, акцизов и НДС',
    descriptionAz: 'Dövlət Gömrük Komitəsi və XİN birgə təsdiqlənmiş diplomatik rüsumsuz idxal bəyannaməsi.',
    descriptionEn: 'State Customs Committee and MFA co-approved tax-free import customs clearance declaration.',
    descriptionRu: 'Совместно утвержденная ГТК и МИД беспошлинная таможенная декларация на импорт.',
    viennaArticle: 'Vyana Konvensiyası Maddə 36 / AR Gömrük Məcəlləsi',
    required: true
  },
  {
    id: 'chk_flag_protocol',
    titleAz: 'Dövlət Bayrağı Protokolu (Missiya Rəhbəri Sağ Qanad Bayrağı)',
    titleEn: 'National Flag Protocol Mounting (Head of Mission Right Fender)',
    titleRu: 'Протокол государственного флага (Правое крыло главы дипмиссии)',
    descriptionAz: 'Rəsmi tədbir və diplomatik səfərlərdə yalnız Missiya Rəhbərinin avtomobilinin sağ qanadında dövlət bayrağı asılır.',
    descriptionEn: 'National flag is displayed on the right front fender exclusively on the Head of Mission vehicle during official missions.',
    descriptionRu: 'Государственный флаг вывешивается на правом крыле исключительно на автомобиле Главы Миссии.',
    viennaArticle: 'Vyana Konvensiyası Maddə 20',
    required: false
  },
  {
    id: 'chk_reserved_parking',
    titleAz: 'Diplomatik Ayrılmış Parklanma Zolağı və Aeroport Girişi',
    titleEn: 'Diplomatic Reserved Parking Bay & Airport VIP Access',
    titleRu: 'Дипломатическая выделенная парковка и доступ в VIP-терминал',
    descriptionAz: 'Səfirlik binaları qarşısında və Heydər Əliyev Beynəlxalq Aeroportunda diplomatik ayrılmış park zonası icazəsi.',
    descriptionEn: 'Authorization for designated diplomatic bays in front of chanceries and GYD International Airport VIP access.',
    descriptionRu: 'Разрешение на выделенную дипломатическую парковку у посольства и доступ в VIP-терминал GYD.',
    viennaArticle: 'AR Nazirlər Kabineti Protokol Reqlamenti',
    required: false
  },
  {
    id: 'chk_green_card',
    titleAz: 'İcbari Mülki Məsuliyyət və Yaşıl Kart Beynəlxalq Sığortası',
    titleEn: 'Compulsory TPL & International Green Card Motor Insurance',
    titleRu: 'ОСАГО и международный полис Зеленая Карта',
    descriptionAz: 'Diplomatik immunitetə baxmayaraq, üçüncü şəxslər qarşısında mülki məsuliyyət icbari sığortası təmin edilmişdir.',
    descriptionEn: 'Third-party motor liability insurance must be maintained despite jurisdiction immunity rules.',
    descriptionRu: 'Обязательное страхование автогражданской ответственности третьих лиц.',
    viennaArticle: 'AR "İcbari Sığortalar Haqqında" Qanun Maddə 50',
    required: true
  },
  {
    id: 'chk_pouch_transport',
    titleAz: 'Diplomatik Kuryer və Möhürlənmiş Valiz Toxunulmazlığı',
    titleEn: 'Diplomatic Courier Pouch Inviolability in Vehicle',
    titleRu: 'Неприкосновенность дипломатической почты и вализы в салоне',
    descriptionAz: 'Avtomobildə daşınan diplomatik möhürlü poçt paketləri və valizlər heç bir halda açıla və ya saxlanıla bilməz.',
    descriptionEn: 'Diplomatic pouches and courier mail carried inside the vehicle shall not be opened or detained under any circumstances.',
    descriptionRu: 'Дипломатическая почта и опечатанные вализы в салоне не подлежат вскрытию или задержанию.',
    viennaArticle: 'Vyana Konvensiyası Maddə 27.3',
    required: true
  },
  {
    id: 'chk_hotline_liaison',
    titleAz: '24/7 XİN Protokol və BDYP Təcili Əlaqələndirmə Şəbəkəsi',
    titleEn: '24/7 MFA Protocol & BDYP Emergency Liaison Network',
    titleRu: 'Круглосуточный канал связи Протокола МИД и BDYP',
    descriptionAz: 'Yol-nəqliyyat hadisəsi və ya fövqəladə hal zamanı XİN Protokol növbətçisi ilə dərhal operativ əlaqə kanalı.',
    descriptionEn: 'Immediate operational communication channel with the MFA Protocol duty officer and BDYP dispatch.',
    descriptionRu: 'Оперативный круглосуточный канал связи с дежурным офицером Госпротокола МИД и BDYP.',
    viennaArticle: 'XİN və DİN Birgə Təlimatı',
    required: true
  }
];

export const MOCK_DIPLOMATIC_MISSIONS: DiplomaticMission[] = [
  {
    id: 'mis_turkey',
    missionNameAz: 'Türkiyə Cümhuriyyətinin Azərbaycan Respublikasındakı Səfirliyi',
    missionNameEn: 'Embassy of the Republic of Turkey in Azerbaijan',
    missionNameRu: 'Посольство Турецкой Республики в Азербайджане',
    countryCode: '001',
    missionType: 'embassy',
    addressAz: 'Bakı şəh., Nəsimi ray., Səməd Vurğun küç. 94',
    addressEn: '94 Samad Vurgun Str., Nasimi dist., Baku',
    districtAz: 'Nəsimi rayonu',
    phone: '+994 (12) 444-73-20',
    email: 'embassy.baku@mfa.gov.tr',
    liaisonOfficer: 'M. Korkut (Müşavir-Elçi)',
    activeVehiclesCount: 18,
    reservedParkingBays: 8
  },
  {
    id: 'mis_usa',
    missionNameAz: 'Amerika Birləşmiş Ştatlarının Bakıdakı Səfirliyi',
    missionNameEn: 'Embassy of the United States of America in Baku',
    missionNameRu: 'Посольство Соединенных Штатов Америки в Баку',
    countryCode: '002',
    missionType: 'embassy',
    addressAz: 'Bakı şəh., Nəsimi ray., Azadlıq prospekti 111',
    addressEn: '111 Azadlig Avenue, Nasimi dist., Baku',
    districtAz: 'Nəsimi rayonu',
    phone: '+994 (12) 488-33-00',
    email: 'BakuProtocol@state.gov',
    liaisonOfficer: 'J. Reynolds (First Secretary / RSO)',
    activeVehiclesCount: 24,
    reservedParkingBays: 12
  },
  {
    id: 'mis_uk',
    missionNameAz: 'Böyük Britaniya Krallığının Bakıdakı Səfirliyi',
    missionNameEn: 'British Embassy in Baku',
    missionNameRu: 'Посольство Великобритании в Баку',
    countryCode: '005',
    missionType: 'embassy',
    addressAz: 'Bakı şəh., Səbail ray., Nizami küç. 96E, Landmark III',
    addressEn: 'Landmark III, 96E Nizami Str., Sabail dist., Baku',
    districtAz: 'Səbail rayonu',
    phone: '+994 (12) 437-43-77',
    email: 'ukbaku.general@fcdo.gov.uk',
    liaisonOfficer: 'A. Campbell (Deputy Head of Mission)',
    activeVehiclesCount: 14,
    reservedParkingBays: 6
  },
  {
    id: 'mis_germany',
    missionNameAz: 'Almaniya Federativ Respublikasının Bakıdakı Səfirliyi',
    missionNameEn: 'Embassy of the Federal Republic of Germany in Baku',
    missionNameRu: 'Посольство Федеративной Республики Германия в Баку',
    countryCode: '006',
    missionType: 'embassy',
    addressAz: 'Bakı şəh., Səbail ray., Nizami küç. 69, ISR Plaza',
    addressEn: 'ISR Plaza, 69 Nizami Str., Sabail dist., Baku',
    districtAz: 'Səbail rayonu',
    phone: '+994 (12) 465-41-00',
    email: 'info@baku.diplo.de',
    liaisonOfficer: 'K. Schmidt (Consular & Protocol Attache)',
    activeVehiclesCount: 11,
    reservedParkingBays: 5
  },
  {
    id: 'mis_italy',
    missionNameAz: 'İtaliya Respublikasının Bakıdakı Səfirliyi',
    missionNameEn: 'Embassy of Italy in Baku',
    missionNameRu: 'Посольство Италии в Баку',
    countryCode: '030',
    missionType: 'embassy',
    addressAz: 'Bakı şəh., Səbail ray., Nizami küç. 90A, Landmark I',
    addressEn: 'Landmark I, 90A Nizami Str., Sabail dist., Baku',
    districtAz: 'Səbail rayonu',
    phone: '+994 (12) 497-51-33',
    email: 'baku.ambasciata@esteri.it',
    liaisonOfficer: 'M. Rossi (First Commercial Secretary)',
    activeVehiclesCount: 9,
    reservedParkingBays: 4
  },
  {
    id: 'mis_un',
    missionNameAz: 'BMT-nin Azərbaycan Respublikasındakı Nümayəndəliyi',
    missionNameEn: 'United Nations Office in Azerbaijan',
    missionNameRu: 'Представительство ООН в Азербайджане',
    countryCode: '010',
    missionType: 'international_org',
    addressAz: 'Bakı şəh., Nəsimi ray., BMT-nin 50 illiyi küç. 3',
    addressEn: '3 UN 50th Anniversary Str., Nasimi dist., Baku',
    districtAz: 'Nəsimi rayonu',
    phone: '+994 (12) 498-98-88',
    email: 'registry.az@undp.org',
    liaisonOfficer: 'S. Aliyeva (UN Protocol Liaison)',
    activeVehiclesCount: 16,
    reservedParkingBays: 8
  },
  {
    id: 'mis_eu',
    missionNameAz: 'Avropa İttifaqının Azərbaycandakı Nümayəndəliyi',
    missionNameEn: 'Delegation of the European Union to Azerbaijan',
    missionNameRu: 'Делегация Европейского Союза в Азербайджане',
    countryCode: '025',
    missionType: 'international_org',
    addressAz: 'Bakı şəh., Səbail ray., Nizami küç. 96E, Landmark III, 11-ci mərtəbə',
    addressEn: 'Landmark III, 11th Floor, 96E Nizami Str., Baku',
    districtAz: 'Səbail rayonu',
    phone: '+994 (12) 497-20-63',
    email: 'delegation-azerbaijan@eeas.europa.eu',
    liaisonOfficer: 'P. De Vries (Head of Administration)',
    activeVehiclesCount: 12,
    reservedParkingBays: 5
  },
  {
    id: 'mis_turkey_ganja',
    missionNameAz: 'Türkiyə Cümhuriyyətinin Gəncə Baş Konsulluğu',
    missionNameEn: 'Consulate General of the Republic of Turkey in Ganja',
    missionNameRu: 'Генеральное Консульство Турецкой Республики в Гяндже',
    countryCode: '001',
    missionType: 'consulate',
    addressAz: 'Gəncə şəh., Heydər Əliyev prospekti 52',
    addressEn: '52 Heydar Aliyev Ave, Ganja city',
    districtAz: 'Gəncə şəhəri',
    phone: '+994 (22) 266-29-23',
    email: 'consulate.ganja@mfa.gov.tr',
    liaisonOfficer: 'R. Yılmaz (Konsul)',
    activeVehiclesCount: 6,
    reservedParkingBays: 4
  }
];

export const MOCK_DIPLOMATIC_PRESETS: DiplomaticVehiclePreset[] = [
  {
    id: 'pre_turkey_ambassador',
    titleAz: 'Türkiyə Səfiri — Rəsmi Flaqman Limuzin',
    titleEn: 'Turkey Ambassador — Official Flagship Limousine',
    titleRu: 'Посол Турции — Официальный флагманский лимузин',
    plateNumber: '001 CD 001',
    countryCode: '001',
    category: 'CD',
    vehicleModel: 'Mercedes-Maybach S 580 4MATIC',
    engineCc: 3982,
    engineHp: 503,
    manufactureYear: 2024,
    cifValueAzn: 380000,
    registeredMonthsAgo: 14,
    flagPoleMounted: true,
    inviolabilityStatus: true
  },
  {
    id: 'pre_usa_dcm',
    titleAz: 'ABŞ Səfirliyi — Missiya Rəhbərinin Müavini SUV',
    titleEn: 'US Embassy — Deputy Chief of Mission Armored SUV',
    titleRu: 'Посольство США — Бронированный внедорожник замглавы миссии',
    plateNumber: '002 CD 002',
    countryCode: '002',
    category: 'CD',
    vehicleModel: 'Cadillac Escalade ESV B6 Armored',
    engineCc: 6162,
    engineHp: 420,
    manufactureYear: 2023,
    cifValueAzn: 420000,
    registeredMonthsAgo: 26,
    flagPoleMounted: true,
    inviolabilityStatus: true
  },
  {
    id: 'pre_uk_first_sec',
    titleAz: 'Böyük Britaniya — 1-ci Siyasi Katib Sedan',
    titleEn: 'British Embassy — First Political Secretary Executive Sedan',
    titleRu: 'Посольство Великобритании — Первый секретарь по политвопросам',
    plateNumber: '005 D 014',
    countryCode: '005',
    category: 'D',
    vehicleModel: 'BMW 530i xDrive Sedan',
    engineCc: 1998,
    engineHp: 258,
    manufactureYear: 2023,
    cifValueAzn: 110000,
    registeredMonthsAgo: 18,
    flagPoleMounted: false,
    inviolabilityStatus: true
  },
  {
    id: 'pre_germany_consul',
    titleAz: 'Almaniya Səfirliyi — Konsulluq Şöbəsi Miniveni',
    titleEn: 'German Embassy — Consular Section Operational Van',
    titleRu: 'Посольство Германии — Оперативный минивэн консульского отдела',
    plateNumber: '006 CC 003',
    countryCode: '006',
    category: 'CC',
    vehicleModel: 'Volkswagen Multivan T7 Life',
    engineCc: 1984,
    engineHp: 204,
    manufactureYear: 2022,
    cifValueAzn: 95000,
    registeredMonthsAgo: 38,
    flagPoleMounted: false,
    inviolabilityStatus: true
  },
  {
    id: 'pre_italy_tech',
    titleAz: 'İtaliya Səfirliyi — Dəftərxana İnzibati Universal',
    titleEn: 'Italian Embassy — Chancellery Administrative Estate',
    titleRu: 'Посольство Италии — Административный универсал канцелярии',
    plateNumber: '030 T 008',
    countryCode: '030',
    category: 'T',
    vehicleModel: 'Audi A6 Avant 45 TFSI',
    engineCc: 1984,
    engineHp: 265,
    manufactureYear: 2021,
    cifValueAzn: 88000,
    registeredMonthsAgo: 52,
    flagPoleMounted: false,
    inviolabilityStatus: true
  },
  {
    id: 'pre_un_liaison',
    titleAz: 'BMT Nümayəndəliyi — Humanitar Monitorinq Ekspedisiya',
    titleEn: 'UN Mission — Humanitarian Field Liaison SUV',
    titleRu: 'Миссия ООН — Внедорожник гуманитарного мониторинга',
    plateNumber: '010 CD 005',
    countryCode: '010',
    category: 'CD',
    vehicleModel: 'Toyota Land Cruiser 300 VXR',
    engineCc: 3445,
    engineHp: 415,
    manufactureYear: 2023,
    cifValueAzn: 195000,
    registeredMonthsAgo: 30,
    flagPoleMounted: true,
    inviolabilityStatus: true
  }
];

export const MOCK_PROTOCOL_EXAM_QUESTIONS: DiplomaticProtocolExamQuestion[] = [
  {
    id: 1,
    questionAz: '1961-ci il Vyana Konvensiyasına əsasən, diplomatik nümayəndəliyin nəqliyyat vasitəsi yerli polis (BDYP) tərəfindən axtarıla bilərmi?',
    questionEn: 'Under the 1961 Vienna Convention, may local traffic police search a diplomatic mission vehicle?',
    questionRu: 'Может ли местная дорожная полиция обыскивать автомобиль дипмиссии согласно Венской конвенции 1961 года?',
    optionsAz: [
      'Xeyr, diplomatik avtomobillər axtarış, rekvizisiya və həbsdən mütləq toxunulmazlığa malikdir (Maddə 22.3)',
      'Bəli, əgər DYP əməkdaşı şübhələnsə, axtarış apara bilər',
      'Yalnız avtomobildə diplomat olmadıqda axtarıla bilər',
      'Yalnız xüsusi məhkəmə qərarı ilə axtarıla bilər'
    ],
    optionsEn: [
      'No, diplomatic vehicles enjoy absolute immunity from search, requisition, or attachment (Article 22.3)',
      'Yes, if traffic police suspect an offense, they may conduct a search',
      'Only if the diplomat is not currently inside the vehicle',
      'Only with an ordinary local court warrant'
    ],
    optionsRu: [
      'Нет, дипломатический транспорт пользуется абсолютным иммунитетом от обыска и ареста (Статья 22.3)',
      'Да, при возникновении подозрений полиция вправе досмотреть салон',
      'Только если в машине в данный момент отсутствует дипломат',
      'Только по ордеру районного суда'
    ],
    correctIndex: 0,
    explanationAz: 'Vyana Konvensiyasının 22-ci maddəsinin 3-cü bəndinə görə, nümayəndəliyin binaları və nəqliyyat vasitələri axtarış, rekvizisiya, həbs və ya icra tədbirlərindən tam toxunulmazdır.',
    explanationEn: 'Under Article 22(3) of the Vienna Convention, the premises of the mission and its means of transport are immune from search, requisition, attachment, or execution.',
    explanationRu: 'Согласно пункту 3 статьи 22 Венской конвенции, помещения миссии и ее транспортные средства пользуются иммунитетом от обыска, ареста и исполнения.',
    legalCitation: '1961-ci il Vyana Konvensiyası Maddə 22(3)'
  },
  {
    id: 2,
    questionAz: 'Azərbaycan qırmızı diplomatik nömrə nişanında ilk 3 rəqəm (məsələn, 001) nəyi bildirir?',
    questionEn: 'What do the first 3 digits on an Azerbaijani red diplomatic plate (e.g. 001) signify?',
    questionRu: 'Что означают первые 3 цифры на красном азербайджанском дипномере (например, 001)?',
    optionsAz: [
      'Akkreditə olunmuş ölkə və ya beynəlxalq təşkilatın XİN protokol kodunu',
      'Avtomobilin mühərrik həcmini',
      'Avtomobilin istehsal ilini',
      'Səfirlik əməkdaşının şəxsi dərəcəsini'
    ],
    optionsEn: [
      'The MFA protocol country code for the accredited state or international organization',
      'The engine displacement category',
      'The manufacturing year of the vehicle',
      'The personal civil service grade of the diplomat'
    ],
    optionsRu: [
      'Протокольный код страны или международной организации, аккредитованной при МИД',
      'Объем двигателя автомобиля',
      'Год выпуска транспортного средства',
      'Ранг дипломатического сотрудника'
    ],
    correctIndex: 0,
    explanationAz: 'İlk 3 rəqəm XİN Protokol İdarəsi tərəfindən ölkələrə ayrılmış rəsmi koddur: 001 - Türkiyə, 002 - ABŞ, 005 - Böyük Britaniya və s.',
    explanationEn: 'The first three digits represent the official country code assigned by the MFA: 001 - Turkey, 002 - USA, 005 - UK, etc.',
    explanationRu: 'Первые три цифры указывают код государства по реестру МИД: 001 - Турция, 002 - США, 005 - Великобритания.',
    legalCitation: 'AR DİN & XİN Dövlət Qeydiyyat Reqlamenti'
  },
  {
    id: 3,
    questionAz: 'Avtomobilin sağ ön qanadında dövlət bayrağını qaldırmaq hüququ kimə məxsusdur?',
    questionEn: 'Who is entitled to fly the national flag on the front right fender of the vehicle?',
    questionRu: 'Кто имеет право вывешивать государственный флаг на правом крыле автомобиля?',
    optionsAz: [
      'Yalnız Fövqəladə və Səlahiyyətli Səfir / Diplomatik Missiya Rəhbəri (rəsmi səfərlərdə)',
      'Səfirliyin bütün əməkdaşları',
      'Yalnız hərbi attaşe',
      'İstənilən qırmızı nömrəli avtomobil sürücüsü'
    ],
    optionsEn: [
      'Exclusively the Ambassador / Head of Mission during official ceremonies and duties',
      'All diplomatic agents and administrative staff',
      'Exclusively the military defense attaché',
      'Any driver of a vehicle bearing red diplomatic plates'
    ],
    optionsRu: [
      'Исключительно Чрезвычайный и Полномочный Посол / Глава Миссии при официальных выездах',
      'Все аккредитованные дипломатические агенты',
      'Исключительно военный атташе посольства',
      'Любой водитель с красными номерами'
    ],
    correctIndex: 0,
    explanationAz: 'Vyana Konvensiyasının 20-ci maddəsinə və dövlət protokol qaydalarına əsasən, bayraq hüququ yalnız nümayəndəlik başçısına (Səfirə) aiddir.',
    explanationEn: 'Under Article 20 of the Vienna Convention, the right to fly the flag on means of transport is vested in the Head of the Mission.',
    explanationRu: 'Согласно статье 20 Венской конвенции, правом вывешивания флага на транспорте обладает глава представительства.',
    legalCitation: 'Vyana Konvensiyası Maddə 20'
  },
  {
    id: 4,
    questionAz: 'Diplomatik statusda olan avtomobil mülki vətəndaşa satıldıqda (de-registrasiya), neçə ildən sonra gömrük rüsumlarından tam (0%) azad olunur?',
    questionEn: 'When a diplomatic vehicle is sold to a civilian, after how many years in diplomatic service is it 100% exempt from residual customs duties?',
    questionRu: 'Через сколько лет службы автомобиль дипмиссии при продаже гражданскому лицу полностью освобождается от таможенных пошлин (0%)?',
    optionsAz: [
      '5 il (60 ay) rəsmi diplomatik istifadədən sonra',
      '1 ildən sonra',
      'Heç vaxt azad olunmur, həmişə 100% ödənilir',
      '10 ildən sonra'
    ],
    optionsEn: [
      'After 5 years (60 months) of registered diplomatic service',
      'After 1 year of service',
      'Never exempt; full customs duties must always be paid',
      'Only after 10 years of service'
    ],
    optionsRu: [
      'После 5 лет (60 месяцев) официальной службы в дипмиссии',
      'После 1 года службы',
      'Никогда не освобождается, пошлины выплачиваются в полном объеме',
      'Только после 10 лет эксплуатации'
    ],
    correctIndex: 0,
    explanationAz: 'Azərbaycan Gömrük Qanunvericiliyinə əsasən, 5 ildən (60 aydan) artıq diplomatik qeydiyyatda olan avtomobil mülki dövriyyəyə keçdikdə qalıq rüsumlar tam amortizasiya olunur (0%).',
    explanationEn: 'Under Azerbaijan Customs regulations, diplomatic vehicles registered for over 5 years (60 months) are fully amortized and exempt from residual import duties upon civilian transfer.',
    explanationRu: 'По таможенным правилам Азербайджана, автомобили со сроком дипломатической службы свыше 5 лет освобождаются от остаточных ввозных пошлин при отчуждении.',
    legalCitation: 'AR Gömrük Məcəlləsi & Nazirlər Kabineti Qərarı'
  },
  {
    id: 5,
    questionAz: '"CD" və "D" seriyalı nömrələr arasında əsas protokol fərqi nədir?',
    questionEn: 'What is the principal protocol distinction between "CD" and "D" series plates?',
    questionRu: 'В чем основное протокольное отличие между сериями номеров "CD" и "D"?',
    optionsAz: [
      '"CD" Səfirlik Başçısı və ya rəsmi missiya avtomobili, "D" isə akkreditə olunmuş diplomatik agentlər üçündür',
      '"CD" texniki işçilər, "D" isə səfirlər üçündür',
      '"CD" dizel avtomobillər, "D" benzin üçündür',
      'Heç bir fərqi yoxdur, eyni seriyadır'
    ],
    optionsEn: [
      '"CD" is for the Head of Mission and official embassy fleet; "D" is for accredited diplomatic agents and families',
      '"CD" is for technical staff; "D" is for Ambassadors',
      '"CD" stands for diesel engines; "D" for petrol',
      'There is no distinction; they are interchangeable'
    ],
    optionsRu: [
      '"CD" предназначен для Главы Миссии и официального парка; "D" — для аккредитованных дипломатов',
      '"CD" выдается техническому персоналу; "D" — послам',
      '"CD" означает дизельный двигатель; "D" — бензиновый',
      'Различий нет, серии полностью идентичны'
    ],
    correctIndex: 0,
    explanationAz: '"CD" (Corps Diplomatique) Missiya rəhbərliyi və səfirliyin rəsmi avtoparkına, "D" isə fərdi diplomatik heyətə (müşavir, katib, attaşe) verilir.',
    explanationEn: '"CD" (Corps Diplomatique) designates the mission leadership and official fleet, whereas "D" designates individual diplomatic officers.',
    explanationRu: '"CD" присваивается руководству дипмиссии и служебному парку, а "D" — дипломатическим сотрудникам миссии.',
    legalCitation: 'AR XİN Diplomatik Protokol Standartı'
  },
  {
    id: 6,
    questionAz: 'Diplomatik avtomobil yol hərəkəti qaydasını pozduqda (məsələn, MMX sürət radarı), DYP cərimə protokolu necə rəsmiləşdirilir?',
    questionEn: 'When a diplomatic vehicle violates traffic laws (e.g. speed camera), how is the protocol processed?',
    questionRu: 'При фиксации нарушения ПДД автомобилем с красными номерами, как оформляется протокол?',
    optionsAz: [
      'BDYP cərimə bildirişini birbaşa sürücüyə deyil, XİN Dövlət Protokolu İdarəsi vasitəsilə diplomatik notayla səfirliyə göndərir',
      'Avtomobil dərhal cərimə meydançasına evakuasiya olunur',
      'Diplomat yerində dərhal nağd cərimə ödəyir',
      'Heç bir protokol tərtib olunmur və qeydə alınmır'
    ],
    optionsEn: [
      'BDYP forwards violation telemetry via the MFA State Protocol Department through a formal diplomatic note',
      'The vehicle is immediately towed to an impound lot',
      'The diplomat pays cash on the spot to the officer',
      'No violation is recorded or archived'
    ],
    optionsRu: [
      'BDYP направляет данные о нарушении через Управление Госпротокола МИД дипломатической нотой в посольство',
      'Автомобиль немедленно эвакуируется на штрафстоянку',
      'Дипломат оплачивает штраф наличными инспектору на месте',
      'Нарушение не фиксируется и аннулируется'
    ],
    correctIndex: 0,
    explanationAz: 'Diplomatik immunitetə görə birbaşa inzibati tənbeh tətbiq olunmur, qayda pozuntuları Xarici İşlər Nazirliyi vasitəsilə rəsmi nota şəklində göndərilir.',
    explanationEn: 'Due to diplomatic immunity, citations are not served directly on the spot; instead, violations are channeled via MFA diplomatic notes.',
    explanationRu: 'Ввиду иммунитета прямое административное взыскание на дороге исключено; материалы направляются через МИД нотой.',
    legalCitation: 'Vyana Konvensiyası Maddə 31 & AR İXM'
  },
  {
    id: 7,
    questionAz: '"T" seriyalı qırmızı diplomatik nömrə kimə verilir?',
    questionEn: 'To whom is the "T" series red diplomatic plate issued?',
    questionRu: 'Кому выдаются государственные номера красной серии "T"?',
    optionsAz: [
      'Səfirlik və nümayəndəliklərin inzibati və texniki xidmət heyətinə (məs. tərcüməçi, IT, dəftərxana)',
      'Taksi sürücülərinə',
      'Təcili tibbi yardım maşınlarına',
      'Tranzit yük maşınlarına'
    ],
    optionsEn: [
      'Administrative and technical staff of diplomatic missions (e.g. IT, archivists, chancellery)',
      'Taxi drivers',
      'Emergency ambulances',
      'Transit commercial cargo trucks'
    ],
    optionsRu: [
      'Административно-техническому персоналу дипмиссий (IT, делопроизводство, канцелярия)',
      'Водителям городских такси',
      'Автомобилям скорой помощи',
      'Транзитным грузовым фурам'
    ],
    correctIndex: 0,
    explanationAz: '"T" (Technique) səfirliklərin inzibati-texniki əməkdaşlarının avtomobilləri üçün nəzərdə tutulmuş rəsmi seriyadır.',
    explanationEn: '"T" signifies technical and administrative personnel serving within diplomatic missions.',
    explanationRu: '"T" (Technique) закреплена за административно-техническими служащими иностранных посольств.',
    legalCitation: 'Vyana Konvensiyası Maddə 37.2'
  },
  {
    id: 8,
    questionAz: 'Diplomatik avtomobilin içərisində daşınan rəsmi möhürlü Diplomatik Poçt (Valiz) gömrük və ya sərhəd xidməti tərəfindən açıla bilərmi?',
    questionEn: 'May the official sealed Diplomatic Pouch carried inside the vehicle be opened by customs or border authorities?',
    questionRu: 'Может ли таможенная или пограничная служба вскрыть официальную опечатанную дипломатическую почту (вализу) в автомобиле?',
    optionsAz: [
      'Qətiyyən xeyr, diplomatik valiz heç bir halda açıla və ya saxlanıla bilməz (Maddə 27.3)',
      'Bəli, əgər rentgen cihazında şübhəli əşya görünsə, açıla bilər',
      'Yalnız gömrük rəisinin icazəsi ilə açıla bilər',
      'Diplomatın iştirakı ilə mütləq yoxlanılmalıdır'
    ],
    optionsEn: [
      'Strictly prohibited; the diplomatic pouch shall not be opened or detained under any circumstances (Article 27.3)',
      'Yes, if X-ray scanner flags suspicious items',
      'Only with written clearance from the chief of customs',
      'It must always be opened in the presence of the diplomat'
    ],
    optionsRu: [
      'Категорически запрещено; дипломатическая почта не подлежит ни вскрытию, ни задержанию (Статья 27.3)',
      'Да, при обнаружении подозрительных предметов на рентгене',
      'Только с письменного разрешения начальника таможни',
      'Обязательно вскрывается в присутствии курьера'
    ],
    correctIndex: 0,
    explanationAz: 'Vyana Konvensiyasının 27-ci maddəsinin 3-cü bəndinə görə, diplomatik valiz toxunulmazdır, heç bir halda açıla və ya ləngidilə bilməz.',
    explanationEn: 'Under Article 27(3) of the Vienna Convention, the diplomatic bag shall not be opened or detained under any circumstance.',
    explanationRu: 'В соответствии со статьей 27(3) Венской конвенции, дипломатическая почта пользуется абсолютной неприкосновенностью.',
    legalCitation: 'Vyana Konvensiyası Maddə 27(3)'
  },
  {
    id: 9,
    questionAz: 'Fəxri Konsulluqların (Honorary Consul) nəqliyyat vasitələrinə hansı seriyalı nömrə nişanı verilir?',
    questionEn: 'Which registration plate series is issued to Honorary Consular posts?',
    questionRu: 'Какая серия регистрационных знаков выдается Почетным Консулам?',
    optionsAz: [
      'HON seriyalı xüsusi nömrə nişanı',
      'Standart mülki 99-XX seriyası',
      'Qara rəngli hərbi nömrə',
      'Mavi rəngli polis nömrəsi'
    ],
    optionsEn: [
      'HON series special consular plate',
      'Standard civilian 99-XX plate',
      'Black military registration plate',
      'Blue police registration plate'
    ],
    optionsRu: [
      'Специальная серия HON для почетных консулов',
      'Стандартный гражданский номер 99-XX',
      'Черный военный номер',
      'Синий полицейский номер'
    ],
    correctIndex: 0,
    explanationAz: 'Fəxri konsulluqların avtomobillərinə rəsmi "HON" prefiksli dövlət qeydiyyat nişanları təyin olunur.',
    explanationEn: 'Honorary Consuls are assigned the dedicated "HON" series license plates in the official vehicle registry.',
    explanationRu: 'Транспортным средствам почетных консулов присваивается специальная серия "HON".',
    legalCitation: '1963-cü il Vyana Konsulluq Konvensiyası Maddə 58'
  },
  {
    id: 10,
    questionAz: 'Diplomatik avtomobil Azərbaycana idxal olunarkən ƏDV (18%) və Aksiz vergisi necə tənzimlənir?',
    questionEn: 'How are VAT (18%) and Excise taxes regulated when a diplomatic vehicle is imported into Azerbaijan?',
    questionRu: 'Как регулируются НДС (18%) и акциз при ввозе дипломатического автомобиля в Азербайджан?',
    optionsAz: [
      'Vyana Konvensiyasının 36-cı maddəsinə və AR Gömrük Məcəlləsinə əsasən, 100% vergi və rüsumlardan azaddır (Tax-Free)',
      'Yalnız 50% endirim tətbiq olunur',
      'Bütün vergilər adi qaydada nağd ödənilir',
      'Yalnız mühərrik həcmi 2000 cc-dən az olduqda azad olunur'
    ],
    optionsEn: [
      'Under Article 36 of the Vienna Convention and Azerbaijan Customs Code, it is 100% tax and duty free',
      'A 50% partial rebate applies',
      'All taxes must be paid in full upfront in cash',
      'Exemption only applies if the engine displacement is under 2000 cc'
    ],
    optionsRu: [
      'В соответствии со статьей 36 Венской конвенции и Таможенным кодексом АР, автомобиль полностью освобожден от налогов (100% Tax-Free)',
      'Предоставляется скидка в размере 50%',
      'Все сборы уплачиваются на общих основаниях',
      'Освобождение действует только при объеме до 2000 куб.см'
    ],
    correctIndex: 0,
    explanationAz: 'Diplomatik nümayəndəliyin xidməti istifadəsi üçün nəzərdə tutulan avtomobillər bütün gömrük rüsumu, aksiz və 18% ƏDV-dən tam azaddır.',
    explanationEn: 'Vehicles imported for the official use of the diplomatic mission are granted complete exemption from customs duties, excise, and 18% VAT.',
    explanationRu: 'Автотранспорт, предназначенный для официального пользования дипмиссией, полностью освобождается от пошлин, акциза и НДС.',
    legalCitation: 'Vyana Konvensiyası Maddə 36'
  }
];

export const MOCK_ACTIVE_DIPLOMATIC_CERTIFICATES: DiplomaticCertificate[] = [
  {
    certificateNumber: 'XIN-DIP-2026-40912',
    issueDate: '2026-02-15',
    validUntil: '2028-02-15',
    plateNumber: '001 CD 001',
    countryCode: '001',
    countryName: 'Türkiyə Cümhuriyyəti',
    category: 'CD',
    missionName: 'Türkiyə Cümhuriyyətinin Səfirliyi',
    vehicleModel: 'Mercedes-Maybach S 580 4MATIC',
    vin: 'W1K2231761A490123',
    engineCc: 3982,
    customsExemptionStatus: '100% Tax-Free Diplomatic Exemption (DGK / XİN Birgə Reystri)',
    savedDutiesAzn: 114500,
    savedDutiesUsd: 67349,
    savedDutiesEur: 61887,
    protocolOfficer: 'E. Rəhimov (XİN Dövlət Protokolu İdarəsi Rəisi)',
    simaSignatureUid: 'SIMA-DIP-XIN-94FA02',
    verificationCode: 'VER-DIP-001-MAYBACH',
    inviolabilityLevel: 'Mütləq Diplomatik Toxunulmazlıq (Vyana Konvensiyası Maddə 22, 29, 30)',
    status: 'active'
  },
  {
    certificateNumber: 'XIN-DIP-2026-58104',
    issueDate: '2025-08-10',
    validUntil: '2027-08-10',
    plateNumber: '002 CD 002',
    countryCode: '002',
    countryName: 'Amerika Birləşmiş Ştatları',
    category: 'CD',
    missionName: 'ABŞ Bakı Səfirliyi',
    vehicleModel: 'Cadillac Escalade ESV B6 Armored',
    vin: '1GYS4HK78PR188432',
    engineCc: 6162,
    customsExemptionStatus: '100% Tax-Free Diplomatic Exemption (DGK / XİN Birgə Reystri)',
    savedDutiesAzn: 148200,
    savedDutiesUsd: 87171,
    savedDutiesEur: 80102,
    protocolOfficer: 'T. Məmmədov (XİN Protokol Baş Məsləhətçisi)',
    simaSignatureUid: 'SIMA-DIP-XIN-4B82DE',
    verificationCode: 'VER-DIP-002-CADILLAC',
    inviolabilityLevel: 'Mütləq Diplomatik Toxunulmazlıq (Vyana Konvensiyası Maddə 22, 29, 30)',
    status: 'active'
  },
  {
    certificateNumber: 'XIN-DIP-2026-77319',
    issueDate: '2025-11-20',
    validUntil: '2027-11-20',
    plateNumber: '005 D 014',
    countryCode: '005',
    countryName: 'Böyük Britaniya Krallığı',
    category: 'D',
    missionName: 'Böyük Britaniya Səfirliyi',
    vehicleModel: 'BMW 530i xDrive Sedan',
    vin: 'WBA53AH04NCK90234',
    engineCc: 1998,
    customsExemptionStatus: '100% Tax-Free Diplomatic Exemption (DGK / XİN Birgə Reystri)',
    savedDutiesAzn: 38700,
    savedDutiesUsd: 22763,
    savedDutiesEur: 20917,
    protocolOfficer: 'V. Quliyev (XİN Diplomatik İmmunitetlər Şöbəsi)',
    simaSignatureUid: 'SIMA-DIP-XIN-12AA89',
    verificationCode: 'VER-DIP-005-BMW',
    inviolabilityLevel: 'Tam Şəxsi və Nəqliyyat Toxunulmazlığı (Vyana Konvensiyası Maddə 31, 37)',
    status: 'active'
  },
  {
    certificateNumber: 'XIN-DIP-2026-88401',
    issueDate: '2024-06-01',
    validUntil: '2026-06-01',
    plateNumber: '010 CD 005',
    countryCode: '010',
    countryName: 'Birləşmiş Millətlər Təşkilatı (BMT)',
    category: 'CD',
    missionName: 'BMT Nümayəndəliyi',
    vehicleModel: 'Toyota Land Cruiser 300 VXR',
    vin: 'JTMHX01J8N4029112',
    engineCc: 3445,
    customsExemptionStatus: '100% Tax-Free Diplomatic Exemption (DGK / XİN Birgə Reystri)',
    savedDutiesAzn: 68400,
    savedDutiesUsd: 40232,
    savedDutiesEur: 36970,
    protocolOfficer: 'S. Nəsirov (XİN BMT və Qlobal İdarəetmə İdarəsi)',
    simaSignatureUid: 'SIMA-DIP-XIN-9C011F',
    verificationCode: 'VER-DIP-010-TOYOTA',
    inviolabilityLevel: 'BMT Baş Konvensiyası (1946) & Vyana İmmuniteti',
    status: 'active'
  }
];
