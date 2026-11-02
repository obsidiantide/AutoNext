import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkSafeModal } from '../MarkSafeModal';

describe('MarkSafeModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default tab (radar) when open', () => {
    render(<MarkSafeModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByTestId('mark-safe-modal-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('mark-safe-modal-content')).toBeInTheDocument();
    expect(screen.getByText('MARK-SAFE-AZ-2026')).toBeInTheDocument();
    expect(screen.getByTestId('radar-tab-content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<MarkSafeModal isOpen={false} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when top close button is clicked', () => {
    render(<MarkSafeModal isOpen={true} onClose={mockOnClose} />);
    const closeBtn = screen.getByTestId('mark-safe-close-btn');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<MarkSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-simulator'));
    expect(screen.getByTestId('simulator-tab-content')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('tab-presets'));
    expect(screen.getByTestId('presets-tab-content')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByTestId('checklist-tab-content')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByTestId('exam-tab-content')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByTestId('certificate-tab-content')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(screen.getByTestId('registry-tab-content')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('tab-radar'));
    expect(screen.getByTestId('radar-tab-content')).toBeInTheDocument();
  });

  it('selects a corridor from radar grid and updates parameters', () => {
    render(<MarkSafeModal isOpen={true} onClose={mockOnClose} />);

    const yasamalCard = screen.getByTestId('corridor-card-corridor-baku-ring-yasamal');
    fireEvent.click(yasamalCard);

    fireEvent.click(screen.getByTestId('tab-simulator'));
    const materialSelect = screen.getByTestId('select-material-type') as HTMLSelectElement;
    expect(materialSelect.value).toBe('COLD_PLASTIC_MMA');
  });

  it('interacts with sliders and selects material in simulator tab', () => {
    render(<MarkSafeModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('tab-simulator'));

    const speedSlider = screen.getByTestId('slider-speed');
    fireEvent.change(speedSlider, { target: { value: '110' } });
    expect(screen.getByText('110 km/saat')).toBeInTheDocument();

    const headlightSlider = screen.getByTestId('slider-headlight');
    fireEvent.change(headlightSlider, { target: { value: '70000' } });

    const embedSlider = screen.getByTestId('slider-embedment');
    fireEvent.change(embedSlider, { target: { value: '55' } });

    const waterSlider = screen.getByTestId('slider-water-depth');
    fireEvent.change(waterSlider, { target: { value: '2.0' } });

    const materialSelect = screen.getByTestId('select-material-type');
    fireEvent.change(materialSelect, { target: { value: 'POLYURETHANE_STRUCTURED_RIBBED' } });

    expect(screen.getByText(/\$R_L\$ Retrorefleksiya/i)).toBeInTheDocument();
  });

  it('selects vehicle presets and toggles administrative violation sanctions', () => {
    render(<MarkSafeModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('tab-presets'));

    const presetPrado = screen.getByTestId('preset-card-preset-suv-prado');
    fireEvent.click(presetPrado);

    const doubleSolidBtn = screen.getByTestId('violation-btn-327-2');
    fireEvent.click(doubleSolidBtn);

    expect(screen.getByText('+3 Cərimə Balı')).toBeInTheDocument();
    expect(screen.getByText('30 AZN')).toBeInTheDocument();

    const damageBtn = screen.getByTestId('violation-btn-353');
    fireEvent.click(damageBtn);
    expect(screen.getByText('75 AZN')).toBeInTheDocument();
  });

  it('manages 10-point checklist toggles, select all, and reset buttons', () => {
    render(<MarkSafeModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('tab-checklist'));

    const firstItem = screen.getByTestId('checklist-item-chk-geom-width');
    fireEvent.click(firstItem);

    const resetBtn = screen.getByTestId('checklist-reset');
    fireEvent.click(resetBtn);

    const selectAllBtn = screen.getByTestId('checklist-select-all');
    fireEvent.click(selectAllBtn);
  });

  it('completes the theoretical exam, submits answers, and resets', () => {
    render(<MarkSafeModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('tab-exam'));

    const opt0 = screen.getByTestId('exam-q-0-opt-1');
    fireEvent.click(opt0);

    const submitBtn = screen.getByTestId('exam-submit-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Nəticə:/i)).toBeInTheDocument();

    const resetBtn = screen.getByTestId('exam-reset-btn');
    fireEvent.click(resetBtn);
    expect(screen.getByTestId('exam-submit-btn')).toBeInTheDocument();
  });

  it('generates a new certificate, handles print and copy actions', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve())
      }
    });

    render(<MarkSafeModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('tab-certificate'));

    const generateBtn = screen.getByTestId('cert-generate-btn');
    fireEvent.click(generateBtn);

    const printBtn = screen.getByTestId('cert-print-btn');
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    const copyBtn = screen.getByTestId('cert-copy-btn');
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    printSpy.mockRestore();
  });

  it('filters active certificates in public registry tab', () => {
    render(<MarkSafeModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('tab-registry'));

    const searchInput = screen.getByTestId('registry-search-input');
    fireEvent.change(searchInput, { target: { value: '99-MK-101' } });

    expect(screen.getByTestId('registry-row-MARK-SAFE-AZ-2026-A101BF')).toBeInTheDocument();
    expect(screen.queryByTestId('registry-row-MARK-SAFE-AZ-2026-B202CD')).not.toBeInTheDocument();
  });
});
