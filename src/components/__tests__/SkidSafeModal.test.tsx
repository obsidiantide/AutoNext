import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SkidSafeModal } from '../SkidSafeModal';

describe('SkidSafeModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
    language: 'az' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<SkidSafeModal {...defaultProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal header, title, and default tab (radar) when open', () => {
    render(<SkidSafeModal {...defaultProps} />);
    expect(screen.getByText('SKID-SAFE-AZ-2026')).toBeInTheDocument();
    expect(screen.getByText(/Respublika Əhəmiyyətli Magistral Yollarda İlişmə Vəziyyəti Radarı/i)).toBeInTheDocument();
    expect(screen.getByText(/1\. Dəhlizlər Radarı/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<SkidSafeModal {...defaultProps} onClose={onClose} />);
    const closeButtons = screen.getAllByRole('button', { name: /Modalı Bağla|Bağla/i });
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<SkidSafeModal {...defaultProps} />);

    // Tab 2: SCADA
    fireEvent.click(screen.getByText(/2\. SCADA Fizika & Hidroplaninq/i));
    expect(screen.getByText(/SCADA Parametrləri & Telemetriya İdarəetməsi/i)).toBeInTheDocument();

    // Tab 3: Vehicles
    fireEvent.click(screen.getByText(/3\. Nəqliyyat & İXM Cərimələr/i));
    expect(screen.getByText(/Nəqliyyat Kateqoriyaları & Təkər Protektoru Standartı/i)).toBeInTheDocument();

    // Tab 4: Checklist
    fireEvent.click(screen.getByText(/4\. 10-Bəndlik Texniki Yoxlama/i));
    expect(screen.getByText(/10-Bəndlik Texniki Asfalt & Təkər Təhlükəsizliyi Audit Standartı/i)).toBeInTheDocument();

    // Tab 5: Exam
    fireEvent.click(screen.getByText(/5\. Yol Qaydaları & İmtahan/i));
    expect(screen.getByText(/Asfalt İlişməsi, Akvaplaninq & Yol Hərəkəti Təhlükəsizliyi İmtahanı/i)).toBeInTheDocument();

    // Tab 6: Certificate
    fireEvent.click(screen.getByText(/6\. Elektron Sertifikat/i));
    expect(screen.getByText(/Rəsmi Elektron Səth İlişməsi & Şin Sertifikatı/i)).toBeInTheDocument();

    // Tab 7: Registry
    fireEvent.click(screen.getByText(/7\. Vahid Dövlət Reyestri/i));
    expect(screen.getByText(/Vahid Dövlət Asfalt İlişmə & Təkər Reyestri Axtarışı/i)).toBeInTheDocument();
  });

  it('interacts with sliders in SCADA tab', () => {
    render(<SkidSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/2\. SCADA Fizika & Hidroplaninq/i));

    const speedSlider = screen.getByLabelText(/Avtomobilin Sürəti/i);
    fireEvent.change(speedSlider, { target: { value: '130' } });
    expect(screen.getByText('130 km/saat')).toBeInTheDocument();

    const pressureSlider = screen.getByLabelText(/Təkərin Hava Təzyiqi/i);
    fireEvent.change(pressureSlider, { target: { value: '300' } });
    expect(screen.getAllByText(/300 kPa/i).length).toBeGreaterThan(0);

    const waterSlider = screen.getByLabelText(/Su Qatının Qalınlığı/i);
    fireEvent.change(waterSlider, { target: { value: '3.5' } });
    expect(screen.getByText('3.5 mm')).toBeInTheDocument();
  });

  it('selects vehicle presets and switches currency in vehicles tab', () => {
    render(<SkidSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/3\. Nəqliyyat & İXM Cərimələr/i));

    // Click Actros truck preset
    const actrosCard = screen.getByText(/Mercedes-Benz Actros 1845/i);
    fireEvent.click(actrosCard);
    expect(screen.getByText('10-SK-202')).toBeInTheDocument();

    // Switch currency to USD
    fireEvent.click(screen.getByRole('button', { name: 'USD' }));
    expect(screen.getAllByText(/\$/).length).toBeGreaterThan(0);
  });

  it('manages 10-point checklist selection, select-all, and reset', () => {
    render(<SkidSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/4\. 10-Bəndlik Texniki Yoxlama/i));

    // Click select all
    fireEvent.click(screen.getByText('Bütün Bəndləri Təsdiqlə'));
    expect(screen.getByText('100%')).toBeInTheDocument();

    // Click reset
    fireEvent.click(screen.getByText('Sıfırla'));
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('completes exam with 100% quick fill and submits', () => {
    render(<SkidSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/5\. Yol Qaydaları & İmtahan/i));

    // Click quick fill
    fireEvent.click(screen.getByText('100% Düzgün Doldur'));

    // Submit exam
    fireEvent.click(screen.getByText('İmtahanı Tamamla və Qiymətləndir'));
    expect(screen.getByText(/Təbriklər! İmtahan Uğurla Keçildi/i)).toBeInTheDocument();
    expect(screen.getByText(/Nəticəniz: 100%/i)).toBeInTheDocument();
  });

  it('handles certificate copy and print actions', () => {
    render(<SkidSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/6\. Elektron Sertifikat/i));

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });

    const copyBtn = screen.getByRole('button', { name: /Kopyala/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    // Mock window.print
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const printBtn = screen.getByRole('button', { name: /Çap Et/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });

  it('searches and filters records in public registry tab', () => {
    render(<SkidSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/7\. Vahid Dövlət Reyestri/i));

    const searchInput = screen.getByPlaceholderText(/Sertifikat no, nömrə və ya dəhliz\.\.\./i);
    fireEvent.change(searchInput, { target: { value: '99-SK-101' } });
    expect(screen.getByText('99-SK-101')).toBeInTheDocument();

    // Non-existent search
    fireEvent.change(searchInput, { target: { value: 'ZZ-999-NOTFOUND' } });
    expect(screen.getByText(/Sorğunuza uyğun sertifikat tapılmadı/i)).toBeInTheDocument();
  });
});
