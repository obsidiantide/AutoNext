export type AmbulanceClass = 'class_a' | 'class_b' | 'class_c';

export type AmbulanceCategory = 
  | 'patient_transport' // Klass A
  | 'emergency_care'    // Klass B
  | 'resuscitation';    // Klass C (Reanimomobil)

export interface AmbulanceChecklistItem {
  id: string;
  labelAz: string;
  labelEn: string;
  labelRu: string;
  category: 'mechanical' | 'medical' | 'electrical' | 'identification' | 'personnel';
  requiredForClasses: AmbulanceClass[];
  penaltyAzn: number;
  penaltyPoints: number;
  legalBasis: string;
}

export interface AmbulanceVehiclePreset {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  vehicleClass: AmbulanceClass;
  ambulanceType: string;
  plate: string;
  vin: string;
  engine: string;
  baseCostAzn: number;
  typicalEquipment: string[];
}

export interface EmsSubstation {
  id: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  addressAz: string;
  addressEn: string;
  addressRu: string;
  region: 'Baku' | 'Sumgayit' | 'Ganja' | 'Absheron' | 'Regions';
  phone: string;
  activeAmbulances: number;
  avgResponseMinutes: number;
  chiefPhysician: string;
}

export interface RescueCorridorScenario {
  id: string;
  titleAz: string;
  titleEn: string;
  titleRu: string;
  roadType: string;
  lanesCount: number;
  descriptionAz: string;
  descriptionEn: string;
  descriptionRu: string;
  correctDriverActionAz: string;
  correctDriverActionEn: string;
  correctDriverActionRu: string;
  legalPenaltyAzn: number;
  legalPenaltyPoints: number;
  legalArticle: string;
}

export interface EmsExamQuestion {
  id: number;
  questionAz: string;
  questionEn: string;
  questionRu: string;
  optionsAz: string[];
  optionsEn: string[];
  optionsRu: string[];
  correctIndex: number;
  explanationAz: string;
  explanationEn: string;
  explanationRu: string;
  legalBasis: string;
}

export interface AmbulancePermitRecord {
  permitNumber: string;
  issueDate: string;
  expiryDate: string;
  plateNumber: string;
  vin: string;
  organizationName: string;
  voen: string;
  vehicleClass: AmbulanceClass;
  ambulanceType: string;
  assignedStation: string;
  oxygenInspectionDate: string;
  chiefPhysicianSignature: string;
  status: 'valid' | 'expired' | 'revoked';
  verificationHash: string;
}

export interface AmbulanceAuditResult {
  totalItems: number;
  passedItems: number;
  scorePercentage: number;
  isEligibleForTargetClass: boolean;
  highestEligibleClass: AmbulanceClass | null;
  totalFineAzn: number;
  totalPoints: number;
  unmetMandatoryItems: string[];
}

/**
 * Calculates audit score and regulatory compliance for an ambulance based on target class
 */
export function calculateAmbulanceAuditScore(
  checkedMap: Record<string, boolean>,
  items: AmbulanceChecklistItem[],
  targetClass: AmbulanceClass
): AmbulanceAuditResult {
  const targetRequiredItems = items.filter(item => item.requiredForClasses.includes(targetClass));
  const passedTargetItems = targetRequiredItems.filter(item => !!checkedMap[item.id]);

  let totalFineAzn = 0;
  let totalPoints = 0;
  const unmetMandatoryItems: string[] = [];

  targetRequiredItems.forEach(item => {
    if (!checkedMap[item.id]) {
      totalFineAzn += item.penaltyAzn;
      totalPoints = Math.max(totalPoints, item.penaltyPoints);
      unmetMandatoryItems.push(item.id);
    }
  });

  const totalItems = targetRequiredItems.length;
  const passedItems = passedTargetItems.length;
  const scorePercentage = totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 100;
  const isEligibleForTargetClass = unmetMandatoryItems.length === 0;

  // Determine highest eligible class
  const classRanking: AmbulanceClass[] = ['class_c', 'class_b', 'class_a'];
  let highestEligibleClass: AmbulanceClass | null = null;

  for (const c of classRanking) {
    const requiredForC = items.filter(item => item.requiredForClasses.includes(c));
    const allPassed = requiredForC.every(item => !!checkedMap[item.id]);
    if (allPassed) {
      highestEligibleClass = c;
      break;
    }
  }

  return {
    totalItems,
    passedItems,
    scorePercentage,
    isEligibleForTargetClass,
    highestEligibleClass,
    totalFineAzn,
    totalPoints,
    unmetMandatoryItems
  };
}

