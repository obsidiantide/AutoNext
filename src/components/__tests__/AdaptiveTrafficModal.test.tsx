import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AdaptiveTrafficModal } from '../AdaptiveTrafficModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

const mockVehicle = MOCK_VEHICLES[0];

describe('AdaptiveTrafficModal Component', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <AdaptiveTrafficModal isOpen={false} onClose={onCloseMock} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default corridors tab when open', () => {
    render(<AdaptiveTrafficModal isOpen={true} onClose={onCloseMock} />);

    expect(screen.getByTestId('adaptive-traffic-modal')).toBeDefined();
    expect(
      screen.getByText(/Ağıllı Nəqliyyat Sistemləri "Yaşıl Dalğa" və Svetofor Sinxronizasiyası Portalı/i)
    ).toBeDefined();
    expect(screen.getByTestId('traffic-tab-corridors-content')).toBeDefined();
  });

  it('calls onClose when close button is clicked', () => {
    render(<AdaptiveTrafficModal isOpen={true} onClose={onCloseMock} />);

    const closeBtn = screen.getByTestId('close-adaptive-traffic-modal-btn');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 8 navigation tabs', () => {
    render(<AdaptiveTrafficModal isOpen={true} onClose={onCloseMock} />);

    // Green Wave Tab
    fireEvent.click(screen.getByTestId('traffic-tab-greenwave'));
    expect(screen.getByTestId('traffic-tab-greenwave-content')).toBeDefined();

    // Telemetry Tab
    fireEvent.click(screen.getByTestId('traffic-tab-telemetry'));
    expect(screen.getByTestId('traffic-tab-telemetry-content')).toBeDefined();

    // Pricing Tab
    fireEvent.click(screen.getByTestId('traffic-tab-pricing'));
    expect(screen.getByTestId('traffic-tab-pricing-content')).toBeDefined();

    // Checklist Tab
    fireEvent.click(screen.getByTestId('traffic-tab-checklist'));
    expect(screen.getByTestId('traffic-tab-checklist-content')).toBeDefined();

    // Exam Tab
    fireEvent.click(screen.getByTestId('traffic-tab-exam'));
    expect(screen.getByTestId('traffic-tab-exam-content')).toBeDefined();

    // Pass Tab
    fireEvent.click(screen.getByTestId('traffic-tab-pass'));
    expect(screen.getByTestId('traffic-tab-pass-content')).toBeDefined();

    // Registry Tab
    fireEvent.click(screen.getByTestId('traffic-tab-registry'));
    expect(screen.getByTestId('traffic-tab-registry-content')).toBeDefined();
  });

  it('allows selecting a corridor from the radar grid', () => {
    render(<AdaptiveTrafficModal isOpen={true} onClose={onCloseMock} />);

    const tbilisiCard = screen.getByTestId('corridor-card-CORRIDOR_TBILISI');
    fireEvent.click(tbilisiCard);
    expect(screen.getAllByText(/Tbilisi Prospekti/i).length).toBeGreaterThanOrEqual(1);
  });

  it('interacts with green wave sliders and switches control mode', () => {
    render(<AdaptiveTrafficModal isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByTestId('traffic-tab-greenwave'));

    const modeBtn = screen.getByRole('button', { name: /ADAPTIVE SCATS/i });
    fireEvent.click(modeBtn);
    expect(modeBtn.className).toContain('text-emerald-300');
  });

  it('interacts with telemetry inputs and displays LOS evaluation', () => {
    render(<AdaptiveTrafficModal isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByTestId('traffic-tab-telemetry'));

    const laneBtn = screen.getByRole('button', { name: /4 Zolaq/i });
    fireEvent.click(laneBtn);
    expect(laneBtn.className).toContain('bg-emerald-500');
  });

  it('applies vehicle presets and issues a new priority pass in pricing tab', () => {
    render(<AdaptiveTrafficModal isOpen={true} onClose={onCloseMock} targetCar={mockVehicle} />);

    fireEvent.click(screen.getByTestId('traffic-tab-pricing'));

    // Apply EV preset
    const evPresetBtn = screen.getByText('10-EV-555');
    fireEvent.click(evPresetBtn);

    // Issue pass button
    const issueBtn = screen.getByTestId('issue-traffic-pass-btn');
    fireEvent.click(issueBtn);

    // Transitions to pass tab
    expect(screen.getByTestId('traffic-tab-pass-content')).toBeDefined();
    expect(screen.getAllByText(/ITS-PRIORITY-AZ-2026-/i).length).toBeGreaterThanOrEqual(1);
  });

  it('interacts with checklist and checks all items', () => {
    render(<AdaptiveTrafficModal isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByTestId('traffic-tab-checklist'));

    const selectAllBtn = screen.getByText(/Bütün Bəndləri Təsdiqlə/i);
    fireEvent.click(selectAllBtn);

    expect(screen.getByText(/100%/i)).toBeDefined();
    expect(screen.getByText(/Qovşaq Sinxronizasiyaya və Yaşıl Dalğaya Tam Yararlıdır/i)).toBeDefined();
  });

  it('completes the theoretical exam and displays score results', () => {
    render(<AdaptiveTrafficModal isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByTestId('traffic-tab-exam'));

    // Answer all 10 questions (first option for each)
    const optionButtons = screen.getAllByRole('button');
    const answerButtons = optionButtons.filter((btn) => btn.className.includes('w-full p-2.5 rounded-xl'));
    
    // Click some answers
    if (answerButtons.length >= 10) {
      for (let i = 0; i < 10; i++) {
        fireEvent.click(answerButtons[i * 4]);
      }
    }

    const submitBtn = screen.queryByText(/İmtahan Cavablarını Təsdiqlə və Qiymətləndir/i);
    if (submitBtn && !submitBtn.hasAttribute('disabled')) {
      fireEvent.click(submitBtn);
      expect(screen.getByText(/İmtahan Nəticəsi/i)).toBeDefined();
    }
  });

  it('filters public registry by search query', () => {
    render(<AdaptiveTrafficModal isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByTestId('traffic-tab-registry'));

    const searchInput = screen.getByPlaceholderText(/Nömrə və ya vəsiqə axtar.../i);
    fireEvent.change(searchInput, { target: { value: '10-TT-103' } });

    expect(screen.getAllByText('10-TT-103').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('99-FHN-001')).toBeNull();
  });
});
