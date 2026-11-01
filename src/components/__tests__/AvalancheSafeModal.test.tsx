import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AvalancheSafeModal } from '../AvalancheSafeModal';

describe('AvalancheSafeModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(<AvalancheSafeModal {...defaultProps} />);

    expect(screen.getByText(/AVALANCHE-SAFE-AZ-2026/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Quba – Qonaqkənd – Xınalıq/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Dağ Aşırımları Radarı/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<AvalancheSafeModal {...defaultProps} />);

    // Click close button
    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<AvalancheSafeModal {...defaultProps} />);

    // Tab 2: SCADA Telemetriya & Gazex
    fireEvent.click(screen.getByText(/SCADA Telemetriya & Gazex/i));
    expect(screen.getByText(/Canlı Akustik Qar və Meyillik Telemetriyası Sladerləri/i)).toBeInTheDocument();

    // Tab 3: Tormoz Fizikası & Cərimələr
    fireEvent.click(screen.getByText(/Tormoz Fizikası & Cərimələr/i));
    expect(screen.getByText(/Nəqliyyat Vasitəsi və Dağ Tormozlanma Fizikası/i)).toBeInTheDocument();

    // Tab 4: Qış Texniki Yoxlanışı (10)
    fireEvent.click(screen.getByText(/Qış Texniki Yoxlanışı \(10\)/i));
    expect(screen.getByText(/AAYDA & FHN Dağ Aşırımı Qış Təhlükəsizlik Yoxlanışı/i)).toBeInTheDocument();

    // Tab 5: Qar Qaydaları İmtahanı
    fireEvent.click(screen.getByText(/Qar Qaydaları İmtahanı/i));
    expect(screen.getByText(/BDYP & AAYDA Dağ Aşırımı və Qar Uçqunu Təhlükəsizliyi İmtahanı/i)).toBeInTheDocument();

    // Tab 6: Rəsmi Keçid Şəhadətnaməsi
    fireEvent.click(screen.getByText(/Rəsmi Keçid Şəhadətnaməsi/i));
    expect(screen.getByText(/Yüksək Dağlıq Magistral Aşırımı və Qar Uçqunu Təhlükəsizlik Keçid Şəhadətnaməsi/i)).toBeInTheDocument();

    // Tab 7: Vahid Dövlət Reyestri
    fireEvent.click(screen.getByText(/Vahid Dövlət Reyestri/i));
    expect(screen.getByPlaceholderText(/Sertifikat UID, avtomobil nömrəsi və ya aşırım adına görə axtarın/i)).toBeInTheDocument();
  });

  it('filters alpine corridors by search query in radar tab', () => {
    render(<AvalancheSafeModal {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/Dağ aşırımı, rayon və ya magistral kodunu axtarın/i);
    fireEvent.change(searchInput, { target: { value: 'Murovdağ' } });

    expect(screen.getByText(/Murovdağ Ömər Aşırımı/i)).toBeInTheDocument();
    expect(screen.queryByText(/R-4 Quba-Xınalıq/i)).not.toBeInTheDocument();
  });

  it('selects a different corridor and transitions to SCADA tab via action button', () => {
    render(<AvalancheSafeModal {...defaultProps} />);

    // Click on Shahdag corridor
    const shahdagCard = screen.getByText(/Qusar – Şahdağ Turizm Kompleksi – Laza/i);
    fireEvent.click(shahdagCard);

    // Click SCADA button
    const scadaBtn = screen.getByRole('button', { name: /SCADA İdarəetməsinə Keç/i });
    fireEvent.click(scadaBtn);

    expect(screen.getByText(/Canlı Akustik Qar və Meyillik Telemetriyası Sladerləri/i)).toBeInTheDocument();
  });

  it('interacts with SCADA sliders and triggers Gazex remote blast', () => {
    render(<AvalancheSafeModal {...defaultProps} />);

    fireEvent.click(screen.getByText(/SCADA Telemetriya & Gazex/i));

    // Find and trigger Gazex exploder button
    const gazexBtn = screen.getByRole('button', { name: /Gazex Partladıcını İcazəli Boşalt/i });
    expect(gazexBtn).toBeInTheDocument();
    fireEvent.click(gazexBtn);
  });

  it('selects vehicle preset and calculates fines on calculator tab', () => {
    render(<AvalancheSafeModal {...defaultProps} />);

    fireEvent.click(screen.getByText(/Tormoz Fizikası & Cərimələr/i));

    // Click KamAZ preset
    const presetBtn = screen.getByText(/KamAZ-43118/i);
    fireEvent.click(presetBtn);

    // Toggle transit defiance checkbox
    const defianceCheckbox = screen.getByRole('checkbox', {
      name: /AAYDA \/ FHN tərəfindən bağlanmış aşırıma icazəsiz giriş/i,
    });
    fireEvent.click(defianceCheckbox);

    // Fine should include the penalty
    expect(screen.getByText(/İXM Maddə 353: Fövqəladə xəbərdarlıq elan olunmuş dağ aşırımına icazəsiz daxil olma/i)).toBeInTheDocument();
  });

  it('interacts with checklist and toggles select all button', () => {
    render(<AvalancheSafeModal {...defaultProps} />);

    fireEvent.click(screen.getByText(/Qış Texniki Yoxlanışı \(10\)/i));

    const selectAllBtn = screen.getByRole('button', { name: /Bütün Bəndləri Təsdiqlə/i });
    fireEvent.click(selectAllBtn);

    expect(screen.getByText(/100% \(10 \/ 10\)/i)).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Sıfırla/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText(/0% \(0 \/ 10\)/i)).toBeInTheDocument();
  });

  it('submits theoretical exam and displays evaluation results', () => {
    render(<AvalancheSafeModal {...defaultProps} />);

    fireEvent.click(screen.getByText(/Qar Qaydaları İmtahanı/i));

    const submitBtn = screen.getByRole('button', { name: /İmtahan Cavablarını Təsdiqlə və Qiymətləndir/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Nəticə:/i)).toBeInTheDocument();
  });

  it('handles copy button and print in certificate tab', () => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<AvalancheSafeModal {...defaultProps} />);

    fireEvent.click(screen.getByText(/Rəsmi Keçid Şəhadətnaməsi/i));

    const copyBtn = screen.getByRole('button', { name: /Hash Kopyala/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    const printBtn = screen.getByRole('button', { name: /Sənədi Çap Et/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });

  it('filters certificates in public registry tab', () => {
    render(<AvalancheSafeModal {...defaultProps} />);

    fireEvent.click(screen.getByText(/Vahid Dövlət Reyestri/i));

    const searchInput = screen.getByPlaceholderText(/Sertifikat UID, avtomobil nömrəsi və ya aşırım adına görə axtarın/i);
    fireEvent.change(searchInput, { target: { value: '99-AV-101' } });

    expect(screen.getByText(/99-AV-101/i)).toBeInTheDocument();
  });
});
