import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MicromobilityModal } from '../MicromobilityModal';

describe('MicromobilityModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default corridors tab when open', () => {
    render(<MicromobilityModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/AYNA & BDYP Rəqəmsal Mikromobillik və Velosiped Zolaqları Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/MICROMOBILITY-BAKU-AZ-2026/i)).toBeInTheDocument();
    expect(screen.getByTestId('tab-corridors-content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<MicromobilityModal isOpen={false} onClose={mockOnClose} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls onClose when close button is clicked', () => {
    render(<MicromobilityModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByTestId('micromobility-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<MicromobilityModal isOpen={true} onClose={mockOnClose} />);

    // 1. Switch to Telemetry tab
    fireEvent.click(screen.getByTestId('micromobility-tab-telemetry'));
    expect(screen.getByTestId('tab-telemetry-content')).toBeInTheDocument();

    // 2. Switch to Calculator tab
    fireEvent.click(screen.getByTestId('micromobility-tab-calculator'));
    expect(screen.getByTestId('tab-calculator-content')).toBeInTheDocument();

    // 3. Switch to Checklist tab
    fireEvent.click(screen.getByTestId('micromobility-tab-checklist'));
    expect(screen.getByTestId('tab-checklist-content')).toBeInTheDocument();

    // 4. Switch to Exam tab
    fireEvent.click(screen.getByTestId('micromobility-tab-exam'));
    expect(screen.getByTestId('tab-exam-content')).toBeInTheDocument();

    // 5. Switch to Certificate tab
    fireEvent.click(screen.getByTestId('micromobility-tab-certificate'));
    expect(screen.getByTestId('tab-certificate-content')).toBeInTheDocument();

    // 6. Switch to Registry tab
    fireEvent.click(screen.getByTestId('micromobility-tab-registry'));
    expect(screen.getByTestId('tab-registry-content')).toBeInTheDocument();

    // 7. Back to Corridors tab
    fireEvent.click(screen.getByTestId('micromobility-tab-corridors'));
    expect(screen.getByTestId('tab-corridors-content')).toBeInTheDocument();
  });

  it('filters corridors by search query and zone', () => {
    render(<MicromobilityModal isOpen={true} onClose={mockOnClose} />);

    const searchInput = screen.getByTestId('corridor-search-input');
    fireEvent.change(searchInput, { target: { value: 'Sahil' } });
    expect(screen.getByText(/Dənizkənarı Milli Park Sahil Mikromobillik Dəhlizi/i)).toBeInTheDocument();

    // Click to select corridor
    fireEvent.click(screen.getByTestId('corridor-card-boulevard_seaside'));
    expect(screen.getByText(/Seçilmiş Dəhliz/i)).toBeInTheDocument();
  });

  it('interacts with telemetry sliders and safety toggles', () => {
    render(<MicromobilityModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('micromobility-tab-telemetry'));

    // Test zone switch to red
    fireEvent.click(screen.getByTestId('telemetry-zone-btn-red'));
    expect(screen.getByText(/Kritik Təhlükəsizlik Pozuntusu/i)).toBeInTheDocument();

    // Test helmet toggle
    const helmetBtn = screen.getByTestId('telemetry-helmet-toggle');
    fireEvent.click(helmetBtn); // toggles to 'Yoxdur'
    expect(screen.getByText('Yoxdur')).toBeInTheDocument();

    // Test tandem toggle
    const tandemBtn = screen.getByTestId('telemetry-tandem-toggle');
    fireEvent.click(tandemBtn); // toggles to 'Aşkar Edildi'
    expect(screen.getByText('Aşkar Edildi')).toBeInTheDocument();

    // Test speed slider
    const speedSlider = screen.getByTestId('telemetry-speed-slider');
    fireEvent.change(speedSlider, { target: { value: '25' } });

    // Test vibration slider
    const vibSlider = screen.getByTestId('telemetry-vibration-slider');
    fireEvent.change(vibSlider, { target: { value: '2.4' } });

    // Test battery slider
    const batterySlider = screen.getByTestId('telemetry-battery-slider');
    fireEvent.change(batterySlider, { target: { value: '12' } });
  });

  it('interacts with tariff calculator and currency switcher', () => {
    render(<MicromobilityModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('micromobility-tab-calculator'));

    // Switch currency
    fireEvent.click(screen.getByTestId('calculator-currency-USD'));
    expect(screen.getAllByText(/\$/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByTestId('calculator-currency-EUR'));
    expect(screen.getAllByText(/€/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByTestId('calculator-currency-AZN'));
    expect(screen.getAllByText(/₼/).length).toBeGreaterThan(0);

    // Change category
    const catSelect = screen.getByTestId('calculator-category-select');
    fireEvent.change(catSelect, { target: { value: 'cargo_e_bike' } });

    // Change duration
    const durSlider = screen.getByTestId('calculator-duration-slider');
    fireEvent.change(durSlider, { target: { value: '45' } });

    // Change distance
    const distSlider = screen.getByTestId('calculator-distance-slider');
    fireEvent.change(distSlider, { target: { value: '10' } });

    // Toggle student discount
    const studentCheck = screen.getByTestId('calculator-student-checkbox');
    fireEvent.click(studentCheck);

    // Toggle BakuCard discount
    const bakucardCheck = screen.getByTestId('calculator-bakucard-checkbox');
    fireEvent.click(bakucardCheck);

    // Toggle helmet rental
    const helmetCheck = screen.getByTestId('calculator-helmet-checkbox');
    fireEvent.click(helmetCheck);

    expect(screen.getByText(/AYNA Smart Tarif/i)).toBeInTheDocument();
  });

  it('toggles checklist items and clicks check all', () => {
    render(<MicromobilityModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('micromobility-tab-checklist'));

    // Click check all button
    fireEvent.click(screen.getByTestId('checklist-check-all-btn'));
    expect(screen.getByText(/%100/i)).toBeInTheDocument();

    // Toggle single item
    const item = screen.getByTestId('checklist-item-chk_dual_brakes');
    fireEvent.click(item);
  });

  it('completes exam with 100% quick fill and submits', () => {
    render(<MicromobilityModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('micromobility-tab-exam'));

    // Answer single option
    fireEvent.click(screen.getByTestId('exam-q1-opt1'));

    // Quick fill 100%
    fireEvent.click(screen.getByTestId('exam-quick-fill-btn'));

    // Submit exam
    fireEvent.click(screen.getByTestId('exam-submit-btn'));
    expect(screen.getByText(/Təbriklər! İmtahan Müvəffəqiyyətlə Keçildi/i)).toBeInTheDocument();
  });

  it('generates a new certificate, handles copy and print', () => {
    render(<MicromobilityModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('micromobility-tab-certificate'));

    // Fill form
    const nameInput = screen.getByTestId('cert-form-fullname');
    fireEvent.change(nameInput, { target: { value: 'Rəşad Babayev' } });

    const finInput = screen.getByTestId('cert-form-fin');
    fireEvent.change(finInput, { target: { value: '8KLM34N' } });

    const serialInput = screen.getByTestId('cert-form-serial');
    fireEvent.change(serialInput, { target: { value: 'WHOOSH-BAKU-8811' } });

    // Submit generate
    fireEvent.click(screen.getByTestId('cert-generate-submit-btn'));

    // Verify copy button
    const copyBtn = screen.getByTestId('cert-copy-btn');
    fireEvent.click(copyBtn);

    // Verify print button
    const printBtn = screen.getByTestId('cert-print-btn');
    fireEvent.click(printBtn);
  });

  it('views public registry and clicks record to open certificate', () => {
    render(<MicromobilityModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('micromobility-tab-registry'));
    expect(screen.getByText(/AYNA Rəsmi Mikromobillik və Sürücü Reyestri/i)).toBeInTheDocument();

    // Click on a certificate in table
    const certRow = screen.getByText('MICROMOBILITY-BAKU-AZ-2026-77821');
    fireEvent.click(certRow);

    // Should switch to certificate tab
    expect(screen.getByTestId('tab-certificate-content')).toBeInTheDocument();
  });
});
