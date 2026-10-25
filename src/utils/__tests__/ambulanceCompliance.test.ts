import { describe, it, expect } from 'vitest';
import {
  calculateAmbulanceAuditScore,
  formatAmbulancePlate,
  generateAmbulancePermitNumber,
  generateAmbulanceHash,
  convertAmbulanceCurrency,
  filterEmsSubstations,
  filterAmbulancePermits,
  gradeEmsExam
} from '../ambulanceCompliance';
import {
  AMBULANCE_CHECKLIST_ITEMS,
  EMS_SUBSTATIONS,
  SAMPLE_AMBULANCE_PERMITS,
  EMS_EXAM_QUESTIONS
} from '../../data/mockAmbulanceData';

describe('ambulanceCompliance utility functions', () => {
  it('calculates 100% score when all items are checked for Class C', () => {
    const checkedMap: Record<string, boolean> = {};
    AMBULANCE_CHECKLIST_ITEMS.forEach(item => {
      checkedMap[item.id] = true;
    });

    const result = calculateAmbulanceAuditScore(checkedMap, AMBULANCE_CHECKLIST_ITEMS, 'class_c');

    expect(result.scorePercentage).toBe(100);
    expect(result.isEligibleForTargetClass).toBe(true);
    expect(result.highestEligibleClass).toBe('class_c');
    expect(result.totalFineAzn).toBe(0);
    expect(result.unmetMandatoryItems.length).toBe(0);
  });

  it('detects missing ventilator and calculates fines for Class C while remaining eligible for Class B', () => {
    const checkedMap: Record<string, boolean> = {};
    AMBULANCE_CHECKLIST_ITEMS.forEach(item => {
      // Uncheck ventilator and syringe infusion pump
      if (item.id !== 'transport_ventilator' && item.id !== 'syringe_infusion_pump') {
        checkedMap[item.id] = true;
      }
    });

    const result = calculateAmbulanceAuditScore(checkedMap, AMBULANCE_CHECKLIST_ITEMS, 'class_c');

    expect(result.isEligibleForTargetClass).toBe(false);
    expect(result.highestEligibleClass).toBe('class_b');
    expect(result.totalFineAzn).toBe(550); // 300 (ventilator) + 250 (infusion pump)
    expect(result.unmetMandatoryItems).toContain('transport_ventilator');
    expect(result.unmetMandatoryItems).toContain('syringe_infusion_pump');
  });

  it('detects missing defibrillator for Class B and defaults highest eligible class to Class A', () => {
    const checkedMap: Record<string, boolean> = {};
    // Only check Class A required items
    AMBULANCE_CHECKLIST_ITEMS.forEach(item => {
      if (item.requiredForClasses.includes('class_a') && item.requiredForClasses.length === 3) {
        checkedMap[item.id] = true;
      }
    });

    const result = calculateAmbulanceAuditScore(checkedMap, AMBULANCE_CHECKLIST_ITEMS, 'class_b');

    expect(result.isEligibleForTargetClass).toBe(false);
    expect(result.highestEligibleClass).toBe('class_a');
  });

  it('formats ambulance license plate properly', () => {
    expect(formatAmbulancePlate('99jh103')).toBe('99-JH-103');
    expect(formatAmbulancePlate('10pa103')).toBe('10-PA-103');
    expect(formatAmbulancePlate('99-JH-103')).toBe('99-JH-103');
    expect(formatAmbulancePlate('CUSTOM')).toBe('CUSTOM');
  });

  it('generates consistent permit numbers and security hash', () => {
    const seeded = generateAmbulancePermitNumber(10399);
    expect(seeded).toBe('TABIB-EMS-2026-10399');

    const randomPermit = generateAmbulancePermitNumber();
    expect(randomPermit).toMatch(/^TABIB-EMS-2026-\d{5}$/);

    const hash = generateAmbulanceHash('TABIB-EMS-2026-10301', '99-JH-103', 'WDB9066351S892103');
    expect(hash).toContain('SHA256:EMS:');
  });

  it('converts currencies using standard platform FX multipliers', () => {
    expect(convertAmbulanceCurrency(170, 'AZN')).toBe(170);
    expect(convertAmbulanceCurrency(170, 'USD')).toBe(100);
    expect(convertAmbulanceCurrency(185, 'EUR')).toBe(100);
  });

  it('filters EMS substations by query and region', () => {
    const allBaku = filterEmsSubstations(EMS_SUBSTATIONS, '', 'Baku');
    expect(allBaku.length).toBeGreaterThan(0);
    expect(allBaku.every(s => s.region === 'Baku')).toBe(true);

    const searchYasamal = filterEmsSubstations(EMS_SUBSTATIONS, 'Yasamal', 'all');
    expect(searchYasamal.length).toBe(1);
    expect(searchYasamal[0].nameAz).toContain('Yasamal');

    const searchGanja = filterEmsSubstations(EMS_SUBSTATIONS, 'Gəncə', 'all');
    expect(searchGanja.length).toBe(1);
  });

  it('filters ambulance permits in unified registry', () => {
    const byPlate = filterAmbulancePermits(SAMPLE_AMBULANCE_PERMITS, '99-JH-103');
    expect(byPlate.length).toBe(1);
    expect(byPlate[0].permitNumber).toBe('TABIB-EMS-2026-10301');

    const byVoen = filterAmbulancePermits(SAMPLE_AMBULANCE_PERMITS, '1401234561');
    expect(byVoen.length).toBe(1);

    const emptyFilter = filterAmbulancePermits(SAMPLE_AMBULANCE_PERMITS, '');
    expect(emptyFilter.length).toBe(SAMPLE_AMBULANCE_PERMITS.length);
  });

  it('grades theoretical examination accurately (pass at 9/10, fail below 9)', () => {
    // Perfect 10/10
    const perfectAnswers: Record<number, number> = {};
    EMS_EXAM_QUESTIONS.forEach(q => {
      perfectAnswers[q.id] = q.correctIndex;
    });

    const perfectResult = gradeEmsExam(perfectAnswers, EMS_EXAM_QUESTIONS);
    expect(perfectResult.correct).toBe(10);
    expect(perfectResult.scorePercentage).toBe(100);
    expect(perfectResult.passed).toBe(true);
    expect(perfectResult.incorrectQuestions.length).toBe(0);

    // 8/10 (Fail for emergency code-3 driver certification)
    const failingAnswers = { ...perfectAnswers };
    failingAnswers[1] = 0; // wrong
    failingAnswers[2] = 0; // wrong

    const failingResult = gradeEmsExam(failingAnswers, EMS_EXAM_QUESTIONS);
    expect(failingResult.correct).toBe(8);
    expect(failingResult.scorePercentage).toBe(80);
    expect(failingResult.passed).toBe(false);
    expect(failingResult.incorrectQuestions).toEqual([1, 2]);
  });
});
