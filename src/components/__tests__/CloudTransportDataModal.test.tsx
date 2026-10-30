import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CloudTransportDataModal } from '../CloudTransportDataModal';
import { Vehicle } from '../../types/vehicle';

const mockTargetCar: Vehicle = {
  id: 'car-telematics-test',
  make: 'Mercedes-Benz',
  model: 'Actros 1845 LS',
  year: 2024,
  price: 185000,
  currency: 'AZN',
  mileage: 42000,
  fuelType: 'diesel',
  transmission: 'automatic',
  bodyType: 'sedan',
  engineSize: 12.8,
  power: 450,
  location: 'Bakı',
  seller: {
    name: 'Silk Way Fleet Division',
    type: 'official_dealer',
    phone: '+994 50 200 00 00',
    rating: 4.9,
    responseTime: '15 dəqiqə',
  },
  images: ['/cars/actros.jpg'],
  features: ['GPS Telematics', 'CAN-Bus FMS', 'Digital Tachograph'],
  featured: true,
  createdAt: '2026-01-01',
} as unknown as Vehicle;

describe('CloudTransportDataModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <CloudTransportDataModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(<CloudTransportDataModal isOpen={true} onClose={mockOnClose} targetCar={mockTargetCar} />);

    expect(screen.getByTestId('cloud-transport-modal')).toBeInTheDocument();
    expect(screen.getByText(/Dövlət Nəqliyyat Bulud Məlumat Mərkəzi/i)).toBeInTheDocument();
    expect(screen.getByTestId('tab-content-radar')).toBeInTheDocument();
    expect(screen.getAllByText(/Bakı Əsas Məlumat Mərkəzi/i).length).toBeGreaterThan(0);
  });

  it('calls onClose when close button is clicked', () => {
    render(<CloudTransportDataModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByTestId('cloud-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 8 navigation tabs', () => {
    render(<CloudTransportDataModal isOpen={true} onClose={mockOnClose} />);

    // Ingestion tab
    fireEvent.click(screen.getByTestId('tab-ingestion'));
    expect(screen.getByTestId('tab-content-ingestion')).toBeInTheDocument();
    expect(screen.getByText(/Kafka & Apache Flink Streaming Engine/i)).toBeInTheDocument();

    // AI Fleet tab
    fireEvent.click(screen.getByTestId('tab-ai-fleet'));
    expect(screen.getByTestId('tab-content-ai-fleet')).toBeInTheDocument();
    expect(screen.getByText(/Süni İntellekt Avtopark Qəza & Vibrasiya Proqnozlaşdırma/i)).toBeInTheDocument();

    // Calculator tab
    fireEvent.click(screen.getByTestId('tab-calculator'));
    expect(screen.getByTestId('tab-content-calculator')).toBeInTheDocument();
    expect(screen.getByText(/Rəsmi Bulud Telemetriya Saxlama və Hesablama SLA/i)).toBeInTheDocument();

    // Checklist tab
    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByTestId('tab-content-checklist')).toBeInTheDocument();
    expect(screen.getByText(/10-Nöqtə Suveren Bulud Təhlükəsizlik/i)).toBeInTheDocument();

    // Exam tab
    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByTestId('tab-content-exam')).toBeInTheDocument();
    expect(screen.getByText(/Bulud Hesablama & Nəqliyyat Məlumatlarının İdarə Edilməsi İmtahan/i)).toBeInTheDocument();

    // Certificate tab
    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByTestId('tab-content-certificate')).toBeInTheDocument();
    expect(screen.getByText(/Rəsmi Elektron Nəqliyyat Bulud Qeydiyyat Sertifikatı/i)).toBeInTheDocument();

    // Registry tab
    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(screen.getByTestId('tab-content-registry')).toBeInTheDocument();
    expect(screen.getByText(/Vahid Nəqliyyat Bulud Qeydiyyat və Telemetriya Reyestri/i)).toBeInTheDocument();

    // Back to Radar tab
    fireEvent.click(screen.getByTestId('tab-radar'));
    expect(screen.getByTestId('tab-content-radar')).toBeInTheDocument();
  });

  it('filters cloud zones in radar tab by search query', () => {
    render(<CloudTransportDataModal isOpen={true} onClose={mockOnClose} />);

    const searchInput = screen.getByPlaceholderText(/Qovşaq və ya region axtar/i);
    fireEvent.change(searchInput, { target: { value: 'Füzuli' } });

    expect(screen.getByText(/Füzuli "Ağıllı Şəhər və Nəqliyyat Dəhlizi"/i)).toBeInTheDocument();
    expect(screen.queryByText(/Sumqayıt Yüksək Sıxlıqlı AI Hesablama/i)).not.toBeInTheDocument();
  });

  it('interacts with ingestion throughput multiplier in ingestion tab', () => {
    render(<CloudTransportDataModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-ingestion'));
    const multiplier4x = screen.getByText('4x');
    fireEvent.click(multiplier4x);

    expect(screen.getByText(/Kafka Partisiya Sayı/i)).toBeInTheDocument();
  });

  it('applies presets and changes vehicle slider in calculator tab', () => {
    render(<CloudTransportDataModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-calculator'));
    expect(screen.getByText(/BakuBus MMC/i)).toBeInTheDocument();

    const bakuBusPreset = screen.getByText(/BakuBus MMC \(Dövlət Sərnişin Daşıma Şəbəkəsi\)/i);
    fireEvent.click(bakuBusPreset);

    expect(screen.getByText(/680 Avtomobil/i)).toBeInTheDocument();
  });

  it('toggles checklist items and supports select all', () => {
    render(<CloudTransportDataModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-checklist'));
    const selectAllBtn = screen.getByText(/Hamısını Seç|Hamısını Sil/i);
    fireEvent.click(selectAllBtn);

    expect(screen.getByText(/Uyğunluq Reytinqi/i)).toBeInTheDocument();
  });

  it('allows answering exam questions and quick filling 100%', () => {
    render(<CloudTransportDataModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-exam'));
    const quickFillBtn = screen.getByText(/100% Nəticə ilə Doldur/i);
    fireEvent.click(quickFillBtn);

    expect(screen.getByText(/10 \/ 10 \(100%\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ƏLA/i).length).toBeGreaterThan(0);
  });

  it('generates a new certificate and switches to certificate view', () => {
    render(<CloudTransportDataModal isOpen={true} onClose={mockOnClose} targetCar={mockTargetCar} />);

    fireEvent.click(screen.getByTestId('tab-certificate'));
    const generateBtn = screen.getByText(/Yeni Sertifikat Generasiya Et/i);
    fireEvent.click(generateBtn);

    expect(screen.getByText(/DÖVLƏT NƏQLİYYAT BULUD SERTİFİKATI/i)).toBeInTheDocument();
    expect(screen.getByText(/SIMA-AZIN-CLOUD/i)).toBeInTheDocument();
  });
});
