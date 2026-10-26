import { describe, it, expect } from 'vitest';
import {
  convertAznToCurrency,
  getLinearMeterRateAzn,
  calculateMaritimeFreight,
  evaluateMaritimeSeaState,
  evaluateMaritimeChecklist,
  evaluateMaritimeExam,
  generateMaritimeBoardingPass,
  ROUTE_METADATA,
  CATEGORY_LABELS,
  CABIN_METADATA,
} from '../maritimePortCompliance';
import {
  MOCK_MARITIME_CHECKLIST,
  MOCK_MARITIME_EXAM_QUESTIONS,
} from '../../data/mockMaritimePortData';

describe('maritimePortCompliance utility', () => {
  describe('convertAznToCurrency', () => {
    it('returns original amount for AZN', () => {
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

  describe('getLinearMeterRateAzn', () => {
    it('returns expected rates per category', () => {
      expect(getLinearMeterRateAzn('sedan_compact')).toBe(55);
      expect(getLinearMeterRateAzn('suv_crossover')).toBe(65);
      expect(getLinearMeterRateAzn('minibus_van')).toBe(80);
      expect(getLinearMeterRateAzn('campervan_rv')).toBe(95);
      expect(getLinearMeterRateAzn('tir_semitrailer')).toBe(115);
      expect(getLinearMeterRateAzn('oversize_cargo')).toBe(150);
      expect(getLinearMeterRateAzn('electric_vehicle')).toBe(60);
    });
  });

  describe('calculateMaritimeFreight', () => {
    it('calculates standard freight for sedan on ALAT_AKTAU', () => {
      const result = calculateMaritimeFreight({
        vehicleLengthM: 4.5,
        vehicleCategory: 'sedan_compact',
        passengerCount: 1,
        cabinTier: 'deck_seat',
        routeCode: 'ALAT_AKTAU',
      });

      // base: 4.5 * 55 * 1.0 = 247.5 -> 248
      // passenger: 1 * 80 = 80
      // cabin: 0
      // port dues: 25 + 40 + 30 = 95
      // total: 248 + 80 + 0 + 95 = 423
      expect(result.baseFreightCostAzn).toBe(248);
      expect(result.passengerTicketTotalAzn).toBe(80);
      expect(result.cabinSurchargeAzn).toBe(0);
      expect(result.ispsSecurityFeeAzn).toBe(25);
      expect(result.terminalHandlingFeeAzn).toBe(40);
      expect(result.dgkManifestDutyAzn).toBe(30);
      expect(result.totalPortAndFerryCostAzn).toBe(423);
      expect(result.nauticalMiles).toBe(253);
    });

    it('adds cabin upgrades and passenger tickets', () => {
      const result = calculateMaritimeFreight({
        vehicleLengthM: 5.0,
        vehicleCategory: 'suv_crossover',
        passengerCount: 3,
        cabinTier: 'superior_2berth',
        routeCode: 'ALAT_AKTAU',
      });

      // base: 5.0 * 65 * 1.0 = 325
      // passengers: 3 * 80 = 240
      // cabin: 95
      // dues: 95
      // total: 325 + 240 + 95 + 95 = 755
      expect(result.baseFreightCostAzn).toBe(325);
      expect(result.passengerTicketTotalAzn).toBe(240);
      expect(result.cabinSurchargeAzn).toBe(95);
      expect(result.totalPortAndFerryCostAzn).toBe(755);
    });

    it('applies hazardous IMDG 35% surcharge and EV battery fee', () => {
      const result = calculateMaritimeFreight({
        vehicleLengthM: 10.0,
        vehicleCategory: 'tir_semitrailer',
        passengerCount: 1,
        cabinTier: 'deck_seat',
        routeCode: 'ALAT_KURYK',
        isHazardousImdg: true,
        isElectricVehicle: true,
      });

      // base: 10.0 * 115 * 1.02 = 1173
      // hazmat: round(1173 * 0.35) = 411
      // ev fee: 20
      expect(result.hazardousSurchargeAzn).toBe(411);
      expect(result.evBatteryHandlingFeeAzn).toBe(20);
      expect(result.totalPortAndFerryCostAzn).toBe(
        1173 + 80 + 0 + 25 + 40 + 30 + 411 + 20
      );
    });
  });

  describe('evaluateMaritimeSeaState', () => {
    it('evaluates calm sea (Bft 0-2)', () => {
      const state = evaluateMaritimeSeaState(2, 4);
      expect(state.seaCondition).toBe('calm');
      expect(state.isNavigationPermitted).toBe(true);
      expect(state.lashingRequirement).toBe('standard_4point');
      expect(state.chockPairsRequired).toBe(1);
    });

    it('evaluates moderate sea (Bft 5-6)', () => {
      const state = evaluateMaritimeSeaState(6, 8);
      expect(state.seaCondition).toBe('moderate');
      expect(state.lashingRequirement).toBe('reinforced_6point');
      expect(state.chockPairsRequired).toBe(2);
      expect(state.minLashingTensionKn).toBe(45);
    });

    it('evaluates rough sea (Bft 7)', () => {
      const state = evaluateMaritimeSeaState(7, 12);
      expect(state.seaCondition).toBe('rough');
      expect(state.lashingRequirement).toBe('heavy_8point');
      expect(state.chockPairsRequired).toBe(2);
      expect(state.minLashingTensionKn).toBe(65);
    });

    it('evaluates storm warning (Bft 10+)', () => {
      const state = evaluateMaritimeSeaState(11, 25);
      expect(state.seaCondition).toBe('storm');
      expect(state.isNavigationPermitted).toBe(false);
      expect(state.chockPairsRequired).toBe(3);
    });

    it('escalates lashing if ship roll angle >= 15 deg', () => {
      const state = evaluateMaritimeSeaState(3, 18);
      // normally Bft 3 is standard_4point, with roll 18 it becomes reinforced_6point
      expect(state.lashingRequirement).toBe('reinforced_6point');
      expect(state.minLashingTensionKn).toBe(45);
    });
  });

  describe('evaluateMaritimeChecklist', () => {
    it('returns A rating when all items pass', () => {
      const items = MOCK_MARITIME_CHECKLIST.map((i) => ({ ...i, passed: true }));
      const result = evaluateMaritimeChecklist(items);

      expect(result.passed).toBe(true);
      expect(result.score).toBe(100);
      expect(result.criticalFail).toBe(false);
      expect(result.stowageClearanceLevel).toBe('unconditional_approved');
      expect(result.penaltyAzn).toBe(0);
    });

    it('rejects with penalty if a critical item fails', () => {
      const items = MOCK_MARITIME_CHECKLIST.map((i) =>
        i.id === 'chk-hermeticity' ? { ...i, passed: false } : { ...i, passed: true }
      );
      const result = evaluateMaritimeChecklist(items);

      expect(result.passed).toBe(false);
      expect(result.criticalFail).toBe(true);
      expect(result.stowageClearanceLevel).toBe('rejected');
      expect(result.penaltyAzn).toBe(300);
    });

    it('handles conditional approval for non-critical failures with score >= 70', () => {
      // 8 of 10 passed (80%), no critical failures
      const items = MOCK_MARITIME_CHECKLIST.map((i) =>
        i.id === 'chk-alarm-deactivation' || i.id === 'chk-tire-pressure'
          ? { ...i, passed: false }
          : { ...i, passed: true }
      );
      const result = evaluateMaritimeChecklist(items);

      expect(result.passed).toBe(true);
      expect(result.criticalFail).toBe(false);
      expect(result.score).toBe(80);
      expect(result.stowageClearanceLevel).toBe('conditional_approved');
      expect(result.penaltyAzn).toBe(100);
    });

    it('handles empty checklist gracefully', () => {
      const result = evaluateMaritimeChecklist([]);
      expect(result.score).toBe(0);
      expect(result.passed).toBe(false);
    });
  });

  describe('evaluateMaritimeExam', () => {
    it('grades 100% correct answers as A and passed', () => {
      const answers: Record<string, number> = {};
      MOCK_MARITIME_EXAM_QUESTIONS.forEach((q) => {
        answers[q.id] = q.correctAnswerIndex;
      });

      const result = evaluateMaritimeExam(answers, MOCK_MARITIME_EXAM_QUESTIONS);
      expect(result.passed).toBe(true);
      expect(result.scorePercent).toBe(100);
      expect(result.correctCount).toBe(10);
      expect(result.grade).toBe('A');
    });

    it('grades failing score (< 80%) properly', () => {
      const answers: Record<string, number> = {};
      MOCK_MARITIME_EXAM_QUESTIONS.forEach((q, idx) => {
        // give correct for first 5, incorrect for others
        answers[q.id] = idx < 5 ? q.correctAnswerIndex : (q.correctAnswerIndex + 1) % 4;
      });

      const result = evaluateMaritimeExam(answers, MOCK_MARITIME_EXAM_QUESTIONS);
      expect(result.passed).toBe(false);
      expect(result.scorePercent).toBe(50);
      expect(result.grade).toBe('F');
    });

    it('handles empty questions list', () => {
      const result = evaluateMaritimeExam({}, []);
      expect(result.scorePercent).toBe(0);
      expect(result.passed).toBe(false);
    });
  });

  describe('generateMaritimeBoardingPass', () => {
    it('generates a complete boarding pass with DDLA-PORT-2026 prefix', () => {
      const pass = generateMaritimeBoardingPass({
        plateNumber: '10-AA-555',
        vin: 'JTMHZ01A204918231',
        vehicleName: 'Toyota Land Cruiser 300',
        vehicleCategory: 'suv_crossover',
        driverFullName: 'Elmir H. Qasımov',
        driverFin: '5K8M2P1',
        routeCode: 'ALAT_AKTAU',
        vesselName: '«Zərifə Əliyeva» Ro-Pax',
        cabinTier: 'deck_seat',
        totalFareAzn: 549,
      });

      expect(pass.passId).toMatch(/^DDLA-PORT-2026-\d{5}$/);
      expect(pass.plateNumber).toBe('10-AA-555');
      expect(pass.driverFullName).toBe('Elmir H. Qasımov');
      expect(pass.vesselName).toBe('«Zərifə Əliyeva» Ro-Pax');
      expect(pass.totalFareAzn).toBe(549);
      expect(pass.gatePinCode).toMatch(/^\d{6}$/);
      expect(pass.securityHash).toContain('SHA256:');
      expect(pass.simaSignatureUid).toContain('SIMA-DDLA-');
      expect(pass.qrData).toContain('PORT_OF_BAKU');
    });

    it('allocates Upper Weather Deck for Electric Vehicles', () => {
      const pass = generateMaritimeBoardingPass({
        plateNumber: '90-EV-101',
        vin: 'LC0C66DY5N0029418',
        vehicleName: 'BYD Tang EV',
        vehicleCategory: 'electric_vehicle',
        driverFullName: 'Kamran T. Nəzərov',
        driverFin: '1A9F4K8',
        routeCode: 'ALAT_AKTAU',
        vesselName: '«Azərbaycan» Ro-Pax',
        cabinTier: 'deck_seat',
        totalFareAzn: 487,
        evSocChecked: true,
      });

      expect(pass.deckLevel).toBe('Upper Weather Deck');
      expect(pass.lashingSecuringType).toContain('Qığılcımkeçirməz');
      expect(pass.evSocChecked).toBe(true);
    });

    it('allocates Main Vehicle Deck and heavy 8-point lashing for TIR semi-trailers', () => {
      const pass = generateMaritimeBoardingPass({
        plateNumber: '99-JH-888',
        vin: 'WDB9634031L847291',
        vehicleName: 'Mercedes-Benz Actros TIR',
        vehicleCategory: 'tir_semitrailer',
        driverFullName: 'Vüqar S. Əliyev',
        driverFin: '4J9P1K2',
        routeCode: 'ALAT_KURYK',
        vesselName: '«Bərdə» Ro-Pax',
        cabinTier: 'deck_seat',
        totalFareAzn: 2135,
      });

      expect(pass.deckLevel).toBe('Main Vehicle Deck');
      expect(pass.chockCount).toBe(4);
      expect(pass.lashingSecuringType).toContain('8-Nöqtəli Ağır Polad Zəncir');
    });
  });
});
