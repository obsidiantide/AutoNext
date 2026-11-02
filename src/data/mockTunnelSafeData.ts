import {
  TunnelCorridorAsset,
  TunnelVehiclePreset,
  TunnelSafetyChecklistItem,
  TunnelTheoryQuestion,
  TunnelSafeCertificate
} from '../utils/tunnelSafeCompliance';

export const MOCK_TUNNEL_CORRIDORS: TunnelCorridorAsset[] = [
  {
    id: 'murovdag-pass',
    nameAz: 'Murovdağ İkiborulu Magistral Tuneli (Km 82+400)',
    nameEn: 'Murovdag Twin-Tube Highway Tunnel (Km 82+400)',
    route: 'Toğana - Kəlbəcər - İstisu Dəhlizi',
    region: 'Göy-göl / Kəlbəcər Yüksək Dağlıq Zolağı',
    chainageKm: 'Km 82+400',
    lengthMeters: 11600,
    altitudeMeters: 2400,
    tunnelType: 'TWIN_TUBE_UNIDIRECTIONAL',
    ventilationMode: 'LONGITUDINAL_JET_FANS',
    ceilingHeightM: 5.4,
    crossSectionAreaM2: 68.0,
    longitudinalSlopePct: 2.2,
    totalJetFansInstalled: 48,
    crossPassageSpacingM: 250,
    waterDelugeInstalled: true,
    activeScadaSensorCode: 'SCADA-MROV-TUN-01'
  },
  {
    id: 'lachin-transit',
    nameAz: 'Laçın-1 Magistral Tranzit Dağ Tuneli (Km 35+200)',
    nameEn: 'Lachin-1 Transit Mountain Highway Tunnel (Km 35+200)',
    route: 'Kəlbəcər - Laçın - Qubadlı Avtomobil Yolu',
    region: 'Şərqi Zəngəzur İqtisadi Rayonu',
    chainageKm: 'Km 35+200',
    lengthMeters: 2470,
    altitudeMeters: 1650,
    tunnelType: 'TWIN_TUBE_UNIDIRECTIONAL',
    ventilationMode: 'LONGITUDINAL_JET_FANS',
    ceilingHeightM: 5.2,
    crossSectionAreaM2: 64.0,
    longitudinalSlopePct: 1.8,
    totalJetFansInstalled: 18,
    crossPassageSpacingM: 250,
    waterDelugeInstalled: true,
    activeScadaSensorCode: 'SCADA-LCH-TUN-02'
  },
  {
    id: 'aghsu-serpentine',
    nameAz: 'Ağsu Aşırımı Qayaqoruyucu Qalereya və Tunel (Km 138+500)',
    nameEn: 'Aghsu Pass Rockfall Gallery & Mountain Tunnel (Km 138+500)',
    route: 'M-4 Bakı - Şamaxı - Ağsu - Yevlax',
    region: 'Şirvan / Ağsu Dağlıq Aşırımı',
    chainageKm: 'Km 138+500',
    lengthMeters: 980,
    altitudeMeters: 920,
    tunnelType: 'SINGLE_TUBE_BIDIRECTIONAL',
    ventilationMode: 'LONGITUDINAL_JET_FANS',
    ceilingHeightM: 4.8,
    crossSectionAreaM2: 54.0,
    longitudinalSlopePct: 3.5,
    totalJetFansInstalled: 8,
    crossPassageSpacingM: 200,
    waterDelugeInstalled: false,
    activeScadaSensorCode: 'SCADA-AGS-TUN-03'
  },
  {
    id: 'baku-bayil',
    nameAz: 'Bakı Dairəvi-1 Bayıl-Badamdar Tuneli (Km 4+800)',
    nameEn: 'Baku Ring Road-1 Bayil-Badamdar Tunnel (Km 4+800)',
    route: 'Bakı Şəhəri Dairəvi Avtomobil Yolu',
    region: 'Bakı Şəhəri Səbail / Yasamal Rayonu',
    chainageKm: 'Km 4+800',
    lengthMeters: 650,
    altitudeMeters: 45,
    tunnelType: 'URBAN_CUT_AND_COVER',
    ventilationMode: 'LONGITUDINAL_JET_FANS',
    ceilingHeightM: 5.0,
    crossSectionAreaM2: 72.0,
    longitudinalSlopePct: 0.8,
    totalJetFansInstalled: 12,
    crossPassageSpacingM: 150,
    waterDelugeInstalled: true,
    activeScadaSensorCode: 'SCADA-BAY-TUN-04'
  },
  {
    id: 'shusha-dashalti',
    nameAz: 'Zəfər Yolu Şuşa-Daşaltı Qala Tuneli (Km 86+100)',
    nameEn: 'Victory Road Shusha-Dashalti Fortress Tunnel (Km 86+100)',
    route: 'Füzuli - Xocavənd - Şuşa Zəfər Yolu',
    region: 'Qarabağ İqtisadi Rayonu / Şuşa',
    chainageKm: 'Km 86+100',
    lengthMeters: 1220,
    altitudeMeters: 1380,
    tunnelType: 'TWIN_TUBE_UNIDIRECTIONAL',
    ventilationMode: 'LONGITUDINAL_JET_FANS',
    ceilingHeightM: 5.1,
    crossSectionAreaM2: 60.0,
    longitudinalSlopePct: 2.0,
    totalJetFansInstalled: 12,
    crossPassageSpacingM: 200,
    waterDelugeInstalled: true,
    activeScadaSensorCode: 'SCADA-SHSH-TUN-05'
  },
  {
    id: 'astara-transit',
    nameAz: 'M-3 Ələt-Astara-İran Sərhəd Tranzit Tuneli (Km 214+600)',
    nameEn: 'M-3 Alat-Astara-Iran Border Transit Tunnel (Km 214+600)',
    route: 'M-3 Bakı - Ələt - Lənkəran - Astara Beynəlxalq Dəhlizi',
    region: 'Astara Dağlıq Sərhəd Keçid Zolağı',
    chainageKm: 'Km 214+600',
    lengthMeters: 1850,
    altitudeMeters: 110,
    tunnelType: 'TWIN_TUBE_UNIDIRECTIONAL',
    ventilationMode: 'LONGITUDINAL_JET_FANS',
    ceilingHeightM: 5.3,
    crossSectionAreaM2: 66.0,
    longitudinalSlopePct: 1.2,
    totalJetFansInstalled: 16,
    crossPassageSpacingM: 250,
    waterDelugeInstalled: true,
    activeScadaSensorCode: 'SCADA-AST-TUN-06'
  }
];

