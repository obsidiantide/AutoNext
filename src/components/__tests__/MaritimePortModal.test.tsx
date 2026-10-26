import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MaritimePortModal } from '../MaritimePortModal';
import { Vehicle } from '../../types/vehicle';

const mockVehicle = {
  id: 'veh-1',
  title: 'Toyota Land Cruiser 300',
  make: 'Toyota',
  model: 'Land Cruiser 300',
  year: 2024,
  priceAzn: 155000,
  mileageKm: 12000,
  city: 'Bakı',
  transmission: 'automatic',
  fuelType: 'petrol',
  bodyType: 'suv',
  drivetrain: '4wd',
  engineVolumeLiters: 3.5,
  powerHp: 415,
  fuelConsumptionLPer100Km: 12.1,
  color: 'Ağ Mirvari',
  vin: 'JTMHZ01A204918231',
  description: 'Əla vəziyyətdə Toyota Land Cruiser 300',
  images: ['https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=600&q=80'],
  features: ['Dəri salon', '360 kamera', 'DiffLock'],
  seller: {
    id: 'seller-1',
    name: 'Elmir Qasımov',
    phone: '+994 50 123 45 67',
    type: 'private',
    rating: 4.9,
    reviewsCount: 38,
    verifiedIdentity: true,
    memberSinceYear: 2021,
    city: 'Bakı',
  },
  publishedAt: '2026-10-25',
} as unknown as Vehicle;

