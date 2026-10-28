import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { TankerSafetyModal } from '../TankerSafetyModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('TankerSafetyModal Component', () => {
  const mockOnClose = vi.fn();
  const sampleVehicle = MOCK_VEHICLES[0];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default telemetry tab when open', () => {
    render(
      <TankerSafetyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={sampleVehicle}
        currency="AZN"
      />
    );

    expect(
      screen.getByText(/Təhlükəli Yüklər \(ADR\) və Yanacaq Sisternləri Təhlükəsizlik Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/FHN DÖVLƏT YANĞIN NƏZARƏTİ XİDMƏTİ/i)).toBeInTheDocument();
    expect(screen.getByText(/Hidrostatik Təzyiq & Divar Qalınlığı/i)).toBeInTheDocument();
    expect(screen.getByText(/Alovsöndürən & Statik Torpaqlama/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <TankerSafetyModal
        isOpen={false}
        onClose={mockOnClose}
        vehicle={sampleVehicle}
        currency="AZN"
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <TankerSafetyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={sampleVehicle}
        currency="AZN"
      />
    );

    const closeBtn = screen.getByLabelText(/Bağla/i);
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(
      <TankerSafetyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={sampleVehicle}
        currency="AZN"
      />
    );

    // 1. Calculator
    fireEvent.click(screen.getByText('FHN Rüsum Kalkulyatoru'));
    expect(screen.getByText(/FHN Dövlət Yanğın Nəzarəti Xidməti və BDYP ADR Rəsmi Rüsum Hesablayıcısı/i)).toBeInTheDocument();

    // 2. Terminals
    fireEvent.click(screen.getByText('Neft-Kimya Terminalları'));
    expect(screen.getByPlaceholderText(/Terminal adı, məntəqə və ya UN kodu üzrə axtarış/i)).toBeInTheDocument();

    // 3. Checklist
    fireEvent.click(screen.getByText('10 Bəndlik Yoxlama'));
    expect(screen.getByText(/FHN DYNX 10 Bəndlik Rəsmi Yanğın və Texniki Yoxlama Protokolu/i)).toBeInTheDocument();

    // 4. Exam
    fireEvent.click(screen.getByText('ADR Sürücü İmtahanı'));
    expect(screen.getByText(/ADR Təhlükəli Yük Sürücüsü və Təhlükəsizlik Məsləhətçisi İmtahan Simulyatoru/i)).toBeInTheDocument();

    // 5. Certificate
    fireEvent.click(screen.getByText('ADR-AZ-2026 Şəhadətnamə'));
    expect(screen.getByText(/CERTIFICATE OF APPROVAL FOR VEHICLES CARRYING CERTAIN DANGEROUS GOODS/i)).toBeInTheDocument();

    // 6. Registry
    fireEvent.click(screen.getByText('Vahid Reyestr'));
    expect(screen.getByPlaceholderText(/Qeydiyyat nömrəsi, nömrə nişanı, daşıyıcı və ya UN kodu/i)).toBeInTheDocument();

    // Back to Telemetry
    fireEvent.click(screen.getByText('Hidrostatik & Telemetriya'));
    expect(screen.getByText(/Hidrostatik Təzyiq & Divar Qalınlığı/i)).toBeInTheDocument();
  });

  it('allows switching presets and updates active vehicle telemetry', () => {
    render(
      <TankerSafetyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={sampleVehicle}
        currency="AZN"
      />
    );

    // Click on defective preset button
    const defectiveBtn = screen.getByText(/10-TX-888/i);
    fireEvent.click(defectiveBtn);

    // Defective banner or warning should be displayed
    expect(screen.getByText(/Kritik Təhlükəsizlik Qüsurları Qeydə Alındı!/i)).toBeInTheDocument();
    expect(screen.getByText(/İXM 323 Cərimə Riski:/i)).toBeInTheDocument();
  });

  it('filters terminals in terminals tab', () => {
    render(
      <TankerSafetyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={sampleVehicle}
        currency="AZN"
      />
    );

    fireEvent.click(screen.getByText('Neft-Kimya Terminalları'));

    const searchInput = screen.getByPlaceholderText(/Terminal adı, məntəqə və ya UN kodu üzrə axtarış/i);
    fireEvent.change(searchInput, { target: { value: 'Səngəçal' } });

    expect(screen.getByText(/Səngəçal Terminalı & BP Xam Neft və Qaz Kondensatı Yükləmə Məntəqəsi/i)).toBeInTheDocument();
  });

  it('toggles checklist items and supports select-all button in checklist tab', () => {
    render(
      <TankerSafetyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={sampleVehicle}
        currency="AZN"
      />
    );

    fireEvent.click(screen.getByText('10 Bəndlik Yoxlama'));

    const selectAllBtn = screen.getByText('Bütün Bəndləri Təsdiqlə');
    fireEvent.click(selectAllBtn);

    expect(screen.getByText(/100% \(Reysə Hazırdır\)/i)).toBeInTheDocument();
  });

  it('completes exam simulation and evaluates submission', () => {
    render(
      <TankerSafetyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={sampleVehicle}
        currency="AZN"
      />
    );

    fireEvent.click(screen.getByText('ADR Sürücü İmtahanı'));

    // Click submit exam
    const submitBtn = screen.getByText('İmtahanı Tamamla & Qiymətləndir');
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Nəticə:/i)).toBeInTheDocument();
    expect(screen.getByText('Yenidən Başla')).toBeInTheDocument();
  });

  it('handles copy and print actions in certificate tab', () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextSpy,
      },
    });

    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <TankerSafetyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={sampleVehicle}
        currency="AZN"
      />
    );

    fireEvent.click(screen.getByText('ADR-AZ-2026 Şəhadətnamə'));

    const copyBtn = screen.getByText(/Şəhadətnamə Nömrəsini Kopyala/i);
    fireEvent.click(copyBtn);
    expect(writeTextSpy).toHaveBeenCalled();

    const printBtn = screen.getByText(/Çap Et \/ PDF Yadda Saxla/i);
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });

  it('filters active certificates in public registry tab', () => {
    render(
      <TankerSafetyModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={sampleVehicle}
        currency="AZN"
      />
    );

    fireEvent.click(screen.getByText('Vahid Reyestr'));

    const registryInput = screen.getByPlaceholderText(/Qeydiyyat nömrəsi, nömrə nişanı, daşıyıcı və ya UN kodu/i);
    fireEvent.change(registryInput, { target: { value: '99-FL-101' } });

    expect(screen.getByText('ADR-AZ-2026-98124')).toBeInTheDocument();
  });
});
