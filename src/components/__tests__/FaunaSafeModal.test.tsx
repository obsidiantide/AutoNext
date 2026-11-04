import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FaunaSafeModal } from '../FaunaSafeModal';

describe('FaunaSafeModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
    window.print = vi.fn();
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(<FaunaSafeModal {...defaultProps} />);
    expect(
      screen.getByText(/Magistral Vəhşi Heyvan Keçidləri və Eko-Dukt Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('tab-radar')).toBeInTheDocument();
    expect(
      screen.getAllByText(/M-4 Şamaxı – İsmayıllı Meşə Dəhlizi Eko-Dukt Körpüsü #01/i)[0]
    ).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<FaunaSafeModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when close button is clicked', () => {
    render(<FaunaSafeModal {...defaultProps} />);
    const closeBtn = screen.getByTestId('fauna-safe-close-btn');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<FaunaSafeModal {...defaultProps} />);

    // Tab 2: simulator
    fireEvent.click(screen.getByTestId('tab-simulator'));
    expect(screen.getByTestId('fauna-simulator-view')).toBeInTheDocument();
    expect(screen.getByText(/SCADA Telemetriya Parametrləri/i)).toBeInTheDocument();

    // Tab 3: sanctions
    fireEvent.click(screen.getByTestId('tab-sanctions'));
    expect(screen.getByTestId('fauna-sanctions-view')).toBeInTheDocument();
    expect(screen.getByText(/Qanunvericilik Cərimələri & ETSN Ziyanı/i)).toBeInTheDocument();

    // Tab 4: checklist
    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByTestId('fauna-checklist-view')).toBeInTheDocument();
    expect(screen.getByText(/10 Maddəlik Eko-Dukt və SCADA Texniki Auditi/i)).toBeInTheDocument();

    // Tab 5: exam
    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByTestId('fauna-exam-view')).toBeInTheDocument();
    expect(
      screen.getByText(/Magistral Vəhşi Heyvan Təhlükəsizliyi Nəzəri İmtahanı/i)
    ).toBeInTheDocument();

    // Tab 6: certificate
    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByTestId('fauna-certificate-view')).toBeInTheDocument();
    expect(
      screen.getByText(/FAUNA-SAFE-AZ-2026 Rəsmi Elektron E-Klirens Sertifikatı/i)
    ).toBeInTheDocument();

    // Tab 7: registry
    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(screen.getByTestId('fauna-registry-view')).toBeInTheDocument();
    expect(screen.getByText(/Vahid İctimai Eko-Klirens Reyestri/i)).toBeInTheDocument();
  });

  it('allows selecting an eco-station from the radar grid', () => {
    render(<FaunaSafeModal {...defaultProps} />);
    const st2 = screen.getByTestId('station-card-fauna-station-2');
    fireEvent.click(st2);
    expect(
      screen.getAllByText(/M-1 Quba – Qusar Şahdağ Ətəkləri Eko-Dukt Keçidi #02/i)[0]
    ).toBeInTheDocument();
  });

  it('interacts with sliders, audio test, and switches target species in simulator', () => {
    render(<FaunaSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-simulator'));

    // Test audio test button
    const audioBtn = screen.getByTestId('audio-btn');
    fireEvent.click(audioBtn);

    // Test species selection
    const bearBtn = screen.getByText('BROWN BEAR');
    fireEvent.click(bearBtn);

    // Test speed slider
    const speedSlider = screen.getByTestId('slider-speed');
    fireEvent.change(speedSlider, { target: { value: '110' } });
    expect(screen.getByText(/110 km\/saat/i)).toBeInTheDocument();

    // Test distance slider
    const distSlider = screen.getByTestId('slider-distance');
    fireEvent.change(distSlider, { target: { value: '45' } });
    expect(screen.getByText(/45 metr/i)).toBeInTheDocument();

    // Test deterrent toggle
    const toggleBtn = screen.getByTestId('toggle-deterrent');
    fireEvent.click(toggleBtn);
  });

  it('interacts with checklist items, select all, and reset buttons', () => {
    render(<FaunaSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-checklist'));

    const resetBtn = screen.getByTestId('checklist-reset');
    fireEvent.click(resetBtn);
    expect(screen.getByText(/NON_COMPLIANT \(0%\)/i)).toBeInTheDocument();

    const selectAllBtn = screen.getByTestId('checklist-select-all');
    fireEvent.click(selectAllBtn);
    expect(screen.getByText(/EXCELLENT \(100%\)/i)).toBeInTheDocument();

    // Toggle specific item
    const item1 = screen.getByTestId('checklist-item-fchk-01');
    fireEvent.click(item1);
  });

  it('submits exam questions, displays scoring, and resets', () => {
    render(<FaunaSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-exam'));

    // Answer first question
    const q1Opt = screen.getByTestId('q-fq-01-opt-1');
    fireEvent.click(q1Opt);

    // Submit
    const submitBtn = screen.getByTestId('exam-submit-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByTestId('exam-results-banner')).toBeInTheDocument();

    // Reset
    const resetBtn = screen.getByTestId('exam-reset-btn');
    fireEvent.click(resetBtn);
    expect(screen.queryByTestId('exam-results-banner')).toBeNull();
  });

  it('generates certificate from simulator, handles copy and print', () => {
    render(<FaunaSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-simulator'));

    const genBtn = screen.getByTestId('generate-cert-btn');
    fireEvent.click(genBtn);

    expect(screen.getByTestId('fauna-certificate-view')).toBeInTheDocument();

    // Copy
    const copyBtn = screen.getByTestId('copy-cert-btn');
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    // Print
    const printBtn = screen.getByTestId('print-cert-btn');
    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalled();
  });

  it('searches and filters records in public registry', () => {
    render(<FaunaSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-registry'));

    const searchInput = screen.getByTestId('registry-search-input');
    fireEvent.change(searchInput, { target: { value: '99-FN-101' } });
    expect(screen.getByText('99-FN-101')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT_PLATE_XYZ' } });
    expect(
      screen.getByText(/Axtarış sorğusuna uyğun sertifikat tapılmadı/i)
    ).toBeInTheDocument();
  });
});