export const MOCK_TUNNEL_VEHICLES: TunnelVehiclePreset[] = [
  {
    id: 'preset-sedan',
    category: 'passenger_sedan',
    nameAz: 'Toyota Camry 2.5 Hybrid Sedan',
    nameEn: 'Toyota Camry 2.5 Hybrid Sedan',
    plateAz: '99-TN-101',
    designHrrMW: 5.0,
    passengerCapacity: 5,
    fuelType: 'GASOLINE_HYBRID',
    recommendedEgressSpeedM_s: 1.2
  },
  {
    id: 'preset-van',
    category: 'commercial_van',
    nameAz: 'Mercedes-Benz Sprinter 316 CDI Yük Vanı',
    nameEn: 'Mercedes-Benz Sprinter 316 CDI Cargo Van',
    plateAz: '10-TN-202',
    designHrrMW: 15.0,
    passengerCapacity: 3,
    fuelType: 'DIESEL',
    recommendedEgressSpeedM_s: 1.1
  },
  {
    id: 'preset-tir',
    category: 'freight_tir',
    nameAz: 'DAF XF 480 Super Space Cab Euro-6 TIR',
    nameEn: 'DAF XF 480 Super Space Cab Euro-6 Semi-Trailer',
    plateAz: '77-TN-303',
    designHrrMW: 50.0,
    passengerCapacity: 2,
    fuelType: 'HEAVY_DIESEL_LNG',
    recommendedEgressSpeedM_s: 1.0
  },
  {
    id: 'preset-tanker',
    category: 'hazmat_tanker',
    nameAz: 'KamAZ-6520 ADR Maye Yanacaq Çəni (HazMat)',
    nameEn: 'KamAZ-6520 ADR Fuel Tanker (HazMat Class 3)',
    plateAz: '90-AZ-404',
    designHrrMW: 100.0,
    passengerCapacity: 2,
    fuelType: 'PETROLEUM_HAZMAT',
    adrHazmatClass: 'ADR Class 3 (Flammable Liquids)',
    recommendedEgressSpeedM_s: 0.9
  },
  {
    id: 'preset-coach',
    category: 'tourist_coach',
    nameAz: 'Neoplan Tourliner 55-Nəfərlik Şəhərlərarası Avtobus',
    nameEn: 'Neoplan Tourliner 55-Pax Intercity Coach',
    plateAz: '99-TN-505',
    designHrrMW: 25.0,
    passengerCapacity: 55,
    fuelType: 'DIESEL',
    recommendedEgressSpeedM_s: 0.95
  },
  {
    id: 'preset-rescue',
    category: 'rescue_response_unit',
    nameAz: 'MAN TGM 18.340 4x4 FHN / BDYP Tünel Xilasetmə Avtomobili',
    nameEn: 'MAN TGM 18.340 4x4 MES / STPD Tunnel Rescue Fire Unit',
    plateAz: '00-FHN-606',
    designHrrMW: 2.0,
    passengerCapacity: 6,
    fuelType: 'DIESEL',
    recommendedEgressSpeedM_s: 1.4
  }
];

