import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AirportRampModal } from '../AirportRampModal';

describe('AirportRampModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<AirportRampModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders header, title, and default terminals radar tab when open', () => {
    render(<AirportRampModal {...defaultProps} />);
    expect(screen.getByTestId('airport-ramp-modal')).toBeInTheDocument();
    expect(screen.getByText(/Dövlət Mülki Aviasiya Agentliyi \(DMAA\) & AZAL/i)).toBeInTheDocument();
    expect(screen.getByTestId('terminals-section')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<AirportRampModal {...defaultProps} />);
    const closeBtn = screen.getByTestId('close-airport-ramp-modal');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('filters terminals when typing in search input', () => {
    render(<AirportRampModal {...defaultProps} />);
    const searchInput = screen.getByTestId('terminal-search-input');
    fireEvent.change(searchInput, { target: { value: 'Gəncə' } });
    expect(screen.getByTestId('terminal-card-term-gnj')).toBeInTheDocument();
    expect(screen.queryByTestId('terminal-card-term-gyd-1')).not.toBeInTheDocument();
  });

  it('switches between all tabs cleanly', () => {
    render(<AirportRampModal {...defaultProps} />);

    // Switch to Vehicles tab
    fireEvent.click(screen.getByTestId('tab-vehicles'));
    expect(screen.getByTestId('vehicles-section')).toBeInTheDocument();

    // Switch to Jet Blast tab
    fireEvent.click(screen.getByTestId('tab-jetblast'));
    expect(screen.getByTestId('jetblast-section')).toBeInTheDocument();

    // Switch to Checklist tab
    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByTestId('checklist-section')).toBeInTheDocument();

    // Switch to Exam tab
    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByTestId('exam-section')).toBeInTheDocument();

    // Switch to Permit tab
    fireEvent.click(screen.getByTestId('tab-permit'));
    expect(screen.getByTestId('permit-section')).toBeInTheDocument();

    // Switch to Registry tab
    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(screen.getByTestId('registry-section')).toBeInTheDocument();
  });

  it('interacts with vehicle presets, adjusts speed slider, and toggles safety rules', () => {
    render(<AirportRampModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-vehicles'));

    // Select Follow-Me preset
    const followMeBtn = screen.getByTestId('vehicle-preset-preset-followme');
    fireEvent.click(followMeBtn);

    // Adjust speed to 45 km/h (speeding on service road where limit is 30)
    const speedSlider = screen.getByTestId('sim-speed-slider');
    fireEvent.change(speedSlider, { target: { value: '45' } });

    // Untoggle beacon
    const beaconToggle = screen.getByTestId('sim-beacon-checkbox');
    fireEvent.click(beaconToggle);

    // Expect violation notice
    expect(screen.getByText(/POZUNTU QEYDƏ ALINDI/i)).toBeInTheDocument();
  });

  it('interacts with jet blast simulator thrust buttons and distance slider', () => {
    render(<AirportRampModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-jetblast'));

    // Click Takeoff thrust
    const takeoffBtn = screen.getByTestId('blast-thrust-takeoff');
    fireEvent.click(takeoffBtn);

    // Set distance to 10 meters (critical proximity)
    const distanceSlider = screen.getByTestId('blast-distance-slider');
    fireEvent.change(distanceSlider, { target: { value: '10' } });

    expect(screen.getByText(/KRİTİK JET BLAST TƏHLÜKƏSİ/i)).toBeInTheDocument();
  });

  it('toggles checklist items and updates score in checklist tab', () => {
    render(<AirportRampModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-checklist'));

    const item = screen.getByTestId('checklist-item-chk-1');
    fireEvent.click(item); // toggles to unpassed (critical item)

    expect(screen.getByText(/İCAZƏ VERİLMİR/i)).toBeInTheDocument();
  });

  it('takes exam, submits results, and allows reset', () => {
    render(<AirportRampModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-exam'));

    // Answer Q1 with option B (correct)
    const q1OptionB = screen.getByTestId('exam-option-q1-1');
    fireEvent.click(q1OptionB);

    // Submit exam
    const submitBtn = screen.getByTestId('submit-exam-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByText(/İmtahan Nəticəsi:/i)).toBeInTheDocument();

    // Reset exam
    const resetBtn = screen.getByTestId('reset-exam-btn');
    fireEvent.click(resetBtn);

    expect(screen.queryByText(/İmtahan Nəticəsi:/i)).not.toBeInTheDocument();
  });

  it('handles copy, print, and generate in permit tab', () => {
    const printMock = vi.fn();
    window.print = printMock;

    render(<AirportRampModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-permit'));

    const printBtn = screen.getByTestId('print-permit-btn');
    fireEvent.click(printBtn);
    expect(printMock).toHaveBeenCalled();

    const copyBtn = screen.getByTestId('copy-permit-btn');
    fireEvent.click(copyBtn);

    const generateBtn = screen.getByTestId('generate-permit-btn');
    fireEvent.click(generateBtn);

    expect(screen.getByText(/DMAA-GYD-2026-/i)).toBeInTheDocument();
  });

  it('filters permits in the unified registry tab', () => {
    render(<AirportRampModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-registry'));

    const searchInput = screen.getByTestId('registry-search-input');
    fireEvent.change(searchInput, { target: { value: 'GNJ' } });

    expect(screen.getAllByText(/GNJ/i).length).toBeGreaterThan(0);
  });
});
