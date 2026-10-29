import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HemsAviationModal } from '../HemsAviationModal';

describe('HemsAviationModal Component', () => {
  const mockOnClose = vi.fn();

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <HemsAviationModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(<HemsAviationModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/Aviasiya Təcili Tibbi Yardım və Sanitar Aviasiya/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Helikopter Təcili Tibbi Xidmətləri \(HEMS\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Azərbaycan Sanitar Aviasiya və Hospital Heliporları Radarı/i)
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Bakı Yeni Klinika Tibb Mərkəzi Damüstü Heliporu/i).length
    ).toBeGreaterThan(0);
  });

  it('calls onClose when close button is clicked', () => {
    render(<HemsAviationModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getAllByRole('button', { name: /Bağla/i })[0];
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 8 navigation tabs', () => {
    render(<HemsAviationModal isOpen={true} onClose={mockOnClose} />);

    // Tab 2: Calculator
    fireEvent.click(screen.getByText(/Uçuş & Qızıl Saat Kalkulyatoru/i));
    expect(
      screen.getByText(/Uçuş Marşrutu və "Qızıl Saat" \(Golden Hour\) Kalkulyatoru/i)
    ).toBeInTheDocument();

    // Tab 3: Weather
    fireEvent.click(screen.getByText(/VFR \/ NVG Hava Telemetriyası/i));
    expect(
      screen.getByText(/VFR \/ NVG Meteoroloji Standartlar və Dağ Uçuşu Skanı/i)
    ).toBeInTheDocument();

    // Tab 4: Fleet
    fireEvent.click(screen.getByText(/Vertolyot Parkı & Reanimasiya/i));
    expect(
      screen.getByText(/Sanitar Aviasiya Helikopter Parkı və Reanimasiya Modulu/i)
    ).toBeInTheDocument();

    // Tab 5: Checklist
    fireEvent.click(screen.getByText(/Uçuş Təhlükəsizlik Yoxlaması \(10\)/i));
    expect(
      screen.getByText(/10-Point Aeronautical & Clinical Pre-Flight Safety Checklist/i)
    ).toBeInTheDocument();

    // Tab 6: Exam
    fireEvent.click(screen.getByText(/HEMS İmtahan Simulyatoru \(10\)/i));
    expect(
      screen.getByText(/HEMS Sanitar Aviasiya və Təcili Tibbi Uçuş Qaydaları İmtahanı/i)
    ).toBeInTheDocument();

    // Tab 7: Certificate
    fireEvent.click(screen.getByText(/Rəsmi HEMS Sertifikatı/i));
    expect(
      screen.getByText(/Rəsmi HEMS Uçuş Klirensi Sertifikatı/i)
    ).toBeInTheDocument();

    // Tab 8: Registry
    fireEvent.click(screen.getByText(/Milli Reyestr/i));
    expect(
      screen.getByText(/Sanitar Aviasiya Rəsmi Uçuş Klirens Reyestri/i)
    ).toBeInTheDocument();
  });

  it('filters medical helipads by search query in radar tab', () => {
    render(<HemsAviationModal isOpen={true} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText(/Helipor və ya şəhər axtar/i);
    fireEvent.change(searchInput, { target: { value: 'Şuşa' } });

    expect(
      screen.getByText(/Şuşa Şəhər Xəstəxanası Yüksək Dağlıq Heliporu/i)
    ).toBeInTheDocument();
  });

  it('applies quick emergency mission presets in calculator tab', () => {
    render(<HemsAviationModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText(/Uçuş & Qızıl Saat Kalkulyatoru/i));

    const shushaPreset = screen.getByText(/Şuşa Yüksək Dağlıq Politravma Təxliyəsi/i);
    fireEvent.click(shushaPreset);

    expect(screen.getByText(/QIZIL SAAT/i)).toBeInTheDocument();
    expect(screen.getByText(/Rəsmi HEMS Uçuş Klirensini Təsdiqlə və Çıxar/i)).toBeInTheDocument();
  });

  it('interacts with checklist and completes all items', () => {
    render(<HemsAviationModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText(/Uçuş Təhlükəsizlik Yoxlaması \(10\)/i));

    const checkAllBtn = screen.getByRole('button', { name: /Bütün Bəndləri Təsdiqlə/i });
    fireEvent.click(checkAllBtn);

    expect(screen.getByText(/Tamamlanma: 10 \/ 10 \(100%\)/i)).toBeInTheDocument();
    expect(screen.getByText(/UÇUŞA KLİRENS VERİLDİ/i)).toBeInTheDocument();
  });

  it('submits examination answers and displays regulatory explanations', () => {
    render(<HemsAviationModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText(/HEMS İmtahan Simulyatoru \(10\)/i));

    // Submit answers
    const submitBtn = screen.getByRole('button', { name: /Cavabları Yoxla və Nəticəni Gör/i });
    fireEvent.click(submitBtn);

    expect(screen.getAllByText(/Qanunvericilik İzahı/i).length).toBeGreaterThan(0);
  });

  it('renders certificate sheet and handles copy', () => {
    // mock clipboard
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<HemsAviationModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText(/Rəsmi HEMS Sertifikatı/i));

    expect(screen.getByText(/DÖVLƏT MÜLKİ AVİASİYA AGENTLİYİ & TƏBİB/i)).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', { name: /Kopyala/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalled();
  });

  it('filters records in public registry tab', () => {
    render(<HemsAviationModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText(/Milli Reyestr/i));

    const regInput = screen.getByPlaceholderText(/Reyestrdə axtar/i);
    fireEvent.change(regInput, { target: { value: '88102' } });

    expect(screen.getByText(/HEMS-AZ-2026-88102/i)).toBeInTheDocument();
  });
});