export const MOCK_TUNNEL_CHECKLIST: TunnelSafetyChecklistItem[] = [
  {
    id: 'chk-1',
    code: 'AZS-TUN-01',
    titleAz: 'Jet fan ventilyatorlarının avtomatlaşdırılmış SCADA reversiv iş rejimi testi',
    titleEn: 'Automated SCADA reversible operating mode test for jet fans',
    category: 'VENTILATION',
    standardRef: 'AZS 410 / NFPA 502 Ch. 7',
    mandatory: true,
    weight: 12
  },
  {
    id: 'chk-2',
    code: 'AZS-TUN-02',
    titleAz: 'Tüstü geri yayılmasının qarşısını alan kritik hava axını sürətinin (vc) təmini',
    titleEn: 'Critical longitudinal air velocity (vc) maintenance to prevent backlayering',
    category: 'VENTILATION',
    standardRef: 'PIARC Guidelines / NFPA 502',
    mandatory: true,
    weight: 12
  },
  {
    id: 'chk-3',
    code: 'AZS-TUN-03',
    titleAz: 'Avtomatlaşdırılmış su dumanı / köpük deluge yanğınsöndürmə sisteminin təzyiq testi',
    titleEn: 'Automated water mist / deluge foam fire suppression pressure integrity test',
    category: 'FIRE_SUPPRESSION',
    standardRef: 'AZS 342 / NFPA 502 Ch. 9',
    mandatory: true,
    weight: 10
  },
  {
    id: 'chk-4',
    code: 'AZS-TUN-04',
    titleAz: 'Hər 250 metrdən bir quraşdırılmış qəza keçid qapılarının (cross-passage) hermetikliyi',
    titleEn: 'Hermetic seal and positive air pressure of emergency cross-passages every 250m',
    category: 'EGRESS_SIGNAGE',
    standardRef: 'UNECE Directive / AZS 410',
    mandatory: true,
    weight: 10
  },
  {
    id: 'chk-5',
    code: 'AZS-TUN-05',
    titleAz: 'Davamlı dinamik işıqlandırılmış yaşıl təxliyə piktogramları və məsafə göstəriciləri',
    titleEn: 'Continuous illuminated LED emergency egress directional arrows and distance signs',
    category: 'EGRESS_SIGNAGE',
    standardRef: 'EN 12101 / PIARC',
    mandatory: true,
    weight: 10
  },
  {
    id: 'chk-6',
    code: 'AZS-TUN-06',
    titleAz: 'Optik xətti istilik detektoru (LHD fiber-optik) və tüstü sensorlarının kalibrasiyası',
    titleEn: 'Linear heat detection (LHD fiber-optic) and optical smoke sensor calibration',
    category: 'SCADA_SENSING',
    standardRef: 'EN 54-22 / NFPA 502',
    mandatory: true,
    weight: 10
  },
  {
    id: 'chk-7',
    code: 'AZS-TUN-07',
    titleAz: 'Karbon monoksid (CO) və azot oksidi (NOx) qaz analizatorlarının SCADA siqnalı',
    titleEn: 'Carbon monoxide (CO) and nitrogen oxide (NOx) gas analyzer SCADA thresholds',
    category: 'SCADA_SENSING',
    standardRef: 'PIARC Emission Standard',
    mandatory: true,
    weight: 10
  },
  {
    id: 'chk-8',
    code: 'AZS-TUN-08',
    titleAz: 'Tüneldaxili 100 dB dinamiklərlə akustik təxliyə və səsli təlimat yayımı (PA System)',
    titleEn: 'Tunnel acoustic PA evacuation broadcast system (100 dB intelligibility test)',
    category: 'COMMUNICATION',
    standardRef: 'AZS 410 / NFPA 502',
    mandatory: true,
    weight: 9
  },
  {
    id: 'chk-9',
    code: 'AZS-TUN-09',
    titleAz: 'Fövqəladə hallar zamanı FHN və BDYP radio dalğalarının tüneldaxili retranslyasiyası',
    titleEn: 'Emergency radio frequency re-broadcast for MES (FHN) and Police (BDYP)',
    category: 'COMMUNICATION',
    standardRef: 'UNECE Trans-European Highway',
    mandatory: true,
    weight: 9
  },
  {
    id: 'chk-10',
    code: 'AZS-TUN-10',
    titleAz: 'Giriş portallarında avtomatik qırmızı qadağan işıqforları və şlaqbaumların bloklanması',
    titleEn: 'Portal automated red lane closure signals, barrier arms, and VMS message gantries',
    category: 'EGRESS_SIGNAGE',
    standardRef: 'AZS 410 / İXM Maddə 327',
    mandatory: true,
    weight: 8
  }
];

