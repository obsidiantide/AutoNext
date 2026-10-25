import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SobrietyComplianceModal } from '../SobrietyComplianceModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

const mockVehicle = MOCK_VEHICLES[0];

describe('SobrietyComplianceModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <SobrietyComplianceModal isOpen={false} onClose={vi.fn()} vehicle={mockVehicle} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default tab (alcotest) when open', () => {
    render(
      <SobrietyComplianceModal isOpen={true} onClose={vi.fn()} vehicle={mockVehicle} />
    );

    expect(screen.getByTestId('sobriety-compliance-modal')).toBeInTheDocument();
    expect(screen.getByText(/DİN & Səhiyyə Nazirliyi • RNM/i)).toBeInTheDocument();
    expect(screen.getByTestId('alcotest-tab-content')).toBeInTheDocument();
    expect(screen.getByText(/Dräger Alcotest 7510/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <SobrietyComplianceModal isOpen={true} onClose={onCloseMock} vehicle={mockVehicle} />
    );

    const closeBtn = screen.getByTestId('close-sobriety-modal-btn');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all navigation tabs', () => {
    render(
      <SobrietyComplianceModal isOpen={true} onClose={vi.fn()} vehicle={mockVehicle} />
    );

    // Switch to drug screen
    fireEvent.click(screen.getByTestId('sobriety-tab-drug_screen'));
    expect(screen.getByTestId('drug-screen-tab-content')).toBeInTheDocument();

    // Switch to clinical
    fireEvent.click(screen.getByTestId('sobriety-tab-clinical'));
    expect(screen.getByTestId('clinical-tab-content')).toBeInTheDocument();

    // Switch to sanctions
    fireEvent.click(screen.getByTestId('sobriety-tab-sanctions'));
    expect(screen.getByTestId('sanctions-tab-content')).toBeInTheDocument();

    // Switch to registry
    fireEvent.click(screen.getByTestId('sobriety-tab-registry'));
    expect(screen.getByTestId('registry-tab-content')).toBeInTheDocument();

    // Return to alcotest
    fireEvent.click(screen.getByTestId('sobriety-tab-alcotest'));
    expect(screen.getByTestId('alcotest-tab-content')).toBeInTheDocument();
  });

  it('updates BrAC slider and reflects changes in Promille and status', () => {
    render(
      <SobrietyComplianceModal isOpen={true} onClose={vi.fn()} vehicle={mockVehicle} />
    );

    const slider = screen.getByTestId('brac-slider');
    fireEvent.change(slider, { target: { value: '0.25' } });

    // 0.25 mg/L corresponds to 0.50 promille
    expect(screen.getAllByText(/0.50 ‰/i).length).toBeGreaterThan(0);
  });

  it('selects roadside presets to update diagnostic state', () => {
    render(
      <SobrietyComplianceModal isOpen={true} onClose={vi.fn()} vehicle={mockVehicle} />
    );

    // Click on preset for repeat offense
    const repeatBtn = screen.getByText(/Vüqar Məmmədov/i);
    fireEvent.click(repeatBtn);

    // Check that slider or BAC was updated
    expect(screen.getAllByText(/1.16 ‰/i).length).toBeGreaterThan(0);
  });

  it('toggles drug screening substances in drug_screen tab', () => {
    render(
      <SobrietyComplianceModal isOpen={true} onClose={vi.fn()} vehicle={mockVehicle} />
    );

    fireEvent.click(screen.getByTestId('sobriety-tab-drug_screen'));

    const thcCard = screen.getByTestId('drug-item-thc');
    fireEvent.click(thcCard);

    // It should now show positive
    expect(screen.getByText(/1 Maddə AŞKARLANDI/i)).toBeInTheDocument();

    // Toggle again to remove
    fireEvent.click(thcCard);
    expect(screen.getByText(/MƏNFİ \(Maddə Yoxdur\)/i)).toBeInTheDocument();
  });

  it('toggles clinical coordination test items and updates impairment score', () => {
    render(
      <SobrietyComplianceModal isOpen={true} onClose={vi.fn()} vehicle={mockVehicle} />
    );

    fireEvent.click(screen.getByTestId('sobriety-tab-clinical'));

    const rombergItem = screen.getByTestId('clinical-test-romberg_balance');
    fireEvent.click(rombergItem);

    // Failing 1 test should still pass clinical test with 10%
    expect(screen.getByText(/10% \(1 \/ 10 sınaq\)/i)).toBeInTheDocument();
    expect(screen.getByText(/KLİNİK AYIQ/i)).toBeInTheDocument();

    const fingerItem = screen.getByTestId('clinical-test-finger_to_nose');
    fireEvent.click(fingerItem);

    // Failing 2 tests fails clinical test
    expect(screen.getByText(/20% \(2 \/ 10 sınaq\)/i)).toBeInTheDocument();
    expect(screen.getByText(/KLİNİK SƏRXOŞLUQ/i)).toBeInTheDocument();
  });

  it('selects sanction articles and calculates legal consequences', () => {
    render(
      <SobrietyComplianceModal isOpen={true} onClose={vi.fn()} vehicle={mockVehicle} />
    );

    // First select repeat preset so driver is intoxicated
    fireEvent.click(screen.getByText(/Vüqar Məmmədov/i));

    fireEvent.click(screen.getByTestId('sobriety-tab-sanctions'));

    const repeatArticle = screen.getByTestId('article-option-article_333_4');
    fireEvent.click(repeatArticle);

    expect(screen.getByText(/AR İXM Maddə 333.4/i)).toBeInTheDocument();
    expect(screen.getByText(/24 Ay \(2 İl\)/i)).toBeInTheDocument();
  });

  it('creates a new protocol and navigates to the registry tab', () => {
    render(
      <SobrietyComplianceModal isOpen={true} onClose={vi.fn()} vehicle={mockVehicle} />
    );

    fireEvent.click(screen.getByTestId('sobriety-tab-sanctions'));

    const createBtn = screen.getByTestId('create-protocol-btn');
    fireEvent.click(createBtn);

    // Registry tab should be active
    expect(screen.getByTestId('registry-tab-content')).toBeInTheDocument();
    expect(screen.getByText(/DRÄGER ALCOTEST 7510 TELEMETRİYA/i)).toBeInTheDocument();
  });

  it('handles copying protocol code and triggering print', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(
      <SobrietyComplianceModal isOpen={true} onClose={vi.fn()} vehicle={mockVehicle} />
    );

    fireEvent.click(screen.getByTestId('sobriety-tab-registry'));

    const printBtn = screen.getByText(/Çap Et/i);
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    const copyBtn = screen.getByText(/Kodu Kopyala/i);
    fireEvent.click(copyBtn);
  });
});
