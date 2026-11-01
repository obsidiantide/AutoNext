import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WindSafeModal } from '../WindSafeModal';

describe('WindSafeModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default corridors tab when open', () => {
    render(<WindSafeModal {...defaultProps} />);

    expect(screen.getByText(/WIND-SAFE-AZ-2026/i)).toBeInTheDocument();
    expect(screen.getByText(/AAYDA, ETSN & BDYP Magistral Yan Külək və Qasırğa SCADA Monitorinqi/i)).toBeInTheDocument();
    expect(screen.getByText(/Azərbaycanın 6 Strateji Qasırğalı Yan Külək Dəhlizi/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Qiləzi-Siyəzən/i).length).toBeGreaterThan(0);
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<WindSafeModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when top close button or bottom footer button is clicked', () => {
    render(<WindSafeModal {...defaultProps} />);

    const closeBtn = screen.getByTestId('wind-modal-header-close');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);

    const bottomCloseBtn = screen.getByRole('button', { name: /^Bağla$/i });
    fireEvent.click(bottomCloseBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<WindSafeModal {...defaultProps} />);

    // Tab 2: SCADA
    fireEvent.click(screen.getByText(/2\. SCADA Telemetriya/i));
    expect(screen.getByText(/SCADA İdarəetmə & Meteoroloji Parametrlər/i)).toBeInTheDocument();
    expect(screen.getByText(/AAYDA & BDYP ELEKTRON VMS TABLO/i)).toBeInTheDocument();

    // Tab 3: Nəqliyyat & İXM Cərimə
    fireEvent.click(screen.getByText(/3\. Nəqliyyat & İXM Cərimə/i));
    expect(screen.getByText(/6 Standart Nəqliyyat Aerodinamik Profili/i)).toBeInTheDocument();
    expect(screen.getByText(/İnzibati Xətalar Məcəlləsi \(İXM\) Cərimə Standı/i)).toBeInTheDocument();

    // Tab 4: Təhlükəsizlik Bəndləri
    fireEvent.click(screen.getByText(/4\. Təhlükəsizlik Bəndləri/i));
    expect(screen.getByText(/10 Bəndlik Magistral Yan Külək Təhlükəsizlik Yoxlama Protokolu/i)).toBeInTheDocument();

    // Tab 5: İmtahan Simulatoru
    fireEvent.click(screen.getByText(/5\. İmtahan Simulatoru/i));
    expect(screen.getByText(/Magistral Qasırğa & Yan Külək Təhlükəsizliyi İmtahanı/i)).toBeInTheDocument();

    // Tab 6: Rəsmi Sertifikat
    fireEvent.click(screen.getByText(/6\. Rəsmi Sertifikat/i));
    expect(screen.getByText(/WIND-SAFE-AZ-2026 Rəsmi Külək Buraxılış Sertifikatı/i)).toBeInTheDocument();

    // Tab 7: Dövlət Reyestri
    fireEvent.click(screen.getByText(/7\. Dövlət Reyestri/i));
    expect(screen.getByText(/WIND-SAFE Vahid Dövlət Reyestr Axtarışı/i)).toBeInTheDocument();
  });

  it('filters strategic corridors in tab 1 via search input', () => {
    render(<WindSafeModal {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/Dəhliz, marşrut və ya rayon axtar/i);
    fireEvent.change(searchInput, { target: { value: 'Yasamal' } });

    expect(screen.getByTestId('corridor-card-corridor-yasamal-viaduct')).toBeInTheDocument();
    expect(screen.queryByTestId('corridor-card-corridor-gilazi-siyazan')).not.toBeInTheDocument();
  });

  it('selects a corridor and navigates to SCADA tab via banner button', () => {
    render(<WindSafeModal {...defaultProps} />);

    // Click on Sangachal corridor
    const sangachalCard = screen.getByText(/Səngəçal-Qobustan Açıq Düzənliyi/i);
    fireEvent.click(sangachalCard);

    // Click banner transition button
    const toScadaBtn = screen.getByText(/SCADA Telemetriyaya Keç/i);
    fireEvent.click(toScadaBtn);

    expect(screen.getByText(/SCADA İdarəetmə & Meteoroloji Parametrlər/i)).toBeInTheDocument();
  });

  it('interacts with sliders and road condition buttons in SCADA tab', () => {
    render(<WindSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/2\. SCADA Telemetriya/i));

    // Road condition button
    const iceBtn = screen.getByRole('button', { name: /^Buz$/i });
    fireEvent.click(iceBtn);
    expect(iceBtn).toHaveClass('bg-cyan-600');

    // Generate certificate button
    const genBtn = screen.getByRole('button', { name: /Buraxılış Sertifikatı Yarad/i });
    fireEvent.click(genBtn);
    expect(screen.getByText(/WIND-SAFE-AZ-2026 Rəsmi Külək Buraxılış Sertifikatı/i)).toBeInTheDocument();
  });

  it('selects vehicle profile in calculator tab', () => {
    render(<WindSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/3\. Nəqliyyat & İXM Cərimə/i));

    // Select Sprinter Van
    const vanCard = screen.getByText(/Mercedes-Benz Sprinter 319 CDI/i);
    fireEvent.click(vanCard);

    expect(screen.getByText('77-WV-303')).toBeInTheDocument();
  });

  it('toggles checklist items, selects all, and resets in tab 4', () => {
    render(<WindSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/4\. Təhlükəsizlik Bəndləri/i));

    const selectAllBtn = screen.getByRole('button', { name: /Bütün Bəndləri Təsdiqlə/i });
    fireEvent.click(selectAllBtn);
    expect(screen.getByText(/10 \/ 10 bənd təsdiqləndi/i)).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Sıfırla/i });
    fireEvent.click(resetBtn);
    expect(screen.getByText(/0 \/ 10 bənd təsdiqləndi/i)).toBeInTheDocument();
  });

  it('answers exam questions, submits, and allows re-taking in tab 5', () => {
    render(<WindSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/5\. İmtahan Simulatoru/i));

    const submitBtn = screen.getByRole('button', { name: /İmtahanı Tamamla/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/İmtahan Nəticəsi/i)).toBeInTheDocument();

    const restartBtn = screen.getByRole('button', { name: /Yenidən Başla/i });
    fireEvent.click(restartBtn);

    expect(screen.getByRole('button', { name: /İmtahanı Tamamla/i })).toBeInTheDocument();
  });

  it('copies pass code and handles print button in certificate tab', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<WindSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/6\. Rəsmi Sertifikat/i));

    const copyBtn = screen.getByRole('button', { name: /Kodu Kopyala/i });
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalled();

    const printBtn = screen.getByRole('button', { name: /Çap Et/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });

  it('filters public registry table in tab 7', () => {
    render(<WindSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByText(/7\. Dövlət Reyestri/i));

    const searchInput = screen.getByPlaceholderText(/Sertifikat ID, dövlət nömrəsi, model/i);
    fireEvent.change(searchInput, { target: { value: '84912' } });

    expect(screen.getByText('WIND-SAFE-AZ-2026-84912')).toBeInTheDocument();
    expect(screen.queryByText('WIND-SAFE-AZ-2026-61320')).not.toBeInTheDocument();
  });
});
