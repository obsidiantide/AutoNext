import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AutonomousVehicleModal } from '../AutonomousVehicleModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

const mockVehicle = MOCK_VEHICLES[0];

describe('AutonomousVehicleModal Component', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <AutonomousVehicleModal isOpen={false} onClose={onCloseMock} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title and default corridors tab when open', () => {
    render(<AutonomousVehicleModal isOpen={true} onClose={onCloseMock} />);

    expect(screen.getByTestId('autonomous-vehicle-modal')).toBeDefined();
    expect(
      screen.getByText(/Avtonom Nəqliyyat Vasitələri, V2X Telemetriya & Sınaq İcazəsi Portalı/i)
    ).toBeDefined();
    expect(screen.getByTestId('corridors-tab-content')).toBeDefined();
  });

  it('calls onClose when close button or bottom close button is clicked', () => {
    render(<AutonomousVehicleModal isOpen={true} onClose={onCloseMock} />);

    const closeBtn = screen.getByTestId('modal-close-btn');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    const bottomCloseBtn = screen.getByTestId('modal-bottom-close-btn');
    fireEvent.click(bottomCloseBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(2);
  });

  it('switches cleanly between all 8 navigation tabs', () => {
    render(<AutonomousVehicleModal isOpen={true} onClose={onCloseMock} />);

    // Telemetry Tab
    fireEvent.click(screen.getByTestId('tab-telemetry'));
    expect(screen.getByTestId('telemetry-tab-content')).toBeDefined();

    // Sensors Tab
    fireEvent.click(screen.getByTestId('tab-sensors'));
    expect(screen.getByTestId('sensors-tab-content')).toBeDefined();

    // V2X Tab
    fireEvent.click(screen.getByTestId('tab-v2x'));
    expect(screen.getByTestId('v2x-tab-content')).toBeDefined();

    // Fees Tab
    fireEvent.click(screen.getByTestId('tab-fees'));
    expect(screen.getByTestId('fees-tab-content')).toBeDefined();

    // Checklist Tab
    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByTestId('checklist-tab-content')).toBeDefined();

    // Exam Tab
    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByTestId('exam-tab-content')).toBeDefined();

    // Permit Tab
    fireEvent.click(screen.getByTestId('tab-permit'));
    expect(screen.getByTestId('permit-tab-content')).toBeDefined();

    // Registry Tab
    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(screen.getByTestId('registry-tab-content')).toBeDefined();
  });

  it('applies quick preset scenarios when clicked', () => {
    render(<AutonomousVehicleModal isOpen={true} onClose={onCloseMock} />);

    const presetButtons = screen.getAllByRole('button');
    const zeekrPreset = presetButtons.find((btn) => btn.textContent?.includes('Zeekr 001'));
    if (zeekrPreset) {
      fireEvent.click(zeekrPreset);
      expect(screen.getAllByText(/99-RX-777/i).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('toggles emergency stop E-STOP MRM button in telemetry tab', () => {
    render(<AutonomousVehicleModal isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByTestId('tab-telemetry'));

    const estopBtn = screen.getByText(/QƏZA DAYANDIRMA \(E-STOP MRM\)/i);
    fireEvent.click(estopBtn);

    expect(screen.getByText(/MANUAL MRM FƏALLAŞDIRILIB/i)).toBeDefined();
  });

  it('interacts with checklist and clicks Bütün Bəndləri Təsdiqlə', () => {
    render(<AutonomousVehicleModal isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByTestId('tab-checklist'));

    const approveAllBtn = screen.getByText(/Bütün Bəndləri Təsdiqlə/i);
    fireEvent.click(approveAllBtn);

    expect(screen.getByText(/10 \/ 10 \(100%\)/i)).toBeDefined();
    expect(screen.getByText(/verilməsi üçün tam uyğundur/i)).toBeDefined();
  });

  it('handles permit copy and print operations in permit tab', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText: writeTextMock } });

    render(<AutonomousVehicleModal isOpen={true} onClose={onCloseMock} targetCar={mockVehicle} />);

    fireEvent.click(screen.getByTestId('tab-permit'));

    const copyBtn = screen.getByRole('button', { name: /Kopyala/i });
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalled();

    const printBtn = screen.getByRole('button', { name: /Çap Et/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });

  it('filters public registry by search query', () => {
    render(<AutonomousVehicleModal isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByTestId('tab-registry'));

    const searchInput = screen.getByPlaceholderText(/Qeydiyyat nişanı və ya icazə nömrəsi.../i);
    fireEvent.change(searchInput, { target: { value: '99-VT-900' } });

    expect(screen.getByText('99-VT-900')).toBeDefined();
    expect(screen.queryByText('99-AS-101')).toBeNull();
  });
});
