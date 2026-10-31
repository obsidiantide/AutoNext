import { describe, it, expect } from 'vitest';
import {
  calculateTransitTariff,
  evaluateCollisionRisk,
  formatCurrency,
  generateLevelCrossingCertificate,
  LEVEL_CROSSINGS_REGISTRY,
  VEHICLE_CLASSES_INFO,
  LEVEL_CROSSING_CHECKLIST,
  LEVEL_CROSSING_EXAM_QUESTIONS,
} from '../levelCrossingCompliance';

describe('Level Crossing Compliance Engine', () => {
  it('formats currencies accurately for AZN, USD, and EUR', () => {
    expect(formatCurrency(100, 'AZN')).toBe('100.00 ₼');
    expect(formatCurrency(100, 'USD')).toBe('58.82 $');
    expect(formatCurrency(100, 'EUR')).toBe('54.05 €');
  });

  it('contains 6 strategic railway grade crossing assets', () => {
    const keys = Object.keys(LEVEL_CROSSINGS_REGISTRY);
    expect(keys).toHaveLength(6);
    expect(LEVEL_CROSSINGS_REGISTRY.sabunchu_zabrat).toBeDefined();
    expect(LEVEL_CROSSINGS_REGISTRY.qobustan_sangachal).toBeDefined();
    expect(LEVEL_CROSSINGS_REGISTRY.khachmaz_north).toBeDefined();
    expect(LEVEL_CROSSINGS_REGISTRY.masalli_south).toBeDefined();
    expect(LEVEL_CROSSINGS_REGISTRY.aran_bypass).toBeDefined();
    expect(LEVEL_CROSSINGS_REGISTRY.zangezur_gateway).toBeDefined();
  });

  it('calculates zero base transit fee for normal passenger sedan', () => {
    const res = calculateTransitTariff({
      vehicleType: 'sedan',
      crossingId: 'sabunchu_zabrat',
      vehicleHeightM: 1.48,
      vehicleWidthM: 1.85,
      vehicleWeightTons: 1.8,
      vehicleSpeedKmh: 40,
    });
    expect(res.totalFeeAzn).toBe(0);
    expect(res.requiresSpecialEscort).toBe(false);
    expect(res.requiresCatenaryDeenergization).toBe(false);
    expect(res.violationPenaltyAzn).toBe(100);
    expect(res.violationPenaltyDiscountedAzn).toBe(50);
    expect(res.violationPenaltyPoints).toBe(3);
  });

  it('requires ADY escort and catenary fee for oversize vehicle exceeding 4.5m height and slow speed', () => {
    const res = calculateTransitTariff({
      vehicleType: 'oversize',
      crossingId: 'sabunchu_zabrat',
      vehicleHeightM: 4.75, // > 4.5m
      vehicleWidthM: 4.1,   // > 3.5m
      vehicleWeightTons: 25.0,
      vehicleSpeedKmh: 6,   // < 8 km/h
      requiresPoliceConvoy: true,
    });
    expect(res.requiresSpecialEscort).toBe(true);
    expect(res.requiresCatenaryDeenergization).toBe(true);
    expect(res.baseFeeAzn).toBe(60);
    expect(res.escortFeeAzn).toBe(80);
    expect(res.catenarySafetyFeeAzn).toBe(120);
    expect(res.policeEscortFeeAzn).toBe(50);
    expect(res.totalFeeAzn).toBe(310);
  });

  it('evaluates safe operation when train is far and no obstacles are detected', () => {
    const risk = evaluateCollisionRisk({
      trainSpeedKmh: 100,
      trainDistanceM: 2500,
      trainType: 'passenger_emu',
      obstacleDetected: false,
      barrierState: 'open',
    });
    expect(risk.riskLevel).toBe('safe');
    expect(risk.atsTripMandatory).toBe(false);
    expect(risk.isTrainStopGuaranteed).toBe(true);
    expect(risk.timeToImpactSec).toBeGreaterThan(50);
  });

  it('triggers critical danger and mandatory ATS trip when obstacle is detected and train cannot stop safely', () => {
    const risk = evaluateCollisionRisk({
      trainSpeedKmh: 120,
      trainDistanceM: 400,
      trainType: 'heavy_freight',
      obstacleDetected: true,
      barrierState: 'closed',
    });
    expect(risk.riskLevel).toBe('critical_danger');
    expect(risk.atsTripMandatory).toBe(true);
    expect(risk.recommendedActionAz).toContain('FÖVQƏLADƏ TƏHLÜKƏ');
  });

  it('has 10 statutory checklist items with references to Law On Road Traffic Article 44', () => {
    expect(LEVEL_CROSSING_CHECKLIST).toHaveLength(10);
    const item = LEVEL_CROSSING_CHECKLIST.find((i) => i.id === 'chk_stopping_distance');
    expect(item).toBeDefined();
    expect(item?.lawReference).toContain('Maddə 44');
    expect(item?.fineAzn).toBe(100);
    expect(item?.penaltyPoints).toBe(3);
  });

  it('has 10 examination questions with valid answer indexes', () => {
    expect(LEVEL_CROSSING_EXAM_QUESTIONS).toHaveLength(10);
    LEVEL_CROSSING_EXAM_QUESTIONS.forEach((q) => {
      expect(q.optionsAz.length).toBeGreaterThanOrEqual(4);
      expect(q.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswer).toBeLessThan(q.optionsAz.length);
      expect(q.explanationAz).toBeTruthy();
    });
  });

  it('generates official LEVEL-CROSSING-AZ-2026 certificate with checksum and SIMA UID', () => {
    const cert = generateLevelCrossingCertificate({
      crossingId: 'sabunchu_zabrat',
      vehiclePlate: '10-TR-800',
      vehicleType: 'truck',
      applicantName: 'Məmmədov İlqar',
      companyName: 'Baku Logistics MMC',
      transitSlot: '03:00 - 05:00',
      calculatedFeeAzn: 15,
    });
    expect(cert.certificateId).toMatch(/^LEVEL-CROSSING-AZ-2026-\d{5}$/);
    expect(cert.vehiclePlate).toBe('10-TR-800');
    expect(cert.sha256Hash).toContain('SHA256:');
    expect(cert.simaSignatureUid).toContain('SIMA-GOV-AZ-');
    expect(cert.status).toBe('approved');
    expect(cert.calculatedFeeAzn).toBe(15);
  });
});
