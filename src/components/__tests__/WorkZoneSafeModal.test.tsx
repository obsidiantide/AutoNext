import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkZoneSafeModal } from '../WorkZoneSafeModal';

describe('WorkZoneSafeModal Component Suite', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, branding, and default radar section when open', () => {
    render(<WorkZoneSafeModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByTestId('work-zone-modal')).toBeInTheDocument();
    expect(screen.getByText('WORKZONE-SAFE-AZ-2026')).toBeInTheDocument();
    expect(screen.getByTestId('radar-section')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<WorkZoneSafeModal isOpen={false} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when close buttons are clicked', () => {
    render(<WorkZoneSafeModal isOpen={true} onClose={mockOnClose} />);

    const topCloseBtn = screen.getByTestId('modal-close-button');
    fireEvent.click(topCloseBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    const bottomCloseBtn = screen.getByTestId('bottom-close-btn');
    fireEvent.click(bottomCloseBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<WorkZoneSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-simulator'));
    expect(screen.getByTestId('simulator-section')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('tab-presets'));
    expect(screen.getByTestId('presets-section')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByTestId('checklist-section')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByTestId('exam-section')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByTestId('certificate-section')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(screen.getByTestId('registry-section')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('tab-radar'));
    expect(screen.getByTestId('radar-section')).toBeInTheDocument();
  });

  it('selects a corridor from radar grid and updates parameters', () => {
    render(<WorkZoneSafeModal isOpen={true} onClose={mockOnClose} />);

    const corridorCard = screen.getByTestId('corridor-card-WZ-BAKU-RING1');
    fireEvent.click(corridorCard);

    expect(screen.getAllByText('Bakı Dairəvi-1 Avtomobil Yolu Km 11+400 (Yasamal Vadisi Estakadası)')[0]).toBeInTheDocument();
  });

  it('interacts with physics sliders and toggles TMA cushion', () => {
    render(<WorkZoneSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-simulator'));

    const speedSlider = screen.getByTestId('slider-vehicle-speed');
    fireEvent.change(speedSlider, { target: { value: '85' } });

    const tmaToggle = screen.getByTestId('toggle-tma-installed');
    fireEvent.click(tmaToggle);
    expect(screen.getByText('DEAKTİV')).toBeInTheDocument();

    fireEvent.click(tmaToggle);
    expect(screen.getByText('AKTİVDİR')).toBeInTheDocument();
  });

  it('selects vehicle preset and reflects in presets tab', () => {
    render(<WorkZoneSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-presets'));

    const vehicleCard = screen.getByTestId('vehicle-card-WZ-VEH-03');
    fireEvent.click(vehicleCard);

    expect(screen.getByText('Mercedes-Benz Actros 1845 TIR (40t Qoşqulu)')).toBeInTheDocument();
  });

  it('handles checklist toggles, select all, and reset buttons', () => {
    render(<WorkZoneSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-checklist'));

    const resetBtn = screen.getByTestId('checklist-reset-btn');
    fireEvent.click(resetBtn);
    expect(screen.getByText(/0 \/ 10/)).toBeInTheDocument();

    const selectAllBtn = screen.getByTestId('checklist-select-all-btn');
    fireEvent.click(selectAllBtn);
    expect(screen.getByText(/10 \/ 10/)).toBeInTheDocument();

    const checkItem = screen.getByTestId('checklist-item-WZ-CHK-01');
    fireEvent.click(checkItem);
    expect(screen.getByText(/9 \/ 10/)).toBeInTheDocument();
  });

  it('completes the theoretical exam and displays evaluation results', () => {
    render(<WorkZoneSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-exam'));

    const submitBtn = screen.getByTestId('exam-submit-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByTestId('exam-result-banner')).toBeInTheDocument();

    const resetBtn = screen.getByTestId('exam-reset-btn');
    fireEvent.click(resetBtn);
    expect(screen.queryByTestId('exam-result-banner')).toBeNull();
  });

  it('generates a new clearance certificate and allows copying code and printing', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextSpy,
      },
    });

    render(<WorkZoneSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-certificate'));

    const generateBtn = screen.getByTestId('generate-cert-btn');
    fireEvent.click(generateBtn);

    const printBtn = screen.getByTestId('print-cert-btn');
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    const copyBtn = screen.getByTestId('copy-cert-id-btn');
    fireEvent.click(copyBtn);
    expect(writeTextSpy).toHaveBeenCalled();
  });

  it('filters active registry records by search query', () => {
    render(<WorkZoneSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-registry'));

    const searchInput = screen.getByTestId('registry-search-input');
    fireEvent.change(searchInput, { target: { value: '99-WZ-101' } });

    expect(screen.getByText('99-WZ-101')).toBeInTheDocument();
    expect(screen.queryByText('10-WZ-202')).toBeNull();
  });
});
