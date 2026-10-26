import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SafeCityModal } from '../SafeCityModal';

describe('SafeCityModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<SafeCityModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders header, title, and default corridors radar tab when open', () => {
    render(<SafeCityModal {...defaultProps} />);
    expect(screen.getByTestId('safe-city-modal')).toBeInTheDocument();
    expect(screen.getByText(/DİN "Təhlükəsiz Şəhər" & NİİM Telemetriya Portalı/i)).toBeInTheDocument();
    expect(screen.getByTestId('corridors-section')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<SafeCityModal {...defaultProps} />);
    const closeBtn = screen.getByTestId('close-safe-city-modal');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('filters corridors when typing in search input', () => {
    render(<SafeCityModal {...defaultProps} />);
    const searchInput = screen.getByTestId('corridor-search-input');
    fireEvent.change(searchInput, { target: { value: 'Babək' } });
    expect(screen.getByTestId('corridor-card-corridor-3')).toBeInTheDocument();
    expect(screen.queryByTestId('corridor-card-corridor-1')).not.toBeInTheDocument();
  });

  it('switches between all tabs cleanly', () => {
    render(<SafeCityModal {...defaultProps} />);

    // Switch to ANPR tab
    fireEvent.click(screen.getByTestId('tab-anpr'));
    expect(screen.getByTestId('anpr-section')).toBeInTheDocument();

    // Switch to Green Wave tab
    fireEvent.click(screen.getByTestId('tab-greenwave'));
    expect(screen.getByTestId('greenwave-section')).toBeInTheDocument();

    // Switch to Incidents tab
    fireEvent.click(screen.getByTestId('tab-incidents'));
    expect(screen.getByTestId('incidents-section')).toBeInTheDocument();

    // Switch to Exam tab
    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByTestId('exam-section')).toBeInTheDocument();

    // Switch to Certificate tab
    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByTestId('certificate-section')).toBeInTheDocument();

    // Switch to Registry tab
    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(screen.getByTestId('registry-section')).toBeInTheDocument();
  });

  it('interacts with ANPR presets and calculates fines', () => {
    render(<SafeCityModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-anpr'));

    // Select preset 1 (speeding preset)
    const presetBtn = screen.getByTestId('anpr-preset-1');
    fireEvent.click(presetBtn);

    expect(screen.getByTestId('plate-display-text')).toHaveTextContent('99-NN-999');
    expect(screen.getByTestId('total-fine-azn')).toHaveTextContent('50.00 ₼');

    // Toggle bus lane checkbox
    const busLaneToggle = screen.getByTestId('toggle-bus-lane');
    fireEvent.click(busLaneToggle);

    // Toggle seatbelt checkbox
    const seatbeltToggle = screen.getByTestId('toggle-seatbelt');
    fireEvent.click(seatbeltToggle);

    expect(screen.getByTestId('total-fine-azn')).toBeInTheDocument();
  });

  it('interacts with Green Wave speed slider and updates efficiency metrics', () => {
    render(<SafeCityModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-greenwave'));

    const speedSlider = screen.getByTestId('greenwave-speed-slider');
    fireEvent.change(speedSlider, { target: { value: '70' } });

    expect(screen.getByTestId('greenwave-efficiency')).toBeInTheDocument();
    expect(screen.getByTestId('greenwave-stops')).toBeInTheDocument();
    expect(screen.getByTestId('greenwave-recommendation')).toBeInTheDocument();
  });

  it('answers exam questions and calculates grade upon submission', () => {
    render(<SafeCityModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-exam'));

    // Answer first question correctly (option 1)
    fireEvent.click(screen.getByTestId('question-0-option-1'));

    // Submit exam
    const submitBtn = screen.getByTestId('submit-exam-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByTestId('exam-result-badge')).toBeInTheDocument();

    // Reset exam
    fireEvent.click(screen.getByTestId('reset-exam-btn'));
    expect(screen.queryByTestId('exam-result-badge')).not.toBeInTheDocument();
  });

  it('handles copy and print actions on certificate tab', () => {
    const originalClipboard = navigator.clipboard;
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<SafeCityModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-certificate'));

    expect(screen.getByTestId('cert-id-display')).toHaveTextContent(/DIN-NIIM-2026/);

    const copyBtn = screen.getByTestId('copy-cert-btn');
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalled();

    const printBtn = screen.getByTestId('print-cert-btn');
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    Object.assign(navigator, { clipboard: originalClipboard });
  });

  it('filters certificates in unified registry search', () => {
    render(<SafeCityModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-registry'));

    const searchInput = screen.getByTestId('registry-search-input');
    fireEvent.change(searchInput, { target: { value: '10-AA-100' } });

    expect(screen.getByTestId('registry-item-DIN-NIIM-2026-10492')).toBeInTheDocument();
  });
});
