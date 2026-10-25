import { describe, it, expect } from 'vitest';
import {
  formatDiplomaticPlate,
  parseDiplomaticPlate,
  calculateDiplomaticCustomsExemption,
  calculateCivilianResaleDuties,
  calculateProtocolChecklistScore,
  convertCurrency,
  filterDiplomaticMissions,
  filterDiplomaticCertificates,
  createDiplomaticCertificate,
  generateDiplomaticCertificateNumber
} from '../diplomaticCompliance';
import {
  MOCK_VIENNA_CHECKLIST,
  MOCK_DIPLOMATIC_MISSIONS,
  MOCK_ACTIVE_DIPLOMATIC_CERTIFICATES
} from '../../data/mockDiplomaticData';

describe('diplomaticCompliance utility engine', () => {
  it('formats red diplomatic license plates correctly', () => {
    expect(formatDiplomaticPlate('001', 'CD', '001')).toBe('001 CD 001');
    expect(formatDiplomaticPlate('2', 'D', '14')).toBe('002 D 014');
    expect(formatDiplomaticPlate('005', 'T', 8)).toBe('005 T 008');
    expect(formatDiplomaticPlate('006', 'CC', '3')).toBe('006 CC 003');
    expect(formatDiplomaticPlate('030', 'HON', '1')).toBe('030 HON 001');
  });

  it('parses diplomatic license plate numbers correctly', () => {
    const valid = parseDiplomaticPlate('001 CD 001');
    expect(valid.isValid).toBe(true);
    expect(valid.countryCode).toBe('001');
    expect(valid.category).toBe('CD');
    expect(valid.sequence).toBe('001');

    const invalid = parseDiplomaticPlate('99-AA-999');
    expect(invalid.isValid).toBe(false);
    expect(invalid.category).toBeNull();

    const partial = parseDiplomaticPlate('001 INVALID 001');
    expect(partial.isValid).toBe(false);
  });

  it('calculates diplomatic tax-free customs exemption correctly across engine brackets', () => {
    // 1998 cc (<= 2000 cc bracket)
    const smallEngine = calculateDiplomaticCustomsExemption(100000, 1998, 1);
    expect(smallEngine.baseDutyAzn).toBeGreaterThan(0);
    expect(smallEngine.exciseTaxAzn).toBe(Math.round(1998 * 0.2));
    expect(smallEngine.vatAzn).toBeGreaterThan(0);
    expect(smallEngine.totalSavedDutiesAzn).toBe(
      smallEngine.baseDutyAzn + smallEngine.exciseTaxAzn + smallEngine.vatAzn
    );

    // 2500 cc (2001 - 3000 cc bracket)
    const midEngine = calculateDiplomaticCustomsExemption(120000, 2500, 1);
    expect(midEngine.exciseTaxAzn).toBe(400 + (2500 - 2000) * 3.0);

    // 3500 cc (3001 - 4000 cc bracket)
    const largeEngine = calculateDiplomaticCustomsExemption(180000, 3500, 1);
    expect(largeEngine.exciseTaxAzn).toBe(3400 + (3500 - 3000) * 8.0);

    // 5000 cc (> 4000 cc bracket)
    const v8Engine = calculateDiplomaticCustomsExemption(300000, 5000, 1);
    expect(v8Engine.exciseTaxAzn).toBe(11400 + (5000 - 4000) * 15.0);
  });

  it('calculates civilian resale amortization schedule adhering to the 5-year rule', () => {
    const cif = 150000;
    const cc = 3000;

    // 0 - 12 months: 100% payable
    const res6m = calculateCivilianResaleDuties(cif, cc, 1, 6);
    expect(res6m.payablePercentage).toBe(100);
    expect(res6m.isFullyExempt).toBe(false);
    expect(res6m.remainingPayableDutyAzn).toBe(res6m.totalCivilianDutyAzn);

    // 13 - 24 months: 80% payable
    const res18m = calculateCivilianResaleDuties(cif, cc, 2, 18);
    expect(res18m.payablePercentage).toBe(80);
    expect(res18m.remainingPayableDutyAzn).toBe(Math.round((res18m.totalCivilianDutyAzn * 80) / 100));

    // 25 - 36 months: 60% payable
    const res30m = calculateCivilianResaleDuties(cif, cc, 3, 30);
    expect(res30m.payablePercentage).toBe(60);

    // 37 - 48 months: 40% payable
    const res42m = calculateCivilianResaleDuties(cif, cc, 4, 42);
    expect(res42m.payablePercentage).toBe(40);

    // 49 - 60 months: 20% payable
    const res54m = calculateCivilianResaleDuties(cif, cc, 5, 54);
    expect(res54m.payablePercentage).toBe(20);

    // 60+ months: 0% fully exempt
    const res65m = calculateCivilianResaleDuties(cif, cc, 6, 65);
    expect(res65m.payablePercentage).toBe(0);
    expect(res65m.remainingPayableDutyAzn).toBe(0);
    expect(res65m.isFullyExempt).toBe(true);
  });

  it('evaluates protocol checklist score and mandatory status', () => {
    // All items checked
    const allIds = MOCK_VIENNA_CHECKLIST.map(i => i.id);
    const fullScore = calculateProtocolChecklistScore(allIds, MOCK_VIENNA_CHECKLIST);
    expect(fullScore.scorePercentage).toBe(100);
    expect(fullScore.allMandatoryMet).toBe(true);
    expect(fullScore.missingMandatoryCount).toBe(0);

    // None checked
    const emptyScore = calculateProtocolChecklistScore([], MOCK_VIENNA_CHECKLIST);
    expect(emptyScore.scorePercentage).toBe(0);
    expect(emptyScore.allMandatoryMet).toBe(false);

    // Empty list edge case
    const edgeScore = calculateProtocolChecklistScore([], []);
    expect(edgeScore.scorePercentage).toBe(100);
    expect(edgeScore.allMandatoryMet).toBe(true);
  });

  it('converts currencies correctly (AZN to USD and EUR)', () => {
    expect(convertCurrency(1000, 'AZN')).toBe(1000);
    expect(convertCurrency(1000, 'USD')).toBe(588);
    expect(convertCurrency(1000, 'EUR')).toBe(541);
  });

  it('filters diplomatic missions by text query and mission type', () => {
    const all = filterDiplomaticMissions(MOCK_DIPLOMATIC_MISSIONS, '', 'all');
    expect(all.length).toBe(MOCK_DIPLOMATIC_MISSIONS.length);

    const turkeyOnly = filterDiplomaticMissions(MOCK_DIPLOMATIC_MISSIONS, 'Türkiyə', 'all');
    expect(turkeyOnly.length).toBeGreaterThanOrEqual(1);

    const consulatesOnly = filterDiplomaticMissions(MOCK_DIPLOMATIC_MISSIONS, '', 'consulate');
    expect(consulatesOnly.every(m => m.missionType === 'consulate')).toBe(true);
  });

  it('filters diplomatic certificates by plate, vin or cert number', () => {
    const byNumber = filterDiplomaticCertificates(MOCK_ACTIVE_DIPLOMATIC_CERTIFICATES, '40912');
    expect(byNumber.length).toBe(1);

    const byPlate = filterDiplomaticCertificates(MOCK_ACTIVE_DIPLOMATIC_CERTIFICATES, '001 CD 001');
    expect(byPlate.length).toBe(1);

    const empty = filterDiplomaticCertificates(MOCK_ACTIVE_DIPLOMATIC_CERTIFICATES, 'NON_EXISTING_XYZ');
    expect(empty.length).toBe(0);
  });

  it('generates certificate numbers and creates valid certificates', () => {
    const certNum = generateDiplomaticCertificateNumber();
    expect(certNum.startsWith('XIN-DIP-2026-')).toBe(true);

    const newCert = createDiplomaticCertificate({
      countryCode: '001',
      category: 'CD',
      sequence: '001',
      missionName: 'Türkiyə Səfirliyi',
      vehicleModel: 'Mercedes-Maybach S 580',
      vin: 'W1K2231761A490123',
      engineCc: 3982,
      cifValueAzn: 350000
    });

    expect(newCert.certificateNumber.startsWith('XIN-DIP-2026-')).toBe(true);
    expect(newCert.plateNumber).toBe('001 CD 001');
    expect(newCert.countryCode).toBe('001');
    expect(newCert.category).toBe('CD');
    expect(newCert.savedDutiesAzn).toBeGreaterThan(0);
    expect(newCert.status).toBe('active');
  });
});
