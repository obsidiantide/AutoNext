import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RumbleSafeModal } from '../RumbleSafeModal';

describe('RumbleSafeModal Component Suite', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<RumbleSafeModal isOpen={false} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, branding, and default radar tab when open', () => {
    render(<RumbleSafeModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/Magistral Səs-Küy və Titrəyiş Zolaqları Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByText('RUMBLE-SAFE-AZ-2026')).toBeInTheDocument();
    expect(screen.getByText('Strateji Zolaqlar Radarı')).toBeInTheDocument();
    expect(screen.getByText(/M-1 Bakı – Quba – Rusiya/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<RumbleSafeModal isOpen={true} onClose={mockOnClose} />);

    const closeBtns = screen.getAllByRole('button', { name: /bağla/i });
    fireEvent.click(closeBtns[0]);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<RumbleSafeModal isOpen={true} onClose={mockOnClose} />);

    const tabs = [
      { name: /Akustik & Taktil Simulyator/i, textCheck: /Həyəcanlama Tezliyi/i },
      { name: /Nəqliyyat & Cərimələr/i, textCheck: /Nəqliyyat Presetləri və İnzibati Xətalar Məcəlləsi/i },
      { name: /10 Maddəlik Standart/i, textCheck: /AAYDA & FHWA 10 Maddəlik Standart Yoxlanışı/i },
      { name: /İmtahan Simulyatoru/i, textCheck: /Magistral Səs-Küy Zolaqları üzrə Rəsmi Nəzəri İmtahan/i },
      { name: /Elektron AAYDA Sertifikatı/i, textCheck: /Rəsmi Elektron RUMBLE-SAFE-AZ-2026 Sertifikatı/i },
      { name: /İctimai Reyestr/i, textCheck: /AAYDA Vahid İctimai Axtarış Reyestri/i },
      { name: /Strateji Zolaqlar Radarı/i, textCheck: /Azərbaycan Magistral Şəbəkəsində Frezlənmiş Səs-Küy Zolaqları/i },
    ];

    tabs.forEach(({ name, textCheck }) => {
      const tabBtn = screen.getByRole('button', { name });
      fireEvent.click(tabBtn);
      expect(screen.getByText(textCheck)).toBeInTheDocument();
    });
  });

  it('selects a corridor from radar grid and switches to simulator', () => {
    render(<RumbleSafeModal isOpen={true} onClose={mockOnClose} />);

    // Click on Baku Ring Road-1 station
    const ringRoadStation = screen.getByText(/Bakı Dairəvi-1 Avtomobil Yolu/i);
    fireEvent.click(ringRoadStation);

    // Verify it switched to simulator and shows station code
    expect(screen.getByText(/BRR1-KM08/i)).toBeInTheDocument();
  });

  it('interacts with sliders, selectors, and audio button in simulator tab', () => {
    render(<RumbleSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /Akustik & Taktil Simulyator/i }));

    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBeGreaterThanOrEqual(4);

    // Adjust speed slider
    fireEvent.change(sliders[0], { target: { value: '110' } });
    expect(screen.getByText('110 km/saat')).toBeInTheDocument();

    // Adjust milling depth slider
    fireEvent.change(sliders[1], { target: { value: '14' } });
    expect(screen.getByText('14 mm')).toBeInTheDocument();

    // Test audio chime button
    const audioBtn = screen.getByRole('button', { name: /akustik səsi sına/i });
    fireEvent.click(audioBtn);
  });

  it('selects vehicle presets and switches currency in presets tab', () => {
    render(<RumbleSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /Nəqliyyat & Cərimələr/i }));

    // Select KamAZ 5490 Neo preset
    const kamazPreset = screen.getByText(/KamAZ 5490 Neo TIR/i);
    fireEvent.click(kamazPreset);

    expect(screen.getByText(/10-RS-202/i)).toBeInTheDocument();

    // Switch currency to USD
    const usdBtn = screen.getByRole('button', { name: 'USD' });
    fireEvent.click(usdBtn);

    expect(screen.getAllByText(/\$/i).length).toBeGreaterThanOrEqual(1);
  });

  it('toggles checklist items, checks all, and resets', () => {
    render(<RumbleSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /10 Maddəlik Standart/i }));

    const checkAllBtn = screen.getByRole('button', { name: /hamısını təsdiqlə/i });
    fireEvent.click(checkAllBtn);

    expect(screen.getByText(/10 \/ 10 \(100%\)/i)).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /sıfırla/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText(/0 \/ 10 \(0%\)/i)).toBeInTheDocument();
  });

  it('completes exam with auto-fill, submits, and displays scoring', () => {
    render(<RumbleSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /İmtahan Simulyatoru/i }));

    const autoFillBtn = screen.getByRole('button', { name: /avto-doldur/i });
    fireEvent.click(autoFillBtn);

    const submitBtn = screen.getByRole('button', { name: /cavabları təsdiqlə/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Təbriklər! İmtahandan Müvəffəqiyyətlə Keçdiniz/i)).toBeInTheDocument();
    expect(screen.getByText(/10 \/ 10 \(100%\)/i)).toBeInTheDocument();
  });

  it('generates a certificate, copies ID, and triggers print', () => {
    render(<RumbleSafeModal isOpen={true} onClose={mockOnClose} />);

    // Go to simulator tab and click generate certificate
    fireEvent.click(screen.getByRole('button', { name: /Akustik & Taktil Simulyator/i }));
    const certBtn = screen.getByRole('button', { name: /AAYDA Sertifikatı Tərtib Et/i });
    fireEvent.click(certBtn);

    expect(screen.getByText(/Rəsmi Elektron RUMBLE-SAFE-AZ-2026 Sertifikatı/i)).toBeInTheDocument();

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });

    const copyBtn = screen.getByRole('button', { name: /id kopyala/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    // Mock window.print
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const printBtn = screen.getByRole('button', { name: /çap et/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('searches and filters records in public registry tab', () => {
    render(<RumbleSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /İctimai Reyestr/i }));

    const searchInput = screen.getByPlaceholderText(/Sertifikat ID və ya Nömrə ilə axtar/i);
    fireEvent.change(searchInput, { target: { value: '99-RS-101' } });

    expect(screen.getByText('99-RS-101')).toBeInTheDocument();
  });
});
