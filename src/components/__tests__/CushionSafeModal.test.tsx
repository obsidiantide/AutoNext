import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CushionSafeModal } from '../CushionSafeModal';

describe('CushionSafeModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
    // Mock window.print
    window.print = vi.fn();
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(<CushionSafeModal {...defaultProps} />);
    expect(screen.getByText(/Magistral Qəza Sönümləyici Yastıqlar və Zərbə Amortizatorları Portalı/i)).toBeInTheDocument();
    expect(screen.getByText(/1. Haçalanma Radarı \(Gore Zones\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Bakı Dairəvi Yolu Yasamal Haçalanması Qəza Yastığı #01/i)[0]).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<CushionSafeModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when close button is clicked', () => {
    render(<CushionSafeModal {...defaultProps} />);
    const closeBtn = screen.getAllByRole('button', { name: /Bağla/i })[0];
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<CushionSafeModal {...defaultProps} />);

    // Tab 2: simulator
    fireEvent.click(screen.getByText(/2. SCADA Zərbə Stendi/i));
    expect(screen.getByText(/2D Haçalanma və Qəza Sönümləyici Zərbə Dinamikası/i)).toBeInTheDocument();

    // Tab 3: sanctions
    fireEvent.click(screen.getByText(/3. Nəqliyyat & İXM Məsuliyyəti/i));
    expect(screen.getByText(/Azərbaycan Nömrəli Nəqliyyat Preseti/i)).toBeInTheDocument();

    // Tab 4: checklist
    fireEvent.click(screen.getByText(/4. EN 1317-3 Çeklist/i));
    expect(screen.getByText(/10-Bəndlik Texniki & SCADA Təhlükəsizlik Çeklisti/i)).toBeInTheDocument();

    // Tab 5: exam
    fireEvent.click(screen.getByText(/5. İmtahan Simulyatoru/i));
    expect(screen.getByText(/Qəza Sönümləyici Yastıqlar və Haçalanma Qaydaları Üzrə 10 Suallıq İmtahan/i)).toBeInTheDocument();

    // Tab 6: certificate
    fireEvent.click(screen.getByText(/6. Rəsmi Sertifikat/i));
    expect(screen.getByText(/RƏSMİ QƏZA SÖNÜMLƏYİCİ VƏ ZƏRBƏ AKT-SERTİFİKATI/i)).toBeInTheDocument();

    // Tab 7: registry
    fireEvent.click(screen.getByText(/7. İctimai Reyestr/i));
    expect(screen.getByText(/Vahid İctimai Qəza Sönümləyici Reyestri/i)).toBeInTheDocument();
  });

  it('allows selecting a zone from the radar grid', () => {
    render(<CushionSafeModal {...defaultProps} />);
    const m1Zone = screen.getAllByText(/M-1 Bakı – Quba Saray Çıxışı Haçalanma Buferi #02/i)[0];
    fireEvent.click(m1Zone);
    expect(screen.getAllByText(/CS-M1-21/i)[0]).toBeInTheDocument();
  });

  it('interacts with sliders and controls in the simulator tab', () => {
    render(<CushionSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/2. SCADA Zərbə Stendi/i));

    // Test audio sound test
    const soundBtn = screen.getByText(/SCADA Siqnal Testi/i);
    fireEvent.click(soundBtn);

    // Test slider change: speed slider
    const speedSlider = screen.getAllByRole('slider')[0];
    fireEvent.change(speedSlider, { target: { value: '110' } });
    expect(screen.getByText(/110 km\/saat/i)).toBeInTheDocument();

    // Test clicking generate cert button from simulator tab
    const generateBtn = screen.getByText(/Bu Toqquşmaya Rəsmi Akt \/ Sertifikat Tərtib Et/i);
    fireEvent.click(generateBtn);
    // Should transition to certificate tab
    expect(screen.getByText(/RƏSMİ QƏZA SÖNÜMLƏYİCİ VƏ ZƏRBƏ AKT-SERTİFİKATI/i)).toBeInTheDocument();
  });

  it('applies vehicle presets and displays updated license plate in sanctions tab', () => {
    render(<CushionSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/3. Nəqliyyat & İXM Məsuliyyəti/i));

    const mercedesPreset = screen.getAllByText(/10-CU-202/i)[0];
    fireEvent.click(mercedesPreset);

    expect(screen.getByText(/Mercedes-Benz E 300 4MATIC/i)).toBeInTheDocument();
    expect(screen.getAllByText(/10-CU-202/i)[0]).toBeInTheDocument();
  });

  it('interacts with checklist items and verifies all and resets', () => {
    render(<CushionSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/4. EN 1317-3 Çeklist/i));

    const resetBtn = screen.getByText(/Sıfırla/i);
    fireEvent.click(resetBtn);

    const verifyAllBtn = screen.getByText(/Bütün Bəndləri Təsdiqlə/i);
    fireEvent.click(verifyAllBtn);

    // Click single item
    const firstCheckItem = screen.getByText(/EN 1317-3 Sertifikatlaşdırılmış Qəza Sönümləyici Yastıq Konstruksiyası/i);
    fireEvent.click(firstCheckItem);
  });

  it('completes the theoretical exam and displays score results', () => {
    render(<CushionSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/5. İmtahan Simulyatoru/i));

    // Answer questions
    const firstOption = screen.getAllByText(/B\)/i)[0];
    fireEvent.click(firstOption);

    const submitBtn = screen.getByText(/İmtahanı Təsdiqlə/i);
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Nəticə:/i)).toBeInTheDocument();

    // Reset exam
    const resetExamBtn = screen.getByText(/Yenidən Başla/i);
    fireEvent.click(resetExamBtn);
    expect(screen.getByText(/İmtahanı Təsdiqlə/i)).toBeInTheDocument();
  });

  it('handles copy and print in certificate tab', () => {
    render(<CushionSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/6. Rəsmi Sertifikat/i));

    const copyBtn = screen.getByText(/Kodu Kopyala/i);
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    const printBtn = screen.getByText(/Çap Et/i);
    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalled();
  });

  it('filters active registry entries in public registry tab', () => {
    render(<CushionSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/7. İctimai Reyestr/i));

    const searchInput = screen.getByPlaceholderText(/Nömrə, sertifikat və ya zona axtar.../i);
    fireEvent.change(searchInput, { target: { value: '99-CU-101' } });

    expect(screen.getByText(/99-CU-101/i)).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT-99999' } });
    expect(screen.getByText(/Sorğu üzrə heç bir sertifikat tapılmadı/i)).toBeInTheDocument();
  });

  it('switches currency between AZN, USD, and EUR', () => {
    render(<CushionSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/USD/i));
    fireEvent.click(screen.getByText(/EUR/i));
    fireEvent.click(screen.getByText(/AZN/i));
  });
});
