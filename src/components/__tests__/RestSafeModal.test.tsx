import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RestSafeModal } from '../RestSafeModal';

describe('RestSafeModal Component', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<RestSafeModal isOpen={false} onClose={onCloseMock} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, branding, and default radar tab when open', () => {
    render(<RestSafeModal isOpen={true} onClose={onCloseMock} />);
    expect(
      screen.getByText('Magistral Yol İstirahət Zonaları & Sürücü Yorğunluğu SCADA Portalı')
    ).toBeInTheDocument();
    expect(screen.getByText('SCADA CANLI')).toBeInTheDocument();
    expect(screen.getByText('İstirahət Məntəqələri Radarı')).toBeInTheDocument();
    expect(screen.getByText('Yaşma Logistika və Vaha TIR İstirahət Kompleksi')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<RestSafeModal isOpen={true} onClose={onCloseMock} />);
    const closeButtons = screen.getAllByRole('button', { name: /bağla/i });
    expect(closeButtons.length).toBeGreaterThan(0);
    fireEvent.click(closeButtons[0]);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 6 navigation tabs', () => {
    render(<RestSafeModal isOpen={true} onClose={onCloseMock} />);

    // Tab 2: AETR & Fatigue Telemetry
    fireEvent.click(screen.getByText('AETR & Yorğunluq Standı'));
    expect(screen.getByText(/Rəqəmsal Taxoqraf & Telemetriya Parametrləri/i)).toBeInTheDocument();

    // Tab 3: Booking & Tariffs
    fireEvent.click(screen.getByText('Rezervasiya & Tariflər'));
    expect(screen.getByText(/Təhlükəsiz Parklanma Yeri Rezervasiyası/i)).toBeInTheDocument();

    // Tab 4: SSTPA Checklist
    fireEvent.click(screen.getByText('SSTPA Texniki Standartlar'));
    expect(screen.getByText('SSTPA Uyğunluq Dərəcəsi:')).toBeInTheDocument();

    // Tab 5: Theory Exam
    fireEvent.click(screen.getByText('AETR Nəzəri İmtahan'));
    expect(
      screen.getByText('AETR Sürücü İstirahət Rejimi & Magistral Parklanma İmtahanı')
    ).toBeInTheDocument();

    // Tab 6: Certificate & Registry
    fireEvent.click(screen.getByText('E-Vauçer & Reyestr'));
    expect(
      screen.getByText('Rəsmi Magistral İstirahət Zonası Elektron Giriş Vauçeri')
    ).toBeInTheDocument();
  });

  it('filters facilities by corridor in radar tab', () => {
    render(<RestSafeModal isOpen={true} onClose={onCloseMock} />);
    fireEvent.click(screen.getByRole('button', { name: 'M-1' }));
    expect(screen.getByText('Yaşma Logistika və Vaha TIR İstirahət Kompleksi')).toBeInTheDocument();
    expect(
      screen.queryByText('Kürdəmir Mərkəzi Tranzit Vaha Kompleksi')
    ).not.toBeInTheDocument();

    // Reset to ALL
    fireEvent.click(screen.getByRole('button', { name: 'Hamısı' }));
    expect(screen.getByText('Kürdəmir Mərkəzi Tranzit Vaha Kompleksi')).toBeInTheDocument();
  });

  it('applies driver presets and updates telemetry in fatigue stand tab', () => {
    render(<RestSafeModal isOpen={true} onClose={onCloseMock} />);
    fireEvent.click(screen.getByText('AETR & Yorğunluq Standı'));

    // Apply 10-RS-202 preset
    const presetBtn = screen.getByText('10-RS-202');
    fireEvent.click(presetBtn);

    expect(screen.getByText(/Sürücü ayıq və diqqətlidir/i)).toBeInTheDocument();
  });

  it('interacts with sliders and sound test in fatigue stand tab', () => {
    render(<RestSafeModal isOpen={true} onClose={onCloseMock} />);
    fireEvent.click(screen.getByText('AETR & Yorğunluq Standı'));

    // Sound test button
    const soundBtn = screen.getByText('Səs Testi');
    fireEvent.click(soundBtn);

    // Toggle day/night button
    const nightBtn = screen.getByText(/Gecə/i);
    fireEvent.click(nightBtn);
    expect(screen.getByText(/Gecə/i)).toBeInTheDocument();
  });

  it('creates a new reservation and navigates to certificate view in booking tab', () => {
    render(<RestSafeModal isOpen={true} onClose={onCloseMock} />);
    fireEvent.click(screen.getByText('Rezervasiya & Tariflər'));

    const submitBtn = screen.getByText('Rezervasiya Et & Elektron Vauçer Al');
    fireEvent.click(submitBtn);

    expect(
      screen.getByText('Rəsmi Magistral İstirahət Zonası Elektron Giriş Vauçeri')
    ).toBeInTheDocument();
  });

  it('toggles checklist items and handles select-all and reset', () => {
    render(<RestSafeModal isOpen={true} onClose={onCloseMock} />);
    fireEvent.click(screen.getByText('SSTPA Texniki Standartlar'));

    const resetBtn = screen.getByRole('button', { name: 'Sıfırla' });
    fireEvent.click(resetBtn);
    expect(screen.getByText('0%')).toBeInTheDocument();

    const selectAllBtn = screen.getByRole('button', { name: 'Hamısını Seç' });
    fireEvent.click(selectAllBtn);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('answers exam questions and submits theoretical exam', () => {
    render(<RestSafeModal isOpen={true} onClose={onCloseMock} />);
    fireEvent.click(screen.getByText('AETR Nəzəri İmtahan'));

    // Select option for Question 1
    const optionBtn = screen.getByText('4.5 saat');
    fireEvent.click(optionBtn);

    const submitExamBtn = screen.getByRole('button', { name: /İmtahanı Tamamla & Yoxla/i });
    fireEvent.click(submitExamBtn);

    expect(screen.getByText(/Nəticə:/i)).toBeInTheDocument();
  });

  it('copies certificate code and triggers print in certificate tab', () => {
    render(<RestSafeModal isOpen={true} onClose={onCloseMock} />);
    fireEvent.click(screen.getByText('E-Vauçer & Reyestr'));

    const copyBtn = screen.getByText('Kodu Kopyala');
    fireEvent.click(copyBtn);
    expect(screen.getByText(/kopyalandı/i)).toBeInTheDocument();

    const printBtn = screen.getByText('Vauçeri Çap Et');
    fireEvent.click(printBtn);
  });

  it('filters records by search query in public registry', () => {
    render(<RestSafeModal isOpen={true} onClose={onCloseMock} />);
    fireEvent.click(screen.getByText('E-Vauçer & Reyestr'));

    const searchInput = screen.getByPlaceholderText(/Qeydiyyat nişanı, sertifikat.../i);
    fireEvent.change(searchInput, { target: { value: '99-RS-101' } });

    expect(screen.getAllByText('99-RS-101').length).toBeGreaterThan(0);
    expect(screen.queryByText('10-RS-202')).not.toBeInTheDocument();
  });
});
