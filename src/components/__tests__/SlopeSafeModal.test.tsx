import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SlopeSafeModal } from '../SlopeSafeModal';

describe('SlopeSafeModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<SlopeSafeModal isOpen={false} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header and default pass radar tab when isOpen is true', () => {
    render(<SlopeSafeModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/Dağ Yolları Sürüşmə, Qaya Uçqunu və Yamac Stabilliyi SCADA Portalı/i)).toBeInTheDocument();
    expect(screen.getByText(/SLOPE-SAFE-AZ-2026/i)).toBeInTheDocument();
    expect(screen.getAllByText(/M-4 Muğanlı Aşırımı/i).length).toBeGreaterThanOrEqual(1);
  });

  it('calls onClose when close button is clicked', () => {
    render(<SlopeSafeModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches currency between AZN, USD, EUR', () => {
    render(<SlopeSafeModal isOpen={true} onClose={mockOnClose} />);

    const usdBtn = screen.getByRole('button', { name: 'USD' });
    fireEvent.click(usdBtn);
    expect(usdBtn).toHaveClass('bg-amber-500');

    const eurBtn = screen.getByRole('button', { name: 'EUR' });
    fireEvent.click(eurBtn);
    expect(eurBtn).toHaveClass('bg-amber-500');
  });

  it('navigates to SCADA telemetry tab and displays geotechnical sliders', () => {
    render(<SlopeSafeModal isOpen={true} onClose={mockOnClose} />);

    const scadaTabBtn = screen.getByRole('button', { name: /2\. Geotexniki SCADA Stendi/i });
    fireEvent.click(scadaTabBtn);

    expect(screen.getByText(/Geotexniki Qrunt və Dərinlik Sensorları/i)).toBeInTheDocument();
    expect(screen.getByText(/Qaya Uçqunu & Kinetik Enerji Simulyatoru/i)).toBeInTheDocument();
    expect(screen.getByText(/Məsamə Suyu Təzyiqi \(Piezometer u\):/i)).toBeInTheDocument();
  });

  it('navigates to Vehicle Restrictions tab and displays presets and transit assessment', () => {
    render(<SlopeSafeModal isOpen={true} onClose={mockOnClose} />);

    const vehicleTabBtn = screen.getByRole('button', { name: /3\. Nəqliyyat & Sürət Məhdudiyyəti/i });
    fireEvent.click(vehicleTabBtn);

    expect(screen.getByText(/Hazır Nəqliyyat Nümunələri \(Presets\):/i)).toBeInTheDocument();
    expect(screen.getByText(/Toyota Land Cruiser Prado 2\.8 D-4D/i)).toBeInTheDocument();
    expect(screen.getByText(/DAĞ KEÇİDİNƏ BURAXILIŞ VERİLİR/i)).toBeInTheDocument();
  });

  it('navigates to Safety Checklist tab and allows toggling items', () => {
    render(<SlopeSafeModal isOpen={true} onClose={mockOnClose} />);

    const checklistTabBtn = screen.getByRole('button', { name: /4\. Təhlükəsizlik Çeklisti/i });
    fireEvent.click(checklistTabBtn);

    expect(screen.getByText(/10 Maddəlik Geotexniki və Dağ Yolu İnfrastruktur Çeklisti/i)).toBeInTheDocument();
    const firstCheckItem = screen.getByText(/1\. Qazma Quyusu İnklinometri və Sürüşmə Müstəvisi Sürəti/i);
    expect(firstCheckItem).toBeInTheDocument();

    // Toggle checklist item
    fireEvent.click(firstCheckItem);
    expect(screen.getByText(/Uyğunluq:/i)).toBeInTheDocument();
  });

  it('navigates to Exam Simulator tab and allows selecting answers', () => {
    render(<SlopeSafeModal isOpen={true} onClose={mockOnClose} />);

    const examTabBtn = screen.getByRole('button', { name: /5\. Nəzəri İmtahan/i });
    fireEvent.click(examTabBtn);

    expect(screen.getByText(/Dağ Yolları və Sürüşmə Təhlükəsizliyi Nəzəri İmtahan Simulyatoru/i)).toBeInTheDocument();

    // Select an option for question 1
    const optionOne = screen.getByText(/Plastik deformasiya və fəlakətli sürüşmə\/uçqun qaçılmazdır/i);
    fireEvent.click(optionOne);
  });

  it('generates certificate from Vehicle tab and renders it in Issue Certificate tab', () => {
    render(<SlopeSafeModal isOpen={true} onClose={mockOnClose} />);

    // Go to vehicle restrictions tab
    const vehicleTabBtn = screen.getByRole('button', { name: /3\. Nəqliyyat & Sürət Məhdudiyyəti/i });
    fireEvent.click(vehicleTabBtn);

    const generateBtn = screen.getByRole('button', { name: /SLOPE-SAFE-AZ-2026 Sertifikatı İstehsal Et/i });
    fireEvent.click(generateBtn);

    // Should now be on Issue Certificate tab
    expect(screen.getByText(/DAĞ KEÇİDİ VƏ YAMAC STABİLLİYİ BURAXILIŞ SERTİFİKATI/i)).toBeInTheDocument();
    expect(screen.getByText(/SİMA Rəqəmsal İmza Şifrəsi:/i)).toBeInTheDocument();
  });

  it('navigates to Public Registry tab and allows searching', () => {
    render(<SlopeSafeModal isOpen={true} onClose={mockOnClose} />);

    const registryTabBtn = screen.getByRole('button', { name: /7\. Rəsmi Reyestr/i });
    fireEvent.click(registryTabBtn);

    expect(screen.getByText(/Rəsmi Dağ Keçidi və Geotexniki İcazələr Reyestri/i)).toBeInTheDocument();
    expect(screen.getByText(/SLOPE-SAFE-AZ-2026-84912/i)).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Sertifikat №, nömrə və ya aşırım\.\.\./i);
    fireEvent.change(searchInput, { target: { value: '99-SL-101' } });
    expect(screen.getByText(/SLOPE-SAFE-AZ-2026-84912/i)).toBeInTheDocument();
  });
});