export const MOCK_TUNNEL_QUESTIONS: TunnelTheoryQuestion[] = [
  {
    id: 'q-1',
    questionAz: 'Avtomobil tunelində qəza və ya yanğın baş verdikdə kritik hava axını sürətinin (vc) əsas məqsədi nədir?',
    questionEn: 'What is the primary objective of maintaining the critical velocity (vc) during a tunnel fire incident?',
    optionsAz: [
      'Yanğını alovlandırmaq və yanacaq yanmasını sürətləndirmək',
      'Tüstünün nəqliyyat axınının təxliyə istiqamətinə əks yayılmasının (backlayering) qarşısını almaq',
      'Tunelin temperaturunu mənfi dərəcəyə salmaq',
      'Yalnız CO qazını tunel daxilində sıxlaşdırmaq'
    ],
    optionsEn: [
      'To accelerate the flame front and intensify fuel burning',
      'To prevent smoke from reversing against the evacuation path (backlayering prevention)',
      'To drop tunnel ambient temperatures below freezing point',
      'To concentrate carbon monoxide inside the tube'
    ],
    correctIndex: 1,
    explanationAz: 'Kritik ventilyasiya sürəti (vc) tüstünün və istiliyin təxliyə olunan insanların hərəkət istiqamətinə əks (arxaya) qayıtmasının (backlayering) qarşısını almaq üçün vacibdir (NFPA 502 & PIARC).',
    explanationEn: 'The critical longitudinal velocity vc prevents smoke from propagating upstream against escaping motorists, preserving a clear evacuation route (NFPA 502 & PIARC).',
    legalRef: 'NFPA 502 Chapter 7 & PIARC Fire Guidelines'
  },
  {
    id: 'q-2',
    questionAz: 'Azərbaycan qanunvericiliyinə və beynəlxalq standartlara görə tunellərdə təcili qəza təxliyə qapıları (cross-passage) hansı maksimum məsafədə yerləşməlidir?',
    questionEn: 'According to Azerbaijani regulations and international norms, what is the maximum permissible distance between emergency cross-passages in road tunnels?',
    optionsAz: [
      'Hər 250 metrdən bir',
      'Hər 1000 metrdən bir',
      'Hər 1500 metrdən bir',
      'Yalnız tunelin hər iki giriş-çıxış portalında'
    ],
    optionsEn: [
      'Every 250 meters maximum',
      'Every 1,000 meters',
      'Every 1,500 meters',
      'Only at the entry and exit portals'
    ],
    correctIndex: 0,
    explanationAz: 'Azərbaycan dövlət standartları və PIARC normalarına görə ikiborulu və uzun tunellərdə sərnişinlərin təhlükəsiz qonşu boruya keçməsi üçün qapılar maksimum hər 250 metrdən bir qoyulmalıdır.',
    explanationEn: 'AZS and PIARC standards require emergency cross-passages connecting to the safe twin tube or escape gallery every 250 meters maximum.',
    legalRef: 'AZS 410 & UNECE Road Tunnel Directive'
  },
  {
    id: 'q-3',
    questionAz: 'Tuneldə avtomobiliniz alovlanarsa və ya hərəkət dayandırılarsa sürücü hansı ilkin addımı atmalıdır?',
    questionEn: 'If a vehicle catches fire or traffic is permanently stopped due to fire in a tunnel, what initial action must the driver take?',
    optionsAz: [
      'Avtomobili kilidləyib açarı cibinə qoymaq və maşının içində gözləmək',
      'Mühərriki söndürmək, açarı alışdırma yuvasında qoymaq, avtomobili tərk edib ən yaxın yaşıl qəza qapısına təxliyə olunmaq',
      'Geriyə dönüb tuneldə əks istiqamətdə sürmək',
      'Bütün pəncərələri açıb audio sistemi maksimum səslə qoşmaq'
    ],
    optionsEn: [
      'Lock the car, pocket the keys, and wait inside the cabin',
      'Turn off engine, leave key in ignition for rescue crews, immediately exit car and follow green signs to the nearest cross-passage',
      'Make a U-turn and drive against opposing traffic',
      'Roll down all windows and crank up the audio system'
    ],
    correctIndex: 1,
    explanationAz: 'Tüneldə yanğın zamanı sürücü mühərriki dərhal söndürməli, xilasedicilərin maşını çəkə bilməsi üçün açarı qoymalı və dərhal işıqlı yaşıl təxliyə qapısına qaçmalıdır.',
    explanationEn: 'Drivers must kill ignition, leave keys in the vehicle for emergency towing, and quickly follow green emergency signage to the nearest safe cross-passage.',
    legalRef: 'Yol Hərəkəti Haqqında Qanun Maddə 60'
  },
  {
    id: 'q-4',
    questionAz: 'Azərbaycan İXM-nin 330-cu maddəsinə əsasən, tüneldə məcburi dayanma zamanı qəza durma nişanını quraşdırmamağa görə hansı cərimə tətbiq edilir?',
    questionEn: 'Under Article 330 of the Code of Administrative Offences of Azerbaijan, what is the statutory penalty for failing to display the emergency hazard warning sign during a forced tunnel stop?',
    optionsAz: [
      '20 AZN cərimə',
      '80 AZN cərimə və 2 cərimə balı',
      '300 AZN cərimə',
      'Yalnız şifahi xəbərdarlıq'
    ],
    optionsEn: [
      '20 AZN fine',
      '80 AZN fine and 2 penalty points',
      '300 AZN fine',
      'Verbal warning only'
    ],
    correctIndex: 1,
    explanationAz: 'İXM Maddə 330-a görə, tüneldə və ya sutkanın qaranlıq vaxtında məcburi dayandıqda qəza durma nişanının quraşdırılmamasına görə 80 AZN cərimə və 2 cərimə balı tətbiq olunur.',
    explanationEn: 'Article 330 prescribes an 80 AZN fine and 2 penalty points for failing to deploy emergency warning signs during forced stops in tunnels.',
    legalRef: 'İXM Maddə 330'
  },
  {
    id: 'q-5',
    questionAz: 'Təhlükəli yük daşıyan (ADR) nəqliyyat vasitəsinin qadağan edilmiş tünelə qanunsuz daxil olması hansı məsuliyyətə səbəb olur?',
    questionEn: 'What legal consequence applies when a HazMat (ADR) vehicle illegally enters a tunnel where dangerous goods transit is prohibited?',
    optionsAz: [
      'İXM Maddə 353.1 əsasında 150 AZN cərimə və 4 cərimə balı',
      '10 AZN parklanma rüsumu',
      'Cərimə tətbiq edilmir',
      'Yalnız təkərlərin havasının boşaldılması'
    ],
    optionsEn: [
      '150 AZN fine and 4 penalty points pursuant to Article 353.1 of the Administrative Code',
      '10 AZN parking fee',
      'No liability applies',
      'Only tire deflation'
    ],
    correctIndex: 0,
    explanationAz: 'İXM Maddə 353.1-ə əsasən, ADR qaydalarını və tunel kateqoriyası məhdudiyyətlərini pozaraq təhlükəli yüklə tünelə daxil olmaya görə 150 AZN cərimə və 4 cərimə balı nəzərdə tutulur.',
    explanationEn: 'Under Article 353.1, violating HazMat ADR tunnel restrictions incurs a 150 AZN administrative fine and 4 penalty points.',
    legalRef: 'İXM Maddə 353.1'
  },
  {
    id: 'q-6',
    questionAz: 'Tüneldə yanğın tüstüsündə hərəkət edərkən optik görünüş məsafəsi kəskin azaldıqda hansı qaydaya riayət edilməlidir?',
    questionEn: 'When moving through tunnel smoke with severely deteriorated optical visibility, what is the correct survival protocol?',
    optionsAz: [
      'Tunelin tam mərkəzində sürətlə qaçmaq',
      'Tunelin yan divarını və yerdəki işıqlı bələdçi zolağı izləyərək əyilmiş vəziyyətdə təxliyə qapısına doğru irəliləmək',
      'Yerdə uzanıb xilasediciləri gözləmək',
      'Avtomobilin damına çıxaraq əl yelləmək'
    ],
    optionsEn: [
      'Sprint blindly along the exact centerline of the roadway',
      'Stay low beneath the hot smoke ceiling, touch the tunnel sidewall and follow ground-level LED guide lights toward the green exit door',
      'Lie flat on the asphalt and wait indefinitely',
      'Climb onto the roof of the car and wave hands'
    ],
    correctIndex: 1,
    explanationAz: 'İsti zəhərli tüstü və CO tavan boyunca toplaşır; təmiz hava döşəməyə yaxın olur. İnsanlar əyilərək divarı və döşəmə LED bələdçilərini izləməlidirlər.',
    explanationEn: 'Toxic gases and buoyant heat rise to the ceiling. Motorists must crouch low, use the sidewall handrail or low-level LED pathfinders, and advance to safety.',
    legalRef: 'PIARC Egress Safety Guide & AZS 410'
  },
  {
    id: 'q-7',
    questionAz: 'İXM-nin 38-ci maddəsinə əsasən təyin edilmiş tünel yol hərəkəti cərimələri neçə gün ərzində ödənildikdə 50 faiz endirim tətbiq olunur?',
    questionEn: 'Under Article 38 of the Azerbaijani Administrative Offences Code, within how many days must a traffic fine be settled to qualify for the 50% discount?',
    optionsAz: [
      '30 gün ərzində',
      '5 gün ərzində',
      'Yalnız həmin gün 2 saat ərzində',
      '90 gün ərzində'
    ],
    optionsEn: [
      'Within 30 calendar days',
      'Within 5 days',
      'Only within 2 hours on the same day',
      'Within 90 days'
    ],
    correctIndex: 0,
    explanationAz: 'İXM Maddə 38-ə əsasən, elektron qərar çıxarıldığı və rəsmi bildiriş təqdim edildiyi gündən 30 gün müddətində ödənildikdə cərimənin 50%-i ödənilir.',
    explanationEn: 'Under Article 38 of the Code of Administrative Offences, settling fines within 30 days grants an immediate 50% statutory discount.',
    legalRef: 'İXM Maddə 38'
  },
  {
    id: 'q-8',
    questionAz: 'Tüneldə su dumanı (water mist / deluge) avtomatik söndürmə sistemi hansı yanğın həddində işə salınır?',
    questionEn: 'At what design fire severity threshold is the high-pressure water mist / deluge suppression system typically triggered in modern road tunnels?',
    optionsAz: [
      'Yalnız siqaret çəkildikdə',
      'İstilik ayrılması 30 MW-ı keçdikdə və ya fiber-optik sensor 250°C-dən yuxarı kritik istilik qeydə aldıqda',
      'Hər gün axşam saat 20:00-da təmizlik məqsədilə',
      'Tuneldə külək əsdikdə'
    ],
    optionsEn: [
      'Whenever a cigarette is lit',
      'When fire Heat Release Rate exceeds 30 MW or fiber-optic linear sensors record temperatures above 250°C',
      'Every evening at 20:00 for scheduled road cleaning',
      'Whenever exterior wind blows'
    ],
    correctIndex: 1,
    explanationAz: 'Böyük yük TIR və çən qəzalarında (HRR > 30 MW) beton konstruksiyanın partlamasını (spalling) və alovun digər avtomobillərə keçməsini önləmək üçün deluge sistemi aktivləşdirilir.',
    explanationEn: 'Deluge water mist activates during high-consequence fires (>30 MW) to suppress flashover, cool the hot gas layer, and protect tunnel structural concrete.',
    legalRef: 'NFPA 502 Chapter 9 & EN 12845'
  },
  {
    id: 'q-9',
    questionAz: 'Tünel daxilində avtomobillər arasında saxlanması məcburi olan minimal təhlükəsizlik məsafəsi nə qədərdir?',
    questionEn: 'What is the statutory minimum safe inter-vehicle following distance inside highway road tunnels?',
    optionsAz: [
      '2 metr',
      'Ən azı 50 metr (yük maşınları üçün 100 metr)',
      '10 santimetr',
      'Heç bir məsafə tələb olunmur'
    ],
    optionsEn: [
      '2 meters',
      'At least 50 meters (100 meters for heavy commercial freight)',
      '10 centimeters',
      'No distance is prescribed'
    ],
    correctIndex: 1,
    explanationAz: 'Yol hərəkəti qaydalarına əsasən, tunellərdə zəncirvari toqquşmaların və yanğın yayılmasının qarşısını almaq üçün ən azı 50m, ağır yük maşınları üçün isə 100m ara məsafəsi saxlanmalıdır.',
    explanationEn: 'Pursuant to traffic regulations, a minimum distance of 50m (100m for heavy trucks) must be maintained to prevent pileups and fire spread.',
    legalRef: 'Yol Hərəkəti Haqqında Qanun Maddə 50'
  },
  {
    id: 'q-10',
    questionAz: 'SİMA rəqəmsal imzalı TUNNEL-SAFE-AZ sertifikatı nəqliyyat vasitəsinə hansı hüququ verir?',
    questionEn: 'What transit authority does the SİMA-signed TUNNEL-SAFE-AZ digital certificate provide to a verified vehicle?',
    optionsAz: [
      'Murovdağ və Laçın kimi strateji yüksək dağlıq tunellərindən rəsmi texniki və ekoloji təhlükəsizlik yoxlanışından keçmiş statusla prioritet keçid hüququ',
      'Bütün sürət kameralarını ləğv etmək hüququ',
      'Tüneldə əks zolağa çıxmaq icazəsi',
      'Yanacaqdoldurma məntəqəsində pulsuz yanacaq almaq hüququ'
    ],
    optionsEn: [
      'Official verified clearance for transit through major strategic mountain tunnels (Murovdag, Lachin) confirming fire & safety system compliance',
      'Exemption from all speed monitoring cameras',
      'Permission to drive in oncoming lanes',
      'Free fuel at commercial filling stations'
    ],
    correctIndex: 0,
    explanationAz: 'TUNNEL-SAFE-AZ sertifikatı AAYDA, FHN və BDYP tərəfindən nəqliyyat vasitəsinin strateji dağ tunellərindən təhlükəsiz keçidə hazır olduğunu təsdiq edən rəsmi rəqəmsal sənəddir.',
    explanationEn: 'The certificate confirms that the vehicle and driver meet all statutory fire, egress, and equipment standards for high-alpine tunnel corridors.',
    legalRef: 'AAYDA & FHN Strateji Tunel Təhlükəsizlik Nizamnaməsi 2026'
  }
];

