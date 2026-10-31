import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoiseBarrierModal } from '../NoiseBarrierModal';
import { MOCK_VEHICLE_ACOUSTIC_PRESETS } from '../../data/mockNoiseBarrierData';

describe('NoiseBarrierModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <NoiseBarrierModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(<NoiseBarrierModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByTestId('noise-barrier-modal')).toBeDefined();
    expect(
      screen.getByText('Magistral Səs Baryerləri & Akustik Telemetriya Portalı')
    ).toBeDefined();
    expect(screen.getByTestId('tab-content-radar')).toBeDefined();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<NoiseBarrierModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByTestId('noise-barrier-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches between all tabs cleanly', () => {
    render(<NoiseBarrierModal isOpen={true} onClose={vi.fn()} />);

    // Switch to SCADA
    fireEvent.click(screen.getByTestId('tab-scada'));
    expect(screen.getByTestId('tab-content-scada')).toBeDefined();
    expect(
      screen.getByText('Maekawa Difraksiya və Fasad Səs Zəifləməsi Simulyatoru')
    ).toBeDefined();

    // Switch to Exhaust
    fireEvent.click(screen.getByTestId('tab-exhaust'));
    expect(screen.getByTestId('tab-content-exhaust')).toBeDefined();
    expect(
      screen.getByText('Avtomobil Səsboğucu və Səs Siqnalı Akustik Standartları')
    ).toBeDefined();

    // Switch to Checklist
    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByTestId('tab-content-checklist')).toBeDefined();

    // Switch to Exam
    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByTestId('tab-content-exam')).toBeDefined();

    // Switch to Certificate
    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByTestId('tab-content-certificate')).toBeDefined();

    // Switch to Registry
    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(screen.getByTestId('tab-content-registry')).toBeDefined();
  });

  it('allows applying vehicle acoustic presets in exhaust tab', () => {
    render(<NoiseBarrierModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByTestId('tab-exhaust'));

    // Apply the VAZ-2107 straight-pipe preset
    const straightPipePreset = MOCK_VEHICLE_ACOUSTIC_PRESETS.find(
      (p) => p.vehiclePlate === '77-SP-909'
    );
    expect(straightPipePreset).toBeDefined();

    const presetBtn = screen.getByText('77-SP-909');
    fireEvent.click(presetBtn);

    // Should indicate fine / warning or fail
    expect(screen.getByText(/150 AZN/i)).toBeDefined();
  });

  it('interacts with checklist and checks all items', () => {
    render(<NoiseBarrierModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByTestId('tab-checklist'));

    const selectAllBtn = screen.getByText('Bütün Bəndləri Təsdiqlə');
    fireEvent.click(selectAllBtn);

    expect(screen.getByText(/100% Tamamlanıb/i)).toBeDefined();
    expect(screen.getByText('AKREDİTASİYA TƏSDİQLƏNDİ')).toBeDefined();
  });

  it('submits exam and calculates score evaluation', () => {
    render(<NoiseBarrierModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByTestId('tab-exam'));

    // Click an option for question 1 (84 dBA)
    const option84 = screen.getByText('84 dBA');
    fireEvent.click(option84);

    const submitBtn = screen.getByText('İmtahanı Tamamla və Qiymətləndir');
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Nəticəniz:/i)).toBeDefined();
    expect(screen.getByText('Yenidən Başla')).toBeDefined();
  });

  it('generates a certificate and switches to certificate tab', () => {
    render(<NoiseBarrierModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByTestId('tab-exhaust'));

    const generateBtn = screen.getByText('Dövlət Akustik Sertifikatı Yarat');
    fireEvent.click(generateBtn);

    expect(screen.getByTestId('tab-content-certificate')).toBeDefined();
    expect(
      screen.getByText('DÖVLƏT AVTOMOBİL YOLLARI & ETSN AKUSTİK NƏZARƏT')
    ).toBeDefined();
  });
});
