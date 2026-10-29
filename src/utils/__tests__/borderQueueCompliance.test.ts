import { describe, it, expect } from 'vitest';
import {
  convertAzn,
  formatCurrency,
  evaluateCheckpointBuffer,
  calculateQueueBooking,
  verifyBiometricEGate,
  issueBorderQueueVoucher,
  COMMERCIAL_VEHICLE_INFO,
  CARGO_PRIORITY_INFO,
} from '../borderQueueCompliance';
import { MOCK_BORDER_CHECKPOINTS } from '../../data/mockBorderQueueData';

describe('borderQueueCompliance Utility Engine', () => {
  it('converts AZN correctly to USD and EUR', () => {
    expect(convertAzn(100, 'AZN')).toBe(100);
    expect(convertAzn(100, 'USD')).toBeCloseTo(58.82, 1);
    expect(convertAzn(100, 'EUR')).toBeCloseTo(54.35, 1);
  });

  it('formats currency correctly with symbols', () => {
    expect(formatCurrency(45, 'AZN')).toContain('₼');
    expect(formatCurrency(45, 'USD')).toContain('$');
    expect(formatCurrency(45, 'EUR')).toContain('€');
  });

  it('evaluates checkpoint buffer zone occupancy and congestion status', () => {
    const samur = MOCK_BORDER_CHECKPOINTS.find((c) => c.id === 'BCP_SAMUR')!;
    const evalResult = evaluateCheckpointBuffer(samur);

    expect(evalResult.occupancyPercentage).toBeGreaterThan(0);
    expect(evalResult.availableSlotsInZone).toBe(samur.bufferZoneTotalSlots - samur.currentActiveQueueTrucks);
    expect(evalResult.estimatedStandardWaitHours).toBeGreaterThan(0);
    expect(evalResult.estimatedFastTrackWaitHours).toBeLessThan(evalResult.estimatedStandardWaitHours);
  });

  it('handles critical congestion when occupancy exceeds 90%', () => {
    const fakeCheckpoint = {
      ...MOCK_BORDER_CHECKPOINTS[0],
      bufferZoneTotalSlots: 100,
      currentActiveQueueTrucks: 95,
    };
    const evalResult = evaluateCheckpointBuffer(fakeCheckpoint);
    expect(evalResult.occupancyPercentage).toBe(95);
    expect(evalResult.statusLevel).toBe('CRITICAL_CONGESTION');
  });

  it('calculates queue booking fee and wait times correctly', () => {
    const samur = MOCK_BORDER_CHECKPOINTS[0];
    const calc = calculateQueueBooking({
      checkpoint: samur,
      vehicleCategory: 'REFRIGERATED_TRUCK',
      priorityTier: 'GREEN_LANE',
      isNightSlot: false,
      driverEGateCleared: true,
      currency: 'AZN',
    });

    const baseFee = COMMERCIAL_VEHICLE_INFO.REFRIGERATED_TRUCK.statutoryBaseFeeAzn;
    const prioritySurcharge = CARGO_PRIORITY_INFO.GREEN_LANE.fastTrackSurchargeAzn;
    const eGateDiscount = 10;
    const expectedTotal = baseFee + prioritySurcharge - eGateDiscount;

    expect(calc.baseFeeAzn).toBe(baseFee);
    expect(calc.prioritySurchargeAzn).toBe(prioritySurcharge);
    expect(calc.eGateDiscountAzn).toBe(10);
    expect(calc.totalFeeAzn).toBe(expectedTotal);
    expect(calc.assignedLane).toContain('Green Lane');
    expect(calc.queueTicketNumber).toContain('AZ-Q-SAMUR-');
  });

  it('adds night slot surcharge when isNightSlot is true', () => {
    const samur = MOCK_BORDER_CHECKPOINTS[0];
    const calc = calculateQueueBooking({
      checkpoint: samur,
      vehicleCategory: 'TIR_SEMI_TRAILER',
      priorityTier: 'REGULAR_TRANSIT',
      isNightSlot: true,
      driverEGateCleared: false,
      currency: 'AZN',
    });

    expect(calc.nightSurchargeAzn).toBe(15);
    expect(calc.totalFeeAzn).toBe(40 + 0 + 15 - 0); // 55 AZN
  });

  it('verifies biometric e-Gate successfully when all metrics pass', () => {
    const verification = verifyBiometricEGate(95, 94, true, true, 0.00);
    expect(verification.isCleared).toBe(true);
    expect(verification.gateStatus).toBe('CLEARED');
  });

  it('denies entry if breathalyzer exceeds statutory limit (0.05 promille)', () => {
    const verification = verifyBiometricEGate(95, 95, true, true, 0.25);
    expect(verification.isCleared).toBe(false);
    expect(verification.gateStatus).toBe('DENIED_ENTRY');
    expect(verification.reasonsAz[0]).toContain('alkoqol səviyyəsi');
  });

  it('flags manual check if facial score or fingerprint is below threshold', () => {
    const verification = verifyBiometricEGate(70, 92, true, true, 0.00);
    expect(verification.isCleared).toBe(false);
    expect(verification.gateStatus).toBe('FLAGGED_MANUAL_CHECK');
    expect(verification.reasonsAz.some((r) => r.includes('85%'))).toBe(true);
  });

  it('issues an official BORDER-QUEUE-AZ-2026 voucher with checksum and PIN', () => {
    const samur = MOCK_BORDER_CHECKPOINTS[0];
    const calc = calculateQueueBooking({
      checkpoint: samur,
      vehicleCategory: 'TANKER_HAZMAT',
      priorityTier: 'ADR_EXPRESS',
      isNightSlot: false,
      driverEGateCleared: true,
      currency: 'AZN',
    });

    const voucher = issueBorderQueueVoucher(
      samur,
      '77-TR-707',
      'TANKER_HAZMAT',
      'ADR_EXPRESS',
      'Caspian Fuel Logistics MMC',
      'Həsənov Fərid Rasim oğlu',
      '4C77190',
      calc
    );

    expect(voucher.voucherNumber).toContain('BORDER-QUEUE-AZ-2026-');
    expect(voucher.vehiclePlate).toBe('77-TR-707');
    expect(voucher.securityChecksumSha256).toContain('sha256:');
    expect(voucher.simaDigitalSignatureUid).toContain('SIMA-DSX-');
    expect(voucher.barrierGatePin).toHaveLength(4);
  });
});
