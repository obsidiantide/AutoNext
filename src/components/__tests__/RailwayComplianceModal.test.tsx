import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RailwayComplianceModal } from '../RailwayComplianceModal';

describe('RailwayComplianceModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
    // Mock window.print
    window.print = vi.fn();
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(<RailwayComplianceModal {...defaultProps} />);

    expect(screen.getByTestId('railway-modal')).toBeInTheDocument();
    expect(screen.getByText(/Azərbaycan Dəmir Yolları \(ADY\) & BDYP/i)).toBeInTheDocument();
    expect(screen.getByTestId('radar-section')).toBeInTheDocument();
    expect(screen.getByText(/Dəmiryol Keçidi Radarı/i)).toBeInTheDocument();
  });

  it('does not render anything when isOpen is false', () => {
    render(<RailwayComplianceModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('railway-modal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<RailwayComplianceModal {...defaultProps} />);
    const closeBtn = screen.getByTestId('close-railway-modal');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 6 navigation tabs', () => {
    render(<RailwayComplianceModal {...defaultProps} />);

    // 1. Calculator Tab
    fireEvent.click(screen.getByTestId('tab-calculator'));
    expect(screen.getByTestId('calculator-section')).toBeInTheDocument();

    // 2. Checklist Tab
    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByTestId('checklist-section')).toBeInTheDocument();

    // 3. Terminals Tab
    fireEvent.click(screen.getByTestId('tab-terminals'));
    expect(screen.getByTestId('terminals-section')).toBeInTheDocument();

    // 4. Exam Tab
    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByTestId('exam-section')).toBeInTheDocument();

    // 5. Boarding Pass Tab
    fireEvent.click(screen.getByTestId('tab-boarding-pass'));
    expect(screen.getByTestId('boarding-pass-section')).toBeInTheDocument();

    // 6. Return to Radar Tab
    fireEvent.click(screen.getByTestId('tab-radar'));
    expect(screen.getByTestId('radar-section')).toBeInTheDocument();
  });

  it('interacts with crossing radar controls and updates telemetry', () => {
    render(<RailwayComplianceModal {...defaultProps} />);

    // Toggle lights
    const lightsBtn = screen.getByTestId('toggle-lights-btn');
    fireEvent.click(lightsBtn);
    expect(lightsBtn).toHaveTextContent(/Ağ-Ay İşığı/i);

    // Switch barrier state
    fireEvent.click(screen.getByTestId('barrier-closed-btn'));
    expect(screen.getByText(/🚫 Tam Bağlı/i)).toBeInTheDocument();

    // Adjust distance slider to <5m to trigger violation
    const distanceSlider = screen.getByTestId('distance-slider');
    fireEvent.change(distanceSlider, { target: { value: '2' } });

    // Violation warning should be displayed
    expect(screen.getAllByText(/İXM Maddə 345/i).length).toBeGreaterThan(0);

    // Toggle bell
    const bellBtn = screen.getByTestId('toggle-bell-btn');
    fireEvent.click(bellBtn);
    expect(bellBtn).toHaveTextContent(/Səssiz/i);
  });

  it('interacts with calculator parameters, selects presets, and generates a ticket', () => {
    render(<RailwayComplianceModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-calculator'));

    // Select SUV preset
    const pradoPresetBtn = screen.getByTestId('preset-btn-preset_suv_prado');
    fireEvent.click(pradoPresetBtn);

    // Change route
    const routeSelect = screen.getByTestId('route-select');
    fireEvent.change(routeSelect, { target: { value: 'BAKU_QABALA' } });

    // Change passenger class
    const pClassSelect = screen.getByTestId('passenger-class-select');
    fireEvent.change(pClassSelect, { target: { value: 'sv_2berth' } });

    // Change passenger count
    const pCountInput = screen.getByTestId('passenger-count-input');
    fireEvent.change(pCountInput, { target: { value: '3' } });

    // Click generate ticket button
    const generateBtn = screen.getByTestId('generate-ticket-btn');
    fireEvent.click(generateBtn);

    // Should transition to boarding pass tab
    expect(screen.getByTestId('boarding-pass-section')).toBeInTheDocument();
  });

  it('toggles checklist items in the checklist tab', () => {
    render(<RailwayComplianceModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-checklist'));

    const firstItem = screen.getByTestId('checklist-item-rail_chk_01');
    fireEvent.click(firstItem);

    // Toggling off a critical item marks it failed and reduces score
    expect(screen.getByText(/Kritik təhlükəsizlik qaydası pozulub/i)).toBeInTheDocument();
  });

  it('filters terminals in the terminals tab by search input', () => {
    render(<RailwayComplianceModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-terminals'));

    const searchInput = screen.getByTestId('terminal-search-input');
    fireEvent.change(searchInput, { target: { value: 'Qəbələ' } });

    expect(screen.getByTestId('terminal-card-term_qabala')).toBeInTheDocument();
    expect(screen.queryByTestId('terminal-card-term_ganja')).not.toBeInTheDocument();
  });

  it('answers exam questions and submits for evaluation in exam tab', () => {
    render(<RailwayComplianceModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-exam'));

    // Answer first question
    const q1Card = screen.getByTestId('exam-question-rail_exam_01');
    const firstOptionBtn = q1Card.querySelectorAll('button')[0];
    fireEvent.click(firstOptionBtn);

    // Submit exam
    const submitBtn = screen.getByTestId('submit-exam-btn');
    fireEvent.click(submitBtn);

    // Explanation should appear
    expect(screen.getByText(/YHQ Maddə 44 Bənd III/i)).toBeInTheDocument();
  });

  it('handles copy and print actions on the boarding pass tab', () => {
    render(<RailwayComplianceModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-boarding-pass'));

    const copyBtn = screen.getByTestId('copy-pass-id-btn');
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    const printBtn = screen.getByTestId('print-pass-btn');
    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalled();
  });

  it('filters boarding passes in the unified registry search', () => {
    render(<RailwayComplianceModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-boarding-pass'));

    const searchInput = screen.getByTestId('registry-search-input');
    fireEvent.change(searchInput, { target: { value: '44102' } });

    expect(screen.getByTestId('registry-item-ADY-RAIL-2026-44102')).toBeInTheDocument();
    expect(screen.queryByTestId('registry-item-ADY-RAIL-2026-88219')).not.toBeInTheDocument();
  });
});
