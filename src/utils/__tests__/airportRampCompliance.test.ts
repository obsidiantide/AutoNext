import { describe, it, expect } from 'vitest';
import {
  formatApronPlate,
  parseApronPlate,
  convertAznToCurrency,
  evaluateApronSpeedAndPriority,
  calculateJetBlastSafety,
  calculateChecklistScore,
  calculateExamScore,
  generateAirportRampPermit,
  ChecklistItem,
  AirsideDriverExamQuestion,
} from '../airportRampCompliance';

describe('airportRampCompliance utility', () => {
  describe('formatApronPlate & parseApronPlate', () => {
    it('formats plate with existing dashes properly', () => {
      expect(formatApronPlate('GYD-AP-012')).toBe('GYD-AP-012');
      expect(formatApronPlate('azal-ramp-04')).toBe('AZAL-RAMP-04');
    });

    it('auto-formats prefixes without dashes', () => {
      expect(formatApronPlate('GYDAP99')).toBe('GYD-AP-99');
      expect(formatApronPlate('AZAL100')).toBe('AZAL-100');
      expect(formatApronPlate('SW777')).toBe('SW-777');
    });

    it('parses formatted apron plate correctly', () => {
      const parsed = parseApronPlate('GYD-AP-012');
      expect(parsed.prefix).toBe('GYD');
      expect(parsed.series).toBe('AP');
      expect(parsed.digits).toBe('012');
      expect(parsed.isValid).toBe(true);
    });

    it('parses fallback plate without hyphens', () => {
      const parsed = parseApronPlate('RAMP9');
      expect(parsed.isValid).toBe(true);
    });
  });

  describe('convertAznToCurrency', () => {
    it('returns exact amount for AZN', () => {
      expect(convertAznToCurrency(100, 'AZN')).toBe(100);
    });

    it('converts to USD correctly', () => {
      expect(convertAznToCurrency(100, 'USD')).toBe(58.82);
    });

    it('converts to EUR correctly', () => {
      expect(convertAznToCurrency(100, 'EUR')).toBe(54.05);
    });
  });

  describe('evaluateApronSpeedAndPriority', () => {
    it('evaluates fully compliant vehicle in ERA zone', () => {
      const result = evaluateApronSpeedAndPriority(
        'pushback_tractor',
        4,
        'era_footprint',
        true,
        true,
        true
      );
      expect(result.isCompliant).toBe(true);
      expect(result.isSpeeding).toBe(false);
      expect(result.statutoryFineAzn).toBe(0);
      expect(result.licenseSuspensionMonths).toBe(0);
      expect(result.infractions.length).toBe(0);
      expect(result.verdict).toContain('TAM UYĞUNDUR');
    });

    it('detects moderate speeding in service road', () => {
      const result = evaluateApronSpeedAndPriority(
        'passenger_shuttle',
        38,
        'service_road',
        true,
        true,
        true
      );
      expect(result.isCompliant).toBe(false);
      expect(result.isSpeeding).toBe(true);
      expect(result.speedDeltaKmh).toBe(8);
      expect(result.statutoryFineAzn).toBe(80);
      expect(result.discountedFineAzn).toBe(40);
      expect(result.licenseSuspensionMonths).toBe(0);
      expect(result.infractions[0].code).toBe('AIR-SPD-MOD');
    });

    it('detects critical speeding (> 15 km/h over limit) in stand taxilane', () => {
      const result = evaluateApronSpeedAndPriority(
        'fuel_bowser',
        35, // Limit 15, delta +20
        'stand_taxilane',
        true,
        true,
        true
      );
      expect(result.isCompliant).toBe(false);
      expect(result.statutoryFineAzn).toBe(200);
      expect(result.licenseSuspensionMonths).toBe(3);
      expect(result.infractions[0].code).toBe('AIR-SPD-CRIT');
    });

    it('penalizes failure to yield to aircraft with critical fine and 6-month suspension', () => {
      const result = evaluateApronSpeedAndPriority(
        'baggage_tug',
        10,
        'stand_taxilane',
        false, // DID NOT YIELD
        true,
        true
      );
      expect(result.isCompliant).toBe(false);
      expect(result.statutoryFineAzn).toBe(300);
      expect(result.licenseSuspensionMonths).toBe(6);
      expect(result.infractions.some((i) => i.code === 'AIR-ROW-VIOL')).toBe(true);
    });

    it('accumulates multiple infractions (no beacon + no radio)', () => {
      const result = evaluateApronSpeedAndPriority(
        'follow_me',
        20,
        'service_road',
        true,
        false, // Beacon off
        false  // Radio off
      );
      expect(result.isCompliant).toBe(false);
      expect(result.statutoryFineAzn).toBe(120); // 50 + 70
      expect(result.discountedFineAzn).toBe(60);
      expect(result.infractions.length).toBe(2);
    });
  });

  describe('calculateJetBlastSafety', () => {
    it('calculates safe distance behind widebody at idle', () => {
      const result = calculateJetBlastSafety('Boeing 777-300ER', 'idle', 60);
      expect(result.isHazardousToVehicles).toBe(false);
      expect(result.riskSeverity).toBe('safe');
      expect(result.blastWindSpeedKmh).toBeLessThan(90);
    });

    it('calculates critical hazard close to widebody at breakaway thrust', () => {
      const result = calculateJetBlastSafety('Boeing 777-300ER', 'breakaway', 25);
      expect(result.isHazardousToVehicles).toBe(true);
      expect(result.riskSeverity).toBe('critical');
      expect(result.minSafeDistanceMeters).toBe(75);
      expect(result.recommendation).toContain('KRİTİK TƏHLÜKƏ');
    });

    it('calculates takeoff thrust blast on narrowbody', () => {
      const result = calculateJetBlastSafety('Airbus A320neo', 'takeoff', 40);
      expect(result.isHazardousToVehicles).toBe(true);
      expect(result.minSafeDistanceMeters).toBe(85);
    });

    it('calculates regional turboprop thrust', () => {
      const result = calculateJetBlastSafety('ATR 72-600', 'idle', 30);
      expect(result.minSafeDistanceMeters).toBe(15);
      expect(result.riskSeverity).toBe('safe');
    });
  });

  describe('calculateChecklistScore', () => {
    const mockItems: ChecklistItem[] = [
      { id: '1', title: 'Beacon', category: 'safety', description: '', standardRef: '', isCritical: true, passed: true },
      { id: '2', title: 'Radio', category: 'avionics', description: '', standardRef: '', isCritical: true, passed: true },
      { id: '3', title: 'Chevrons', category: 'safety', description: '', standardRef: '', isCritical: false, passed: false },
    ];

    it('calculates score and passes when no critical fails and score >= 80%', () => {
      const score = calculateChecklistScore(mockItems);
      expect(score.passed).toBe(false); // 2/3 = 67%
      expect(score.score).toBe(67);
      expect(score.criticalFail).toBe(false);
    });

    it('fails immediately when a critical item is unpassed', () => {
      const criticalFailItems: ChecklistItem[] = [
        { id: '1', title: 'Beacon', category: 'safety', description: '', standardRef: '', isCritical: true, passed: false },
        { id: '2', title: 'Radio', category: 'avionics', description: '', standardRef: '', isCritical: true, passed: true },
        { id: '3', title: 'Governor', category: 'mechanical', description: '', standardRef: '', isCritical: false, passed: true },
        { id: '4', title: 'Alarm', category: 'safety', description: '', standardRef: '', isCritical: false, passed: true },
        { id: '5', title: 'Extinguisher', category: 'safety', description: '', standardRef: '', isCritical: false, passed: true },
      ];
      const score = calculateChecklistScore(criticalFailItems);
      expect(score.passed).toBe(false);
      expect(score.criticalFail).toBe(true);
      expect(score.rating).toContain('İCAZƏ VERİLMİR');
    });

    it('handles empty checklist gracefully', () => {
      const score = calculateChecklistScore([]);
      expect(score.passed).toBe(true);
      expect(score.score).toBe(100);
    });
  });

  describe('calculateExamScore', () => {
    const mockQuestions: AirsideDriverExamQuestion[] = [
      { id: 'q1', question: 'Q1', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 1, explanation: '', standardRef: '' },
      { id: 'q2', question: 'Q2', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 0, explanation: '', standardRef: '' },
      { id: 'q3', question: 'Q3', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 2, explanation: '', standardRef: '' },
      { id: 'q4', question: 'Q4', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 3, explanation: '', standardRef: '' },
      { id: 'q5', question: 'Q5', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 0, explanation: '', standardRef: '' },
    ];

    it('grades 100% when all answers are correct', () => {
      const answers = { q1: 1, q2: 0, q3: 2, q4: 3, q5: 0 };
      const result = calculateExamScore(answers, mockQuestions);
      expect(result.scorePercent).toBe(100);
      expect(result.passed).toBe(true);
      expect(result.grade).toBe('A');
    });

    it('grades fail when score is below 80%', () => {
      const answers = { q1: 1, q2: 0, q3: 0, q4: 0, q5: 0 }; // 3/5 = 60%
      const result = calculateExamScore(answers, mockQuestions);
      expect(result.scorePercent).toBe(60);
      expect(result.passed).toBe(false);
      expect(result.grade).toBe('C');
    });

    it('handles empty questions array gracefully', () => {
      const result = calculateExamScore({}, []);
      expect(result.scorePercent).toBe(100);
      expect(result.passed).toBe(true);
    });
  });

  describe('generateAirportRampPermit', () => {
    it('generates an authentic electronic permit with proper IDs and hashes', () => {
      const permit = generateAirportRampPermit({
        plateNumber: 'GYD-AP-018',
        vehicleName: 'Goldhofer AST-2 Pushback',
        vehicleType: 'pushback_tractor',
        operatorName: 'AZAL Ground Handling',
      });

      expect(permit.permitId).toMatch(/^DMAA-GYD-2026-\d{5}$/);
      expect(permit.plateNumber).toBe('GYD-AP-018');
      expect(permit.vehicleType).toBe('pushback_tractor');
      expect(permit.securityHash).toMatch(/^SHA256-[0-9A-F]+/);
      expect(permit.simaSignatureUid).toMatch(/^SIMA-AZ-DMAA-[0-9A-Z]+/);
      expect(permit.complianceScore).toBeGreaterThanOrEqual(90);
    });
  });
});
