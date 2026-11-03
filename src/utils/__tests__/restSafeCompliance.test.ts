import { describe, it, expect } from 'vitest';
import {
  convertRestCurrency,
  calculateDriverFatigue,
  calculateParkingTariff,
  calculateStatutorySanctions,
  evaluateRestChecklist,
  evaluateRestExam,
  generateRestReservationRecord,
  DriverFatigueInput,
  RestChecklistItem,
  RestExamQuestion,
  RestAreaFacility,
} from '../restSafeCompliance';

describe('restSafeCompliance utility', () => {
  it('converts currencies correctly', () => {
    expect(convertRestCurrency(100, 'AZN')).toBe(100);
    expect(convertRestCurrency(100, 'USD')).toBe(58.82);
    expect(convertRestCurrency(100, 'EUR')).toBe(54.05);
  });

  it('calculates driver fatigue within normal alert limits', () => {
    const input: DriverFatigueInput = {
      continuousDrivingHours: 2.0,
      restTakenMinutes: 0,
      dailyDrivingHours: 3.5,
      hoursAwake: 8.0,
      timeOfDay: 'DAY',
      perclosPct: 4.0,
      steeringCorrectionsPerMin: 22,
      vehicleSpeedKmh: 90,
      vehicleCategory: 'SEMI_TRAILER_TIR',
      shorePowerNeeded: false,
      parkingDurationHours: 2,
    };

    const res = calculateDriverFatigue(input);
    expect(res.aetrContinuousCompliant).toBe(true);
    expect(res.aetrStatus).toBe('COMPLIANT');
    expect(res.fatigueLevel).toBe('ALERT');
    expect(res.minutesUntilMandatoryBreak).toBe(150); // (4.5 - 2.0) * 60
    expect(res.reactionTimeDegradedSec).toBeGreaterThanOrEqual(1.0);
    expect(res.totalStoppingDistanceMeters).toBeGreaterThan(0);
  });

  it('flags warning when approaching 4.5 hours continuous driving', () => {
    const input: DriverFatigueInput = {
      continuousDrivingHours: 4.2,
      restTakenMinutes: 10,
      dailyDrivingHours: 7.0,
      hoursAwake: 12.0,
      timeOfDay: 'DAY',
      perclosPct: 7.0,
      steeringCorrectionsPerMin: 18,
      vehicleSpeedKmh: 85,
      vehicleCategory: 'SEMI_TRAILER_TIR',
      shorePowerNeeded: false,
      parkingDurationHours: 1,
    };

    const res = calculateDriverFatigue(input);
    expect(res.aetrStatus).toBe('WARNING_NEAR_LIMIT');
    expect(res.aetrContinuousCompliant).toBe(true);
    expect(res.minutesUntilMandatoryBreak).toBe(18); // (4.5 - 4.2) * 60
  });

  it('flags critical overdue and severe drowsiness when driving exceeds 4.5 hours without rest', () => {
    const input: DriverFatigueInput = {
      continuousDrivingHours: 5.5,
      restTakenMinutes: 15,
      dailyDrivingHours: 9.8,
      hoursAwake: 18.0,
      timeOfDay: 'NIGHT',
      perclosPct: 18.0,
      steeringCorrectionsPerMin: 6,
      vehicleSpeedKmh: 90,
      vehicleCategory: 'SEMI_TRAILER_TIR',
      shorePowerNeeded: true,
      parkingDurationHours: 8,
    };

    const res = calculateDriverFatigue(input);
    expect(res.aetrStatus).toBe('CRITICAL_OVERDUE');
    expect(res.aetrContinuousCompliant).toBe(false);
    expect(res.perclosRisk).toBe('CRITICAL');
    expect(res.fatigueLevel).toBe('SEVERE_MICROSLEEP_RISK');
    expect(res.reactionTimeDegradedSec).toBeGreaterThan(1.5);
    expect(res.recommendedActionAz).toContain('TƏCİLİ DAYANMA TƏLƏB OLUNUR');
  });

  it('calculates parking tariffs with free hours and shore power', () => {
    // 2 hours TIR, no shore power -> free
    const shortStay = calculateParkingTariff(2, false, 'SEMI_TRAILER_TIR');
    expect(shortStay.freeHours).toBe(2);
    expect(shortStay.billableHours).toBe(0);
    expect(shortStay.parkingFeeAzn).toBe(0);
    expect(shortStay.totalFeeAzn).toBe(0);

    // 8 hours TIR with shore power
    const longStay = calculateParkingTariff(8, true, 'SEMI_TRAILER_TIR');
    expect(longStay.freeHours).toBe(2);
    expect(longStay.billableHours).toBe(6);
    expect(longStay.parkingFeeAzn).toBe(9); // 6 * 1.5 = 9 AZN
    expect(longStay.shorePowerFeeAzn).toBe(6.4); // 8 * 0.8 = 6.4 AZN
    expect(longStay.totalFeeAzn).toBe(15.4);
    expect(longStay.amenitiesIncluded).toContain('400V / 32A Soyuducu (Reefer) Elektrik Şəbəkəsi');
  });

  it('calculates statutory sanctions under İXM 322-1 and 346 with 50% discount', () => {
    const criticalFatigue = calculateDriverFatigue({
      continuousDrivingHours: 5.2,
      restTakenMinutes: 0,
      dailyDrivingHours: 8.0,
      hoursAwake: 14.0,
      timeOfDay: 'DAY',
      perclosPct: 10.0,
      steeringCorrectionsPerMin: 14,
      vehicleSpeedKmh: 80,
      vehicleCategory: 'SEMI_TRAILER_TIR',
      shorePowerNeeded: false,
      parkingDurationHours: 4,
    });

    const fines = calculateStatutorySanctions(criticalFatigue, true);
    expect(fines.aetrViolation).toBe(true);
    expect(fines.aetrFineAzn).toBe(40);
    expect(fines.aetrFineDiscountedAzn).toBe(20);
    expect(fines.illegalShoulderParkingViolation).toBe(true);
    expect(fines.illegalShoulderFineAzn).toBe(40);
    expect(fines.illegalShoulderDiscountedAzn).toBe(20);
    expect(fines.totalFineAzn).toBe(80);
    expect(fines.totalFineDiscountedAzn).toBe(40);
    expect(fines.demeritPoints).toBe(4);
    expect(fines.legalArticles.length).toBe(2);
  });

  it('evaluates technical rest area checklist scoring and SSTPA tiers', () => {
    const checklist: RestChecklistItem[] = [
      {
        id: '1',
        code: 'SSTPA-01',
        titleAz: 'CCTV kamera',
        titleEn: 'CCTV camera',
        titleRu: 'CCTV камера',
        category: 'SECURITY',
        standardRef: 'EU 885/2013',
        points: 10,
        passed: true,
      },
      {
        id: '2',
        code: 'SSTPA-02',
        titleAz: 'Hasar və işıqlandırma',
        titleEn: 'Fencing & lighting',
        titleRu: 'Ограждение и освещение',
        category: 'SECURITY',
        standardRef: 'EU 885/2013',
        points: 10,
        passed: true,
      },
      {
        id: '3',
        code: 'SSTPA-03',
        titleAz: 'Duş və sanitar',
        titleEn: 'Showers & sanitaries',
        titleRu: 'Душ и санузел',
        category: 'HYGIENE',
        standardRef: 'AZS 410',
        points: 10,
        passed: false,
      },
    ];

    const result = evaluateRestChecklist(checklist);
    expect(result.totalPoints).toBe(20);
    expect(result.scorePct).toBe(67);
    expect(result.sstpaAchievedTier).toBe('SILVER');
    expect(result.passedCount).toBe(2);
    expect(result.failedCount).toBe(1);
  });

  it('evaluates theoretical examination questions', () => {
    const questions: RestExamQuestion[] = [
      {
        id: 'q1',
        questionAz: 'Sual 1',
        questionEn: 'Question 1',
        questionRu: 'Вопрос 1',
        optionsAz: ['A', 'B'],
        optionsEn: ['A', 'B'],
        optionsRu: ['A', 'B'],
        correctAnswer: 0,
        explanationAz: 'İzah 1',
        explanationEn: 'Explanation 1',
        explanationRu: 'Объяснение 1',
        legalCitation: 'AETR',
      },
      {
        id: 'q2',
        questionAz: 'Sual 2',
        questionEn: 'Question 2',
        questionRu: 'Вопрос 2',
        optionsAz: ['A', 'B'],
        optionsEn: ['A', 'B'],
        optionsRu: ['A', 'B'],
        correctAnswer: 1,
        explanationAz: 'İzah 2',
        explanationEn: 'Explanation 2',
        explanationRu: 'Объяснение 2',
        legalCitation: 'AETR',
      },
    ];

    const passRes = evaluateRestExam(questions, { q1: 0, q2: 1 });
    expect(passRes.score).toBe(2);
    expect(passRes.total).toBe(2);
    expect(passRes.percentage).toBe(100);

    const failRes = evaluateRestExam(questions, { q1: 1, q2: 0 });
    expect(failRes.score).toBe(0);
    expect(failRes.percentage).toBe(0);
  });

  it('generates an authentic REST-SAFE-AZ-2026 reservation record', () => {
    const mockFacility: RestAreaFacility = {
      id: 'fac-1',
      code: 'M1-KM52',
      nameAz: 'Yaşma Logistika və Vaha İstirahət Kompleksi',
      nameEn: 'Yashma Logistics & Oasis Rest Complex',
      nameRu: 'Логистический оазис Яшма',
      corridor: 'M-1 Bakı - Quba - Rusiya Sərhədi',
      routeNumber: 'M-1',
      picketKm: 'Km 52+400',
      kmNumeric: 52.4,
      gpsLat: 40.7128,
      gpsLng: 49.3821,
      sstpaTier: 'PLATINUM',
      totalTirBays: 85,
      occupiedTirBays: 42,
      reservedTirBays: 10,
      totalCarBays: 120,
      occupiedCarBays: 55,
      shorePowerPlugsTotal: 16,
      shorePowerPlugsOccupied: 6,
      amenities: {
        motelBeds: 40,
        showers: true,
        canteen24h: true,
        mosque: true,
        wifi: true,
        cctvSecurity24h: true,
        fuelStationSocar: true,
        evChargersHpc: 4,
        truckRepairPit: true,
        defibrillatorAed: true,
      },
      liveOccupancyPct: 61,
      status: 'OPEN_AVAILABLE',
    };

    const record = generateRestReservationRecord(
      mockFacility,
      '99-RS-101',
      'SEMI_TRAILER_TIR',
      'Elmar Məmmədov',
      '5ABC123',
      'Silk Way Logistics QSC',
      6,
      true
    );

    expect(record.certificateNumber).toContain('REST-SAFE-AZ-2026-');
    expect(record.vehiclePlate).toBe('99-RS-101');
    expect(record.driverName).toBe('Elmar Məmmədov');
    expect(record.driverFin).toBe('5ABC123');
    expect(record.companyName).toBe('Silk Way Logistics QSC');
    expect(record.restAreaName).toBe(mockFacility.nameAz);
    expect(record.bayNumber).toMatch(/^TIR-\d{2}$/);
    expect(record.shorePowerRequested).toBe(true);
    expect(record.barrierPinCode.length).toBe(6);
    expect(record.paymentStatus).toBe('PAID_ASANPAY');
    expect(record.simaDigitalUid).toContain('SIMA-AETR-');
  });
});
