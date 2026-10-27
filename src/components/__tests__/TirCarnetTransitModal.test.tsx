import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TirCarnetTransitModal } from '../TirCarnetTransitModal';

describe('TirCarnetTransitModal Component', () => {
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

  it('renders modal header, title, and default tab (checkpoints) when open', () => {
    render(<TirCarnetTransitModal {...defaultProps} />);

    expect(screen.getByText('DGK Beynəlxalq TIR & Tranzit Gömrük Portalı')).toBeInTheDocument();
    expect(screen.getByText('DGK • IRU TIR • ADR • YAŞIL DƏHLİZ')).toBeInTheDocument();
    expect(screen.getByText('Gömrük Məntəqələri Radarı')).toBeInTheDocument();
  });

  it('does not render anything when isOpen is false', () => {
    const { container } = render(<TirCarnetTransitModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when close button is clicked', () => {
    render(<TirCarnetTransitModal {...defaultProps} />);

    const closeBtn = screen.getByTestId('tir-carnet-close-btn');
    fireEvent.click(closeBtn);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('switches between all 6 tabs cleanly', () => {
    render(<TirCarnetTransitModal {...defaultProps} />);

    // 1. Calculator tab
    fireEvent.click(screen.getByTestId('tab-calculator-btn'));
    expect(screen.getByText('Hazır Beynəlxalq Yük / TIR Preseti Seçin:')).toBeInTheDocument();

    // 2. Telemetry tab
    fireEvent.click(screen.getByTestId('tab-telemetry-btn'));
    expect(screen.getByText('Dual-Energy Qamma/Rentgen & Radiasiya Telemetriyası Stendi')).toBeInTheDocument();

    // 3. Checklist tab
    fireEvent.click(screen.getByTestId('tab-checklist-btn'));
    expect(screen.getByText('DGK, BDYP & FHN Beynəlxalq Yük və ADR Təhlükəsizlik Yoxlaması')).toBeInTheDocument();

    // 4. Exam tab
    fireEvent.click(screen.getByTestId('tab-exam-btn'));
    expect(screen.getByText('DGK & ADR Beynəlxalq Yük Daşıma İmtahan Simulyatoru')).toBeInTheDocument();

    // 5. Certificate tab
    fireEvent.click(screen.getByTestId('tab-certificate-btn'));
    expect(screen.getByText('AZƏRBAYCAN RESPUBLİKASI DÖVLƏT GÖMRÜK KOMİTƏSİ')).toBeInTheDocument();

    // 6. Back to Checkpoints tab
    fireEvent.click(screen.getByTestId('tab-checkpoints-btn'));
    expect(screen.getByPlaceholderText('Məntəqə və ya dəhliz axtar...')).toBeInTheDocument();
  });

  it('filters checkpoints by country and search query', () => {
    render(<TirCarnetTransitModal {...defaultProps} />);

    // Filter by Russia
    const russiaBtn = screen.getByText('🇷🇺 Rusiya');
    fireEvent.click(russiaBtn);
    expect(screen.getByText('Samur Gömrük Postu (Quba / Rusiya Sərhədi)')).toBeInTheDocument();
    expect(screen.queryByText('Astara Gömrük Postu (Astara / İran Sərhədi)')).not.toBeInTheDocument();

    // Search query
    const searchInput = screen.getByPlaceholderText('Məntəqə və ya dəhliz axtar...');
    fireEvent.change(searchInput, { target: { value: 'Samur' } });
    expect(screen.getByText('Samur Gömrük Postu (Quba / Rusiya Sərhədi)')).toBeInTheDocument();
  });

  it('selects preset in calculator and generates certificate', () => {
    render(<TirCarnetTransitModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-calculator-btn'));

    // Click another preset
    const presetBtn = screen.getByText('10-AA-404');
    fireEvent.click(presetBtn);

    // Click generate certificate button
    const genBtn = screen.getByTestId('generate-cert-from-calc-btn');
    fireEvent.click(genBtn);

    // Should navigate to certificate tab
    expect(screen.getByText('Beynəlxalq TIR Karneti & Tranzit Gömrük Buraxılış Şəhadətnaməsi')).toBeInTheDocument();
    expect(screen.getAllByText(/10-AA-404/).length).toBeGreaterThan(0);
  });

  it('interacts with telemetry controls (sliders and tamper checkbox)', () => {
    render(<TirCarnetTransitModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-telemetry-btn'));

    const tamperCheckbox = screen.getByLabelText(/Gömrük Möhürünə Qanunsuz Müdaxilə/);
    fireEvent.click(tamperCheckbox);

    expect(screen.getByText('HƏBS / MÜSADİRƏ TƏDBİRİ')).toBeInTheDocument();
  });

  it('toggles checklist items, selects all and resets', () => {
    render(<TirCarnetTransitModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-checklist-btn'));

    const resetBtn = screen.getByText('Sıfırla');
    fireEvent.click(resetBtn);
    expect(screen.getByText('0 / 10 (0%)')).toBeInTheDocument();

    const selectAllBtn = screen.getByText('Hamısını Seç');
    fireEvent.click(selectAllBtn);
    expect(screen.getByText('10 / 10 (100%)')).toBeInTheDocument();
  });

  it('submits exam and handles answers', () => {
    render(<TirCarnetTransitModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-exam-btn'));

    const finishExamBtn = screen.getByText('İmtahanı Tamamla');
    fireEvent.click(finishExamBtn);

    expect(screen.getByText('İmtahan Nəticəsi Qeyri-Qənaətbəxşdir')).toBeInTheDocument();

    const restartBtn = screen.getByText('Yenidən Başla');
    fireEvent.click(restartBtn);
    expect(screen.getByText('İmtahanı Tamamla')).toBeInTheDocument();
  });

  it('copies certificate code and triggers print in certificate view', () => {
    render(<TirCarnetTransitModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-certificate-btn'));

    const copyBtn = screen.getByText('Kodu Kopyala');
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    const printBtn = screen.getByText('Çap Et');
    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalled();
  });
});
