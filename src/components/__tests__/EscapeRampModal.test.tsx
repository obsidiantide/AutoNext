import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EscapeRampModal } from '../EscapeRampModal';

describe('EscapeRampModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(<EscapeRampModal {...defaultProps} />);

    expect(screen.getAllByText(/ESCAPE-RAMP-AZ-2026/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Dağ Enişlərində Qəza Tormoz Zolaqları \(EER\) və Çınqıl Yatağı SCADA Monitorinqi/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Ağsu Aşırımı/i).length).toBeGreaterThan(0);
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<EscapeRampModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<EscapeRampModal {...defaultProps} />);

    // Tab 2: SCADA
    fireEvent.click(screen.getByTestId('tab-scada'));
    expect(screen.getByText(/Giriş Telemetriyası və Yataq Parametrləri/i)).toBeInTheDocument();
    expect(screen.getByText(/Fiziki Hesablama və SCADA Qiymətləndirməsi/i)).toBeInTheDocument();

    // Tab 3: Vehicles & Fines
    fireEvent.click(screen.getByTestId('tab-vehicles'));
    expect(screen.getByText(/Azərbaycan Magistrallarında Tipik Nəqliyyat Preserləri/i)).toBeInTheDocument();
    expect(screen.getByText(/İnzibati Məsuliyyət və Cərimələr \(İXM\)/i)).toBeInTheDocument();

    // Tab 4: Checklist
    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByText(/10-Bəndlik Texniki Təhlükəsizlik və İnfrastruktur Reqlamenti/i)).toBeInTheDocument();

    // Tab 5: Exam
    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByText(/Dağ Enişləri və Qəza Zolaqlarından İstifadə İmtahanı/i)).toBeInTheDocument();

    // Tab 6: Certificate
    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByText(/DAĞ AŞIRIMLARINDA QƏZA ZOLAĞI \(EER\) VƏ ƏYLƏC SAZLIĞI TALONU/i)).toBeInTheDocument();

    // Tab 7: Registry
    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(screen.getByText(/Vahid İctimai Reyestr/i)).toBeInTheDocument();
  });

  it('filters mountain pass corridors via search input', () => {
    render(<EscapeRampModal {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/Aşırım və ya magistral axtar/i);
    fireEvent.change(searchInput, { target: { value: 'Murovdağ' } });

    expect(screen.getByText(/Murovdağ Enişi/i)).toBeInTheDocument();
    expect(screen.queryByText(/Qızılqaya Dik Enişi/i)).not.toBeInTheDocument();
  });

  it('allows interacting with sliders in SCADA tab', () => {
    render(<EscapeRampModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-scada'));

    const speedSlider = screen.getByDisplayValue('80');
    fireEvent.change(speedSlider, { target: { value: '110' } });

    expect(screen.getByText(/110 km\/saat/i)).toBeInTheDocument();
  });

  it('selects a vehicle preset in vehicles tab', () => {
    render(<EscapeRampModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-vehicles'));

    const actrosCard = screen.getByText(/Mercedes-Benz Actros 3340/i);
    fireEvent.click(actrosCard);

    expect(screen.getByText(/10-TK-202/i)).toBeInTheDocument();
  });

  it('toggles checklist items and handles Bütün Bəndləri Təsdiqlə button', () => {
    render(<EscapeRampModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-checklist'));

    const checkAllBtn = screen.getByRole('button', { name: /Bütün Bəndləri Təsdiqlə/i });
    fireEvent.click(checkAllBtn);

    expect(screen.getByText(/10 \/ 10 \(100%\)/i)).toBeInTheDocument();
  });

  it('completes the exam with quick fill and evaluates score', () => {
    render(<EscapeRampModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-exam'));

    const quickFillBtn = screen.getByRole('button', { name: /Sürətli Doldur/i });
    fireEvent.click(quickFillBtn);

    const submitBtn = screen.getByRole('button', { name: /İmtahanı Tamamla/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/10 \/ 10 \(100%\) - KEÇDİ/i)).toBeInTheDocument();
  });

  it('handles certificate issuance, copying and printing', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    render(<EscapeRampModal {...defaultProps} />);

    // Click Top Banner Button "Elektron Talon Generasiyası"
    const issueBtn = screen.getByRole('button', { name: /Elektron Talon Generasiyası/i });
    fireEvent.click(issueBtn);

    expect(screen.getByText(/Rəsmi Elektron Keçid və Təhlükəsizlik Talonu/i)).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', { name: /^Kopyala$/i });
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalled();

    const printBtn = screen.getByRole('button', { name: /Çap Et/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });

  it('searches and filters records in public registry tab', () => {
    render(<EscapeRampModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-registry'));

    const searchInput = screen.getByPlaceholderText(/Talon ID, Nəqliyyat/i);
    fireEvent.change(searchInput, { target: { value: '88102' } });

    expect(screen.getByText(/ESCAPE-RAMP-AZ-2026-88102/i)).toBeInTheDocument();
    expect(screen.queryByText(/ESCAPE-RAMP-AZ-2026-19302/i)).not.toBeInTheDocument();
  });
});
