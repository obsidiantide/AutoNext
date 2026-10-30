import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BridgeShmModal } from '../BridgeShmModal';

describe('BridgeShmModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(<BridgeShmModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/Ağıllı Körpü & Viyaduk Struktur Sağlamlığı Monitorinqi/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/AAYDA • FHN • BDYP/i)).toBeInTheDocument();
    expect(screen.getByText(/Körpülər Radarı/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<BridgeShmModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByLabelText('Bağla');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches between all 7 navigation tabs cleanly', () => {
    render(<BridgeShmModal isOpen={true} onClose={mockOnClose} />);

    // 1. Switch to Telemetry tab
    const telemetryTabBtn = screen.getByText(/Sensor Telemetriyası & WIM/i);
    fireEvent.click(telemetryTabBtn);
    expect(screen.getByText(/FBG Optik Lifli Gərginlik/i)).toBeInTheDocument();

    // 2. Switch to Calculator tab
    const calcTabBtn = screen.getByText(/Ox Yükü & Rüsum Kalkulyatoru/i);
    fireEvent.click(calcTabBtn);
    expect(
      screen.getByText(/Ağırçəkili Nəqliyyat Ox Yükü & Rüsum Kalkulyatoru/i)
    ).toBeInTheDocument();

    // 3. Switch to Checklist tab
    const checklistTabBtn = screen.getByText(/10-Maddəlik SHM Təftişi/i);
    fireEvent.click(checklistTabBtn);
    expect(
      screen.getByText(/10-Maddəlik Körpü Struktur Təhlükəsizlik və SHM Təftişi/i)
    ).toBeInTheDocument();

    // 4. Switch to Exam tab
    const examTabBtn = screen.getByText(/Mühəndislik İmtahanı/i);
    fireEvent.click(examTabBtn);
    expect(
      screen.getByText(/İnşaat & Körpü Mühəndisliyi Təhlükəsizlik Test Simulyatoru/i)
    ).toBeInTheDocument();

    // 5. Switch to Certificate tab
    const certTabBtn = screen.getByText(/Elektron Buraxılış Vərəqəsi/i);
    fireEvent.click(certTabBtn);
    expect(
      screen.getByText(/ELEKTRON KÖRPÜ TRANZİT BURAXILIŞI & SHM VƏRƏQƏSİ/i)
    ).toBeInTheDocument();

    // 6. Switch to Registry tab
    const regTabBtn = screen.getByText(/Vahid Reyestr/i);
    fireEvent.click(regTabBtn);
    expect(
      screen.getByPlaceholderText(/Sertifikat nömrəsi, nəqliyyat qeydiyyat nişanı/i)
    ).toBeInTheDocument();
  });

  it('interacts with telemetry sliders and emergency barrier toggle', () => {
    render(<BridgeShmModal isOpen={true} onClose={mockOnClose} />);

    // Switch to telemetry tab
    fireEvent.click(screen.getByText(/Sensor Telemetriyası & WIM/i));

    // Toggle emergency barrier
    const barrierBtn = screen.getByText(/Şlaqbaum: AÇIQDIR/i);
    fireEvent.click(barrierBtn);
    expect(screen.getByText(/Şlaqbaum: QAPALIDIR/i)).toBeInTheDocument();
  });

  it('handles checklist select all, clear, and item toggles', () => {
    render(<BridgeShmModal isOpen={true} onClose={mockOnClose} />);

    // Switch to checklist tab
    fireEvent.click(screen.getByText(/10-Maddəlik SHM Təftişi/i));

    // Initially all 10 items selected
    expect(screen.getByText(/100% Uyğunluq/i)).toBeInTheDocument();

    // Click Reset
    const clearBtn = screen.getByText('Sıfırla');
    fireEvent.click(clearBtn);
    expect(screen.getByText(/0% Uyğunluq/i)).toBeInTheDocument();

    // Click Select All
    const selectAllBtn = screen.getByText('Hamısını Seç');
    fireEvent.click(selectAllBtn);
    expect(screen.getByText(/100% Uyğunluq/i)).toBeInTheDocument();
  });

  it('submits engineering exam and provides instant evaluation', () => {
    render(<BridgeShmModal isOpen={true} onClose={mockOnClose} />);

    // Switch to Exam tab
    fireEvent.click(screen.getByText(/Mühəndislik İmtahanı/i));

    // Select an option on Question 1 (11.5 ton is the correct option index 2)
    const optionBtn = screen.getByText('11.5 ton');
    fireEvent.click(optionBtn);

    // Submit exam
    const submitBtn = screen.getByText(/Cavabları Təsdiqlə və Qiymətləndir/i);
    fireEvent.click(submitBtn);

    expect(screen.getByText(/İmtahan Nəticəsi:/i)).toBeInTheDocument();
  });

  it('generates a new clearance certificate from calculator and supports print/copy', () => {
    render(<BridgeShmModal isOpen={true} onClose={mockOnClose} />);

    // Switch to Calculator tab
    fireEvent.click(screen.getByText(/Ox Yükü & Rüsum Kalkulyatoru/i));

    // Click generate certificate
    const generateBtn = screen.getByText(/Rəsmi SHM Buraxılış Sertifikatı Yarat/i);
    fireEvent.click(generateBtn);

    // Now on certificate tab
    expect(
      screen.getByText(/ELEKTRON KÖRPÜ TRANZİT BURAXILIŞI & SHM VƏRƏQƏSİ/i)
    ).toBeInTheDocument();

    // Copy action
    const copyBtn = screen.getByText(/Məlumatı Kopyala/i);
    fireEvent.click(copyBtn);

    // Print action
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const printBtn = screen.getByText(/Çap Et/i);
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });

  it('filters public registry records by search query', () => {
    render(<BridgeShmModal isOpen={true} onClose={mockOnClose} />);

    // Switch to Registry tab
    fireEvent.click(screen.getByText(/Vahid Reyestr/i));

    const searchInput = screen.getByPlaceholderText(
      /Sertifikat nömrəsi, nəqliyyat qeydiyyat nişanı/i
    );
    fireEvent.change(searchInput, { target: { value: '99-TK-812' } });

    expect(screen.getByText('99-TK-812')).toBeInTheDocument();
  });
});
