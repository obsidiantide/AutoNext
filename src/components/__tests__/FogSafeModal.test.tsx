import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FogSafeModal } from '../FogSafeModal';
import { MOCK_VEHICLE_FOG_PRESETS } from '../../data/mockFogSafeData';

describe('FogSafeModal Component Suite', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<FogSafeModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, branding, and default radar tab when open', () => {
    render(<FogSafeModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Qatı Duman, Toz Fırtınası və Məhdud Görünüş SCADA Portalı/i)).toBeInTheDocument();
    expect(screen.getByText(/FOG-SAFE-AZ-2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Azərbaycanın 6 Strateji Duman və Toz Fırtınası Koridoru/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<FogSafeModal isOpen={true} onClose={onClose} />);

    const closeBtn = screen.getByText('✕');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<FogSafeModal isOpen={true} onClose={vi.fn()} />);

    // Radar -> SCADA
    const scadaTab = screen.getByRole('button', { name: /SCADA & VSL Standı/i });
    fireEvent.click(scadaTab);
    expect(screen.getByText(/AAYDA & BDYP Magistral Dəyişkən Sürət Həddi \(VSL\) Elektron Portalı/i)).toBeInTheDocument();

    // SCADA -> Calculator
    const calcTab = screen.getByRole('button', { name: /Fizika & Cərimə Hesablayıcı/i });
    fireEvent.click(calcTab);
    expect(screen.getByText(/İnzibati Xətalar Məcəlləsi \(İXM\) Cərimə Hesabatı/i)).toBeInTheDocument();

    // Calculator -> Checklist
    const chkTab = screen.getByRole('button', { name: /10-Bənd Təhlükəsizlik/i });
    fireEvent.click(chkTab);
    expect(screen.getByText(/10-Bəndlik Texniki Görünüş və Yol Təhlükəsizliyi Yoxlama Vərəqəsi/i)).toBeInTheDocument();

    // Checklist -> Exam
    const examTab = screen.getByRole('button', { name: /Yol Hərəkəti İmtahanı/i });
    fireEvent.click(examTab);
    expect(screen.getByText(/Duman və Məhdud Görünüşdə Hərəkət Qaydaları İmtahanı/i)).toBeInTheDocument();

    // Exam -> Certificate
    const certTab = screen.getByRole('button', { name: /FOG-SAFE Sertifikatı/i });
    fireEvent.click(certTab);
    expect(screen.getByText(/RƏSMİ MAGİSTRAL DUMAN KEÇİD SERTİFİKATI/i)).toBeInTheDocument();

    // Certificate -> Registry
    const regTab = screen.getByRole('button', { name: /Vahid Reyestr/i });
    fireEvent.click(regTab);
    expect(screen.getByText(/Vahid Magistral Duman Keçid Sertifikatları Reyestri/i)).toBeInTheDocument();
  });

  it('filters corridors by search query in radar tab', () => {
    render(<FogSafeModal isOpen={true} onClose={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText(/Koridor və ya magistral axtar/i);
    fireEvent.change(searchInput, { target: { value: 'Muğanlı' } });

    expect(screen.getByText(/M-4 Muğanlı Dağ Aşırımı Oroqrafik Dumanı/i)).toBeInTheDocument();
    expect(screen.queryByText(/Km 184\+300/i)).not.toBeInTheDocument();
  });

  it('interacts with SCADA sliders and surface friction buttons', () => {
    render(<FogSafeModal isOpen={true} onClose={vi.fn()} />);

    // Go to SCADA tab
    fireEvent.click(screen.getByRole('button', { name: /SCADA & VSL Standı/i }));

    // Switch surface to Black ice
    const iceBtn = screen.getByRole('button', { name: /Qara Buz \(0.12\)/i });
    fireEvent.click(iceBtn);
    expect(screen.getByText(/Qara Buz \(Black Ice\)/i)).toBeInTheDocument();

    // Change visibility slider
    const rangeInputs = screen.getAllByRole('slider');
    fireEvent.change(rangeInputs[0], { target: { value: '30' } });

    expect(screen.getByText(/30 metr/i)).toBeInTheDocument();
  });

  it('applies vehicle presets and toggles violation checkboxes in calculator tab', () => {
    render(<FogSafeModal isOpen={true} onClose={vi.fn()} currency="AZN" />);

    // Go to calculator tab
    fireEvent.click(screen.getByRole('button', { name: /Fizika & Cərimə Hesablayıcı/i }));

    // Select second preset
    const preset = MOCK_VEHICLE_FOG_PRESETS[1];
    const presetBtn = screen.getByRole('button', { name: new RegExp(preset.plate, 'i') });
    fireEvent.click(presetBtn);

    // Toggle high beams violation checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // toggle headlights violation

    expect(screen.getByText(/İXM 342.1.4: Dumanda uzaq vuran işıqlar/i)).toBeInTheDocument();
  });

  it('toggles checklist items and completes all via Hamısını Təsdiqlə button', () => {
    render(<FogSafeModal isOpen={true} onClose={vi.fn()} />);

    // Go to checklist
    fireEvent.click(screen.getByRole('button', { name: /10-Bənd Təhlükəsizlik/i }));

    const approveAllBtn = screen.getByRole('button', { name: /Hamısını Təsdiqlə/i });
    fireEvent.click(approveAllBtn);

    expect(screen.getByText(/Uyğunluq: 100%/i)).toBeInTheDocument();
  });

  it('answers exam questions and submits theoretical exam', () => {
    render(<FogSafeModal isOpen={true} onClose={vi.fn()} />);

    // Go to exam
    fireEvent.click(screen.getByRole('button', { name: /Yol Hərəkəti İmtahanı/i }));

    // Click submit button
    const submitBtn = screen.getByRole('button', { name: /İmtahanı Tamamla və Qiymətləndir/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Nəticə:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Yenidən Sına/i })).toBeInTheDocument();
  });

  it('handles certificate copy and print actions in certificate tab', () => {
    const originalPrint = window.print;
    window.print = vi.fn();

    render(<FogSafeModal isOpen={true} onClose={vi.fn()} />);

    // Go to certificate tab
    fireEvent.click(screen.getByRole('button', { name: /FOG-SAFE Sertifikatı/i }));

    const printBtn = screen.getByRole('button', { name: /Sertifikatı Çap Et/i });
    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalledTimes(1);

    const copyBtn = screen.getByRole('button', { name: /Kodu Kopyala/i });
    fireEvent.click(copyBtn);
    expect(screen.getByText(/Kopyalandı!/i)).toBeInTheDocument();

    window.print = originalPrint;
  });

  it('filters certificates in registry tab', () => {
    render(<FogSafeModal isOpen={true} onClose={vi.fn()} />);

    // Go to registry tab
    fireEvent.click(screen.getByRole('button', { name: /Vahid Reyestr/i }));

    const searchInput = screen.getByPlaceholderText(/Qeydiyyat nişanı və ya nömrə/i);
    fireEvent.change(searchInput, { target: { value: '99-FG-101' } });

    expect(screen.getByText(/99-FG-101/i)).toBeInTheDocument();
    expect(screen.queryByText(/77-VS-909/i)).not.toBeInTheDocument();
  });
});