describe('MaritimePortModal Component', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <MaritimePortModal
        isOpen={false}
        onClose={onCloseMock}
        currency="AZN"
        initialVehicle={mockVehicle}
      />
    );
    expect(screen.queryByTestId('maritime-port-modal')).toBeNull();
  });

  it('renders modal header, title, and default calculator tab when open', () => {
    render(
      <MaritimePortModal
        isOpen={true}
        onClose={onCloseMock}
        currency="AZN"
        initialVehicle={mockVehicle}
      />
    );

    expect(screen.getByTestId('maritime-port-modal')).toBeDefined();
    expect(screen.getByText('Dövlət Dəniz və Liman Agentliyi (DDLA) & ASCO')).toBeDefined();
    expect(screen.getByTestId('maritime-calculator-section')).toBeDefined();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <MaritimePortModal
        isOpen={true}
        onClose={onCloseMock}
        currency="AZN"
        initialVehicle={mockVehicle}
      />
    );

    const closeBtn = screen.getByTestId('maritime-port-close-btn');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(
      <MaritimePortModal
        isOpen={true}
        onClose={onCloseMock}
        currency="AZN"
        initialVehicle={mockVehicle}
      />
    );

    // Tab 2: Ports
    fireEvent.click(screen.getByTestId('tab-ports-btn'));
    expect(screen.getByTestId('ports-fleet-section')).toBeDefined();

    // Tab 3: Weather
    fireEvent.click(screen.getByTestId('tab-weather-btn'));
    expect(screen.getByTestId('weather-lashing-section')).toBeDefined();

    // Tab 4: Checklist
    fireEvent.click(screen.getByTestId('tab-checklist-btn'));
    expect(screen.getByTestId('checklist-section')).toBeDefined();

    // Tab 5: Exam
    fireEvent.click(screen.getByTestId('tab-exam-btn'));
    expect(screen.getByTestId('maritime-exam-section')).toBeDefined();

    // Tab 6: Boarding pass
    fireEvent.click(screen.getByTestId('tab-boarding-pass-btn'));
    expect(screen.getByTestId('boarding-pass-section')).toBeDefined();

    // Tab 7: Registry
    fireEvent.click(screen.getByTestId('tab-registry-btn'));
    expect(screen.getByTestId('registry-section')).toBeDefined();

    // Back to Calculator
    fireEvent.click(screen.getByTestId('tab-calculator-btn'));
    expect(screen.getByTestId('maritime-calculator-section')).toBeDefined();
  });

  it('applies vehicle presets and adjusts calculation', () => {
    render(
      <MaritimePortModal
        isOpen={true}
        onClose={onCloseMock}
        currency="AZN"
        initialVehicle={mockVehicle}
      />
    );

    // Click Actros TIR preset
    const actrosBtn = screen.getByTestId('preset-btn-preset-actros-tir');
    fireEvent.click(actrosBtn);

    // Check slider length changed to 16.5m
    const lengthSlider = screen.getByTestId('vehicle-length-slider') as HTMLInputElement;
    expect(parseFloat(lengthSlider.value)).toBe(16.5);
  });

  it('adjusts hazardous and EV checkboxes in calculator', () => {
    render(
      <MaritimePortModal
        isOpen={true}
        onClose={onCloseMock}
        currency="AZN"
        initialVehicle={mockVehicle}
      />
    );

    const hazmatCheckbox = screen.getByTestId('hazardous-checkbox') as HTMLInputElement;
    fireEvent.click(hazmatCheckbox);
    expect(hazmatCheckbox.checked).toBe(true);
    expect(screen.getByText(/IMDG Təhlükəli Yük Əlavəsi/i)).toBeDefined();

    const evCheckbox = screen.getByTestId('electric-vehicle-checkbox') as HTMLInputElement;
    fireEvent.click(evCheckbox);
    expect(evCheckbox.checked).toBe(true);
    expect(screen.getByText(/EV Termal İzolasiya & Yoxlama/i)).toBeDefined();
  });

  it('filters ports by country buttons in ports tab', () => {
    render(
      <MaritimePortModal
        isOpen={true}
        onClose={onCloseMock}
        currency="AZN"
        initialVehicle={mockVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-ports-btn'));

    // Filter Azerbaijan
    fireEvent.click(screen.getByTestId('port-filter-az'));
    expect(screen.getByTestId('port-card-port-alat-roro')).toBeDefined();
    expect(screen.queryByTestId('port-card-port-aktau')).toBeNull();

    // Filter Caspian (Foreign)
    fireEvent.click(screen.getByTestId('port-filter-caspian'));
    expect(screen.getByTestId('port-card-port-aktau')).toBeDefined();
    expect(screen.queryByTestId('port-card-port-alat-roro')).toBeNull();

    // Filter All
    fireEvent.click(screen.getByTestId('port-filter-all'));
    expect(screen.getByTestId('port-card-port-alat-roro')).toBeDefined();
    expect(screen.getByTestId('port-card-port-aktau')).toBeDefined();
  });

  it('interacts with weather sliders in weather tab', () => {
    render(
      <MaritimePortModal
        isOpen={true}
        onClose={onCloseMock}
        currency="AZN"
        initialVehicle={mockVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-weather-btn'));

    const beaufortSlider = screen.getByTestId('beaufort-slider');
    fireEvent.change(beaufortSlider, { target: { value: '7' } });

    expect(screen.getByText(/8-Nöqtəli Ağır Polad Zəncir/i)).toBeDefined();
    expect(screen.getByText(/Girişməli dəniz/i)).toBeDefined();

    const shipRollSlider = screen.getByTestId('ship-roll-slider');
    fireEvent.change(shipRollSlider, { target: { value: '22' } });
    expect(screen.getByText('22° dərəcə')).toBeDefined();
  });

  it('toggles checklist items and handles select-all in checklist tab', () => {
    render(
      <MaritimePortModal
        isOpen={true}
        onClose={onCloseMock}
        currency="AZN"
        initialVehicle={mockVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-checklist-btn'));

    // Toggle hermeticity
    const hermeticityRow = screen.getByTestId('checklist-row-chk-hermeticity');
    fireEvent.click(hermeticityRow);

    // Verify it caused a critical failure notice
    expect(screen.getByText(/Kritik təhlükəsizlik qaydası pozulub/i)).toBeDefined();

    // Click select-all
    fireEvent.click(screen.getByTestId('select-all-checklist-btn'));
    expect(screen.getByText(/Bərəyə minik icazəsi qeyd-şərtsiz təsdiq edildi/i)).toBeDefined();
  });

  it('completes theoretical exam and displays evaluation in exam tab', () => {
    render(
      <MaritimePortModal
        isOpen={true}
        onClose={onCloseMock}
        currency="AZN"
        initialVehicle={mockVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-exam-btn'));

    // Answer first question option 1
    const opt0 = screen.getByTestId('opt-m-q1-1');
    fireEvent.click(opt0);

    // Submit exam
    fireEvent.click(screen.getByTestId('submit-exam-btn'));
    expect(screen.getByTestId('exam-result-banner')).toBeDefined();

    // Reset exam
    fireEvent.click(screen.getByTestId('reset-exam-btn'));
    expect(screen.queryByTestId('exam-result-banner')).toBeNull();
  });

  it('generates a boarding pass and interacts with copy and print buttons', () => {
    const printMock = vi.fn();
    window.print = printMock;
    const writeTextMock = vi.fn().mockImplementation(() => Promise.resolve());
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <MaritimePortModal
        isOpen={true}
        onClose={onCloseMock}
        currency="AZN"
        initialVehicle={mockVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-boarding-pass-btn'));

    // Change driver name
    const driverInput = screen.getByTestId('driver-name-input');
    fireEvent.change(driverInput, { target: { value: 'Tural M. Məmmədov' } });

    // Generate
    fireEvent.click(screen.getByTestId('generate-pass-btn'));
    expect(screen.getByTestId('boarding-pass-ticket')).toBeDefined();
    expect(screen.getByText('Tural M. Məmmədov')).toBeDefined();

    // Print
    fireEvent.click(screen.getByTestId('print-pass-btn'));
    expect(printMock).toHaveBeenCalled();

    // Copy
    fireEvent.click(screen.getByTestId('copy-pass-id-btn'));
    expect(writeTextMock).toHaveBeenCalled();
  });

  it('searches and filters in the public registry tab', () => {
    render(
      <MaritimePortModal
        isOpen={true}
        onClose={onCloseMock}
        currency="AZN"
        initialVehicle={mockVehicle}
      />
    );

    fireEvent.click(screen.getByTestId('tab-registry-btn'));

    const searchInput = screen.getByTestId('registry-search-input');
    fireEvent.change(searchInput, { target: { value: '10-AA-555' } });

    expect(screen.getByTestId('registry-item-DDLA-PORT-2026-48291')).toBeDefined();
    expect(screen.queryByTestId('registry-item-DDLA-PORT-2026-91824')).toBeNull();

    // Click view pass
    fireEvent.click(screen.getByTestId('view-pass-DDLA-PORT-2026-48291'));
    expect(screen.getByTestId('boarding-pass-ticket')).toBeDefined();
  });
});
