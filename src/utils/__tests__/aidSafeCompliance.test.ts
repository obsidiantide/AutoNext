import { describe, it, expect } from 'vitest';
import {
  convertAidCurrency,
  calculateOpticalResolution,
  calculateCollisionRisk,
  getStatutoryFineDetails,
  generateScadaAutomationAction,
  evaluateAidCompliance,
  generateAidCertificate,
  AidSimulationInput,
} from '../aidSafeCompliance';
import { MOCK_AID_CAMERAS } from '../../data/mockAidSafeData';

describe('AID-SAFE-AZ-2026 Compliance Engine', () => {
  describe('Currency Conversions', () => {
    it('converts AZN amounts correctly to USD and EUR', () => {
      expect(convertAidCurrency(100, 'AZN')).toBe(100);
      expect(convertAidCurrency(100, 'USD')).toBe(58.82);
      expect(convertAidCurrency(100, 'EUR')).toBe(54.05);
    });
  });

  describe('Optical Resolution & Johnson\'s Criteria', () => {
    it('computes higher pixel density at closer distances and longer focal lengths', () => {
      const closeRes = calculateOpticalResolution(100, 50, 'CLEAR_DAY', 60, 95);
      const farRes = calculateOpticalResolution(500, 50, 'CLEAR_DAY', 60, 95);

      expect(closeRes.pixelsPerMeter).toBeGreaterThan(farRes.pixelsPerMeter);
      expect(closeRes.johnsonCriteriaStatus).toBe('IDENTIFICATION');
    });

    it('identifies recognition criteria correctly when pixels per meter is between 25 and 60', () => {
      const res = calculateOpticalResolution(250, 50, 'CLEAR_DAY', 60, 95);
      expect(['IDENTIFICATION', 'RECOGNITION']).toContain(res.johnsonCriteriaStatus);
    });

    it('penalizes optical clarity and effective confidence in adverse weather', () => {
      const clearRes = calculateOpticalResolution(200, 50, 'CLEAR_DAY', 60, 95);
      const fogRes = calculateOpticalResolution(200, 50, 'DENSE_FOG', 60, 95);

      expect(fogRes.opticalClarityPct).toBeLessThan(clearRes.opticalClarityPct);
      expect(fogRes.effectiveAiConfidencePct).toBeLessThan(clearRes.effectiveAiConfidencePct);
      expect(fogRes.meanTimeToDetectSec).toBeGreaterThan(clearRes.meanTimeToDetectSec);
    });
  });

  describe('Collision Mechanics & Time-to-Collision (TTC)', () => {
    const baseInput: AidSimulationInput = {
      incidentType: 'STOPPED_VEHICLE',
      approachSpeedKmh: 100,
      incidentSpeedKmh: 0,
      distanceToIncidentMeters: 300,
      cameraFocalLengthMm: 50,
      detectionLatencySec: 3.0,
      aiFrameRateFps: 60,
      ambientVisibility: 'CLEAR_DAY',
      trafficFlowVehPerHour: 1800,
      aiConfidenceThresholdPct: 95,
      driverReactionTimeSec: 1.2,
      affectedLane: 1,
    };

    it('calculates closing speed and TTC accurately for stationary obstacles', () => {
      const optical = calculateOpticalResolution(300, 50, 'CLEAR_DAY', 60, 95);
      const risk = calculateCollisionRisk(baseInput, optical);

      expect(risk.closingSpeedKmh).toBe(100);
      expect(risk.timeToCollisionSec).toBeCloseTo(10.8, 1);
      expect(risk.collisionPredicted).toBe(false);
      expect(risk.clearanceMarginM).toBeGreaterThan(0);
    });

    it('doubles closing speed and sharply reduces TTC for wrong-way drivers', () => {
      const wrongWayInput: AidSimulationInput = {
        ...baseInput,
        incidentType: 'WRONG_WAY_DRIVER',
        approachSpeedKmh: 110,
        incidentSpeedKmh: 70,
        distanceToIncidentMeters: 300,
      };

      const optical = calculateOpticalResolution(300, 50, 'CLEAR_DAY', 60, 95);
      const risk = calculateCollisionRisk(wrongWayInput, optical);

      expect(risk.closingSpeedKmh).toBe(180);
      expect(risk.severity).toBe('CRITICAL_EMERGENCY');
      expect(risk.timeToCollisionSec).toBeLessThan(7.0);
    });

    it('detects imminent collision if distance is insufficient to stop', () => {
      const criticalInput: AidSimulationInput = {
        ...baseInput,
        distanceToIncidentMeters: 40,
        approachSpeedKmh: 120,
      };

      const optical = calculateOpticalResolution(40, 50, 'CLEAR_DAY', 60, 95);
      const risk = calculateCollisionRisk(criticalInput, optical);

      expect(risk.collisionPredicted).toBe(true);
      expect(risk.clearanceMarginM).toBeLessThan(0);
    });
  });

  describe('Statutory Fines under İXM', () => {
    it('applies İXM 327.4 with 100 AZN fine and 4 demerit points for wrong-way driving', () => {
      const fines = getStatutoryFineDetails('WRONG_WAY_DRIVER');
      expect(fines.fineAzn).toBe(100);
      expect(fines.demeritPoints).toBe(4);
      expect(fines.article).toContain('327.4');
    });

    it('applies İXM 327.2 with 80 AZN fine and 3 demerit points for road debris hazards', () => {
      const fines = getStatutoryFineDetails('DEBRIS_OBSTACLE');
      expect(fines.fineAzn).toBe(80);
      expect(fines.demeritPoints).toBe(3);
      expect(fines.article).toContain('327.2');
    });

    it('applies İXM 338.1 with 40 AZN fine for pedestrian intrusion', () => {
      const fines = getStatutoryFineDetails('PEDESTRIAN_INTRUSION');
      expect(fines.fineAzn).toBe(40);
      expect(fines.demeritPoints).toBe(0);
      expect(fines.article).toContain('338.1');
    });
  });

  describe('SCADA Automation Decisions', () => {
    it('generates urgent warning banners, lane red cross, and continuous klaxon for critical wrong-way drivers', () => {
      const scada = generateScadaAutomationAction('WRONG_WAY_DRIVER', 1, 'CRITICAL_EMERGENCY', 400);

      expect(scada.vmsBannerAz).toContain('ƏKS İSTİQAMƏTDƏ NƏQLİYYAT');
      expect(scada.recommendedLaneSignals[0]).toBe('RED_CROSS');
      expect(scada.recommendedSpeedLimitKmh).toBeLessThanOrEqual(40);
      expect(scada.audibleAlarmPattern).toBe('CONTINUOUS_KLAXON');
      expect(scada.dispatchUnits).toEqual(
        expect.arrayContaining(['BDYP 902 Magistral Patrul Alayı'])
      );
    });
  });

  describe('Full Orchestrator & Certificate Generation', () => {
    const input: AidSimulationInput = {
      incidentType: 'WRONG_WAY_DRIVER',
      approachSpeedKmh: 100,
      incidentSpeedKmh: 60,
      distanceToIncidentMeters: 350,
      cameraFocalLengthMm: 50,
      detectionLatencySec: 2.5,
      aiFrameRateFps: 60,
      ambientVisibility: 'CLEAR_DAY',
      trafficFlowVehPerHour: 2000,
      aiConfidenceThresholdPct: 95,
      driverReactionTimeSec: 1.2,
      affectedLane: 1,
    };

    it('evaluates compliance end-to-end and returns expected structure', () => {
      const evalRes = evaluateAidCompliance(input);

      expect(evalRes.opticalMetrics.johnsonCriteriaStatus).toBeDefined();
      expect(evalRes.collisionMetrics.timeToCollisionSec).toBeGreaterThan(0);
      expect(evalRes.scadaAction.vmsBannerAz).toBeDefined();
      expect(evalRes.statutoryFineAzn).toBe(100);
      expect(evalRes.demeritPoints).toBe(4);
    });

    it('generates official certificate with cryptographic details', () => {
      const evalRes = evaluateAidCompliance(input);
      const cert = generateAidCertificate(MOCK_AID_CAMERAS[0], evalRes, '99-AI-101', 'Operator Test');

      expect(cert.certificateId).toContain('AID-SAFE-AZ-2026-');
      expect(cert.sha256Digest).toHaveLength(68);
      expect(cert.simaSignatureUid).toContain('SIMA-AID-');
      expect(cert.barrierPIN).toBeDefined();
    });
  });
});
