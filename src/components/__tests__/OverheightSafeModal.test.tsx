import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OverheightSafeModal } from '../OverheightSafeModal';

describe('OverheightSafeModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
  };

  it('does not render when isOpen is false', () => {
    const { container } = render(<OverheightSafeModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default corridors tab when open', () => {
    render(<OverheightSafeModal {...defaultProps} />);
    expect(screen.getByTestId('overheight-safe-modal')).toBeInTheDocument();
    expect(screen.getByText(/OVERHEIGHT-SAFE-AZ-2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Azərbaycan Magistral Körpü və Yolötürücülərinin Laser OHVDS Radarı/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<OverheightSafeModal {...defaultProps} onClose={onClose} />);
    const closeBtn = screen.getByLabelText(/close/i);
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 8 navigation tabs', () => {
    render(<OverheightSafeModal {...defaultProps} />);

    // SCADA Tab
    fireEvent.click(screen.getByRole('button', { name: /SCADA Lazer Stendi/i }));
    expect(screen.getByText(/OHVDS Dual-Beam Lazer & Toqquşma SCADA Simulyasiya Stendi/i)).toBeInTheDocument();

    // Envelope Tab
    fireEvent.click(screen.getByRole('button', { name: /2D\/3D Aşırım Qrafiki/i }));
    expect(screen.getByText(/2D Lazer LiDAR Aşırım Ölçmə Zərfi və Profil Qrafiki/i)).toBeInTheDocument();

    // Presets Tab
    fireEvent.click(screen.getByRole('button', { name: /Nəqliyyat Preseti & Cərimə/i }));
    expect(screen.getByText(/Nəqliyyat Presetləri və İnzibati Məsuliyyət Hesablayıcısı/i)).toBeInTheDocument();

    // Checklist Tab
    fireEvent.click(screen.getByRole('button', { name: /10-Bəndlik Standart/i }));
    expect(screen.getByText(/10-Bəndlik Texniki və Hüquqi Qabarit Hündürlük Standartı/i)).toBeInTheDocument();

    // Exam Tab
    fireEvent.click(screen.getByRole('button', { name: /İmtahan Simulyatoru/i }));
    expect(screen.getByText(/Qabarit Hündürlük və Körpü Təhlükəsizliyi İmtahan Simulyatoru/i)).toBeInTheDocument();

    // Certificate Tab
    fireEvent.click(screen.getByRole('button', { name: /Sertifikat Blankı/i }));
    expect(screen.getByText(/Rəsmi Elektron Qabarit Arayışı/i)).toBeInTheDocument();

    // Registry Tab
    fireEvent.click(screen.getByRole('button', { name: /Dövlət Reyestri/i }));
    expect(screen.getByText(/Vahid AAYDA & BDYP Qabarit və Toqquşma Reyestri/i)).toBeInTheDocument();

    // Back to Corridors Tab
    fireEvent.click(screen.getByRole('button', { name: /Körpü Radarı/i }));
    expect(screen.getByText(/Azərbaycan Magistral Körpü və Yolötürücülərinin Laser OHVDS Radarı/i)).toBeInTheDocument();
  });

  it('filters bridges in corridors tab using search input', () => {
    render(<OverheightSafeModal {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/Körpü və ya marşrut axtar/i);
    fireEvent.change(searchInput, { target: { value: 'Sumqayıt' } });
    expect(screen.getByText(/M-1 Bakı-Quba-Rusiya Sərhədi Km 22\+800/i)).toBeInTheDocument();
    expect(screen.queryByText(/8 Noyabr Prospekti Km 3\+900/i)).toBeNull();
  });

  it('interacts with SCADA sliders and updates telemetry', () => {
    render(<OverheightSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /SCADA Lazer Stendi/i }));

    // Select Road Surface Friction
    const frictionSelect = screen.getByRole('combobox');
    fireEvent.change(frictionSelect, { target: { value: 'WET' } });
    expect(frictionSelect).toHaveValue('WET');

    // Toggle Siren
    const audioBtn = screen.getByText(/Səs Söndürülüb/i);
    fireEvent.click(audioBtn);
    expect(screen.getByText(/118 dBA Siren Aktiv/i)).toBeInTheDocument();
  });

  it('applies vehicle presets and recalculates penalties in presets tab', () => {
    render(<OverheightSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Nəqliyyat Preseti & Cərimə/i }));

    const presetBtn = screen.getByText(/Euro-6 Tentli Dartıcı Semi-Trailer/i);
    fireEvent.click(presetBtn);

    expect(screen.getByText(/Qanunvericilik üzrə Cərimə və Dəymiş Ziyanın Bərpası/i)).toBeInTheDocument();
  });

  it('toggles checklist items, selects all, and resets in checklist tab', () => {
    render(<OverheightSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /10-Bəndlik Standart/i }));

    const selectAllBtn = screen.getByRole('button', { name: /Hamısını Seç/i });
    fireEvent.click(selectAllBtn);
    expect(screen.getByText('100%')).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Sıfırla/i });
    fireEvent.click(resetBtn);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('answers exam questions and submits in exam tab', () => {
    render(<OverheightSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /İmtahan Simulyatoru/i }));

    // Select answers for questions
    const optionBtns = screen.getAllByRole('button', { name: /^[A-D]\)/i });
    expect(optionBtns.length).toBeGreaterThan(0);
    // Click some option
    fireEvent.click(optionBtns[0]);

    // Submit button should exist
    const submitBtn = screen.getByRole('button', { name: /Cavabları Təsdiqlə və Qiymətləndir/i });
    expect(submitBtn).toBeInTheDocument();
  });

  it('generates certificate from SCADA stend and opens certificate tab', () => {
    render(<OverheightSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /SCADA Lazer Stendi/i }));

    const genBtn = screen.getByRole('button', { name: /Elektron Qabarit Arayışı Yarat/i });
    fireEvent.click(genBtn);

    expect(screen.getByText(/QABARİT HÜNDÜRLÜK KEÇİD SERTİFİKATI/i)).toBeInTheDocument();
    expect(screen.getByText(/SİMA Rəqəmsal İmza:/i)).toBeInTheDocument();
  });

  it('filters certificates in registry tab', () => {
    render(<OverheightSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Dövlət Reyestri/i }));

    const regInput = screen.getByPlaceholderText(/Qeydiyyat nişanı və ya №/i);
    fireEvent.change(regInput, { target: { value: '99-OH-101' } });
    expect(screen.getByText('99-OH-101')).toBeInTheDocument();

    // Select status filter
    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'VERIFIED_CLEARANCE' } });
    expect(statusSelect).toHaveValue('VERIFIED_CLEARANCE');
  });
});
