import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FireSafetyModal } from '../FireSafetyModal';

describe('FireSafetyModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <FireSafetyModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default audit tab when open', () => {
    render(<FireSafetyModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText('Fövqəladə Hallar Nazirliyi (FHN) & DYNX Yanğın Təhlükəsizlik Portalı')
    ).toBeInTheDocument();
    expect(screen.getByText('112 Xilasetmə')).toBeInTheDocument();
    expect(
      screen.getByText('10-Bəndlik Təhlükəsizlik Sınağı')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Avtomobilin Yanğın Təhlükəsizlik İmtahanı & Sertifikatlaşdırma Sınağı')
    ).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<FireSafetyModal isOpen={true} onClose={mockOnClose} />);
    const closeBtn = screen.getByRole('button', { name: 'Bağla' });
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches between all navigation tabs cleanly', () => {
    render(<FireSafetyModal isOpen={true} onClose={mockOnClose} />);

    // Extinguisher tab
    const extTab = screen.getByRole('button', { name: /Yanğınsöndürən & Manometr Stendi/i });
    fireEvent.click(extTab);
    expect(screen.getByText('Balon və Nəqliyyat Parametrləri')).toBeInTheDocument();
    expect(screen.getByText('Manometr və Daxili Təzyiq Sınağı')).toBeInTheDocument();

    // PASS Simulator tab
    const simTab = screen.getByRole('button', { name: /PASS Yanğınsöndürmə Simulyatoru/i });
    fireEvent.click(simTab);
    expect(screen.getByText(/Beynəlxalq PASS Prinsipi üzrə Yanğınsöndürmə Təlimatı/i)).toBeInTheDocument();

    // Hydrant tab
    const hydrantTab = screen.getByRole('button', { name: /Yanğın Hidrantı 5m Qorunma Zonası/i });
    fireEvent.click(hydrantTab);
    expect(screen.getByText(/Məsafə Tənzimləyicisi/i)).toBeInTheDocument();

    // Stations tab
    const stationsTab = screen.getByRole('button', { name: /FHN Regional Mərkəzləri Radarı/i });
    fireEvent.click(stationsTab);
    expect(screen.getByText(/Sertifikatlaşdırma və Yanğından Mühafizə Hissələri/i)).toBeInTheDocument();

    // Exam tab
    const examTab = screen.getByRole('button', { name: /10-Suallıq FHN İmtahanı/i });
    fireEvent.click(examTab);
    expect(screen.getByText(/Avtomobil Yanğın Təhlükəsizliyi Nəzəri İmtahanı/i)).toBeInTheDocument();

    // Certificate tab
    const certTab = screen.getByRole('button', { name: /FHN-DYNX-2026 Sertifikatı/i });
    fireEvent.click(certTab);
    expect(screen.getByText(/DÖVLƏT YANĞIN NƏZARƏTİ XİDMƏTİ \(DYNX\)/i)).toBeInTheDocument();
  });

  it('handles checklist interaction: select all and reset', () => {
    render(<FireSafetyModal isOpen={true} onClose={mockOnClose} />);

    const selectAllBtn = screen.getByRole('button', { name: 'Hamısını Seç' });
    fireEvent.click(selectAllBtn);
    expect(screen.getByText('100%')).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: 'Sıfırla' });
    fireEvent.click(resetBtn);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('progresses through PASS simulator steps and resets', () => {
    render(<FireSafetyModal isOpen={true} onClose={mockOnClose} />);

    // Go to simulator
    const simTab = screen.getByRole('button', { name: /PASS Yanğınsöndürmə Simulyatoru/i });
    fireEvent.click(simTab);

    // Initial step: Pull
    const pullBtn = screen.getByRole('button', { name: /1. Pini Çıxar \(Pull\)/i });
    fireEvent.click(pullBtn);

    // Next step: Aim
    const aimBtn = screen.getByRole('button', { name: /2. Əsasa Tuşla \(Aim\)/i });
    fireEvent.click(aimBtn);

    // Next step: Squeeze
    const squeezeBtn = screen.getByRole('button', { name: /3. Qolu Sıx \(Squeeze\)/i });
    fireEvent.click(squeezeBtn);

    // Next step: Sweep
    const sweepBtn = screen.getByRole('button', { name: /4. Yana Süpür \(Sweep\)/i });
    fireEvent.click(sweepBtn);

    // Extinguished state
    expect(screen.getByText('YANĞIN TAM SÖNDÜRÜLDÜ!')).toBeInTheDocument();

    // Reset simulator
    const restartBtn = screen.getByRole('button', { name: /Yenidən Başla/i });
    fireEvent.click(restartBtn);
    expect(screen.getByRole('button', { name: /1. Pini Çıxar \(Pull\)/i })).toBeInTheDocument();
  });

  it('interacts with hydrant distance and displays violations', () => {
    render(<FireSafetyModal isOpen={true} onClose={mockOnClose} />);

    const hydrantTab = screen.getByRole('button', { name: /Yanğın Hidrantı 5m Qorunma Zonası/i });
    fireEvent.click(hydrantTab);

    // Default distance is 6.5m (compliant)
    expect(screen.getByText('QANUNİ PARKLANMA')).toBeInTheDocument();

    // Change distance to 2.0m (non-compliant)
    const rangeInput = screen.getByRole('slider');
    fireEvent.change(rangeInput, { target: { value: '2.0' } });

    expect(screen.getByText('QADAĞAN OLUNMUŞ ZONA!')).toBeInTheDocument();
    expect(screen.getByText('Bəli (Dərhal Evakuasiya)')).toBeInTheDocument();
  });

  it('allows answering theoretical exam questions and submitting', () => {
    render(<FireSafetyModal isOpen={true} onClose={mockOnClose} />);

    const examTab = screen.getByRole('button', { name: /10-Suallıq FHN İmtahanı/i });
    fireEvent.click(examTab);

    // Click first option of question 1
    const optionBtn = screen.getAllByRole('button', { name: /kq tutumlu/i })[0];
    fireEvent.click(optionBtn);

    const submitBtn = screen.getByRole('button', { name: 'İmtahanı Tamamla' });
    expect(submitBtn).toBeEnabled();
    fireEvent.click(submitBtn);

    expect(screen.getByText(/İMTAHANDAN KEÇDİ|KƏSİLDİ/i)).toBeInTheDocument();
  });

  it('allows booking a queue at a fire station', () => {
    render(<FireSafetyModal isOpen={true} onClose={mockOnClose} />);

    const stationsTab = screen.getByRole('button', { name: /FHN Regional Mərkəzləri Radarı/i });
    fireEvent.click(stationsTab);

    const bookBtns = screen.getAllByRole('button', { name: 'Növbə Al' });
    fireEvent.click(bookBtns[0]);

    expect(screen.getByText('Növbə Alındı!')).toBeInTheDocument();
  });
});