/**
 * Validates and formats Azerbaijan ambulance license plate (e.g. 99-JH-103 or 10-PA-103)
 */
export function formatAmbulancePlate(input: string): string {
  const clean = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length === 7) {
    return `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4, 7)}`;
  }
  return input.toUpperCase().trim();
}

/**
 * Generates an official electronic TƏBİB EMS Permit number
 */
export function generateAmbulancePermitNumber(seed?: number): string {
  const num = seed ?? Math.floor(10000 + Math.random() * 90000);
  return `TABIB-EMS-2026-${num}`;
}

/**
 * Creates a verification hash for the certificate
 */
export function generateAmbulanceHash(permitNumber: string, plate: string, vin: string): string {
  const raw = `${permitNumber}:${plate}:${vin}:AZ_TABIB_VERIFIED`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return `SHA256:EMS:${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;
}

/**
 * Converts AZN currency to USD and EUR using standard platform exchange rates
 */
export function convertAmbulanceCurrency(amountAzn: number, currency: 'AZN' | 'USD' | 'EUR'): number {
  switch (currency) {
    case 'USD':
      return Math.round((amountAzn / 1.70) * 100) / 100;
    case 'EUR':
      return Math.round((amountAzn / 1.85) * 100) / 100;
    case 'AZN':
    default:
      return Math.round(amountAzn * 100) / 100;
  }
}

/**
 * Filters EMS substations by search query and region
 */
export function filterEmsSubstations(
  stations: EmsSubstation[],
  query: string,
  regionFilter: string = 'all'
): EmsSubstation[] {
  const q = query.toLowerCase().trim();
  return stations.filter(station => {
    const matchesQuery = !q ||
      station.nameAz.toLowerCase().includes(q) ||
      station.nameEn.toLowerCase().includes(q) ||
      station.addressAz.toLowerCase().includes(q) ||
      station.phone.includes(q);

    const matchesRegion = regionFilter === 'all' || station.region.toLowerCase() === regionFilter.toLowerCase();

    return matchesQuery && matchesRegion;
  });
}

/**
 * Filters ambulance permit registry by plate, VIN, organization or permit number
 */
export function filterAmbulancePermits(
  permits: AmbulancePermitRecord[],
  query: string
): AmbulancePermitRecord[] {
  const q = query.toLowerCase().trim();
  if (!q) return permits;
  return permits.filter(permit =>
    permit.permitNumber.toLowerCase().includes(q) ||
    permit.plateNumber.toLowerCase().includes(q) ||
    permit.vin.toLowerCase().includes(q) ||
    permit.organizationName.toLowerCase().includes(q) ||
    permit.voen.includes(q)
  );
}

/**
 * Grades the theoretical examination for EMS & Ambulance traffic safety
 */
export function gradeEmsExam(
  answers: Record<number, number>,
  questions: EmsExamQuestion[]
): {
  total: number;
  correct: number;
  scorePercentage: number;
  passed: boolean;
  incorrectQuestions: number[];
} {
  const total = questions.length;
  let correct = 0;
  const incorrectQuestions: number[] = [];

  questions.forEach(q => {
    if (answers[q.id] === q.correctIndex) {
      correct++;
    } else {
      incorrectQuestions.push(q.id);
    }
  });

  const scorePercentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  // Passing score is 9 out of 10 (90%) for emergency drivers
  const passed = correct >= 9;

  return {
    total,
    correct,
    scorePercentage,
    passed,
    incorrectQuestions
  };
}
