import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GlareSafeModal } from '../GlareSafeModal';

describe('GlareSafeModal Component Suite', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<GlareSafeModal isOpen={false} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, branding, and default radar tab when open', () => {
    render(<GlareSafeModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/AAYDA & BDYP Magistral Anti-Glare Çəpər və Optik Gözqamaşdırma Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByText('GLARE-SAFE-AZ-2026')).toBeInTheDocument();
    expect(screen.getByText('Stansiyalar Radarı')).toBeInTheDocument();
    expect(screen.getByText(/M-1 Bakı – Quba – Rusiya/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<GlareSafeModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<GlareSafeModal isOpen={true} onClose={mockOnClose} />);

    const tabs = [
      { name: /SCADA Simulyator/i, textCheck: /Optik Daldalanma Dərəcəsi/i },
      { name: /Nəqliyyat & İXM/i, textCheck: /Azərbaycan Dövlət Qeydiyyat Nişanlı Nəqliyyat Presetləri/i },
      { name: /10-Bəndlik Standart/i, textCheck: /10-Bəndlik Anti-Glare Çəpər SCADA/i },
      { name: /İmtahan Testi/i, textCheck: /10-Suallıq Magistral Anti-Glare/i },
      { name: /Elektron Sertifikat/i, textCheck: /Rəsmi Dövlət Anti-Glare Optik Təhlükəsizlik Sertifikatı/i },
      { name: /Vahid Reyestr/i, textCheck: /Vahid AAYDA & BDYP Anti-Glare Təhlükəsizlik Sertifikatları/i },
      { name: /Stansiyalar Radarı/i, textCheck: /AAYDA Magistral Ayrıcı Zolaq Anti-Glare Çəpər/i },
    ];

    tabs.forEach(({ name, textCheck }) => {
      const tabBtn = screen.getByRole('button', { name });
      fireEvent.click(tabBtn);
      expect(screen.getByText(textCheck)).toBeInTheDocument();
    });
  });

  it('selects a corridor from radar grid and switches to simulator', () => {
    render(<GlareSafeModal isOpen={true} onClose={mockOnClose} />);

    // Click on Yasamal Valley station
    const yasamalStation = screen.getByText(/Bakı Dairəvi-1 Avtomobil Yolu/i);
    fireEvent.click(yasamalStation);

    // Switch to simulator tab
    const simTabBtn = screen.getByRole('button', { name: /SCADA Simulyator/i });
    fireEvent.click(simTabBtn);

    expect(screen.getByText(/GLARE-BDR1-KM05/i)).toBeInTheDocument();
  });

  it('interacts with sliders and inputs in simulator tab', () => {
    render(<GlareSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /SCADA Simulyator/i }));

    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBeGreaterThanOrEqual(5);

    // Adjust speed slider
    fireEvent.change(sliders[0], { target: { value: '130' } });
    expect(screen.getByText('130 km/saat')).toBeInTheDocument();
  });

  it('switches vehicle presets in presets tab', () => {
    render(<GlareSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /Nəqliyyat & İXM/i }));

    const priusPreset = screen.getByText(/77-GL-303/i);
    fireEvent.click(priusPreset);

    expect(screen.getByText(/İXM Maddə 342.1/i)).toBeInTheDocument();
  });

  it('toggles checklist items and handles check all / reset', () => {
    render(<GlareSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /10-Bəndlik Standart/i }));

    const checkAllBtn = screen.getByRole('button', { name: /Hamısını Təsdiqlə/i });
    fireEvent.click(checkAllBtn);

    expect(screen.getByText(/10 \/ 10 \(100%\)/i)).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Sıfırla/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText(/0 \/ 10 \(0%\)/i)).toBeInTheDocument();
  });

  it('completes exam with auto fill and submits result', () => {
    render(<GlareSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /İmtahan Testi/i }));

    const autoFillBtn = screen.getByRole('button', { name: /Avtomatik Doldur/i });
    fireEvent.click(autoFillBtn);

    expect(
      screen.getByText(/İmtahandan Müvəffəqiyyətlə Keçdiniz!/i)
    ).toBeInTheDocument();
  });

  it('generates a new certificate from simulator status banner', () => {
    render(<GlareSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /SCADA Simulyator/i }));

    const genCertBtn = screen.getByRole('button', { name: /Elektron Sertifikat Tərtib Et/i });
    fireEvent.click(genCertBtn);

    expect(
      screen.getByText(/Rəsmi Dövlət Anti-Glare Optik Təhlükəsizlik Sertifikatı/i)
    ).toBeInTheDocument();
  });

  it('handles copy and print in certificate tab', () => {
    const originalClipboard = navigator.clipboard;
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });
    const printMock = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<GlareSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /Elektron Sertifikat/i }));

    const copyBtn = screen.getByRole('button', { name: /Kodu Kopyala/i });
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalled();

    const printBtn = screen.getByRole('button', { name: /Çap Et/i });
    fireEvent.click(printBtn);
    expect(printMock).toHaveBeenCalled();

    Object.assign(navigator, { clipboard: originalClipboard });
  });

  it('filters certificates in registry tab', () => {
    render(<GlareSafeModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole('button', { name: /Vahid Reyestr/i }));

    const searchInput = screen.getByPlaceholderText(/Sertifikat ID, Nömrə və ya SİMA UID axtar.../i);
    fireEvent.change(searchInput, { target: { value: '99-GL-101' } });

    expect(screen.getByText(/99-GL-101/i)).toBeInTheDocument();
  });
});
