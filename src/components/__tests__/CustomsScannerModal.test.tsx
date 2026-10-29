import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomsScannerModal } from '../CustomsScannerModal';

describe('CustomsScannerModal Component Suite', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default checkpoints tab when open', () => {
    render(<CustomsScannerModal isOpen={true} onClose={onCloseMock} />);

    expect(screen.getByText(/DGK & AYNA Yüksək Enerjili Rentgen-Qantri Skaneri Portalı/i)).toBeInTheDocument();
    expect(screen.getByText(/NII 6.0 MeV/i)).toBeInTheDocument();
    expect(screen.getByText(/Azərbaycan Respublikası Sərhəd Rentgen-Qantri Kompleksləri/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<CustomsScannerModal isOpen={false} onClose={onCloseMock} />);
    expect(screen.queryByText(/DGK & AYNA Yüksək Enerjili Rentgen-Qantri Skaneri Portalı/i)).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<CustomsScannerModal isOpen={true} onClose={onCloseMock} />);

    const closeBtn = screen.getByTestId('close-scanner-modal-btn');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 8 navigation tabs', () => {
    render(<CustomsScannerModal isOpen={true} onClose={onCloseMock} />);

    // 1. Simulator
    fireEvent.click(screen.getByText(/Qantri Rentgen Simulyatoru/i));
    expect(screen.getByText(/Nəqliyyat və Yük Parametrləri/i)).toBeInTheDocument();

    // 2. RPM
    fireEvent.click(screen.getByText(/RPM Radiasiya Monitoru/i));
    expect(screen.getByText(/Radiasiya Portal Monitoru \(RPM\) və Qamma\/Neytron Telemetriyası/i)).toBeInTheDocument();

    // 3. Fees
    fireEvent.click(screen.getByText(/Gömrük Rüsumu & Sanksiyalar/i));
    expect(screen.getByText(/Qanunvericilik üzrə Gömrük Rentgen Rüsumları/i)).toBeInTheDocument();

    // 4. Checklist
    fireEvent.click(screen.getByText(/IAEA Təhlükəsizlik Çeklisti/i));
    expect(screen.getByText(/IAEA SSG-55 və Gömrük Radiasiya Kalibrasiya Çeklisti/i)).toBeInTheDocument();

    // 5. Exam
    fireEvent.click(screen.getByText(/NII Nəzəri İmtahan/i));
    expect(screen.getByText(/DGK Qeyri-İntruziv Yoxlama \(NII\) Nəzəri İmtahan Simulyatoru/i)).toBeInTheDocument();

    // 6. Certificate
    fireEvent.click(screen.getByText(/DGK-SCAN-2026 Sertifikatı/i));
    expect(screen.getByText(/Sertifikat Hələ Generasiya Edilməyib/i)).toBeInTheDocument();

    // 7. Registry
    fireEvent.click(screen.getByText(/Açıq Reyestr/i));
    expect(screen.getByText(/DGK Vahid Açıq Rentgen Skan Reyestri/i)).toBeInTheDocument();

    // 8. Back to checkpoints
    fireEvent.click(screen.getByText(/Sərhəd Radarı/i));
    expect(screen.getByText(/Azərbaycan Respublikası Sərhəd Rentgen-Qantri Kompleksləri/i)).toBeInTheDocument();
  });

  it('filters checkpoints by search query', () => {
    render(<CustomsScannerModal isOpen={true} onClose={onCloseMock} />);

    const searchInput = screen.getByPlaceholderText(/Məntəqə və ya dəhliz axtar.../i);
    fireEvent.change(searchInput, { target: { value: 'Astara' } });

    expect(screen.getByText(/Astara Sərhəd Buraxılış Məntəqəsi/i)).toBeInTheDocument();
    expect(screen.queryByText(/Böyük Kəsik Dəmir Yolu/i)).not.toBeInTheDocument();
  });

  it('selects truck presets and adjusts simulation telemetry', () => {
    render(<CustomsScannerModal isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByText(/Qantri Rentgen Simulyatoru/i));

    // Click 3rd preset (Absheron MAN TGX with critical concealment)
    const presetBtn = screen.getByText('77-TR-909');
    fireEvent.click(presetBtn);

    expect(screen.getByDisplayValue('77-TR-909')).toBeInTheDocument();
    expect(screen.getByText(/KRİTİK ANOMALİYA/i)).toBeInTheDocument();
  });

  it('interacts with RPM tab sliders and displays telemetry', () => {
    render(<CustomsScannerModal isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByText(/RPM Radiasiya Monitoru/i));
    expect(screen.getByText(/Canlı Detektor Sensorları/i)).toBeInTheDocument();
    expect(screen.getByText(/RPM Həyəcan Statusu/i)).toBeInTheDocument();
  });

  it('interacts with checklist and toggles items', () => {
    render(<CustomsScannerModal isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByText(/IAEA Təhlükəsizlik Çeklisti/i));
    const firstChecklistTitle = screen.getByText(/Şüalanma Təhlükəsizlik Zonası və Qırmızı İşıq Siqnalizasiyası/i);
    expect(firstChecklistTitle).toBeInTheDocument();

    // Toggle click
    fireEvent.click(firstChecklistTitle);
  });

  it('submits theoretical exam and displays grade evaluation', () => {
    render(<CustomsScannerModal isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByText(/NII Nəzəri İmtahan/i));

    const submitBtn = screen.getByText(/İmtahanı Təsdiqlə və Qiymətləndir/i);
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Yenidən Başla/i)).toBeInTheDocument();
  });

  it('generates certificate from simulator and handles copy and print', () => {
    render(<CustomsScannerModal isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByText(/Qantri Rentgen Simulyatoru/i));

    const generateBtn = screen.getByRole('button', { name: /DGK-SCAN Sertifikatı Yarat/i });
    fireEvent.click(generateBtn);

    // Should switch to certificate tab
    expect(screen.getByText(/Qeyri-İntruziv Rentgen Baxış Sertifikatı/i)).toBeInTheDocument();
    expect(screen.getByText(/Kodu Kopyala/i)).toBeInTheDocument();

    // Click copy
    fireEvent.click(screen.getByText(/Kodu Kopyala/i));
    expect(screen.getByText(/Kodu Kopyala/i)).toBeInTheDocument();

    // Click print
    fireEvent.click(screen.getByText(/Çap Et/i));
  });

  it('filters active registry entries in public registry tab', () => {
    render(<CustomsScannerModal isOpen={true} onClose={onCloseMock} />);

    fireEvent.click(screen.getByText(/Açıq Reyestr/i));

    const registryInput = screen.getByPlaceholderText(/DQN və ya sertifikat №.../i);
    fireEvent.change(registryInput, { target: { value: '99-TR-707' } });

    expect(screen.getByText('99-TR-707')).toBeInTheDocument();
    expect(screen.queryByText('10-TX-404')).not.toBeInTheDocument();
  });
});
