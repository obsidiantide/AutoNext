import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AmbulanceComplianceModal } from '../AmbulanceComplianceModal';

describe('AmbulanceComplianceModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve())
      }
    });
    window.print = vi.fn();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <AmbulanceComplianceModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default audit tab when open', () => {
    render(<AmbulanceComplianceModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/TƏBİB & BDYP Təcili Tibbi Yardım və Reanimasiya Portalı/i)).toBeInTheDocument();
    expect(screen.getByText(/EN 1789 Standartı Audit/i)).toBeInTheDocument();
    expect(screen.getByText(/Reanimomobil \(Klass C\)/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<AmbulanceComplianceModal isOpen={true} onClose={mockOnClose} />);

    const closeButtons = screen.getAllByRole('button', { name: /close|bağla|✕/i });
    fireEvent.click(closeButtons[0]);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 6 navigation tabs', () => {
    render(<AmbulanceComplianceModal isOpen={true} onClose={mockOnClose} />);

    // Tab 2: Presets & Siren
    fireEvent.click(screen.getByText(/Ambulans Parkı & Mayak/i));
    expect(screen.getAllByText(/Mercedes-Benz Sprinter 319 CDI Reanimomobil/i).length).toBeGreaterThan(0);

    // Tab 3: Corridor
    fireEvent.click(screen.getByText(/«Həyat Dəhlizi»/i));
    expect(screen.getAllByText(/3 Zolaqlı Şəhər Magistralı/i).length).toBeGreaterThan(0);

    // Tab 4: Exam
    fireEvent.click(screen.getByText(/Sürücü İmtahanı/i));
    expect(screen.getByText(/Təcili Tibbi Yardım və Operativ Hərəkət İmtahanı/i)).toBeInTheDocument();

    // Tab 5: Stations
    fireEvent.click(screen.getByText(/103 Stansiyaları Radarı/i));
    expect(screen.getByPlaceholderText(/Stansiya adı, rayon/i)).toBeInTheDocument();

    // Tab 6: Permit
    fireEvent.click(screen.getByText(/TƏBİB-EMS Buraxılış & Reyestr/i));
    expect(screen.getByText(/TƏCİLİ VƏ TƏXİRƏSALINMAZ TİBBİ YARDIM OPERATİV BURAXILIŞI/i)).toBeInTheDocument();
  });

  it('toggles checklist items and recalculates score and fines in audit tab', () => {
    render(<AmbulanceComplianceModal isOpen={true} onClose={mockOnClose} />);

    // Initially 100%
    expect(screen.getByText(/Uyğunluq Reytinqi:/i)).toBeInTheDocument();

    // Toggle off the first item (stretcher)
    const firstCheckItem = screen.getByText(/10g Toqquşma Sertifikatlı Əsas və Əlavə Xərəklər/i);
    fireEvent.click(firstCheckItem);

    // Score drops and fine increases
    expect(screen.getAllByText(/150 AZN/i).length).toBeGreaterThan(0);

    // Click auto-fill to restore 100%
    const autoFillBtn = screen.getByText(/Tam Uyğunluğu Doldur/i);
    fireEvent.click(autoFillBtn);
    expect(screen.getByText(/100%/i)).toBeInTheDocument();
  });

  it('switches ambulance presets and toggles beacon/siren state in presets tab', () => {
    render(<AmbulanceComplianceModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText(/Ambulans Parkı & Mayak/i));

    // Click on Ford Transit preset
    const transitPreset = screen.getByText(/Ford Transit 350L/i);
    fireEvent.click(transitPreset);

    // Toggle Siren
    const sirenBtn = screen.getByRole('button', { name: /Sayrışan Mayakı Yandır/i });
    fireEvent.click(sirenBtn);
    expect(screen.getByRole('button', { name: /Göy Mayak & Siren Aktivdir/i })).toBeInTheDocument();
  });

  it('switches rescue corridor scenarios and displays yielding rules in corridor tab', () => {
    render(<AmbulanceComplianceModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText(/«Həyat Dəhlizi»/i));

    // Switch to 2-lane scenario
    const twoLaneScenario = screen.getByText(/2 Zolaqlı Şəhərdaxili Küçə/i);
    fireEvent.click(twoLaneScenario);

    expect(screen.getByText(/Sol zolaqdakı avtomobil sola, sağ zolaqdakı avtomobil tam sağ kənara çıxaraq/i)).toBeInTheDocument();
  });

  it('answers exam questions and checks theoretical exam results in exam tab', () => {
    render(<AmbulanceComplianceModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText(/Sürücü İmtahanı/i));

    // Answer first question
    const correctOption = screen.getByText(/Hərəkət zolağını dərhal boşaltmalı və maneəsiz keçid üçün yol verməlidir/i);
    fireEvent.click(correctOption);

    // Submit exam
    const submitBtn = screen.getByText(/İmtahanı Tamamla və Yoxla/i);
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Nəticə:/i)).toBeInTheDocument();
    expect(screen.getByText(/Yenidən Başla/i)).toBeInTheDocument();
  });

  it('filters EMS substations by search query and region in stations tab', () => {
    render(<AmbulanceComplianceModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByText(/103 Stansiyaları Radarı/i));

    const searchInput = screen.getByPlaceholderText(/Stansiya adı, rayon/i);
    fireEvent.change(searchInput, { target: { value: 'Yasamal' } });

    expect(screen.getByText(/2 saylı Yasamal Təcili Tibbi Yardım Stansiyası/i)).toBeInTheDocument();
    expect(screen.queryByText(/Gəncə Regional/i)).toBeNull();

    // Simulate booking callout
    const dispatchBtn = screen.getByText(/Briqada Çağırışı Simulyasiyası/i);
    fireEvent.click(dispatchBtn);
    expect(screen.getByText(/✓ Dispetçer Əlaqələndi/i)).toBeInTheDocument();
  });

  it('generates permit, handles copy, print, and filters permits in registry tab', () => {
    render(<AmbulanceComplianceModal isOpen={true} onClose={mockOnClose} />);

    // Go to presets and click generate
    fireEvent.click(screen.getByText(/Ambulans Parkı & Mayak/i));
    const generateBtn = screen.getByRole('button', { name: /E-Buraxılış Hazırla/i });
    fireEvent.click(generateBtn);

    // Should switch to permit tab
    expect(screen.getByText(/TƏCİLİ VƏ TƏXİRƏSALINMAZ TİBBİ YARDIM OPERATİV BURAXILIŞI/i)).toBeInTheDocument();

    // Copy code
    const copyBtn = screen.getByRole('button', { name: /Kodu Kopyala/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    // Print
    const printBtn = screen.getByRole('button', { name: /Çap et/i });
    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalled();

    // Filter registry
    const registryInput = screen.getByPlaceholderText(/Qeydiyyat nömrəsi, nömrə nişanı/i);
    fireEvent.change(registryInput, { target: { value: '99-JH-103' } });
    expect(screen.getByText(/TABIB-EMS-2026-10301/i)).toBeInTheDocument();
  });
});
