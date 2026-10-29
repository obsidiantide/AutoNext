import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AirCargoModal } from '../AirCargoModal';

describe('AirCargoModal Component', () => {
  const mockOnClose = vi.fn();

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <AirCargoModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(<AirCargoModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/Dövlət Mülki Aviasiya Agentliyi \(DDAA\) & Silk Way West Hava-Yol Karqo Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Hava Limanı Karqo Radarı/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Bakı Heydər Əliyev Beynəlxalq Aeroportu Karqo Terminalı/i).length).toBeGreaterThan(0);
  });

  it('calls onClose when close button is clicked', () => {
    render(<AirCargoModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByRole('button', { name: /Bağla/i });
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 8 navigation tabs', () => {
    render(<AirCargoModal isOpen={true} onClose={mockOnClose} />);

    // Tab 2: Calculator
    fireEvent.click(screen.getByText(/Avia-Tarif & Həcm Kalkulyatoru/i));
    expect(screen.getByText(/Uçuş & Təyinat Parametrləri/i)).toBeInTheDocument();

    // Tab 3: Screening
    fireEvent.click(screen.getByText(/ICAO Annex 17 & DGR Standı/i));
    expect(screen.getByText(/ICAO Annex 17 & IATA DGR Təhlükəsizlik və Rentgen Skaneri Standı/i)).toBeInTheDocument();

    // Tab 4: Telemetry
    fireEvent.click(screen.getByText(/Apron & Soyuq Zəncir/i));
    expect(screen.getByText(/Apron Rampası & Envirotainer Aktiv Termo-Zəncir Telemetriyası/i)).toBeInTheDocument();

    // Tab 5: Checklist
    fireEvent.click(screen.getByText(/10-Bəndlik Təhlükəsizlik/i));
    expect(screen.getByText(/10-Bəndlik Məcburi Aviasiya Karqo Təhlükəsizlik və RFS Yoxlama Vərəqəsi/i)).toBeInTheDocument();

    // Tab 6: Exam
    fireEvent.click(screen.getByText(/Aviasiya Qanunvericilik İmtahanı/i));
    expect(screen.getByText(/DDAA & ICAO Aviasiya Yük Daşımaları Qanunvericilik İmtahanı/i)).toBeInTheDocument();

    // Tab 7: Voucher
    fireEvent.click(screen.getByText(/Elektron Uçuş Buraxılış Vərəqəsi/i));
    expect(screen.getByText(/Aktiv Buraxılış Vərəqəsi Tapılmadı/i)).toBeInTheDocument();

    // Tab 8: Registry
    fireEvent.click(screen.getByText(/Dövlət Karqo Reyestri/i));
    expect(screen.getByText(/DDAA & Silk Way Vahid İctimai Karqo və Buraxılış Reyestri/i)).toBeInTheDocument();
  });

  it('filters cargo hubs by search query in radar tab', () => {
    render(<AirCargoModal isOpen={true} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText(/Aeroport adı və ya IATA kodu/i);
    fireEvent.change(searchInput, { target: { value: 'FZL' } });

    expect(screen.getByText(/Füzuli Beynəlxalq Hava Limanı Qarabağ Karqo Qapısı/i)).toBeInTheDocument();
    expect(screen.queryByText(/Gəncə Beynəlxalq Hava Limanı/i)).not.toBeInTheDocument();
  });

  it('applies quick cargo presets in calculator tab', () => {
    render(<AirCargoModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText(/Avia-Tarif & Həcm Kalkulyatoru/i));

    const oilfieldPreset = screen.getByText(/Neft-Qaz Qazma Avadanlığı/i);
    fireEvent.click(oilfieldPreset);

    // Should update values
    expect(screen.getByDisplayValue('9500')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10-SW-404')).toBeInTheDocument();
  });

  it('interacts with security screening diagnostics and updates status', () => {
    render(<AirCargoModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText(/ICAO Annex 17 & DGR Standı/i));

    // Initially cleared
    expect(screen.getByText(/UÇUŞA TAM BURAXILDI \(CLEARED\)/i)).toBeInTheDocument();

    // Click ETD Trace button to simulate danger
    const etdBtn = screen.getByRole('button', { name: /TƏMİZ/i });
    fireEvent.click(etdBtn);

    // Status should update to REJECTED
    expect(screen.getByText(/QƏTİ QADAĞAN EDİLDİ \(REJECTED\)/i)).toBeInTheDocument();
  });

  it('toggles checklist items and confirms all', () => {
    render(<AirCargoModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText(/10-Bəndlik Təhlükəsizlik/i));

    const confirmAllBtn = screen.getByRole('button', { name: /Hamısını Təsdiqlə/i });
    fireEvent.click(confirmAllBtn);

    expect(screen.getByText(/100 \/ 100 Bal/i)).toBeInTheDocument();
  });

  it('answers exam questions and evaluates results', () => {
    render(<AirCargoModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText(/Aviasiya Qanunvericilik İmtahanı/i));

    // Select option A for question 1
    const optionA = screen.getByText(/\(Uzunluq × En × Hündürlük sm\) \/ 6000 və ya 1 m³ = 167 kq/i);
    fireEvent.click(optionA);

    const checkBtn = screen.getByRole('button', { name: /Nəticələri Yoxla/i });
    fireEvent.click(checkBtn);

    expect(screen.getByText(/Nəticəniz:/i)).toBeInTheDocument();
  });

  it('generates a new voucher, copies code, and filters registry', () => {
    render(<AirCargoModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText(/Avia-Tarif & Həcm Kalkulyatoru/i));

    const generateBtn = screen.getByRole('button', { name: /Uçuş Buraxılış Vərəqəsi Yarat/i });
    fireEvent.click(generateBtn);

    // Should switch to voucher view
    expect(screen.getByText(/Elektron Uçuş Tranzit və Apron Buraxılış Vərəqəsi/i)).toBeInTheDocument();
    expect(screen.getByText(/Kodu Kopyala/i)).toBeInTheDocument();
    expect(screen.getByText(/Çap Et/i)).toBeInTheDocument();

    // Switch to registry tab and search
    fireEvent.click(screen.getByText(/Dövlət Karqo Reyestri/i));
    const searchInput = screen.getByPlaceholderText(/AWB, Vauçer, Reys və ya Nömrə/i);
    fireEvent.change(searchInput, { target: { value: '99-AC-101' } });

    expect(screen.getAllByText(/99-AC-101/i).length).toBeGreaterThan(0);
  });
});
