import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BiosecurityComplianceModal } from '../BiosecurityComplianceModal';

describe('BiosecurityComplianceModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
  };

  it('renders modal header, title, and default tab when open', () => {
    render(<BiosecurityComplianceModal {...defaultProps} />);
    expect(
      screen.getByText(/AQTA, DGK & KTN Sərhəd Bioloji Təhlükəsizlik və Soyuq Zəncir Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/EN 12830 Rəqəmsal Termoqraf və Temperatur Tənzimləyicisi/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<BiosecurityComplianceModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<BiosecurityComplianceModal {...defaultProps} onClose={onClose} />);
    const closeBtn = screen.getByLabelText(/close/i);
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all navigation tabs', () => {
    render(<BiosecurityComplianceModal {...defaultProps} />);

    // Tab 2: Disinfection
    fireEvent.click(screen.getByText('Dezinfeksiya Baryeri'));
    expect(
      screen.getByText(/Avtomatlaşdırılmış Sərhəd Sanitariya və Dezinfeksiya Baryeri Simulyatoru/i)
    ).toBeInTheDocument();

    // Tab 3: Quarantine Lab
    fireEvent.click(screen.getByText('Karantin & Laboratoriya'));
    expect(
      screen.getByText(/Sərhəd Baytarlıq, Fitosanitar və PCR Karantin Laboratoriyası/i)
    ).toBeInTheDocument();

    // Tab 4: Checkpoints
    fireEvent.click(screen.getByText('Gömrük Məntəqələri'));
    expect(
      screen.getByText(/Azərbaycan Respublikası Sərhəd Buraxılış Məntəqələri Radarı/i)
    ).toBeInTheDocument();

    // Tab 5: Calculator
    fireEvent.click(screen.getByText('Rüsum Kalkulyatoru'));
    expect(
      screen.getByText(/Bioloji Təhlükəsizlik və Karantin Rüsum Hesablayıcısı/i)
    ).toBeInTheDocument();

    // Tab 6: Exam
    fireEvent.click(screen.getByText('Bioloji İmtahan'));
    expect(
      screen.getByText(/AQTA & UNECE ATP Bioloji Təhlükəsizlik və Soyuq Zəncir İmtahanı/i)
    ).toBeInTheDocument();

    // Tab 7: Certificate
    fireEvent.click(screen.getByText('Rəsmi AQTA-BIO Sertifikatı'));
    expect(
      screen.getByText(/AZƏRBAYCAN RESPUBLİKASI QİDA TƏHLÜKƏSİZLİYİ AGENTLİYİ/i)
    ).toBeInTheDocument();
  });

  it('selects a preset in cold chain tab and updates telemetry', () => {
    render(<BiosecurityComplianceModal {...defaultProps} />);
    const presetBtn = screen.getByText('10-FR-505');
    fireEvent.click(presetBtn);
    expect(screen.getByText(/Təzə Pomidor və Gilas İxracı/i)).toBeInTheDocument();
  });

  it('toggles currency in header and reflects in calculator tab', () => {
    render(<BiosecurityComplianceModal {...defaultProps} />);
    fireEvent.click(screen.getByText('USD'));
    fireEvent.click(screen.getByText('Rüsum Kalkulyatoru'));
    expect(screen.getByText(/\$/)).toBeInTheDocument();
  });

  it('interacts with exam questions and grades submission', () => {
    render(<BiosecurityComplianceModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Bioloji İmtahan'));

    // Select first option for question 1
    const option = screen.getByText('K ≤ 0.40 W/m²·K');
    fireEvent.click(option);

    // Submit exam
    const submitBtn = screen.getByText(/İmtahan Nəticələrini Təsdiq Et və Qiymətləndir/i);
    fireEvent.click(submitBtn);

    expect(screen.getByText(/NƏTİCƏ:/i)).toBeInTheDocument();
  });

  it('filters active certificates in the registry search', () => {
    render(<BiosecurityComplianceModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Rəsmi AQTA-BIO Sertifikatı'));

    const searchInput = screen.getByPlaceholderText(/Serial, nömrə və ya daşıyıcı.../i);
    fireEvent.change(searchInput, { target: { value: '99-AQ-101' } });

    expect(screen.getByText('AQTA-BIO-2026-48192')).toBeInTheDocument();
  });

  it('handles copy and print actions on certificate tab', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<BiosecurityComplianceModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Rəsmi AQTA-BIO Sertifikatı'));

    const copyBtn = screen.getByText(/Kodu Kopyala/i);
    fireEvent.click(copyBtn);

    const printBtn = screen.getByText(/Çap Et/i);
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
