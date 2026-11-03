import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RwisSafeModal } from '../RwisSafeModal';

describe('RwisSafeModal Component Suite', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, branding, and default radar tab when open', () => {
    render(<RwisSafeModal isOpen={true} onClose={mockOnClose} currency="AZN" />);

    expect(screen.getByText(/RWIS Magistral Yol-Hava Məlumat & Qara Buz \(Black Ice\) Portalı/i)).toBeInTheDocument();
    expect(screen.getByText(/AAYDA • ETSN • AYNA • BDYP/i)).toBeInTheDocument();
    expect(screen.getByText(/Stansiyalar Radarı/i)).toBeInTheDocument();
    expect(screen.getByText(/M-4 Şamaxı - Ağsu Aşırımı Zirvə Stansiyası/i)).toBeInTheDocument();
  });

  it('does not render anything when isOpen is false', () => {
    const { container } = render(
      <RwisSafeModal isOpen={false} onClose={mockOnClose} currency="AZN" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when top close button or bottom footer close button is clicked', () => {
    render(<RwisSafeModal isOpen={true} onClose={mockOnClose} currency="AZN" />);

    const closeButtons = screen.getAllByRole('button', { name: /^Bağla$/i });
    fireEvent.click(closeButtons[0]);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    fireEvent.click(closeButtons[1]);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<RwisSafeModal isOpen={true} onClose={mockOnClose} currency="AZN" />);

    // 1. Simulator tab
    fireEvent.click(screen.getByRole('button', { name: /RWIS Telemetriya & FAST Çiləmə/i }));
    expect(screen.getByText(/SCADA Telemetriya Qrafiki & FAST Nozzle/i)).toBeInTheDocument();

    // 2. Sanctions tab
    fireEvent.click(screen.getByRole('button', { name: /Avtomobil Presetləri & İXM Cərimələri/i }));
    expect(screen.getByText(/Nəqliyyat Vasitəsi Presetləri & İnzibati Xətalar Məcəlləsi/i)).toBeInTheDocument();

    // 3. Checklist tab
    fireEvent.click(screen.getByRole('button', { name: /Texniki Standartlar \(AZS\/EN 15518\)/i }));
    expect(screen.getByText(/Standartlara Uyğunluq Dərəcəsi/i)).toBeInTheDocument();

    // 4. Exam tab
    fireEvent.click(screen.getByRole('button', { name: /Qış Hərəkət İmtahanı \(10 Sual\)/i }));
    expect(screen.getByText(/Qara Buz & Magistral Qış Hərəkət Təhlükəsizliyi İmtahanı/i)).toBeInTheDocument();

    // 5. Certificate tab
    fireEvent.click(screen.getByRole('button', { name: /SİMA Rəqəmsal Sertifikat/i }));
    expect(screen.getByText(/MAGİSTRAL YOL-HAVA MƏLUMAT \(RWIS\) VƏ QARA BUZ TƏHLÜKƏSİZLİK SERTİFİKATI/i)).toBeInTheDocument();

    // 6. Registry tab
    fireEvent.click(screen.getByRole('button', { name: /Dövlət Reyestri/i }));
    expect(screen.getByText(/Vahid Magistral Qış Sertifikatları Dövlət Reyestri/i)).toBeInTheDocument();

    // 7. Back to Radar
    fireEvent.click(screen.getByRole('button', { name: /Stansiyalar Radarı/i }));
    expect(screen.getByText(/Azərbaycan Magistral Yol Şəbəkəsi RWIS Stansiyaları/i)).toBeInTheDocument();
  });

  it('filters stations by search query in radar tab and selects a station', () => {
    render(<RwisSafeModal isOpen={true} onClose={mockOnClose} currency="AZN" />);

    const searchInput = screen.getByPlaceholderText(/Stansiya və ya magistral axtar/i);
    fireEvent.change(searchInput, { target: { value: 'Şuşa' } });

    expect(screen.getByText(/Zəfər Yolu - Şuşa Daşaltı Dərəsi Stansiyası/i)).toBeInTheDocument();
    expect(screen.queryByText(/Biləsuvar Çöl Stansiyası/i)).not.toBeInTheDocument();

    // Click on the station card
    fireEvent.click(screen.getByText(/Zəfər Yolu - Şuşa Daşaltı Dərəsi Stansiyası/i));
    expect(screen.getByText(/Seçilmiş Stansiya/i)).toBeInTheDocument();
  });

  it('interacts with telemetry sliders, toggles FAST spray, and plays audio in simulator tab', () => {
    render(<RwisSafeModal isOpen={true} onClose={mockOnClose} currency="AZN" />);

    fireEvent.click(screen.getByRole('button', { name: /RWIS Telemetriya & FAST Çiləmə/i }));

    // Sound button
    const soundBtn = screen.getByRole('button', { name: /SCADA Siqnal Səsi/i });
    fireEvent.click(soundBtn);

    // Force fast spray button
    const fastSprayBtn = screen.getByRole('button', { name: /FAST Məcburi Çilə|FAST Püskürtmə Dayandır/i });
    fireEvent.click(fastSprayBtn);

    // Adjust speed slider
    const speedSlider = screen.getAllByRole('slider').find((el) => {
      const input = el as HTMLInputElement;
      return input.max === '140';
    });
    if (speedSlider) {
      fireEvent.change(speedSlider, { target: { value: '100' } });
    }

    expect(screen.getByText(/Ümumi Dayanma Məsafəsi/i)).toBeInTheDocument();
  });

  it('selects vehicle preset and calculates sanctions in sanctions tab', () => {
    render(<RwisSafeModal isOpen={true} onClose={mockOnClose} currency="AZN" />);

    fireEvent.click(screen.getByRole('button', { name: /Avtomobil Presetləri & İXM Cərimələri/i }));

    // Click on Toyota Camry preset (Summer tyres)
    const camryPreset = screen.getByText(/10-WI-202/i);
    fireEvent.click(camryPreset);

    expect(screen.getByText(/10-WI-202 - Toyota Camry 2.5 Hybrid/i)).toBeInTheDocument();

    // Toggle snowplow obstruction checkbox
    const plowCheckbox = screen.getByRole('checkbox', {
      name: /AAYDA Duzsəpən\/Qartəmizləyən karvanına mane olma/i,
    });
    fireEvent.click(plowCheckbox);

    expect(screen.getByText(/30 gün ərzində 50% Güzəştlə/i)).toBeInTheDocument();
  });

  it('interacts with checklist and toggles select all and reset', () => {
    render(<RwisSafeModal isOpen={true} onClose={mockOnClose} currency="AZN" />);

    fireEvent.click(screen.getByRole('button', { name: /Texniki Standartlar \(AZS\/EN 15518\)/i }));

    const resetBtn = screen.getByRole('button', { name: /Sıfırla/i });
    fireEvent.click(resetBtn);
    expect(screen.getByText('0%')).toBeInTheDocument();

    const selectAllBtn = screen.getByRole('button', { name: /Hamısını Seç/i });
    fireEvent.click(selectAllBtn);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('answers theoretical exam questions, submits, and allows reset', () => {
    render(<RwisSafeModal isOpen={true} onClose={mockOnClose} currency="AZN" />);

    fireEvent.click(screen.getByRole('button', { name: /Qış Hərəkət İmtahanı \(10 Sual\)/i }));

    // Answer first question
    const q1Option = screen.getByRole('button', {
      name: /Yol səthinin temperaturu 0°C və ya aşağı olduqda və şeh nöqtəsi/i,
    });
    fireEvent.click(q1Option);

    // Submit exam
    const submitBtn = screen.getByRole('button', { name: /Cavabları Təsdiqlə və Nəticəni Gör/i });
    fireEvent.click(submitBtn);

    expect(screen.getAllByText(/Hüquqi Əsas & İzah/i)[0]).toBeInTheDocument();

    // Reset exam
    const restartBtn = screen.getByRole('button', { name: /İmtahanı Yenidən Başla/i });
    fireEvent.click(restartBtn);
    expect(screen.queryByText(/Hüquqi Əsas & İzah/i)).not.toBeInTheDocument();
  });

  it('generates certificate from simulator and handles print and copy actions', () => {
    // Mock navigator.clipboard
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<RwisSafeModal isOpen={true} onClose={mockOnClose} currency="AZN" />);

    fireEvent.click(screen.getByRole('button', { name: /RWIS Telemetriya & FAST Çiləmə/i }));

    const generateCertBtn = screen.getByRole('button', { name: /RWIS Təhlükəsizlik Sertifikatı Yarat/i });
    fireEvent.click(generateCertBtn);

    // Should navigate to certificate tab
    expect(screen.getByText(/MAGİSTRAL YOL-HAVA MƏLUMAT \(RWIS\) VƏ QARA BUZ TƏHLÜKƏSİZLİK SERTİFİKATI/i)).toBeInTheDocument();

    // Copy code button
    const copyBtn = screen.getByRole('button', { name: /Kodu Kopyala/i });
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalled();

    // Print button
    const printBtn = screen.getByRole('button', { name: /Çap Et/i });
    fireEvent.click(printBtn);
  });

  it('filters active certificates in registry tab and selects a record for viewing', () => {
    render(<RwisSafeModal isOpen={true} onClose={mockOnClose} currency="AZN" />);

    fireEvent.click(screen.getByRole('button', { name: /Dövlət Reyestri/i }));

    const searchInput = screen.getByPlaceholderText(/Reyestrdə nömrə və ya kod axtar/i);
    fireEvent.change(searchInput, { target: { value: '99-WI-101' } });

    expect(screen.getByText('99-WI-101')).toBeInTheDocument();

    const viewButtons = screen.getAllByRole('button', { name: /Baxış/i });
    fireEvent.click(viewButtons[0]);

    // Navigates to certificate view
    expect(screen.getByText(/MAGİSTRAL YOL-HAVA MƏLUMAT \(RWIS\) VƏ QARA BUZ TƏHLÜKƏSİZLİK SERTİFİKATI/i)).toBeInTheDocument();
  });
});
