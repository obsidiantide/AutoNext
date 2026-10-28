import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { LezEcoModal } from '../LezEcoModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('LezEcoModal Component', () => {
  const mockOnClose = vi.fn();
  const sampleVehicle = MOCK_VEHICLES[0];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default zones tab when open', () => {
    render(
      <LezEcoModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    expect(
      screen.getByText(/Aşağı Emissiya Zonaları \(LEZ\) & Yaşıl Donanma Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/ETSN • AYNA • BDYP/i)).toBeInTheDocument();
    expect(screen.getByText(/Azərbaycan Şəhər Aşağı Emissiya Zonaları \(LEZ\) Şəbəkəsi/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <LezEcoModal
        isOpen={false}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('calls onClose when top close button or bottom footer button is clicked', () => {
    render(
      <LezEcoModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    const closeBtn = screen.getByLabelText(/Close Modal/i);
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    const bottomCloseBtn = screen.getByRole('button', { name: /^Bağla$/i });
    fireEvent.click(bottomCloseBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it('switches cleanly between all 6 navigation tabs', () => {
    render(
      <LezEcoModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    // 1. Zones tab (default)
    expect(screen.getByText(/İçərişəhər Dövlət Tarix-Memarlıq Qoruğu/i)).toBeInTheDocument();

    // 2. Telemetry tab
    fireEvent.click(screen.getByText(/📊 Eko-Skor & Telemetriya/i));
    expect(screen.getByText(/Avtomobil Eko-Skoru/i)).toBeInTheDocument();
    expect(screen.getByText(/OBD-II Tailpipe & Bort Sensor Telemetriyası/i)).toBeInTheDocument();

    // 3. Calculator tab
    fireEvent.click(screen.getByText(/🧮 İcazə & Rüsum Kalkulyatoru/i));
    expect(screen.getByText(/LEZ Giriş Rüsumu & Karbon Ofseti Parametrləri/i)).toBeInTheDocument();
    expect(screen.getByText(/Rəsmi Ödəniş Hesabatı/i)).toBeInTheDocument();

    // 4. Checklist tab
    fireEvent.click(screen.getByText(/📋 10-Bəndlik Eko-Audit/i));
    expect(screen.getByText(/10-Bəndlik Texniki & Ekoloji Yoxlama Siyahısı/i)).toBeInTheDocument();

    // 5. Exam tab
    fireEvent.click(screen.getByText(/🎓 Nəzəri İmtahan Simulyatoru/i));
    expect(screen.getByText(/Ekoloji Maarifləndirmə & LEZ İmtahan Simulyatoru/i)).toBeInTheDocument();

    // 6. Certificate & Registry tab
    fireEvent.click(screen.getByText(/📜 Ekoloji İcazə & Reyestr/i));
    expect(screen.getByText(/Vahid Dövlət LEZ Eko-İcazələr Reyestri/i)).toBeInTheDocument();
  });

  it('switches vehicle presets and displays updated eco-score', () => {
    render(
      <LezEcoModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={null}
      />
    );

    // Switch to telemetry tab
    fireEvent.click(screen.getByText(/📊 Eko-Skor & Telemetriya/i));

    // Preset 1: 99-EV-001 (Default first preset)
    expect(screen.getByText(/Platin Eko-Sinif/i)).toBeInTheDocument();

    // Click preset 10-VK-999 (Euro 2 diesel/petrol)
    const presetEuro2 = screen.getByText('10-VK-999');
    fireEvent.click(presetEuro2);

    expect(screen.getByText(/Qeyri-Uyğun \(LEZ Giriş Qadağası\)/i)).toBeInTheDocument();
    expect(screen.getByText(/⛔ GİRİŞ QADAĞANDIR/i)).toBeInTheDocument();
  });

  it('interacts with calculator options (rush hour, carbon offset tree donation)', () => {
    render(
      <LezEcoModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    fireEvent.click(screen.getByText(/🧮 İcazə & Rüsum Kalkulyatoru/i));

    const rushCheckbox = screen.getByLabelText(/Pik Saatlar Ərzində Hərəkət Rejimi/i);
    expect(rushCheckbox).not.toBeChecked();
    fireEvent.click(rushCheckbox);
    expect(rushCheckbox).toBeChecked();

    const treeCheckbox = screen.getByLabelText(/Könüllü Karbon Kompensasiyası/i);
    expect(treeCheckbox).toBeChecked();
    fireEvent.click(treeCheckbox);
    expect(treeCheckbox).not.toBeChecked();
  });

  it('manages 10-point checklist selection, select all, and reset', () => {
    render(
      <LezEcoModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    fireEvent.click(screen.getByText(/📋 10-Bəndlik Eko-Audit/i));

    // Reset checklist
    const resetBtn = screen.getByRole('button', { name: /Sıfırla/i });
    fireEvent.click(resetBtn);
    expect(screen.getByText(/Uyğunluq: 0 \/ 10 \(0%\)/i)).toBeInTheDocument();

    // Select all
    const selectAllBtn = screen.getByRole('button', { name: /Hamısını Təsdiqlə/i });
    fireEvent.click(selectAllBtn);
    expect(screen.getByText(/Uyğunluq: 10 \/ 10 \(100%\)/i)).toBeInTheDocument();
  });

  it('takes theoretical exam and submits answers', () => {
    render(
      <LezEcoModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    fireEvent.click(screen.getByText(/🎓 Nəzəri İmtahan Simulyatoru/i));

    // Select first option for Question 1
    const optButtons = screen.getAllByRole('button');
    const optionA = optButtons.find((b) => b.textContent?.includes('Bütün minik avtomobilləri'));
    if (optionA) {
      fireEvent.click(optionA);
    }

    const submitBtn = screen.getByRole('button', { name: /İmtahanı Bitir və Nəticəni Yoxla/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/ETSN Yaşıl Sürücü Sertifikasiyası/i)).toBeInTheDocument();
  });

  it('generates certificate and allows copying to clipboard', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    render(
      <LezEcoModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={null}
      />
    );

    fireEvent.click(screen.getByText(/📊 Eko-Skor & Telemetriya/i));
    const generateBtn = screen.getByRole('button', { name: /Rəsmi Eko-İcazə Şəhadətnaməsi Yarat/i });
    fireEvent.click(generateBtn);

    expect(screen.getByText(/ŞƏHƏR AŞAĞI EMİSSİYA ZONASI \(LEZ\) GİRİŞ ŞƏHADƏTNAMƏSİ/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ECO-ZONE-AZ-2026-/i).length).toBeGreaterThan(0);

    const copyBtn = screen.getByRole('button', { name: /Məlumatları Kopyala/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('filters zones by city', () => {
    render(
      <LezEcoModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    // Click Gəncə city filter
    const ganjaBtn = screen.getByRole('button', { name: /^Gəncə$/i });
    fireEvent.click(ganjaBtn);
    expect(screen.getByText(/Gəncə Qədim Tarixi Mərkəzi Eko-Zonası/i)).toBeInTheDocument();
    expect(screen.queryByText(/İçərişəhər Dövlət Tarix-Memarlıq Qoruğu/i)).not.toBeInTheDocument();

    // Click Şuşa filter
    const shushaBtn = screen.getByRole('button', { name: /^Şuşa$/i });
    fireEvent.click(shushaBtn);
    expect(screen.getByText(/Şuşa Dövlət Tarix-Memarlıq Qoruğu "Təmiz Şəhər"/i)).toBeInTheDocument();
  });

  it('filters public registry by search query', () => {
    render(
      <LezEcoModal
        isOpen={true}
        onClose={mockOnClose}
        targetCar={sampleVehicle}
      />
    );

    fireEvent.click(screen.getByText(/📜 Ekoloji İcazə & Reyestr/i));

    const searchInput = screen.getByPlaceholderText(/Dövlət nömrəsi və ya №\.\.\./i);
    fireEvent.change(searchInput, { target: { value: '99-EV-001' } });

    expect(screen.getByText('99-EV-001')).toBeInTheDocument();
    expect(screen.queryByText('10-TX-707')).not.toBeInTheDocument();
  });
});
