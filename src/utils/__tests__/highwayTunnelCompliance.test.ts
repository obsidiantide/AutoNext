import { describe, it, expect } from 'vitest';
import {
  convertAzn,
  formatCurrency,
  STRATEGIC_TUNNELS,
  SCADA_MODES,
  TUNNEL_VEHICLE_TARIFFS,
  ADR_CARGO_CATEGORIES,
  evaluateAirQuality,
  checkAdrTunnelCompliance,
  calculateTunnelTransitFee,
  TUNNEL_SAFETY_CHECKLIST,
  evaluateTunnelChecklist,
  TUNNEL_EXAM_QUESTIONS,
  evaluateTunnelExam,
  generateTunnelCertificate,
  TunnelTelemetryState,
} from '../highwayTunnelCompliance';

describe('Highway Tunnel SCADA Safety Compliance Engine (highwayTunnelCompliance.ts)', () => {
  describe('Currency & Localization Helpers', () => {
    it('converts AZN to USD and EUR correctly', () => {
      expect(convertAzn(100, 'AZN')).toBe(100);
      expect(convertAzn(100, 'USD')).toBeCloseTo(58.82, 2);
      expect(convertAzn(100, 'EUR')).toBeCloseTo(54.35, 2);
    });

    it('formats currency with Azerbaijani locale symbol', () => {
      expect(formatCurrency(25.5, 'AZN')).toContain('₼');
      expect(formatCurrency(25.5, 'USD')).toContain('$');
      expect(formatCurrency(25.5, 'EUR')).toContain('€');
    });
  });

  describe('Strategic Tunnel Data Integrity', () => {
    it('contains all 6 strategic Azerbaijani road tunnels', () => {
      const tunnels = Object.keys(STRATEGIC_TUNNELS);
      expect(tunnels).toHaveLength(6);
      expect(tunnels).toContain('TUNNEL_MUROVDAG');
      expect(tunnels).toContain('TUNNEL_ZEFER_YOLU_T1');
      expect(tunnels).toContain('TUNNEL_BAKU_BAY');
      expect(tunnels).toContain('TUNNEL_GOYGOL_KALBAJAR_T2');
      expect(tunnels).toContain('TUNNEL_SHAMAKHI_PASS');
      expect(tunnels).toContain('TUNNEL_ASTARA_FRONTIER');
    });

    it('verifies Murovdag tunnel has 11.6km length and 2 tubes', () => {
      const murovdag = STRATEGIC_TUNNELS.TUNNEL_MUROVDAG;
      expect(murovdag.lengthMeters).toBe(11600);
      expect(murovdag.tubesCount).toBe(2);
      expect(murovdag.altitudeMeters).toBeGreaterThan(1500);
      expect(murovdag.jetFanCount).toBe(64);
    });

    it('verifies all 4 SCADA operational modes', () => {
      const modes = Object.keys(SCADA_MODES);
      expect(modes).toHaveLength(4);
      expect(SCADA_MODES.MODE_NORMAL.speedLimitKmH).toBe(90);
      expect(SCADA_MODES.MODE_FIRE_EMERGENCY.speedLimitKmH).toBe(0);
      expect(SCADA_MODES.MODE_FIRE_EMERGENCY.jetFanOperatingPowerPercent).toBe(100);
    });
  });

  describe('Air Quality & Environmental SCADA Telemetry Evaluation', () => {
    const nominalTelemetry: TunnelTelemetryState = {
      carbonMonoxidePpm: 12,
      nitrogenDioxidePpm: 0.15,
      visibilityExtinctionK: 0.002,
      airflowVelocityMs: 2.8,
      linearHeatSensorTempC: 20,
      crossPassagePressureDifferentialPa: 50,
      overheightDetected: false,
      activeVehiclesInTube: 30,
    };

    it('evaluates safe nominal tunnel conditions', () => {
      const result = evaluateAirQuality(nominalTelemetry);
      expect(result.coStatus).toBe('SAFE');
      expect(result.no2Status).toBe('SAFE');
      expect(result.visibilityStatus).toBe('CLEAR');
      expect(result.heatStatus).toBe('NORMAL');
      expect(result.requiresEmergencyStop).toBe(false);
      expect(result.requiresVentilationBoost).toBe(false);
      expect(result.recommendedJetFanPowerPercent).toBe(25);
    });

    it('detects warning levels when CO or NO2 is elevated', () => {
      const warningTelemetry: TunnelTelemetryState = {
        ...nominalTelemetry,
        carbonMonoxidePpm: 38,
        nitrogenDioxidePpm: 0.5,
      };
      const result = evaluateAirQuality(warningTelemetry);
      expect(result.coStatus).toBe('WARNING');
      expect(result.no2Status).toBe('WARNING');
      expect(result.requiresVentilationBoost).toBe(true);
      expect(result.requiresEmergencyStop).toBe(false);
      expect(result.recommendedJetFanPowerPercent).toBe(65);
    });

    it('triggers emergency stop when CO >= 50 ppm', () => {
      const dangerTelemetry: TunnelTelemetryState = {
        ...nominalTelemetry,
        carbonMonoxidePpm: 55,
      };
      const result = evaluateAirQuality(dangerTelemetry);
      expect(result.coStatus).toBe('DANGER');
      expect(result.requiresEmergencyStop).toBe(true);
      expect(result.recommendedJetFanPowerPercent).toBe(100);
    });

    it('triggers emergency stop and 100% jet fan power on linear heat alarm (>= 68°C)', () => {
      const fireTelemetry: TunnelTelemetryState = {
        ...nominalTelemetry,
        linearHeatSensorTempC: 75,
        visibilityExtinctionK: 0.012,
      };
      const result = evaluateAirQuality(fireTelemetry);
      expect(result.heatStatus).toBe('FIRE_FLASH');
      expect(result.visibilityStatus).toBe('DENSE_SMOKE');
      expect(result.requiresEmergencyStop).toBe(true);
      expect(result.recommendedJetFanPowerPercent).toBe(100);
    });

    it('triggers emergency stop when an overheight vehicle is detected', () => {
      const overheightTelemetry: TunnelTelemetryState = {
        ...nominalTelemetry,
        overheightDetected: true,
      };
      const result = evaluateAirQuality(overheightTelemetry);
      expect(result.requiresEmergencyStop).toBe(true);
    });
  });

  describe('ADR Cargo Tunnel Compliance & Restriction Rules', () => {
    it('permits non-hazardous cargo in any tunnel category', () => {
      const res = checkAdrTunnelCompliance('E', 'NONE');
      expect(res.permitted).toBe(true);
    });

    it('permits any cargo in Category A tunnels without restriction', () => {
      const res = checkAdrTunnelCompliance('A', 'ADR_CAT_B');
      expect(res.permitted).toBe(true);
    });

    it('forbids ADR Category B cargo in Category B tunnels', () => {
      const res = checkAdrTunnelCompliance('B', 'ADR_CAT_B');
      expect(res.permitted).toBe(false);
      expect(res.reasonAz).toContain('ADR Kod B');
    });

    it('forbids ADR Category D flammable liquid tankers in Category D tunnels', () => {
      const res = checkAdrTunnelCompliance('D', 'ADR_CAT_D');
      expect(res.permitted).toBe(false);
      expect(res.reasonAz).toContain('ADR Kod D');
    });

    it('forbids ADR Category E cargo in Category E tunnels', () => {
      const res = checkAdrTunnelCompliance('E', 'ADR_CAT_E');
      expect(res.permitted).toBe(false);
    });
  });

  describe('Tunnel Transit Tariff & Escort Fee Calculation', () => {
    it('calculates standard passenger car fee without peak hour', () => {
      const fee = calculateTunnelTransitFee(
        'TUNNEL_MUROVDAG',
        'CLASS_1_PASSENGER',
        'NONE',
        false,
        'AZN'
      );
      expect(fee.baseFeeAzn).toBe(2.0);
      expect(fee.adrEscortFeeAzn).toBe(0);
      expect(fee.peakHourSurchargeAzn).toBe(0);
      expect(fee.totalFeeAzn).toBe(2.0);
      expect(fee.isAdrPermittedInTunnel).toBe(true);
    });

    it('applies 25% surcharge during peak hour', () => {
      const fee = calculateTunnelTransitFee(
        'TUNNEL_MUROVDAG',
        'CLASS_3_HEAVY_TRUCK_BUS',
        'NONE',
        true,
        'AZN'
      );
      expect(fee.baseFeeAzn).toBe(8.0);
      expect(fee.peakHourSurchargeAzn).toBe(2.0); // 8 * 0.25 = 2.0
      expect(fee.totalFeeAzn).toBe(10.0);
    });

    it('adds escort fee for ADR Tanker category 4', () => {
      const fee = calculateTunnelTransitFee(
        'TUNNEL_ASTARA_FRONTIER',
        'CLASS_4_ADR_TANKER_OVERSIZE',
        'ADR_CAT_D',
        false,
        'USD'
      );
      expect(fee.baseFeeAzn).toBe(25.0);
      expect(fee.adrEscortFeeAzn).toBe(20.0);
      expect(fee.totalFeeAzn).toBe(45.0);
      expect(fee.convertedTotalFee).toBeCloseTo(45.0 * 0.5882, 2);
    });
  });

  describe('10-Point Technical & Fire Safety Checklist', () => {
    it('has exactly 10 mandatory checklist items', () => {
      expect(TUNNEL_SAFETY_CHECKLIST).toHaveLength(10);
    });

    it('evaluates 100% score as ƏLA grade', () => {
      const allIds = TUNNEL_SAFETY_CHECKLIST.map((item) => item.id);
      const evalResult = evaluateTunnelChecklist(allIds);
      expect(evalResult.totalScore).toBe(100);
      expect(evalResult.percentage).toBe(100);
      expect(evalResult.passed).toBe(true);
      expect(evalResult.gradeAz).toBe('ƏLA');
    });

    it('evaluates 80% score as QƏNAƏTBƏXŞ', () => {
      const eightIds = TUNNEL_SAFETY_CHECKLIST.slice(0, 8).map((item) => item.id);
      const evalResult = evaluateTunnelChecklist(eightIds);
      expect(evalResult.totalScore).toBe(80);
      expect(evalResult.percentage).toBe(80);
      expect(evalResult.passed).toBe(true);
      expect(evalResult.gradeAz).toBe('QƏNAƏTBƏXŞ');
    });

    it('fails when score is below 80%', () => {
      const fiveIds = TUNNEL_SAFETY_CHECKLIST.slice(0, 5).map((item) => item.id);
      const evalResult = evaluateTunnelChecklist(fiveIds);
      expect(evalResult.totalScore).toBe(50);
      expect(evalResult.percentage).toBe(50);
      expect(evalResult.passed).toBe(false);
      expect(evalResult.gradeAz).toBe('QEYRİ-MƏQBUL');
    });
  });

  describe('Theoretical Tunnel Safety Examination Simulator', () => {
    it('has exactly 10 comprehensive examination questions', () => {
      expect(TUNNEL_EXAM_QUESTIONS).toHaveLength(10);
    });

    it('passes when 8 or more questions are answered correctly', () => {
      const answers: Record<string, number> = {};
      TUNNEL_EXAM_QUESTIONS.forEach((q, idx) => {
        answers[q.id] = idx < 9 ? q.correctOptionIndex : (q.correctOptionIndex + 1) % 4;
      });
      const result = evaluateTunnelExam(answers);
      expect(result.score).toBe(9);
      expect(result.percentage).toBe(90);
      expect(result.passed).toBe(true);
      expect(result.feedbackAz).toContain('Təbriklər');
    });

    it('fails when fewer than 8 questions are answered correctly', () => {
      const answers: Record<string, number> = {};
      TUNNEL_EXAM_QUESTIONS.forEach((q) => {
        answers[q.id] = (q.correctOptionIndex + 1) % 4; // all wrong
      });
      const result = evaluateTunnelExam(answers);
      expect(result.score).toBe(0);
      expect(result.percentage).toBe(0);
      expect(result.passed).toBe(false);
      expect(result.feedbackAz).toContain('Təəssüf ki');
    });
  });

  describe('Official Electronic Tunnel Clearance Certificate Generator', () => {
    it('generates an authentic TUNNEL-SAFE-AZ-2026 voucher', () => {
      const cert = generateTunnelCertificate(
        'TUNNEL_MUROVDAG',
        '10-AA-100',
        'CLASS_1_PASSENGER',
        'NONE',
        'AZN',
        false
      );

      expect(cert.certificateNumber).toMatch(/^TUNNEL-SAFE-AZ-2026-\d{5}$/);
      expect(cert.vehiclePlate).toBe('10-AA-100');
      expect(cert.tunnelId).toBe('TUNNEL_MUROVDAG');
      expect(cert.paidFeeAzn).toBe(2.0);
      expect(cert.securityChecksumSha256).toContain('SHA256:AAYDA:');
      expect(cert.simaDigitalSignatureUid).toContain('SIMA-AZ-GOV-');
      expect(cert.status).toBe('ACTIVE');
      expect(cert.maxSpeedKmH).toBe(90);
      expect(cert.assignedEscortCallsign).toBe('TƏLƏB_OLUNMUR');
    });

    it('assigns escort callsign when ADR Category 4 cargo is selected', () => {
      const cert = generateTunnelCertificate(
        'TUNNEL_ASTARA_FRONTIER',
        '99-TR-700',
        'CLASS_4_ADR_TANKER_OVERSIZE',
        'ADR_CAT_D',
        'AZN',
        false
      );

      expect(cert.assignedEscortCallsign).toMatch(/^AAYDA-ESCORT-\d+$/);
      expect(cert.paidFeeAzn).toBe(45.0);
    });
  });
});
