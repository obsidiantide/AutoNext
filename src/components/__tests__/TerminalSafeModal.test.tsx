import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TerminalSafeModal } from '../TerminalSafeModal';

describe('TerminalSafeModal Component', () => {
  it('renders modal header, title, and default corridors tab when open', () => {
    render(<TerminalSafeModal isOpen={true} onClose={vi.fn()} language="az" />);

    expect(screen.getByText(/TERMINAL-SAFE-AZ-2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Respublika Magistral Yollarında Enerjiuducu Terminal Stansiyaları/i)).toBeInTheDocument();
    expect(screen.getAllByText(/AAYDA • AYNA • BDYP/i).length).toBeGreaterThan(0);
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<TerminalSafeModal isOpen={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<TerminalSafeModal isOpen={true} onClose={handleClose} language="az" />);

    const closeBtn = screen.getByLabelText(/close modal/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<TerminalSafeModal isOpen={true} onClose={vi.fn()} language="az" />);

    // Simulator Tab
    fireEvent.click(screen.getByText(/^Toqquşma Simulyatoru$/i));
    expect(screen.getByText(/EN 1317-4 Deformasiya və Rels Ekstruziyası Telemetriyası/i)).toBeInTheDocument();

    // Calculator Tab
    fireEvent.click(screen.getByText(/^Nəqliyyat & İXM Cərimələri$/i));
    expect(screen.getByText(/Azərbaycan Qeydiyyatlı Nəqliyyat Vasitələri Preseti & Zərbə Parametrləri/i)).toBeInTheDocument();

    // Checklist Tab
    fireEvent.click(screen.getByText(/^10-Bənd SCADA Standartı$/i));
    expect(screen.getByText(/10-Bəndlik Yol Çəpəri Terminal SCADA & Texniki Standartı/i)).toBeInTheDocument();

    // Exam Tab
    fireEvent.click(screen.getByText(/^Yol Qanunvericiliyi İmtahanı$/i));
    expect(screen.getByText(/Çəpər Ucluqları və Yol Təhlükəsizliyi Qanunvericiliyi İmtahanı/i)).toBeInTheDocument();

    // Certificate Tab
    fireEvent.click(screen.getByText(/^Rəsmi Arayış$/i));
    expect(screen.getByText(/TERMINAL-SAFE-AZ-2026 ELEKTRON TƏSDİQNAMƏSİ/i)).toBeInTheDocument();

    // Registry Tab
    fireEvent.click(screen.getByText(/^Vahid Reyestr$/i));
    expect(screen.getByText(/Vahid İctimai Çəpər Terminal Reyestri/i)).toBeInTheDocument();
  });

  it('allows selecting a station card from corridors radar and opens simulator', () => {
    render(<TerminalSafeModal isOpen={true} onClose={vi.fn()} language="az" />);

    const openSimButtons = screen.getAllByText(/Simulyatorda Aç/i);
    fireEvent.click(openSimButtons[1]); // Select second station (Baku Ring Road-1)

    expect(screen.getByText(/EN 1317-4 Deformasiya və Rels Ekstruziyası Telemetriyası/i)).toBeInTheDocument();
  });

  it('interacts with simulator sliders, terminal types, and audio button', () => {
    render(<TerminalSafeModal isOpen={true} onClose={vi.fn()} language="az" />);
    fireEvent.click(screen.getByText(/^Toqquşma Simulyatoru$/i));

    // Audio button
    const audioBtn = screen.getByText(/Akustik Zərbə Səsi/i);
    fireEvent.click(audioBtn);

    // Terminal type button
    fireEvent.click(screen.getByText(/Bükülmüş Yönləndirici/i));

    // Performance class button
    fireEvent.click(screen.getByText('P3'));

    // Post condition button
    fireEvent.click(screen.getByText('Korroziyalı'));

    expect(screen.getByText(/ASI İndeksi:/i)).toBeInTheDocument();
  });

  it('allows selecting vehicle presets and toggles currencies in calculator tab', () => {
    render(<TerminalSafeModal isOpen={true} onClose={vi.fn()} language="az" />);
    fireEvent.click(screen.getByText(/^Nəqliyyat & İXM Cərimələri$/i));

    // Select Toyota Land Cruiser preset
    fireEvent.click(screen.getByText(/Toyota Land Cruiser 300 V6/i));

    // Change currency to USD and EUR
    fireEvent.click(screen.getByText('USD'));
    expect(screen.getAllByText(/\$/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText('EUR'));
    expect(screen.getAllByText(/€/).length).toBeGreaterThan(0);
  });

  it('manages 10-point checklist: toggles items, selects all, and resets', () => {
    render(<TerminalSafeModal isOpen={true} onClose={vi.fn()} language="az" />);
    fireEvent.click(screen.getByText(/^10-Bənd SCADA Standartı$/i));

    // Reset button
    const resetBtn = screen.getByText(/Sıfırla/i);
    fireEvent.click(resetBtn);
    expect(screen.getAllByText(/UYĞUN DEYİL/i).length).toBe(10);

    // Select all button
    const selectAllBtn = screen.getByText(/Hamısını Təsdiqlə/i);
    fireEvent.click(selectAllBtn);
    expect(screen.getAllByText(/UYĞUNDUR/i).length).toBe(10);
  });

  it('completes theoretical exam and displays evaluation results', () => {
    render(<TerminalSafeModal isOpen={true} onClose={vi.fn()} language="az" />);
    fireEvent.click(screen.getByText(/^Yol Qanunvericiliyi İmtahanı$/i));

    // Quick fill exam
    const quickFillBtn = screen.getByText(/100% Avto-Doldur/i);
    fireEvent.click(quickFillBtn);

    // Submit exam
    const submitBtn = screen.getByText(/İmtahanı Tamamla/i);
    fireEvent.click(submitBtn);

    expect(screen.getByText(/İmtahan Nəticəsi: 10 \/ 10 Doğru Cavab/i)).toBeInTheDocument();
  });

  it('generates certificate from simulator and handles copy and print', () => {
    render(<TerminalSafeModal isOpen={true} onClose={vi.fn()} language="az" />);
    fireEvent.click(screen.getByText(/^Toqquşma Simulyatoru$/i));

    const certButton = screen.getByText(/TERMINAL-SAFE Rəsmi Arayış Yarat/i);
    fireEvent.click(certButton);

    expect(screen.getByText(/TERMINAL-SAFE-AZ-2026 ELEKTRON TƏSDİQNAMƏSİ/i)).toBeInTheDocument();

    const copyBtn = screen.getByText(/Kopyala/i);
    fireEvent.click(copyBtn);
    expect(screen.getByText(/Seriya Kodu Kopyalandı!/i)).toBeInTheDocument();
  });

  it('filters public registry records with search input', () => {
    render(<TerminalSafeModal isOpen={true} onClose={vi.fn()} language="az" />);
    fireEvent.click(screen.getByText(/^Vahid Reyestr$/i));

    const searchInput = screen.getByPlaceholderText(/Sertifikat və ya nömrə axtar/i);
    fireEvent.change(searchInput, { target: { value: '92144' } });

    expect(screen.getByText(/TERMINAL-SAFE-AZ-2026-92144/i)).toBeInTheDocument();
    expect(screen.queryByText(/TERMINAL-SAFE-AZ-2026-64120/i)).not.toBeInTheDocument();
  });
});
