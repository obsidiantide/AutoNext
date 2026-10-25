import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiplomaticComplianceModal } from '../DiplomaticComplianceModal';
import { Vehicle } from '../../types/vehicle';

const mockVehicle: Vehicle = {
  id: 'v-test-dip',
  title: 'Mercedes-Benz S 580',
  vin: 'W1K2231761A490999',
  make: 'Mercedes-Benz',
  model: 'S 580',
  year: 2024,
  priceAzn: 250000,
  mileageKm: 12000,
  engineVolumeLiters: 4.0,
  fuelType: 'petrol',
  transmission: 'automatic',
  drivetrain: 'awd',
  bodyType: 'sedan',
  powerHp: 503,
  fuelConsumptionLPer100Km: 10.5,
  color: 'Black',
  interiorColor: 'Black',
  interiorMaterial: 'leather',
  city: 'Baku',
  viewsCount: 150,
  publishedDate: '2026-01-01',
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  description: 'Diplomatic executive flagship',
  images: ['/test.jpg'],
  features: ['Leather', 'Armor'],
  damageReport: [],
  valuation: {
    status: 'fair_price',
    percentageDiff: 0,
    avgMarketPriceAzn: 250000,
    minMarketPriceAzn: 230000,
    maxMarketPriceAzn: 270000,
    confidenceScore: 95,
    priceHistoryTrend: []
  },
  seller: {
    id: 's-dip',
    name: 'State Protocol Dept',
    type: 'official_dealer',
    phone: '+994124447320',
    city: 'Baku',
    rating: 5.0,
    reviewsCount: 12,
    verifiedIdentity: true,
    memberSinceYear: 2020
  }
};

