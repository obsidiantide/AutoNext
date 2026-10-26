import { describe, it, expect } from 'vitest';
import {
  convertAznToCurrency,
  getPassengerTicketRateAzn,
  getVehicleBaseRateAzn,
  getVehicleCategoryLabel,
  getPassengerClassLabel,
  calculateMotorailFare,
  evaluateRailwayCrossingViolation,
  evaluateRailwayChecklist,
  gradeRailwayExam,
  generateRailwayBoardingPass,
  formatAzerbaijanPlate,
  RailwayChecklistItem,
  RailwayExamQuestion,
} from '../railwayCompliance';

describe('railwayCompliance utility suite', () => {
  describe('convertAznToCurrency', () => {
    it('returns exact AZN when currency is AZN', () => {
      expect(convertAznToCurrency(100, 'AZN')).toBe(100);
    });

    it('converts to USD correctly', () => {
      // 100 * 0.5882 = 58.82
      expect(convertAznToCurrency(100, 'USD')).toBe(58.82);
    });

    it('converts to EUR correctly', () => {
      // 100 * 0.5405 = 54.05
      expect(convertAznToCurrency(100, 'EUR')).toBe(54.05);
    });
  });

  describe('rate and label helpers', () => {
    it('returns correct passenger ticket rates', () => {
      expect(getPassengerTicketRateAzn('standard_seat')).toBe(20);
      expect(getPassengerTicketRateAzn('kupe_4berth')).toBe(35);
      expect(getPassengerTicketRateAzn('sv_2berth')).toBe(60);
      expect(getPassengerTicketRateAzn('business_vip')).toBe(110);
    });

    it('returns correct vehicle base carriage rates', () => {
      expect(getVehicleBaseRateAzn('motorcycle_quad')).toBe(35);
      expect(getVehicleBaseRateAzn('sedan_compact')).toBe(65);
      expect(getVehicleBaseRateAzn('suv_crossover')).toBe(85);
      expect(getVehicleBaseRateAzn('minibus_van')).toBe(110);
      expect(getVehicleBaseRateAzn('commercial_light')).toBe(120);
      expect(getVehicleBaseRateAzn('electric_vehicle')).toBe(75);
    });

    it('returns descriptive category labels', () => {
      expect(getVehicleCategoryLabel('sedan_compact')).toContain('Sedan');
      expect(getVehicleCategoryLabel('suv_crossover')).toContain('Krossover');
      expect(getVehicleCategoryLabel('electric_vehicle')).toContain('Elektromobil');
    });

    it('returns descriptive passenger class labels', () => {
      expect(getPassengerClassLabel('standard_seat')).toContain('Standart');
      expect(getPassengerClassLabel('kupe_4berth')).toContain('Kupe');
      expect(getPassengerClassLabel('business_vip')).toContain('VIP');
    });
  });

  describe('calculateMotorailFare', () => {
    it('calculates fare for a standard sedan on Baku-Ganja route', () => {
      const calc = calculateMotorailFare({
        vehicleLengthM: 4.93,
        vehicleWidthM: 1.85,
        vehicleHeightM: 1.47,
        vehicleCurbWeightKg: 1720,
        vehicleCategory: 'sedan_compact',
        passengerCount: 2,
        passengerClass: 'kupe_4berth',
        routeCode: 'BAKU_GANJA',
      });

      expect(calc.baseCarFareAzn).toBe(65);
      expect(calc.passengerTicketsTotalAzn).toBe(70); // 35 * 2
      expect(calc.wagonWheelTieDownFeeAzn).toBe(15);
      expect(calc.stationTerminalFeeAzn).toBe(10);
      expect(calc.evSafetyBatteryAuditFeeAzn).toBe(0);
      expect(calc.deckLevel).toBe('Aşağı Qat (Lower Deck)');
      expect(calc.totalFareAzn).toBe(160);
      expect(calc.co2SavedKg).toBeGreaterThan(0);
      expect(calc.estimatedHighwayFuelSavedLiters).toBeGreaterThan(0);
    });

    it('assigns Upper Deck for vehicles taller than 1.85m', () => {
      const calc = calculateMotorailFare({
        vehicleLengthM: 4.84,
        vehicleWidthM: 1.88,
        vehicleHeightM: 1.89, // > 1.85m
        vehicleCurbWeightKg: 2240,
        vehicleCategory: 'suv_crossover',
        passengerCount: 1,
        passengerClass: 'standard_seat',
        routeCode: 'BAKU_QABALA',
      });

      expect(calc.deckLevel).toBe('Yuxarı Qat (Upper Deck)');
    });

    it('includes EV thermal safety audit fee when isElectric is true', () => {
      const calc = calculateMotorailFare({
        vehicleLengthM: 4.99,
        vehicleWidthM: 1.91,
        vehicleHeightM: 1.49,
        vehicleCurbWeightKg: 2150,
        vehicleCategory: 'electric_vehicle',
        passengerCount: 1,
        passengerClass: 'standard_seat',
        routeCode: 'BAKU_GANJA',
        isElectric: true,
        batterySocPercent: 65,
      });

      expect(calc.isElectric).toBe(true);
      expect(calc.evSafetyBatteryAuditFeeAzn).toBe(10);
    });

    it('scales fares by distance for longer routes like Baku-Boyuk Kesik', () => {
      const calc = calculateMotorailFare({
        vehicleLengthM: 4.82,
        vehicleWidthM: 1.83,
        vehicleHeightM: 1.84,
        vehicleCurbWeightKg: 1680,
        vehicleCategory: 'commercial_light',
        passengerCount: 1,
        passengerClass: 'standard_seat',
        routeCode: 'BAKU_BOYUK_KESIK',
      });

      expect(calc.baseCarFareAzn).toBeGreaterThan(120);
    });
  });

  describe('evaluateRailwayCrossingViolation', () => {
    it('evaluates safe passage when lights are white and barrier is open', () => {
      const result = evaluateRailwayCrossingViolation({
        distanceMeters: 20,
        barrierState: 'fully_open',
        lightsState: 'white_clear',
        bellActive: false,
        trainApproaching: false,
      });

      expect(result.verdict).toBe('safe_passage');
      expect(result.isViolation).toBe(false);
      expect(result.fineAzn).toBe(0);
      expect(result.penaltyPoints).toBe(0);
    });

    it('requires stopping when lights are red but vehicle is safely at distance', () => {
      const result = evaluateRailwayCrossingViolation({
        distanceMeters: 25,
        barrierState: 'lowering',
        lightsState: 'red_flashing_stop',
        bellActive: true,
        trainApproaching: true,
      });

      expect(result.verdict).toBe('stopping_required');
      expect(result.isViolation).toBe(false);
    });

    it('flags violation under İXM 345 when vehicle is closer than 5m during closing barrier', () => {
      const result = evaluateRailwayCrossingViolation({
        distanceMeters: 3, // < 5m
        barrierState: 'fully_closed',
        lightsState: 'red_flashing_stop',
        bellActive: true,
        trainApproaching: true,
        trainDistanceMeters: 400,
        trainSpeedKmH: 120,
      });

      expect(result.isViolation).toBe(true);
      expect(result.violationArticle).toContain('İXM Maddə 345');
      expect(result.fineAzn).toBe(100);
      expect(result.penaltyPoints).toBe(3);
    });

    it('detects critical danger when vehicle enters tracks (distance <= 0)', () => {
      const result = evaluateRailwayCrossingViolation({
        distanceMeters: 0,
        barrierState: 'fully_closed',
        lightsState: 'red_flashing_stop',
        bellActive: true,
        trainApproaching: true,
        trainDistanceMeters: 200,
        trainSpeedKmH: 120,
      });

      expect(result.isViolation).toBe(true);
      expect(result.fineAzn).toBe(150);
      expect(result.penaltyPoints).toBe(4);
      expect(result.verdict).toBe('critical_danger');
    });
  });

  describe('evaluateRailwayChecklist', () => {
    const mockItems: RailwayChecklistItem[] = [
      {
        id: '1',
        title: 'Catenary Height',
        category: 'dimensions',
        description: 'Height check',
        standardRef: 'GOST',
        isCritical: true,
        passed: true,
      },
      {
        id: '2',
        title: 'Chocking',
        category: 'chocking',
        description: 'Chock check',
        standardRef: 'ADY',
        isCritical: true,
        passed: true,
      },
      {
        id: '3',
        title: 'Mirror fold',
        category: 'dimensions',
        description: 'Fold mirrors',
        standardRef: 'ADY',
        isCritical: false,
        passed: true,
      },
    ];

    it('returns unconditional approval when all items pass', () => {
      const score = evaluateRailwayChecklist(mockItems);
      expect(score.score).toBe(100);
      expect(score.clearanceLevel).toBe('unconditional_approved');
      expect(score.penaltyAzn).toBe(0);
      expect(score.passed).toBe(true);
    });

    it('returns rejected when a critical item fails', () => {
      const failedCritical = mockItems.map((item, idx) =>
        idx === 0 ? { ...item, passed: false } : item
      );
      const score = evaluateRailwayChecklist(failedCritical);
      expect(score.clearanceLevel).toBe('rejected');
      expect(score.passed).toBe(false);
      expect(score.penaltyAzn).toBe(80);
      expect(score.criticalFail).toBe(true);
    });

    it('returns conditional approval when only a non-critical item fails and score is >=70%', () => {
      const failedNonCritical = mockItems.map((item, idx) =>
        idx === 2 ? { ...item, passed: false } : item
      );
      const score = evaluateRailwayChecklist(failedNonCritical);
      expect(score.criticalFail).toBe(false);
      expect(score.clearanceLevel).toBe('conditional_approved');
      expect(score.penaltyAzn).toBe(30);
    });

    it('handles empty checklist array safely', () => {
      const score = evaluateRailwayChecklist([]);
      expect(score.score).toBe(100);
      expect(score.clearanceLevel).toBe('unconditional_approved');
    });
  });

  describe('gradeRailwayExam', () => {
    const mockQuestions: RailwayExamQuestion[] = [
      {
        id: 'q1',
        question: 'Distance to rail?',
        options: ['10m', '5m', '2m'],
        correctAnswerIndex: 0,
        explanation: '10m without barrier',
        standardRef: 'YHQ 44',
      },
      {
        id: 'q2',
        question: 'İXM 345 fine?',
        options: ['100 AZN', '20 AZN', '50 AZN'],
        correctAnswerIndex: 0,
        explanation: '100 AZN + 3 points',
        standardRef: 'İXM 345',
      },
    ];

    it('grades 100% and assigns Grade A', () => {
      const result = gradeRailwayExam(mockQuestions, { q1: 0, q2: 0 });
      expect(result.scorePercent).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.grade).toBe('A');
    });

    it('grades 50% and assigns Grade F when below 60%', () => {
      const result = gradeRailwayExam(mockQuestions, { q1: 0, q2: 1 });
      expect(result.scorePercent).toBe(50);
      expect(result.passed).toBe(false);
      expect(result.grade).toBe('F');
    });

    it('handles empty questions list', () => {
      const result = gradeRailwayExam([], {});
      expect(result.scorePercent).toBe(100);
      expect(result.passed).toBe(true);
    });
  });

  describe('generateRailwayBoardingPass', () => {
    it('creates a valid boarding pass with correct formatting and data', () => {
      const pass = generateRailwayBoardingPass({
        plateNumber: '10-AZ-700',
        vin: 'WDB2130421A987654',
        vehicleName: 'Mercedes-Benz E-Class',
        vehicleCategory: 'sedan_compact',
        passengerFullName: 'Cavid Həsənov',
        passengerFin: '5K92LA1',
        passengerCount: 2,
        passengerClass: 'kupe_4berth',
        routeCode: 'BAKU_GANJA',
        totalFareAzn: 160,
      });

      expect(pass.passId).toMatch(/^ADY-RAIL-2026-\d{5}$/);
      expect(pass.plateNumber).toBe('10-AZ-700');
      expect(pass.trainNumber).toContain('ADY');
      expect(pass.wagonNumber).toContain('Avtovaqon');
      expect(pass.seatNumbers).toContain('Yer');
      expect(pass.gatePinCode).toHaveLength(4);
      expect(pass.securityHash).toContain('SHA256:');
      expect(pass.simaSignatureUid).toContain('SIMA-AZ-RAIL-');
      expect(pass.qrData).toContain('ACTIVE_VALIDATED');
    });
  });

  describe('formatAzerbaijanPlate', () => {
    it('formats 7-character plate numbers with proper hyphens', () => {
      expect(formatAzerbaijanPlate('10az700')).toBe('10-AZ-700');
      expect(formatAzerbaijanPlate('99ad333')).toBe('99-AD-333');
    });

    it('returns uppercase input when length is not 7', () => {
      expect(formatAzerbaijanPlate('10-az-700')).toBe('10-AZ-700');
    });
  });
});