export const MOCK_TUNNEL_CERTIFICATES: TunnelSafeCertificate[] = [
  {
    certificateId: 'TUNNEL-SAFE-AZ-2026-90412',
    tunnelId: 'murovdag-pass',
    tunnelName: 'Murovdağ İkiborulu Magistral Tuneli',
    vehiclePlate: '99-TN-101',
    vehicleCategory: 'passenger_sedan',
    fireThreatStage: 'SAFE_NORMAL_OPERATION',
    criticalVelocityMs: 2.85,
    actualVelocityMs: 3.40,
    backlayeringSafe: true,
    opticalVisibilityM: 95.0,
    egressMarginSec: 360,
    safetyScore: 96,
    issueDateIso: '2026-10-15T10:30:00.000Z',
    expiryDateIso: '2027-04-15T10:30:00.000Z',
    simaDigitalUid: 'SIMA-TUN-78A9C12-AZ',
    qrVerificationHash: 'SHA256-MROV-SAFE-90412-2026',
    evacuationPasscode: 'EP-4421-CROSS',
    status: 'VERIFIED_ACTIVE'
  },
  {
    certificateId: 'TUNNEL-SAFE-AZ-2026-83194',
    tunnelId: 'lachin-transit',
    tunnelName: 'Laçın-1 Magistral Tranzit Dağ Tuneli',
    vehiclePlate: '10-TN-202',
    vehicleCategory: 'commercial_van',
    fireThreatStage: 'SAFE_NORMAL_OPERATION',
    criticalVelocityMs: 3.10,
    actualVelocityMs: 3.25,
    backlayeringSafe: true,
    opticalVisibilityM: 88.5,
    egressMarginSec: 310,
    safetyScore: 92,
    issueDateIso: '2026-10-20T14:15:00.000Z',
    expiryDateIso: '2027-04-20T14:15:00.000Z',
    simaDigitalUid: 'SIMA-TUN-55F4B90-AZ',
    qrVerificationHash: 'SHA256-LCHN-SAFE-83194-2026',
    evacuationPasscode: 'EP-6819-CROSS',
    status: 'VERIFIED_ACTIVE'
  },
  {
    certificateId: 'TUNNEL-SAFE-AZ-2026-76503',
    tunnelId: 'aghsu-serpentine',
    tunnelName: 'Ağsu Aşırımı Qayaqoruyucu Qalereya və Tunel',
    vehiclePlate: '77-TN-303',
    vehicleCategory: 'freight_tir',
    fireThreatStage: 'ADVISORY_HAZARD_STAGE_1',
    criticalVelocityMs: 3.65,
    actualVelocityMs: 3.80,
    backlayeringSafe: true,
    opticalVisibilityM: 52.0,
    egressMarginSec: 180,
    safetyScore: 84,
    issueDateIso: '2026-10-25T09:40:00.000Z',
    expiryDateIso: '2027-04-25T09:40:00.000Z',
    simaDigitalUid: 'SIMA-TUN-31D8E77-AZ',
    qrVerificationHash: 'SHA256-AGSU-SAFE-76503-2026',
    evacuationPasscode: 'EP-9104-CROSS',
    status: 'VERIFIED_ACTIVE'
  },
  {
    certificateId: 'TUNNEL-SAFE-AZ-2026-62019',
    tunnelId: 'shusha-dashalti',
    tunnelName: 'Zəfər Yolu Şuşa-Daşaltı Qala Tuneli',
    vehiclePlate: '99-TN-505',
    vehicleCategory: 'tourist_coach',
    fireThreatStage: 'SAFE_NORMAL_OPERATION',
    criticalVelocityMs: 3.20,
    actualVelocityMs: 3.50,
    backlayeringSafe: true,
    opticalVisibilityM: 90.0,
    egressMarginSec: 290,
    safetyScore: 90,
    issueDateIso: '2026-10-28T16:00:00.000Z',
    expiryDateIso: '2027-04-28T16:00:00.000Z',
    simaDigitalUid: 'SIMA-TUN-99A0F14-AZ',
    qrVerificationHash: 'SHA256-SHSH-SAFE-62019-2026',
    evacuationPasscode: 'EP-2391-CROSS',
    status: 'VERIFIED_ACTIVE'
  },
  {
    certificateId: 'TUNNEL-SAFE-AZ-2026-51842',
    tunnelId: 'baku-bayil',
    tunnelName: 'Bakı Dairəvi-1 Bayıl-Badamdar Tuneli',
    vehiclePlate: '00-FHN-606',
    vehicleCategory: 'rescue_response_unit',
    fireThreatStage: 'SAFE_NORMAL_OPERATION',
    criticalVelocityMs: 2.50,
    actualVelocityMs: 3.60,
    backlayeringSafe: true,
    opticalVisibilityM: 98.0,
    egressMarginSec: 420,
    safetyScore: 100,
    issueDateIso: '2026-11-01T11:20:00.000Z',
    expiryDateIso: '2027-05-01T11:20:00.000Z',
    simaDigitalUid: 'SIMA-TUN-00FHN01-AZ',
    qrVerificationHash: 'SHA256-FHN-RESCUE-51842-2026',
    evacuationPasscode: 'EP-0001-ADMIN',
    status: 'VERIFIED_ACTIVE'
  }
];
