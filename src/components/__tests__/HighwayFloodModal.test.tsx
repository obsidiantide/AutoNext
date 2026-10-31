import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HighwayFloodModal } from '../HighwayFloodModal';

describe('HighwayFloodModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders modal header, title, and default tab (radar) when open', () => {
    render(<HighwayFloodModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('FLOOD-GUARD-AZ-2026')).toBeInTheDocument();
    expect(screen.getByText(/AAYDA • FHN • ADSEA • BDYP/i)).toBeInTheDocument();
    expect(screen.getByText('Keçidlər Radarı')).toBeInTheDocument();
    expect(screen.getAllByText('Sabunçu Yolötürücü Keçidi və Tuneli').length).toBeGreaterThan(0);
  });

  it('calls onClose when close button is clicked', () => {
    render(<HighwayFloodModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByRole('button', { name: /Bağla/i });
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<HighwayFloodModal isOpen={true} onClose={mockOnClose} />);

    // SCADA Stand
    fireEvent.click(screen.getByRole('button', { name: /Drenaj SCADA Standı/i }));
    expect(screen.getByText(/SCADA Drenaj Nasosları və Hidrostatik Su Səviyyəsi Standı/i)).toBeInTheDocument();

    // Hydro-lock
    fireEvent.click(screen.getByRole('button', { name: /Hidrozərbə Riski/i }));
    expect(screen.getByText(/Mühərrikin Hidrozərbə \(Hydro-Lock\) və EV Batareya İzolasiyası Riski/i)).toBeInTheDocument();

    // Checklist
    fireEvent.click(screen.getByRole('button', { name: /Təhlükəsizlik Siyahısı/i }));
    expect(screen.getByText(/10 Bəndlik Drenaj və Yol Subasma Təhlükəsizlik Reqlamenti/i)).toBeInTheDocument();

    // Exam
    fireEvent.click(screen.getByRole('button', { name: /Nəzəri İmtahan/i }));
    expect(screen.getByText(/Subasma Təhlükəsizliyi və Qəza Davranışı Nəzəri İmtahanı/i)).toBeInTheDocument();

    // Certificate
    fireEvent.click(screen.getByRole('button', { name: /E-Buraxılış Vərəqəsi/i }));
    expect(screen.getByText(/FLOOD-GUARD-AZ-2026 Rəsmi Elektron Buraxılış Vərəqəsi/i)).toBeInTheDocument();

    // Registry
    fireEvent.click(screen.getByRole('button', { name: /Vahid Reyestr/i }));
    expect(screen.getByText(/Vahid AAYDA & FHN Subasma Buraxılış Reyestri/i)).toBeInTheDocument();

    // Back to Radar
    fireEvent.click(screen.getByRole('button', { name: /Keçidlər Radarı/i }));
    expect(screen.getByText(/Bakı və Abşeron Subasma Təhlükəli Yolötürücü Keçidləri/i)).toBeInTheDocument();
  });

  it('filters underpasses in the radar tab', () => {
    render(<HighwayFloodModal isOpen={true} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText(/Keçid və ya küçə axtar.../i);
    fireEvent.change(searchInput, { target: { value: 'Bağırov' } });

    expect(screen.getAllByText(/Bağırov Körpüsü Altı Yol Keçidi/i).length).toBeGreaterThan(0);
  });

  it('interacts with sliders in SCADA tab', () => {
    render(<HighwayFloodModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /Drenaj SCADA Standı/i }));

    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBeGreaterThanOrEqual(3);

    // Change water depth slider
    fireEvent.change(sliders[0], { target: { value: '420' } });
    expect(screen.getByText('420 mm')).toBeInTheDocument();

    // Change active pumps slider
    fireEvent.change(sliders[1], { target: { value: '6' } });
    expect(screen.getByText('6 ədəd')).toBeInTheDocument();
  });

  it('selects vehicle presets in hydrolock tab', () => {
    render(<HighwayFloodModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /Hidrozərbə Riski/i }));

    const presetBtn = screen.getByText('77-TR-700');
    fireEvent.click(presetBtn);

    expect(screen.getByText(/Ağır Yolsuzluq 4x4/i)).toBeInTheDocument();
  });

  it('toggles checklist items and uses verify-all button', () => {
    render(<HighwayFloodModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /Təhlükəsizlik Siyahısı/i }));

    const verifyAllBtn = screen.getByRole('button', { name: /Bütün Bəndləri Təsdiqlə/i });
    fireEvent.click(verifyAllBtn);

    const firstItem = screen.getByText(/Drenaj quyusu avtomatik hidrostatik float-sviç/i);
    fireEvent.click(firstItem);
    expect(firstItem).toBeInTheDocument();
  });

  it('answers exam questions, submits exam, and resets', () => {
    render(<HighwayFloodModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /Nəzəri İmtahan/i }));

    // Answer questions
    const optionButtons = screen.getAllByRole('button', { name: /A\)/i });
    optionButtons.forEach((btn) => fireEvent.click(btn));

    const submitBtn = screen.getByRole('button', { name: /İmtahanı Tamamla/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/İmtahan Nəticəsi/i)).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Yenidən Başla/i });
    fireEvent.click(resetBtn);
    expect(screen.queryByText(/İmtahan Nəticəsi/i)).not.toBeInTheDocument();
  });

  it('generates a certificate, handles copy, and verifies in registry', () => {
    render(<HighwayFloodModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /E-Buraxılış Vərəqəsi/i }));

    const genBtn = screen.getByRole('button', { name: /İndi Generasiya Et/i });
    fireEvent.click(genBtn);

    expect(screen.getByText(/AZƏRBAYCAN RESPUBLİKASI RƏSMİ ELEKTRON DRENAJ SERTİFİKATI/i)).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', { name: /Kodu Kopyala/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    // Check registry tab
    fireEvent.click(screen.getByRole('button', { name: /Vahid Reyestr/i }));
    expect(screen.getByPlaceholderText(/Sertifikat ID və ya Nömrə axtar.../i)).toBeInTheDocument();
  });
});
