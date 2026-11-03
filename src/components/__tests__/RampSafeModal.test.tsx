import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RampSafeModal } from '../RampSafeModal';

describe('RampSafeModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
  };

  it('does not render when isOpen is false', () => {
    render(<RampSafeModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('ramp-safe-modal')).not.toBeInTheDocument();
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(<RampSafeModal {...defaultProps} />);
    expect(screen.getByTestId('ramp-safe-modal')).toBeInTheDocument();
    expect(
      screen.getByText(/Magistral Giriş Rampası Nəzarət və ALINEA SCADA Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('ramp-radar-tab')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<RampSafeModal {...defaultProps} onClose={onClose} />);
    const closeBtn = screen.getByTestId('ramp-safe-close-btn');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 8 navigation tabs', () => {
    render(<RampSafeModal {...defaultProps} />);

    // Simulator Tab
    fireEvent.click(screen.getByTestId('ramp-tab-simulator'));
    expect(screen.getByTestId('ramp-simulator-tab')).toBeInTheDocument();

    // Vehicles Tab
    fireEvent.click(screen.getByTestId('ramp-tab-vehicles'));
    expect(screen.getByTestId('ramp-vehicles-tab')).toBeInTheDocument();

    // Checklist Tab
    fireEvent.click(screen.getByTestId('ramp-tab-checklist'));
    expect(screen.getByTestId('ramp-checklist-tab')).toBeInTheDocument();

    // Exam Tab
    fireEvent.click(screen.getByTestId('ramp-tab-exam'));
    expect(screen.getByTestId('ramp-exam-tab')).toBeInTheDocument();

    // Certificate Tab
    fireEvent.click(screen.getByTestId('ramp-tab-certificate'));
    expect(screen.getByTestId('ramp-certificate-tab')).toBeInTheDocument();

    // Registry Tab
    fireEvent.click(screen.getByTestId('ramp-tab-registry'));
    expect(screen.getByTestId('ramp-registry-tab')).toBeInTheDocument();

    // About Tab
    fireEvent.click(screen.getByTestId('ramp-tab-about'));
    expect(screen.getByTestId('ramp-about-tab')).toBeInTheDocument();

    // Back to Radar Tab
    fireEvent.click(screen.getByTestId('ramp-tab-radar'));
    expect(screen.getByTestId('ramp-radar-tab')).toBeInTheDocument();
  });

  it('allows selecting a station card from the radar grid', () => {
    render(<RampSafeModal {...defaultProps} />);
    const stationCard = screen.getByTestId('ramp-station-card-ramp-02');
    fireEvent.click(stationCard);
    expect(screen.getAllByText(/Böyükşor Qovşağı/i).length).toBeGreaterThanOrEqual(1);
  });

  it('interacts with ALINEA simulator sliders and switches mode', () => {
    render(<RampSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('ramp-tab-simulator'));

    // Move downstream occupancy slider
    const occSlider = screen.getByTestId('ramp-slider-downstream-occ');
    fireEvent.change(occSlider, { target: { value: '25' } });
    expect(occSlider).toHaveValue('25');

    // Move queue occupancy slider
    const queueSlider = screen.getByTestId('ramp-slider-queue-occ');
    fireEvent.change(queueSlider, { target: { value: '85' } });
    expect(queueSlider).toHaveValue('85');

    // Toggle 2-car mode
    const twoCarBtn = screen.getByTestId('ramp-mode-two-car-btn');
    fireEvent.click(twoCarBtn);

    // Audio alarm button click
    const soundBtn = screen.getByTestId('ramp-alarm-sound-btn');
    fireEvent.click(soundBtn);
  });

  it('interacts with vehicle presets and shows calculated sanctions', () => {
    render(<RampSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('ramp-tab-vehicles'));

    // Select truck preset
    const truckCard = screen.getByTestId('ramp-vehicle-preset-veh-03');
    fireEvent.click(truckCard);
    expect(screen.getAllByText(/KamAZ 5490 Neo TIR/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/İXM Maddə 327.1/i)).toBeInTheDocument();
  });

  it('interacts with 10-point checklist toggling', () => {
    render(<RampSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('ramp-tab-checklist'));

    const firstItem = screen.getByTestId('ramp-checklist-item-chk-01');
    fireEvent.click(firstItem);

    const selectAllBtn = screen.getByText('Hamısını Seç');
    fireEvent.click(selectAllBtn);

    const resetBtn = screen.getByText('Sıfırla');
    fireEvent.click(resetBtn);
  });

  it('completes the theoretical exam and displays evaluation result', () => {
    render(<RampSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('ramp-tab-exam'));

    const radioOption = screen.getAllByRole('radio')[0];
    fireEvent.click(radioOption);

    const submitBtn = screen.getByTestId('ramp-exam-submit-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Nəticə:/i)).toBeInTheDocument();
  });

  it('generates a new clearance certificate, handles print and search filter in registry', () => {
    render(<RampSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('ramp-tab-certificate'));

    const plateInput = screen.getByTestId('ramp-cert-plate-input');
    fireEvent.change(plateInput, { target: { value: '99-TEST-999' } });

    const generateBtn = screen.getByTestId('ramp-generate-cert-btn');
    fireEvent.click(generateBtn);

    expect(screen.getByText('99-TEST-999')).toBeInTheDocument();

    // Test registry tab filter
    fireEvent.click(screen.getByTestId('ramp-tab-registry'));
    const searchInput = screen.getByTestId('ramp-registry-search-input');
    fireEvent.change(searchInput, { target: { value: '99-TEST-999' } });
    expect(screen.getByText('99-TEST-999')).toBeInTheDocument();
  });
});
