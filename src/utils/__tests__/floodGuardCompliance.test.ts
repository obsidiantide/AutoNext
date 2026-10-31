import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  UNDERPASS_REGISTRY,
  VEHICLE_FLOOD_PROFILES,
  evaluateHydroLockRisk,
  calculateDrainageMetrics,
  calculateEnergyConsumption,
  calculateStatutoryFloodFines,
  INITIAL_DRAINAGE_CHECKLIST,
  FLOOD_EXAM_QUESTIONS,
  generateFloodGuardCertificate,
} from '../floodGuardCompliance';

describe('floodGuardCompliance Utility Engine', () => {
  it('formats currency correctly for AZN, USD, and EUR', () => {
    expect(formatCurrency(100, 'AZN')).toBe('100.00 ₼');
    expect(formatCurrency(100, 'USD')).toBe('58.82 $');
    expect(formatCurrency(100, 'EUR')).toBe('54.05 €');
  });

  it('contains all 6 strategic underpass assets in the registry', () => {
    const keys = Object.keys(UNDERPASS_REGISTRY);
    expect(keys).toHaveLength(6);
    expect(keys).toContain('sabunchu_tunnel');
    expect(keys).toContain('bagirov_bridge');
    expect(keys).toContain('khatai_nobel');
    expect(keys).toContain('babek_mahammadi');
    expect(keys).toContain('dernegul_underpass');
    expect(keys).toContain('lokbatan_m3');

    const sabunchu = UNDERPASS_REGISTRY['sabunchu_tunnel'];
    expect(sabunchu.totalPumpsCount).toBe(6);
    expect(sabunchu.pumpCapacityM3h).toBe(1200);
    expect(sabunchu.ultrasonicSensorActive).toBe(true);
  });

  it('evaluates hydro-lock risk accurately for standard compact sedans', () => {
    // Water level below ground clearance (150 mm)
    const safeResult = evaluateHydroLockRisk(80, 'sedan_compact');
    expect(safeResult.riskLevel).toBe('safe');
    expect(safeResult.clearanceExceeded).toBe(false);
    expect(safeResult.estimatedDamageAzn).toBe(0);

    // Water level between clearance and air intake
    const cautionResult = evaluateHydroLockRisk(200, 'sedan_compact');
    expect(cautionResult.riskLevel).toBe('caution');
    expect(cautionResult.clearanceExceeded).toBe(true);
    expect(cautionResult.intakeSubmerged).toBe(false);

    // Water level approaching air intake (450 mm)
    const criticalResult = evaluateHydroLockRisk(400, 'sedan_compact');
    expect(criticalResult.riskLevel).toBe('critical');

    // Water level exceeding air intake
    const dangerResult = evaluateHydroLockRisk(500, 'sedan_compact');
    expect(dangerResult.riskLevel).toBe('severe_danger');
    expect(dangerResult.intakeSubmerged).toBe(true);
    expect(dangerResult.riskScorePercent).toBe(100);
    expect(dangerResult.estimatedDamageAzn).toBe(3800);
  });

  it('evaluates electric vehicle battery submersion and insulation breach hazards', () => {
    const evSafe = evaluateHydroLockRisk(100, 'electric_vehicle');
    expect(evSafe.riskLevel).toBe('safe');
    expect(evSafe.isElectricShortCircuitRisk).toBe(false);

    const evCaution = evaluateHydroLockRisk(250, 'electric_vehicle');
    expect(evCaution.riskLevel).toBe('caution');

    const evCritical = evaluateHydroLockRisk(380, 'electric_vehicle');
    expect(evCritical.riskLevel).toBe('critical');
    expect(evCritical.isElectricShortCircuitRisk).toBe(true);

    const evDanger = evaluateHydroLockRisk(550, 'electric_vehicle');
    expect(evDanger.riskLevel).toBe('severe_danger');
    expect(evDanger.riskScorePercent).toBe(98);
    expect(evDanger.estimatedDamageAzn).toBe(14500);
  });

  it('calculates drainage metrics and determines proper warning levels and barrier states', () => {
    const underpass = UNDERPASS_REGISTRY['sabunchu_tunnel'];

    // Normal water level
    const normalMetrics = calculateDrainageMetrics(underpass, 100, 3, 10);
    expect(normalMetrics.warningLevel).toBe('normal');
    expect(normalMetrics.gateStatus).toBe('open_free_flow');
    expect(normalMetrics.scadaStatus).toBe('pumping_normal');
    expect(normalMetrics.accumulatedWaterVolumeM3).toBeGreaterThan(0);

    // Caution level (>= 150 mm)
    const cautionMetrics = calculateDrainageMetrics(underpass, 200, 4, 15);
    expect(cautionMetrics.warningLevel).toBe('caution');
    expect(cautionMetrics.gateStatus).toBe('caution_flashing');

    // Critical closure level (>= 400 mm)
    const closureMetrics = calculateDrainageMetrics(underpass, 450, 6, 30);
    expect(closureMetrics.warningLevel).toBe('critical_closure');
    expect(closureMetrics.gateStatus).toBe('fully_barricaded');
    expect(closureMetrics.scadaStatus).toBe('pumping_maximum');
  });

  it('calculates energy consumption and municipal electricity costs', () => {
    const underpass = UNDERPASS_REGISTRY['sabunchu_tunnel']; // 110 kW per pump
    const energy = calculateEnergyConsumption(underpass, 4, 5, 'AZN'); // 4 pumps * 110 kW * 5h = 2200 kWh
    expect(energy.totalKwh).toBe(2200);
    expect(energy.costAzn).toBe(242.0); // 2200 * 0.11 AZN
    expect(energy.formattedCost).toBe('242.00 ₼');
  });

  it('calculates statutory flood fines and 50% prompt discount', () => {
    const fineWithoutDiscount = calculateStatutoryFloodFines('barrier_breach', false, 'AZN');
    expect(fineWithoutDiscount.baseFineAzn).toBe(60);
    expect(fineWithoutDiscount.finalFineAzn).toBe(60);
    expect(fineWithoutDiscount.demeritPoints).toBe(2);

    const fineWithDiscount = calculateStatutoryFloodFines('barrier_breach', true, 'AZN');
    expect(fineWithDiscount.finalFineAzn).toBe(30);
    expect(fineWithDiscount.formattedFinalFine).toBe('30.00 ₼');
  });

  it('contains 10 comprehensive drainage safety checklist items and 10 theoretical exam questions', () => {
    expect(INITIAL_DRAINAGE_CHECKLIST).toHaveLength(10);
    INITIAL_DRAINAGE_CHECKLIST.forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.titleAz).toBeTruthy();
      expect(item.standardCitation).toBeTruthy();
      expect(item.passed).toBe(true);
    });

    expect(FLOOD_EXAM_QUESTIONS).toHaveLength(10);
    FLOOD_EXAM_QUESTIONS.forEach((q) => {
      expect(q.id).toBeGreaterThan(0);
      expect(q.optionsAz).toHaveLength(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(q.explanationAz).toBeTruthy();
    });
  });

  it('generates a valid FLOOD-GUARD-AZ-2026 electronic certificate', () => {
    const underpass = UNDERPASS_REGISTRY['sabunchu_tunnel'];
    const risk = evaluateHydroLockRisk(120, 'crossover_suv');
    const cert = generateFloodGuardCertificate(underpass, '99-FL-101', 'crossover_suv', 120, risk);

    expect(cert.certificateId).toMatch(/^FLOOD-GUARD-AZ-2026-\d{5}$/);
    expect(cert.vehiclePlate).toBe('99-FL-101');
    expect(cert.underpassId).toBe('sabunchu_tunnel');
    expect(cert.simaDigitalUid).toContain('SIMA-AZ-');
    expect(cert.sha256Checksum).toHaveLength(32);
    expect(cert.status).toBe('active_valid');
  });
});
