import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { V2gSmartGridModal } from '../V2gSmartGridModal';

describe('V2gSmartGridModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default tab when open', () => {
    render(<V2gSmartGridModal {...defaultProps} />);

    expect(
      screen.getByText(/Azərişıq & Energetika Nazirliyi • Ağıllı Şəbəkə V2G Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Rəsmi V2G-AZ-2026/i)).toBeInTheDocument();
    expect(screen.getByText(/İnverter & Rejim Parametrləri/i)).toBeInTheDocument();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<V2gSmartGridModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when close button or bottom button is clicked', () => {
    const onClose = vi.fn();
    render(<V2gSmartGridModal {...defaultProps} onClose={onClose} />);

    const closeBtn = screen.getByLabelText('Bağla');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    const bottomCloseBtns = screen.getAllByRole('button', { name: /^Bağla$/i });
    if (bottomCloseBtns.length > 0) {
      fireEvent.click(bottomCloseBtns[0]);
      expect(onClose).toHaveBeenCalledTimes(2);
    }
  });

  it('switches between all navigation tabs cleanly', () => {
    render(<V2gSmartGridModal {...defaultProps} />);

    // Substations
    fireEvent.click(screen.getByRole('button', { name: /Azərişıq Yarımstansiyalar/i }));
    expect(
      screen.getByText(/Azərişıq Ağıllı Rəqəmsal Yarımstansiyalar Radarı/i)
    ).toBeInTheDocument();

    // Checklist
    fireEvent.click(screen.getByRole('button', { name: /10-Nöqtəli Təhlükəsizlik/i }));
    expect(
      screen.getByText(/Azərişıq & Energetika Nazirliyi 10-Nöqtəli Təhlükəsizlik Auditi/i)
    ).toBeInTheDocument();

    // Exam
    fireEvent.click(screen.getByRole('button', { name: /Rəsmi V2G İmtahanı/i }));
    expect(
      screen.getByText(/Aktiv İstehlakçı & V2G Təhlükəsizlik İmtahanı/i)
    ).toBeInTheDocument();

    // Certificate
    fireEvent.click(screen.getByRole('button', { name: /Şəhadətnamə & Reyestr/i }));
    expect(
      screen.getByText(/RƏSMİ V2G ENERJİ İXRAC ŞƏHADƏTNAMƏSİ/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Azərişıq Aktiv V2G Şəhadətnamələr Reyestri/i)
    ).toBeInTheDocument();
  });

  it('applies vehicle presets and updates calculation parameters in inverter tab', () => {
    render(<V2gSmartGridModal {...defaultProps} />);

    const presetBtn = screen.getByText(/BYD Seal Excellence/i);
    fireEvent.click(presetBtn);

    expect(screen.getAllByText(/82.5 kVt·st/i).length).toBeGreaterThan(0);
  });

  it('switches V2X modes and inverter ratings', () => {
    render(<V2gSmartGridModal {...defaultProps} />);

    // Switch to V2H
    const v2hBtn = screen.getByRole('button', { name: /^V2H$/i });
    fireEvent.click(v2hBtn);
    expect(
      screen.getByText(/Ev Təsərrüfatı Ehtiyat Qidası/i)
    ).toBeInTheDocument();

    // Switch to 22 kW inverter
    const kw22Btn = screen.getByRole('button', { name: /22 kW/i });
    fireEvent.click(kw22Btn);
    expect(screen.getByText(/22 kVt Yüksək Güclü/i)).toBeInTheDocument();
  });

  it('filters substations by search query and selects a substation', () => {
    render(<V2gSmartGridModal {...defaultProps} />);

    // Switch to substations tab
    fireEvent.click(screen.getByRole('button', { name: /Azərişıq Yarımstansiyalar/i }));

    const searchInput = screen.getByPlaceholderText(/Yarımstansiya və ya rayon axtar/i);
    fireEvent.change(searchInput, { target: { value: 'Sumqayıt' } });

    expect(screen.getByText(/Sumqayıt Kimya Sənaye Parkı/i)).toBeInTheDocument();
    expect(screen.queryByText(/Ağ Şəhər-1/i)).not.toBeInTheDocument();

    // Select Sumqayıt substation
    const selectBtn = screen.getByRole('button', { name: /Seç & Qoşul/i });
    fireEvent.click(selectBtn);
    expect(screen.getByRole('button', { name: /Seçildi/i })).toBeInTheDocument();
  });

  it('interacts with 10-point checklist toggles and select all buttons', () => {
    render(<V2gSmartGridModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /10-Nöqtəli Təhlükəsizlik/i }));

    // Reset all
    fireEvent.click(screen.getByRole('button', { name: /Sıfırla/i }));
    expect(screen.getByText(/0% \(0\/10\)/i)).toBeInTheDocument();

    // Select all
    fireEvent.click(screen.getByRole('button', { name: /Hamısını Təsdiqlə/i }));
    expect(screen.getByText(/100% \(10\/10\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Təsdiqləndi/i)).toBeInTheDocument();
  });

  it('answers theoretical exam and submits results', () => {
    render(<V2gSmartGridModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Rəsmi V2G İmtahanı/i }));

    // Click first option of each question
    const optionButtons = screen.getAllByRole('button');
    const questionChoices = optionButtons.filter((b) =>
      b.textContent?.includes('Aktiv İstehlakçı') ||
      b.textContent?.includes('Anti-Islanding') ||
      b.textContent?.includes('şəbəkəyə ixrac')
    );
    if (questionChoices.length > 0) {
      fireEvent.click(questionChoices[0]);
    }

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Nəticəni Yoxla və Təsdiqlə/i });
    fireEvent.click(submitBtn);

    expect(screen.getAllByText(/İzah:/i).length).toBeGreaterThan(0);
  });

  it('generates a new certificate, handles print, and filters public registry', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<V2gSmartGridModal {...defaultProps} />);

    // Generate certificate button from inverter tab
    const generateBtn = screen.getByRole('button', { name: /Şəhadətnamə Al/i });
    fireEvent.click(generateBtn);

    // Verify it transitioned to certificate tab
    expect(screen.getByText(/RƏSMİ V2G ENERJİ İXRAC ŞƏHADƏTNAMƏSİ/i)).toBeInTheDocument();

    // Print
    const printBtn = screen.getByRole('button', { name: /Çap Et/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    // Copy code
    const copyBtn = screen.getByRole('button', { name: /Kodu Kopyala/i });
    fireEvent.click(copyBtn);

    // Filter registry
    const registryInput = screen.getByPlaceholderText(/Nömrə, FİN və ya sayğac axtar/i);
    fireEvent.change(registryInput, { target: { value: '99-EL-101' } });
    expect(screen.getByText(/Tural Məmmədov/i)).toBeInTheDocument();

    printSpy.mockRestore();
  });
});