describe('DiplomaticComplianceModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve())
      }
    });
    vi.spyOn(window, 'print').mockImplementation(() => {});
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <DiplomaticComplianceModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default tab (checklist) when open', () => {
    render(<DiplomaticComplianceModal isOpen={true} onClose={vi.fn()} vehicle={mockVehicle} />);
    expect(screen.getByText(/XİN & BDYP Diplomatik Korpus və Beynəlxalq Nümayəndəliklər Portalı/i)).toBeInTheDocument();
    expect(screen.getByTestId('tab-content-checklist')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(<DiplomaticComplianceModal isOpen={true} onClose={onCloseMock} />);
    const closeBtn = screen.getByTestId('diplomatic-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 6 navigation tabs', () => {
    render(<DiplomaticComplianceModal isOpen={true} onClose={vi.fn()} />);

    // Switch to Plate Visualizer
    fireEvent.click(screen.getByTestId('tab-plate'));
    expect(screen.getByTestId('tab-content-plate')).toBeInTheDocument();

    // Switch to Customs
    fireEvent.click(screen.getByTestId('tab-customs'));
    expect(screen.getByTestId('tab-content-customs')).toBeInTheDocument();

    // Switch to Missions Radar
    fireEvent.click(screen.getByTestId('tab-missions'));
    expect(screen.getByTestId('tab-content-missions')).toBeInTheDocument();

    // Switch to Exam
    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByTestId('tab-content-exam')).toBeInTheDocument();

    // Switch to Certificate
    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByTestId('tab-content-certificate')).toBeInTheDocument();

    // Switch back to Checklist
    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByTestId('tab-content-checklist')).toBeInTheDocument();
  });

  it('applies quick vehicle presets and updates input parameters', () => {
    render(<DiplomaticComplianceModal isOpen={true} onClose={vi.fn()} />);

    // Click on US Embassy preset
    const usPresetBtn = screen.getByTestId('preset-btn-pre_usa_dcm');
    fireEvent.click(usPresetBtn);

    // Switch to plate tab to verify updated country code and plate display
    fireEvent.click(screen.getByTestId('tab-plate'));
    expect(screen.getByTestId('plate-country-code').textContent).toBe('002');
    expect(screen.getByTestId('plate-category').textContent).toBe('CD');
  });

  it('toggles checklist items and recalculates score percentage', () => {
    render(<DiplomaticComplianceModal isOpen={true} onClose={vi.fn()} />);

    const firstCheckItem = screen.getByTestId('checklist-item-chk_xin_accreditation');
    expect(firstCheckItem).toBeInTheDocument();

    const scoreElem = screen.getByTestId('compliance-score-percentage');
    expect(scoreElem).toHaveTextContent('100%');

    // Toggle off
    fireEvent.click(firstCheckItem);
    expect(scoreElem).toHaveTextContent('90%');

    // Toggle back on
    fireEvent.click(firstCheckItem);
    expect(scoreElem).toHaveTextContent('100%');
  });

  it('updates plate visualizer when inputs change', () => {
    render(<DiplomaticComplianceModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-plate'));

    // Change category to 'D'
    const catSelect = screen.getByTestId('select-category');
    fireEvent.change(catSelect, { target: { value: 'D' } });
    expect(screen.getByTestId('plate-category').textContent).toBe('D');

    // Change sequence to '077'
    const seqInput = screen.getByTestId('input-plate-sequence');
    fireEvent.change(seqInput, { target: { value: '077' } });
    expect(screen.getByTestId('plate-seq').textContent).toBe('077');
  });

  it('adjusts sliders in customs tab and recalculates duties', () => {
    render(<DiplomaticComplianceModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-customs'));

    const cifSlider = screen.getByTestId('slider-cif-value');
    fireEvent.change(cifSlider, { target: { value: '250000' } });

    const engineSlider = screen.getByTestId('slider-engine-cc');
    fireEvent.change(engineSlider, { target: { value: '4500' } });

    const monthsSlider = screen.getByTestId('slider-months-service');
    fireEvent.change(monthsSlider, { target: { value: '60' } });

    // With 60 months, resale duty is fully exempt (0 AZN)
    expect(screen.getByText(/✓ Tam 0% Azad Olunub/i)).toBeInTheDocument();
  });

  it('filters embassies radar by search input and type filter', () => {
    render(<DiplomaticComplianceModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-missions'));

    const searchInput = screen.getByTestId('search-missions-input');
    fireEvent.change(searchInput, { target: { value: 'Türkiyə' } });

    expect(screen.getByTestId('mission-card-mis_turkey')).toBeInTheDocument();

    // Filter by international organizations
    const typeFilter = screen.getByTestId('filter-mission-type');
    fireEvent.change(typeFilter, { target: { value: 'international_org' } });
    fireEvent.change(searchInput, { target: { value: '' } });

    expect(screen.getByTestId('mission-card-mis_un')).toBeInTheDocument();
    expect(screen.queryByTestId('mission-card-mis_turkey')).not.toBeInTheDocument();
  });

  it('answers exam questions, grades exam, and shows explanations', () => {
    render(<DiplomaticComplianceModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-exam'));

    // Answer Q1 with correct option A
    const q1OptionA = screen.getByTestId('q-1-opt-0');
    fireEvent.click(q1OptionA);

    // Answer Q2 with correct option A
    const q2OptionA = screen.getByTestId('q-2-opt-0');
    fireEvent.click(q2OptionA);

    // Submit exam
    const submitBtn = screen.getByTestId('submit-exam-btn');
    fireEvent.click(submitBtn);

    // Explanations should be visible
    expect(screen.getAllByText(/Hüquqi Əsas:/i).length).toBeGreaterThan(0);
  });

  it('generates certificate from checklist, copies code, and handles print', () => {
    render(<DiplomaticComplianceModal isOpen={true} onClose={vi.fn()} />);

    // Generate from checklist
    const genBtn = screen.getByTestId('generate-cert-from-checklist-btn');
    fireEvent.click(genBtn);

    expect(screen.getByTestId('official-certificate-view')).toBeInTheDocument();

    // Copy certificate
    const copyBtn = screen.getByTestId('copy-certificate-btn');
    fireEvent.click(copyBtn);
    expect(screen.getByText(/Kopyalandı!/i)).toBeInTheDocument();

    // Print certificate
    const printBtn = screen.getByTestId('print-certificate-btn');
    fireEvent.click(printBtn);
    expect(window.print).toHaveBeenCalled();
  });
});
