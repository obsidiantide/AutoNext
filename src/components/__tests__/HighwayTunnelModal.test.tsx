import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HighwayTunnelModal } from '../HighwayTunnelModal';
import { Vehicle } from '../../types/vehicle';

const mockCar = {
  id: 'test-car-1',
  plateNumber: '10-AA-100',
} as unknown as Vehicle;

describe('HighwayTunnelModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(<HighwayTunnelModal isOpen={true} onClose={mockOnClose} targetCar={mockCar} />);

    expect(
      screen.getByText('Avtomobil Tunelləri SCADA Təhlükəsizlik və Ventilyasiya Sistemi')
    ).toBeInTheDocument();
    expect(screen.getByText('AAYDA • FHN • BDYP RƏSMİ PORTALI')).toBeInTheDocument();
    expect(screen.getByText('TUNNEL-SAFE-AZ-2026')).toBeInTheDocument();
    expect(screen.getByText('Tunellər Radarı')).toBeInTheDocument();
    expect(screen.getAllByText(/Murovdağ Tuneli/i).length).toBeGreaterThan(0);
  });

  it('does not render anything when isOpen is false', () => {
    const { container } = render(
      <HighwayTunnelModal isOpen={false} onClose={mockOnClose} targetCar={mockCar} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when close button is clicked', () => {
    render(<HighwayTunnelModal isOpen={true} onClose={mockOnClose} targetCar={mockCar} />);
    const closeBtn = screen.getByLabelText('Bağla');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<HighwayTunnelModal isOpen={true} onClose={mockOnClose} targetCar={mockCar} />);

    // SCADA Tab
    fireEvent.click(screen.getByText('SCADA Telemetriya & Ventilyasiya'));
    expect(screen.getByText('SCADA ƏMƏLİYYAT REJİMİ SEÇİMİ')).toBeInTheDocument();

    // Calculator Tab
    fireEvent.click(screen.getByText('Tranzit & ADR Tarifləri'));
    expect(screen.getByText('Tranzit İcazəsi & Təhlükəli Yük (ADR) Parametrləri')).toBeInTheDocument();

    // Checklist Tab
    fireEvent.click(screen.getByText('10-Nöqtəli Təhlükəsizlik Sınağı'));
    expect(screen.getByText('10-Nöqtəli Tunel Təhlükəsizlik və Yanğın Sınaq Protokolu')).toBeInTheDocument();

    // Exam Tab
    fireEvent.click(screen.getByText('Nəzəri İmtahan Simulyatoru'));
    expect(screen.getByText('Avtomobil Tunellərində Hərəkət və Təxliyə İmtahanı')).toBeInTheDocument();

    // Certificate Tab
    fireEvent.click(screen.getByText('E-İcazə Sertifikatı'));
    expect(screen.getByText(/AVTOMOBİL TUNELLƏRİ TRANZİT VƏ TƏHLÜKƏSİZLİK/i)).toBeInTheDocument();

    // Registry Tab
    fireEvent.click(screen.getByText('Vahid Dövlət Reyestri'));
    expect(
      screen.getByPlaceholderText('Qeydiyyat nişanı və ya sertifikat nömrəsi ilə axtar...')
    ).toBeInTheDocument();
  });

  it('filters tunnels by search query in radar tab', () => {
    render(<HighwayTunnelModal isOpen={true} onClose={mockOnClose} targetCar={mockCar} />);

    const searchInput = screen.getByPlaceholderText('Tunel adı, magistral və ya rayon axtar...');
    fireEvent.change(searchInput, { target: { value: 'Zəfər Yolu' } });

    expect(screen.getByText(/Zəfər Yolu T-1 Tuneli/i)).toBeInTheDocument();
    expect(screen.queryByText(/Şamaxı Muğanlı-İsmayıllı/i)).not.toBeInTheDocument();
  });

  it('selects a different tunnel and updates the 3D cross-section view', () => {
    render(<HighwayTunnelModal isOpen={true} onClose={mockOnClose} targetCar={mockCar} />);

    const bakuBayCards = screen.getAllByText(/Bakı Sahil Dənizkənarı Yeraltı Tuneli/i);
    fireEvent.click(bakuBayCards[0]);

    expect(screen.getAllByText(/Baku Central Loop/i).length).toBeGreaterThan(0);
  });

  it('interacts with SCADA mode buttons in SCADA tab', () => {
    render(<HighwayTunnelModal isOpen={true} onClose={mockOnClose} targetCar={mockCar} />);

    fireEvent.click(screen.getByText('SCADA Telemetriya & Ventilyasiya'));

    // Switch to Emergency Fire Mode
    const fireModeBtn = screen.getByText('TƏCİLİ YANĞIN & EVAKUASİYA HƏYƏCANI');
    fireEvent.click(fireModeBtn);

    expect(screen.getByText(/KRİTİK HƏYƏCAN: TUNEL BLOKLANMASI TƏLƏB OLUNUR/i)).toBeInTheDocument();
    expect(screen.getByText(/100% Güc/i)).toBeInTheDocument();

    // Reset back to normal
    const resetBtn = screen.getByText('SCADA Parametrlərini Standart Rejimə Sıfırla');
    fireEvent.click(resetBtn);

    expect(screen.getByText(/BÜTÜN PARAMETRLƏR TƏHLÜKƏSİZLİK NORMALARINDADIR/i)).toBeInTheDocument();
  });

  it('calculates fees and generates new certificate in calculator tab', () => {
    render(<HighwayTunnelModal isOpen={true} onClose={mockOnClose} targetCar={mockCar} />);

    fireEvent.click(screen.getByText('Tranzit & ADR Tarifləri'));

    // Toggle Peak Hour checkbox
    const peakCheckbox = screen.getByRole('checkbox');
    fireEvent.click(peakCheckbox);

    expect(screen.getByText(/Pik Saat Əlavəsi \(\+25%\):/i)).toBeInTheDocument();

    // Click Generate Certificate
    const generateBtn = screen.getByText('Rəsmi TUNNEL-SAFE E-İcazə Sertifikatı Yarat');
    fireEvent.click(generateBtn);

    // Should transition to certificate tab
    expect(screen.getByText(/AVTOMOBİL TUNELLƏRİ TRANZİT VƏ TƏHLÜKƏSİZLİK/i)).toBeInTheDocument();
    expect(screen.getByText('STATUS: AKTİV TRANZİT')).toBeInTheDocument();
  });

  it('interacts with checklist items and resets checklist', () => {
    render(<HighwayTunnelModal isOpen={true} onClose={mockOnClose} targetCar={mockCar} />);

    fireEvent.click(screen.getByText('10-Nöqtəli Təhlükəsizlik Sınağı'));

    expect(screen.getByText(/100% \(ƏLA\)/i)).toBeInTheDocument();

    // Click Reset
    const resetBtn = screen.getByText('Sıfırla');
    fireEvent.click(resetBtn);

    expect(screen.getByText(/0% \(QEYRİ-MƏQBUL\)/i)).toBeInTheDocument();

    // Click Select All
    const selectAllBtn = screen.getByText('Hamısını Seç');
    fireEvent.click(selectAllBtn);

    expect(screen.getByText(/100% \(ƏLA\)/i)).toBeInTheDocument();
  });

  it('submits theoretical exam and displays evaluation results', () => {
    render(<HighwayTunnelModal isOpen={true} onClose={mockOnClose} targetCar={mockCar} />);

    fireEvent.click(screen.getByText('Nəzəri İmtahan Simulyatoru'));

    // Submit Exam
    const submitBtn = screen.getByText('Nəticəni Yoxla');
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Nəticə: \d+\/10/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Qanunvericilik İzahı:/i).length).toBeGreaterThan(0);
  });

  it('handles copy button and print in certificate tab', () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<HighwayTunnelModal isOpen={true} onClose={mockOnClose} targetCar={mockCar} />);

    fireEvent.click(screen.getByText('E-İcazə Sertifikatı'));

    const copyBtn = screen.getByText('Kodu Kopyala');
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalled();

    const printBtn = screen.getByText('Çap Et (PDF)');
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });

  it('filters certificates in registry tab', () => {
    render(<HighwayTunnelModal isOpen={true} onClose={mockOnClose} targetCar={mockCar} />);

    fireEvent.click(screen.getByText('Vahid Dövlət Reyestri'));

    const searchInput = screen.getByPlaceholderText(
      'Qeydiyyat nişanı və ya sertifikat nömrəsi ilə axtar...'
    );
    fireEvent.change(searchInput, { target: { value: '99-TR-700' } });

    expect(screen.getByText('99-TR-700')).toBeInTheDocument();
    expect(screen.queryByText('10-AA-100')).not.toBeInTheDocument();
  });
});
