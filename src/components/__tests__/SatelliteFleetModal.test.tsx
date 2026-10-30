import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SatelliteFleetModal } from '../SatelliteFleetModal';
import { Vehicle } from '../../types/vehicle';

describe('SatelliteFleetModal Component', () => {
  const mockOnClose = vi.fn();
  const mockTargetCar: Vehicle = {
    id: 'car-sat-1',
    make: 'Mercedes-Benz',
    model: 'Actros 1845 LS',
    year: 2024,
    price: 185000,
    mileage: 45000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'Tractor',
    engineSize: 12.8,
    plateNumber: '99-ZA-841',
    vin: 'VF624GPA7KC881920',
  } as unknown as Vehicle;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(<SatelliteFleetModal isOpen={true} onClose={mockOnClose} targetCar={mockTargetCar} />);

    expect(screen.getByTestId('satellite-fleet-modal')).toBeInTheDocument();
    expect(screen.getByText(/Peyk Donanma Telemetriyası & RTK S-AIS Rəqəmsal Portalı/i)).toBeInTheDocument();
    expect(screen.getByText(/Azərkosmos • RİNN • AYNA • BDYP/i)).toBeInTheDocument();
    expect(screen.getByTestId('satellite-tab-radar')).toBeInTheDocument();
    expect(screen.getAllByText(/Əsas Yerüstü Peyk İdarəetmə Mərkəzi/i).length).toBeGreaterThan(0);
  });

  it('calls onClose when close button is clicked', () => {
    render(<SatelliteFleetModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByTestId('satellite-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 6 navigation tabs', () => {
    render(<SatelliteFleetModal isOpen={true} onClose={mockOnClose} />);

    // Tab 2: RTK & Anti-Spoofing
    fireEvent.click(screen.getByTestId('satellite-tab-rtk'));
    expect(screen.getByText(/GNSS Telemetriya Parametrləri/i)).toBeInTheDocument();

    // Tab 3: Calculator
    fireEvent.click(screen.getByTestId('satellite-tab-calculator'));
    expect(screen.getByText(/Dövlət Peyk Telemetriyası və Geozona İllik Tarif Kalkulyatoru/i)).toBeInTheDocument();

    // Tab 4: Checklist
    fireEvent.click(screen.getByTestId('satellite-tab-checklist'));
    expect(screen.getByText(/10 Bəndlik Kosmik Rabitə və GNSS Kiberdayanıqlıq Standartı/i)).toBeInTheDocument();

    // Tab 5: Exam
    fireEvent.click(screen.getByTestId('satellite-tab-exam'));
    expect(screen.getByText(/Kosmik Rabitə və Peyk Naviqasiyası İmtahan Simulyatoru/i)).toBeInTheDocument();

    // Tab 6: Registry
    fireEvent.click(screen.getByTestId('satellite-tab-registry'));
    expect(screen.getByText(/Rəsmi Peyk Donanma Telemetriya Sertifikatı Verilməsi/i)).toBeInTheDocument();
  });

  it('filters active fleet in Radar tab by search query', () => {
    render(<SatelliteFleetModal isOpen={true} onClose={mockOnClose} />);

    const searchInput = screen.getByTestId('fleet-search-input');
    fireEvent.change(searchInput, { target: { value: 'SOCAR' } });

    expect(screen.getByText(/SOCAR Petroleum QSC & Caspian Gas Fleet/i)).toBeInTheDocument();
    expect(screen.queryByText(/BakuBus MMC/i)).not.toBeInTheDocument();
  });

  it('updates RTK status and jamming defense in RTK tab when sliders change', () => {
    render(<SatelliteFleetModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('satellite-tab-rtk'));

    const satSlider = screen.getByTestId('satellites-tracked-slider');
    fireEvent.change(satSlider, { target: { value: '30' } });

    const cn0Slider = screen.getByTestId('cn0-slider');
    fireEvent.change(cn0Slider, { target: { value: '48' } });

    expect(screen.getByText(/RTK Mövqetmə Analizi/i)).toBeInTheDocument();
  });

  it('interacts with units slider and updates total fee in Calculator tab', () => {
    render(<SatelliteFleetModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('satellite-tab-calculator'));

    const unitsSlider = screen.getByTestId('fleet-units-slider');
    fireEvent.change(unitsSlider, { target: { value: '50' } });

    expect(screen.getByText(/Həcm Endirimi \(Donanma Güzəşti\):/i)).toBeInTheDocument();
  });

  it('toggles checklist items and supports Check All in Checklist tab', () => {
    render(<SatelliteFleetModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('satellite-tab-checklist'));

    const checkAllBtn = screen.getByTestId('check-all-btn');
    fireEvent.click(checkAllBtn);

    expect(screen.getAllByText(/100%/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/TAM UYĞUNDUR/i)).toBeInTheDocument();
  });

  it('allows answering exam questions and clicking Quick Fill in Exam tab', () => {
    render(<SatelliteFleetModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('satellite-tab-exam'));

    const quickFillBtn = screen.getByTestId('quick-fill-exam-btn');
    fireEvent.click(quickFillBtn);

    expect(screen.getAllByText(/100%/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/ƏLA NƏTİCƏ/i)).toBeInTheDocument();
  });

  it('submits certificate form, issues certificate, and copies certificate ID', () => {
    render(<SatelliteFleetModal isOpen={true} onClose={mockOnClose} targetCar={mockTargetCar} />);
    fireEvent.click(screen.getByTestId('satellite-tab-registry'));

    const plateInput = screen.getByTestId('cert-plate-input');
    fireEvent.change(plateInput, { target: { value: '10-AA-999' } });

    const submitBtn = screen.getByTestId('generate-cert-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByTestId('active-certificate-card')).toBeInTheDocument();
    expect(screen.getAllByText(/10-AA-999/i).length).toBeGreaterThanOrEqual(1);

    const copyBtn = screen.getByTestId('copy-cert-btn');
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
