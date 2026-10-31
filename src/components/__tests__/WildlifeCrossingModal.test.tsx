import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WildlifeCrossingModal } from '../WildlifeCrossingModal';

describe('WildlifeCrossingModal Component', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <WildlifeCrossingModal isOpen={false} onClose={onCloseMock} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with header and tabs when isOpen is true', () => {
    render(<WildlifeCrossingModal isOpen={true} onClose={onCloseMock} />);
    expect(
      screen.getByText(/Vəhşi Təbiət & Heyvan Keçidləri SCADA Bio-Telemetriya Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('tab-btn-corridors_radar')).toBeInTheDocument();
    expect(screen.getByTestId('tab-btn-scada_biotelemetry')).toBeInTheDocument();
    expect(screen.getByTestId('tab-btn-stopping_physics')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<WildlifeCrossingModal isOpen={true} onClose={onCloseMock} />);
    const closeBtn = screen.getByTestId('modal-close-btn');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('switches between presets on Tab 1', () => {
    render(<WildlifeCrossingModal isOpen={true} onClose={onCloseMock} />);
    const presetBtn = screen.getByTestId('preset-btn-v_byd_song');
    fireEvent.click(presetBtn);
    expect(screen.getByText('77-AZ-555')).toBeInTheDocument();
  });

  it('navigates to Tab 2 (SCADA Bio-Telemetry) and adjusts slider', () => {
    render(<WildlifeCrossingModal isOpen={true} onClose={onCloseMock} />);
    const tabBtn = screen.getByTestId('tab-btn-scada_biotelemetry');
    fireEvent.click(tabBtn);

    expect(screen.getByTestId('tab-scada-biotelemetry')).toBeInTheDocument();
    const slider = screen.getByTestId('ai-confidence-slider');
    fireEvent.change(slider, { target: { value: '85' } });
    expect(slider).toHaveValue('85');

    const toggleBtn = screen.getByTestId('toggle-virtual-fence');
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent('SÖNÜLÜ');
  });

  it('navigates to Tab 3 (Stopping Physics) and updates speed & road conditions', () => {
    render(<WildlifeCrossingModal isOpen={true} onClose={onCloseMock} />);
    const tabBtn = screen.getByTestId('tab-btn-stopping_physics');
    fireEvent.click(tabBtn);

    expect(screen.getByTestId('tab-stopping-physics')).toBeInTheDocument();
    const speedSlider = screen.getByTestId('speed-slider');
    fireEvent.change(speedSlider, { target: { value: '110' } });
    expect(speedSlider).toHaveValue('110');

    // Click lighting button
    const lowBeamBtn = screen.getByTestId('lighting-btn-night_low_beam');
    fireEvent.click(lowBeamBtn);

    // Verify collision verdict banner exists
    expect(screen.getByTestId('collision-verdict-banner')).toBeInTheDocument();
  });

  it('navigates to Tab 4 (Checklist) and toggles checklist items', () => {
    render(<WildlifeCrossingModal isOpen={true} onClose={onCloseMock} />);
    const tabBtn = screen.getByTestId('tab-btn-safety_checklist');
    fireEvent.click(tabBtn);

    expect(screen.getByTestId('tab-safety-checklist')).toBeInTheDocument();
    const toggleAllBtn = screen.getByTestId('toggle-all-checklist-btn');
    fireEvent.click(toggleAllBtn); // Deselect all

    expect(screen.getByText(/0% \(0\/10\)/i)).toBeInTheDocument();

    fireEvent.click(toggleAllBtn); // Select all
    expect(screen.getByText(/100% \(10\/10\)/i)).toBeInTheDocument();
  });

  it('navigates to Tab 5 (Exam Simulator), answers question, and resets', () => {
    render(<WildlifeCrossingModal isOpen={true} onClose={onCloseMock} />);
    const tabBtn = screen.getByTestId('tab-btn-exam_simulator');
    fireEvent.click(tabBtn);

    expect(screen.getByTestId('tab-exam-simulator')).toBeInTheDocument();
    const optionBtn = screen.getByTestId('question-1-option-1');
    fireEvent.click(optionBtn);

    const resetBtn = screen.getByTestId('reset-exam-btn');
    fireEvent.click(resetBtn);
  });

  it('navigates to Tab 6 (Issue Certificate) and generates a certificate', () => {
    render(<WildlifeCrossingModal isOpen={true} onClose={onCloseMock} />);
    const tabBtn = screen.getByTestId('tab-btn-issue_certificate');
    fireEvent.click(tabBtn);

    expect(screen.getByTestId('tab-issue-certificate')).toBeInTheDocument();
    const generateBtn = screen.getByTestId('generate-cert-btn');
    fireEvent.click(generateBtn);

    expect(screen.getByTestId('wildlife-certificate-card')).toBeInTheDocument();
    expect(screen.getByText(/RƏSMİ WILD-PASS-AZ-2026/i)).toBeInTheDocument();

    const copyBtn = screen.getByTestId('copy-cert-num-btn');
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('navigates to Tab 7 (Public Registry) and filters records', () => {
    render(<WildlifeCrossingModal isOpen={true} onClose={onCloseMock} />);
    const tabBtn = screen.getByTestId('tab-btn-public_registry');
    fireEvent.click(tabBtn);

    expect(screen.getByTestId('tab-public-registry')).toBeInTheDocument();
    const searchInput = screen.getByTestId('registry-search-input');
    fireEvent.change(searchInput, { target: { value: '99-WL-901' } });

    expect(screen.getByText('99-WL-901')).toBeInTheDocument();
  });

  it('changes currency between AZN, USD, and EUR', () => {
    render(<WildlifeCrossingModal isOpen={true} onClose={onCloseMock} />);
    const usdBtn = screen.getByTestId('currency-btn-usd');
    fireEvent.click(usdBtn);
    expect(usdBtn).toHaveClass('bg-emerald-600');
  });
});
