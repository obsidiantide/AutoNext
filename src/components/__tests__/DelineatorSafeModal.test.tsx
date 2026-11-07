import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DelineatorSafeModal } from '../DelineatorSafeModal';

describe('DelineatorSafeModal Component', () => {
  it('renders modal header, title, and default radar tab when open', () => {
    render(<DelineatorSafeModal isOpen={true} onClose={vi.fn()} language="az" />);

    expect(screen.getByText(/DELINEATOR-SAFE-AZ-2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Respublika Magistral Yollarında Bələdçi Sütun Stansiyaları Radarı/i)).toBeInTheDocument();
    expect(screen.getAllByText(/AAYDA • AYNA • BDYP/i).length).toBeGreaterThan(0);
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<DelineatorSafeModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<DelineatorSafeModal isOpen={true} onClose={handleClose} language="az" />);

    const closeBtn = screen.getByLabelText(/close modal/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<DelineatorSafeModal isOpen={true} onClose={vi.fn()} language="az" />);

    // Simulator Tab
    fireEvent.click(screen.getByText(/^Optik Simulyator$/i));
    expect(screen.getByText(/Döngə Trayektoriyası və Bələdçi Sütunların İşıqqaytarması/i)).toBeInTheDocument();

    // Calculator Tab
    fireEvent.click(screen.getByText(/Nəqliyyat & İXM Cərimələri/i));
    expect(screen.getByText(/Nəqliyyat Vasitələri Optik Kateqoriyaları və İXM Cərimə Məsuliyyəti/i)).toBeInTheDocument();

    // Checklist Tab
    fireEvent.click(screen.getByText(/10-Bənd SCADA Standartı/i));
    expect(screen.getByText(/10-Bəndlik Bələdçi Sütun Texniki və Quraşdırma SCADA Standartı/i)).toBeInTheDocument();

    // Exam Tab
    fireEvent.click(screen.getByText(/Yol Qanunvericiliyi İmtahanı/i));
    expect(screen.getByText(/Bələdçi Sütunlar və Yol Hərəkəti Təhlükəsizliyi İmtahanı/i)).toBeInTheDocument();

    // Certificate Tab
    fireEvent.click(screen.getByText(/Rəsmi Sertifikat/i));
    expect(screen.getByText(/Rəsmi DELINEATOR-SAFE-AZ-2026 Elektron Sertifikatı/i)).toBeInTheDocument();

    // Registry Tab
    fireEvent.click(screen.getByText(/Vahid Reyestr/i));
    expect(screen.getByText(/Vahid İctimai Bələdçi Sütun və Qəza Qeydiyyat Reyestri/i)).toBeInTheDocument();
  });

  it('allows selecting a station from the radar grid and opens simulator', () => {
    render(<DelineatorSafeModal isOpen={true} onClose={vi.fn()} language="az" />);

    const openSimButtons = screen.getAllByText(/Optik Simulyatorda Aç/i);
    fireEvent.click(openSimButtons[1]); // Select second station (M-4 Aghsu)

    expect(screen.getByText(/Döngə Trayektoriyası və Bələdçi Sütunların İşıqqaytarması/i)).toBeInTheDocument();
    expect(screen.getByText(/M-4 Bakı – Şamaxı – Ağsu Aşırımı/i)).toBeInTheDocument();
  });

  it('interacts with sliders, reflector classes, and knockdown trigger in simulator tab', () => {
    render(<DelineatorSafeModal isOpen={true} onClose={vi.fn()} language="az" />);
    fireEvent.click(screen.getByText(/^Optik Simulyator$/i));

    // Reflector Class button R3
    fireEvent.click(screen.getByText('R3'));

    // Knockdown trigger button
    const strikeBtn = screen.getByText(/Təkər Toqquşması & Bərpa Simulyasiyası/i);
    fireEvent.click(strikeBtn);
    expect(screen.getByText(/Təkər Zərbəsi Aktivdir/i)).toBeInTheDocument();

    // Reset button
    const resetBtn = screen.getByTitle(/Parametrləri sıfırla/i);
    fireEvent.click(resetBtn);
    expect(screen.getByText(/Təkər Toqquşması & Bərpa Simulyasiyası/i)).toBeInTheDocument();
  });

  it('allows selecting vehicle presets and toggles currencies in calculator tab', () => {
    render(<DelineatorSafeModal isOpen={true} onClose={vi.fn()} language="az" />);
    fireEvent.click(screen.getByText(/Nəqliyyat & İXM Cərimələri/i));

    // Select Toyota Land Cruiser preset
    fireEvent.click(screen.getByText(/Toyota Land Cruiser 300 V6 Bi-LED/i));

    // Change currency to USD and EUR
    fireEvent.click(screen.getByText('USD'));
    expect(screen.getAllByText(/\$/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('EUR'));
    expect(screen.getAllByText(/€/).length).toBeGreaterThan(0);
  });

  it('manages 10-point checklist: toggles item and selects all', () => {
    render(<DelineatorSafeModal isOpen={true} onClose={vi.fn()} language="az" />);
    fireEvent.click(screen.getByText(/10-Bənd SCADA Standartı/i));

    // Click on select all button
    const selectAllBtn = screen.getByText(/Hamısını Təsdiqlə/i);
    fireEvent.click(selectAllBtn);

    // Verify all 10 have UYĞUNDUR
    const compliantBadges = screen.getAllByText(/UYĞUNDUR/i);
    expect(compliantBadges.length).toBe(10);
  });

  it('completes theoretical exam and displays evaluation results', () => {
    render(<DelineatorSafeModal isOpen={true} onClose={vi.fn()} language="az" />);
    fireEvent.click(screen.getByText(/Yol Qanunvericiliyi İmtahanı/i));

    // Quick fill exam
    const quickFillBtn = screen.getByText(/100% Avto-Doldur/i);
    fireEvent.click(quickFillBtn);

    // Submit exam
    const submitBtn = screen.getByText(/İmtahanı Tamamla/i);
    fireEvent.click(submitBtn);

    expect(screen.getByText(/İmtahan Nəticəsi: 10 \/ 10 Doğru Cavab/i)).toBeInTheDocument();
  });

  it('generates certificate from simulator and handles copy and print', () => {
    render(<DelineatorSafeModal isOpen={true} onClose={vi.fn()} language="az" />);
    fireEvent.click(screen.getByText(/^Optik Simulyator$/i));

    const certButton = screen.getByText(/DELINEATOR-SAFE Rəsmi Arayış Yarat/i);
    fireEvent.click(certButton);

    expect(screen.getByText(/DELINEATOR-SAFE-AZ-2026 ELEKTRON TƏSDİQNAMƏSİ/i)).toBeInTheDocument();

    const copyBtn = screen.getByText(/Kopyala/i);
    fireEvent.click(copyBtn);
    expect(screen.getByText(/Seriya Kodu Kopyalandı!/i)).toBeInTheDocument();
  });

  it('filters public registry records with search input', () => {
    render(<DelineatorSafeModal isOpen={true} onClose={vi.fn()} language="az" />);
    fireEvent.click(screen.getByText(/Vahid Reyestr/i));

    const searchInput = screen.getByPlaceholderText(/Sertifikat və ya nömrə axtar/i);
    fireEvent.change(searchInput, { target: { value: '88142' } });

    expect(screen.getByText(/DELINEATOR-SAFE-AZ-2026-88142/i)).toBeInTheDocument();
    expect(screen.queryByText(/DELINEATOR-SAFE-AZ-2026-67319/i)).not.toBeInTheDocument();
  });
});
