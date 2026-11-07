import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FootbridgeSafeModal } from '../FootbridgeSafeModal';

describe('FootbridgeSafeModal Component Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, branding, and default radar tab when open', () => {
    render(<FootbridgeSafeModal isOpen={true} onClose={vi.fn()} language="az" />);

    expect(screen.getByText(/FOOTBRIDGE-SAFE-AZ-2026/i)).toBeInTheDocument();
    expect(screen.getByText(/AZS 410 \/ EN 1991-1-7 \/ EN 81-70/i)).toBeInTheDocument();
    expect(screen.getByText(/M-1 Bakı – Sumqayıt Magistralı Xırdalan Dairəsi Şimal Keçidi/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<FootbridgeSafeModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<FootbridgeSafeModal isOpen={true} onClose={handleClose} language="az" />);

    const closeBtn = screen.getByTitle('Bağla');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<FootbridgeSafeModal isOpen={true} onClose={vi.fn()} language="az" />);

    // Tab 2: Simulator
    fireEvent.click(screen.getByText(/2. SCADA Keçid Simulyatoru/i));
    expect(screen.getByText(/2D SCADA İnfrastruktur Kəsiyi/i)).toBeInTheDocument();

    // Tab 3: Presets & Sanctions
    fireEvent.click(screen.getByText(/3. Qəza və Sanksiyalar Stendi/i));
    expect(screen.getByText(/Avtonom Nəqliyyat və Piyada İntruziya Preseti Seçin/i)).toBeInTheDocument();

    // Tab 4: Checklist
    fireEvent.click(screen.getByText(/4. 10 Bəndlik Texniki Audit/i));
    expect(screen.getByText(/Şaquli Qabarit Hündürlüyü \(Minimum 5.50 m\)/i)).toBeInTheDocument();

    // Tab 5: Exam
    fireEvent.click(screen.getByText(/5. Qanunvericilik İmtahanı/i));
    expect(screen.getByText(/Yol Hərəkəti və Piyada Keçidləri Qanunvericilik İmtahanı/i)).toBeInTheDocument();

    // Tab 6: Certificate
    fireEvent.click(screen.getByText(/6. Rəsmi SİMA Sertifikatı/i));
    expect(screen.getByText(/Rəsmi Elektron Sənəd Çap və Təsdiq Modulu/i)).toBeInTheDocument();

    // Tab 7: Registry
    fireEvent.click(screen.getByText(/7. İctimai Reyestr/i));
    expect(screen.getByText(/Qeydiyyatda olan aktlar/i)).toBeInTheDocument();
  });

  it('filters stations in radar tab using search input', () => {
    render(<FootbridgeSafeModal isOpen={true} onClose={vi.fn()} language="az" />);

    const searchInput = screen.getByPlaceholderText(/Keçid adı, piket km və ya marşrut nömrəsi/i);
    fireEvent.change(searchInput, { target: { value: 'Bülbülə' } });

    expect(screen.getByText(/Heydər Əliyev Beynəlxalq Hava Limanı Magistralı Bülbülə Keçidi/i)).toBeInTheDocument();
    expect(screen.queryByText(/M-4 Bakı – Şamaxı Yolu Müşviqabad/i)).not.toBeInTheDocument();
  });

  it('interacts with sliders and controls in SCADA simulator tab', () => {
    render(<FootbridgeSafeModal isOpen={true} onClose={vi.fn()} language="az" />);

    fireEvent.click(screen.getByText(/2. SCADA Keçid Simulyatoru/i));

    const speedSliders = screen.getAllByRole('slider');
    expect(speedSliders.length).toBeGreaterThanOrEqual(4);

    // Adjust first slider (traffic speed)
    fireEvent.change(speedSliders[0], { target: { value: '110' } });
    expect(screen.getByText(/110 km\/saat/i)).toBeInTheDocument();

    // Toggle pedestrian bridge usage
    const bridgeCheckbox = screen.getByLabelText(/Piyada Körpüdən İstifadə Edir/i);
    fireEvent.click(bridgeCheckbox);

    expect(screen.getByText(/TƏHLÜKƏLİ AT-GRADE QAÇIŞ!/i)).toBeInTheDocument();
  });

  it('selects vehicle preset and recalculates statutory penalties in presets tab', () => {
    render(<FootbridgeSafeModal isOpen={true} onClose={vi.fn()} language="az" />);

    fireEvent.click(screen.getByText(/3. Qəza və Sanksiyalar Stendi/i));

    const jaywalkerCard = screen.getByText(/Qanunsuz Magistralı Keçən Piyada/i);
    fireEvent.click(jaywalkerCard);

    expect(screen.getAllByText(/İXM Maddə 338/i)[0]).toBeInTheDocument();
  });

  it('toggles checklist items and clicks Bütün Bəndləri Təsdiqlə', () => {
    render(<FootbridgeSafeModal isOpen={true} onClose={vi.fn()} language="az" />);

    fireEvent.click(screen.getByText(/4. 10 Bəndlik Texniki Audit/i));

    const confirmAllBtn = screen.getByText(/Bütün Bəndləri Təsdiqlə/i);
    fireEvent.click(confirmAllBtn);

    expect(screen.getByText(/Təsdiqlənmiş bəndlər:/i)).toHaveTextContent('10');

    const resetBtn = screen.getByText('Sıfırla');
    fireEvent.click(resetBtn);

    expect(screen.getByText(/Təsdiqlənmiş bəndlər:/i)).toHaveTextContent('0');
  });

  it('completes exam with auto-fill demo button and calculates grade', () => {
    render(<FootbridgeSafeModal isOpen={true} onClose={vi.fn()} language="az" />);

    fireEvent.click(screen.getByText(/5. Qanunvericilik İmtahanı/i));

    const autoFillBtn = screen.getByText(/Avto-Doldur \(Demo\)/i);
    fireEvent.click(autoFillBtn);

    expect(screen.getByText(/İmtahan Müvəffəqiyyətlə Keçildi!/i)).toBeInTheDocument();
    expect(screen.getByText(/Toplanan bal: 100%/i)).toBeInTheDocument();
  });

  it('generates a new certificate and handles copy and print actions', () => {
    const originalPrint = window.print;
    window.print = vi.fn();

    render(<FootbridgeSafeModal isOpen={true} onClose={vi.fn()} language="az" />);

    fireEvent.click(screen.getByText(/2. SCADA Keçid Simulyatoru/i));
    const generateBtn = screen.getByText(/Sertifikat Formalaşdır/i);
    fireEvent.click(generateBtn);

    expect(screen.getByText(/Rəsmi Elektron Sənəd Çap və Təsdiq Modulu/i)).toBeInTheDocument();
    expect(screen.getByText(/Azərbaycan Avtomobil Yolları Dövlət Agentliyi/i)).toBeInTheDocument();

    const printBtn = screen.getByText(/Çap Et/i);
    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalledTimes(1);

    const copyBtn = screen.getByText(/Kodu Kopyala/i);
    fireEvent.click(copyBtn);

    window.print = originalPrint;
  });

  it('filters active certificates in public registry tab', () => {
    render(<FootbridgeSafeModal isOpen={true} onClose={vi.fn()} language="az" />);

    fireEvent.click(screen.getByText(/7. İctimai Reyestr/i));

    const registrySearch = screen.getByPlaceholderText(/Sertifikat ID, nömrə nişanı və ya körpü adı/i);
    fireEvent.change(registrySearch, { target: { value: '00101' } });

    expect(screen.getByText(/FOOTBRIDGE-SAFE-AZ-2026-00101/i)).toBeInTheDocument();
    expect(screen.queryByText(/FOOTBRIDGE-SAFE-AZ-2026-00303/i)).not.toBeInTheDocument();
  });
});
