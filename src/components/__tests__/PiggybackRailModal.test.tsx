import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PiggybackRailModal } from '../PiggybackRailModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('PiggybackRailModal Component', () => {
  const mockOnClose = vi.fn();
  const sampleVehicle = MOCK_VEHICLES[0];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default terminals tab when open', () => {
    render(
      <PiggybackRailModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    expect(screen.getByText(/İntermodal Dəmir Yolu Kontreyler Portalı/i)).toBeInTheDocument();
    expect(screen.getByText(/ADY • AYNA • BDYP/i)).toBeInTheDocument();
    expect(screen.getByText(/Azərbaycanın 6 Strateji Multimodal Kontreyler və Dəmir Yolu Terminalı/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <PiggybackRailModal
        isOpen={false}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <PiggybackRailModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    const closeBtn = screen.getByTestId('piggyback-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(
      <PiggybackRailModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    // 1. Terminals tab (default)
    expect(screen.getByTestId('terminals-tab-content')).toBeInTheDocument();

    // 2. Simulator tab
    fireEvent.click(screen.getByTestId('tab-simulator'));
    expect(screen.getByTestId('simulator-tab-content')).toBeInTheDocument();

    // 3. Tariff tab
    fireEvent.click(screen.getByTestId('tab-tariff'));
    expect(screen.getByTestId('tariff-tab-content')).toBeInTheDocument();

    // 4. Checklist tab
    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByTestId('checklist-tab-content')).toBeInTheDocument();

    // 5. Exam tab
    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByTestId('exam-tab-content')).toBeInTheDocument();

    // 6. Certificate tab
    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByTestId('certificate-tab-content')).toBeInTheDocument();

    // 7. Registry tab
    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(screen.getByTestId('registry-tab-content')).toBeInTheDocument();
  });

  it('applies vehicle presets and adjusts loading simulator telemetry', () => {
    render(
      <PiggybackRailModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-simulator'));

    // Click preset 1 (Schmitz Ro-La)
    fireEvent.click(screen.getByTestId('preset-btn-1'));
    expect(screen.getByDisplayValue('10-AG-505')).toBeInTheDocument();

    // Change wagon type
    const wagonSelect = screen.getByTestId('wagon-type-select');
    fireEvent.change(wagonSelect, { target: { value: 'POCKET_T3000E' } });
    expect(wagonSelect).toHaveValue('POCKET_T3000E');
  });

  it('handles loading clearance violations when height is exceeded or suspension inflated', () => {
    render(
      <PiggybackRailModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-simulator'));

    // Uncheck air suspension deflation
    const suspensionToggle = screen.getByTestId('suspension-toggle');
    fireEvent.click(suspensionToggle);

    expect(screen.getByText(/QABARİT AŞINTISI \/ UYĞUNSUZLUQ/i)).toBeInTheDocument();
    expect(screen.getByText(/Yarımqoşqu pnevmatik asqısı tam endirilməyib/i)).toBeInTheDocument();

    // Check it back
    fireEvent.click(suspensionToggle);
    expect(screen.getByText(/QABARİT VƏ TƏHLÜKƏSİZLİK TƏSDİQLƏNDİ/i)).toBeInTheDocument();
  });

  it('calculates tariffs and green savings when interacting with route inputs', () => {
    render(
      <PiggybackRailModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-tariff'));

    const originSelect = screen.getByTestId('origin-terminal-select');
    fireEvent.change(originSelect, { target: { value: 'astara_instc' } });

    const destSelect = screen.getByTestId('dest-terminal-select');
    fireEvent.change(destSelect, { target: { value: 'yalama_north' } });

    expect(screen.getByText(/Qənaət Edilən Dizel:/i)).toBeInTheDocument();
    expect(screen.getByText(/Azaldılan CO2 Tullantısı:/i)).toBeInTheDocument();
  });

  it('checks all checklist items on one-click action', () => {
    render(
      <PiggybackRailModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-checklist'));

    const checkAllBtn = screen.getByTestId('check-all-checklist-btn');
    fireEvent.click(checkAllBtn);

    expect(screen.getByText(/10 \/ 10 \(100%\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Məcburi bəndlər ödənilib/i)).toBeInTheDocument();
  });

  it('completes theoretical exam simulation and displays pass status', () => {
    render(
      <PiggybackRailModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-exam'));

    // Select options for questions
    const q1Opt = screen.getByTestId('exam-q-q1-opt-1');
    fireEvent.click(q1Opt);

    const submitBtn = screen.getByTestId('submit-exam-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Nəticə:/i)).toBeInTheDocument();
  });

  it('generates certificate from simulator and handles copy and print', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <PiggybackRailModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-simulator'));

    // Generate certificate button
    const proceedBtn = screen.getByTestId('proceed-cert-btn');
    fireEvent.click(proceedBtn);

    // Moves to certificate tab
    expect(screen.getByText(/İNTERMODAL KONTREYLER TRANZİT BURAXILIŞI/i)).toBeInTheDocument();

    const copyBtn = screen.getByTestId('copy-cert-btn');
    fireEvent.click(copyBtn);

    const printBtn = screen.getByTestId('print-cert-btn');
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });

  it('searches and filters records in public registry', () => {
    render(
      <PiggybackRailModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-registry'));

    const searchInput = screen.getByTestId('registry-search-input');
    fireEvent.change(searchInput, { target: { value: 'SilkWay' } });

    expect(screen.getByText(/10-AG-505/i)).toBeInTheDocument();
  });
});
