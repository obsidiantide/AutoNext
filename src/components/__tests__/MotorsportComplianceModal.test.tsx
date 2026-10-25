import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MotorsportComplianceModal } from '../MotorsportComplianceModal';
import { Vehicle } from '../../types/vehicle';

const mockVehicle: Vehicle = {
  id: 'v-bmw-m3',
  title: 'BMW M3 CSL Track Spec',
  vin: 'WBA330000AA099881',
  make: 'BMW',
  model: 'M3 CSL',
  year: 2022,
  priceAzn: 95000,
  mileageKm: 18000,
  engineVolumeLiters: 3.0,
  fuelType: 'petrol',
  transmission: 'automatic',
  drivetrain: 'rwd',
  powerHp: 510,
  fuelConsumptionLPer100Km: 10.5,
  bodyType: 'coupe',
  color: 'Alpine White',
  interiorColor: 'Black',
  interiorMaterial: 'leather',
  city: 'Baku',
  images: ['https://example.com/bmw.jpg'],
  features: ['Carbon Bucket Seats', 'M Differential', 'Adaptive M Suspension'],
  damageReport: [],
  seller: {
    id: 's1',
    name: 'Baku Motorsport Hub',
    phone: '+994 50 123 45 67',
    type: 'autocenter',
    rating: 4.9,
    reviewsCount: 38,
    verifiedIdentity: true,
    memberSinceYear: 2020,
    city: 'Baku',
  },
  valuation: {
    status: 'good_deal',
    percentageDiff: -3,
    avgMarketPriceAzn: 98000,
    minMarketPriceAzn: 92000,
    maxMarketPriceAzn: 105000,
    confidenceScore: 95,
    priceHistoryTrend: [],
  },
  isVerified: true,
  hasCustomsCleared: true,
  isCreditAvailable: true,
  isBarterAvailable: false,
  publishedDate: '2026-01-01T10:00:00Z',
  viewsCount: 520,
  description: 'Track-ready BMW M3 CSL.',
};

describe('MotorsportComplianceModal Component', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <MotorsportComplianceModal
        isOpen={false}
        vehicle={mockVehicle}
        currency="AZN"
        onClose={onCloseMock}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default anti-hooliganism tab when open', () => {
    render(
      <MotorsportComplianceModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        onClose={onCloseMock}
      />
    );

    expect(screen.getByTestId('motorsport-compliance-modal')).toBeInTheDocument();
    expect(
      screen.getByText(/Avtomobil İdmanı, Trek Günləri & "Avtoxuliqanlığa Yox" Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('anti-hooliganism-tab-content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <MotorsportComplianceModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        onClose={onCloseMock}
      />
    );

    const closeBtn = screen.getByTestId('motorsport-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('switches between all 5 navigation tabs cleanly', () => {
    render(
      <MotorsportComplianceModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        onClose={onCloseMock}
      />
    );

    // Switch to Scrutineering
    fireEvent.click(screen.getByTestId('tab-scrutineering'));
    expect(screen.getByTestId('scrutineering-tab-content')).toBeInTheDocument();

    // Switch to Tracks & Booking
    fireEvent.click(screen.getByTestId('tab-tracks-booking'));
    expect(screen.getByTestId('tracks-booking-tab-content')).toBeInTheDocument();

    // Switch to Exam
    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByTestId('exam-tab-content')).toBeInTheDocument();

    // Switch to Passport & Registry
    fireEvent.click(screen.getByTestId('tab-passport-registry'));
    expect(screen.getByTestId('passport-registry-tab-content')).toBeInTheDocument();

    // Switch back to Anti-hooliganism
    fireEvent.click(screen.getByTestId('tab-anti-hooliganism'));
    expect(screen.getByTestId('anti-hooliganism-tab-content')).toBeInTheDocument();
  });

  it('interacts with violation checkboxes and updates sanctions display', () => {
    render(
      <MotorsportComplianceModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        onClose={onCloseMock}
      />
    );

    // Initially safe
    expect(screen.getByText('TƏHLÜKƏSİZ')).toBeInTheDocument();
    expect(screen.getByText('0 AZN')).toBeInTheDocument();

    // Check drift attempt
    const driftCheckbox = screen.getByLabelText(/Qəsdən Yana Sürüşmə/i);
    fireEvent.click(driftCheckbox);

    // Should now show 500 - 1000 AZN and AVTOXULİQANLIQ / HƏBS
    expect(screen.getByText(/500 – 1000 AZN/i)).toBeInTheDocument();
    expect(screen.getByText(/İnzibati Həbs: 15–30 GÜN/i)).toBeInTheDocument();

    // Check repeat within one year
    const repeatCheckbox = screen.getByLabelText(/TƏKRAR Törədilməsi/i);
    fireEvent.click(repeatCheckbox);

    expect(screen.getByText(/1500 – 2000 AZN/i)).toBeInTheDocument();
    expect(screen.getByText(/İnzibati Həbs: 30–60 GÜN/i)).toBeInTheDocument();
  });

  it('selects vehicle preset and updates scrutiny score in scrutineering tab', () => {
    render(
      <MotorsportComplianceModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        onClose={onCloseMock}
      />
    );

    fireEvent.click(screen.getByTestId('tab-scrutineering'));

    // Click on Porsche 911 GT3 preset
    const porschePresetBtn = screen.getByText(/Porsche 911 GT3/i);
    fireEvent.click(porschePresetBtn);

    // Porsche preset has 100% score
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText(/10 \/ 10 Standart Tamamlandı/i)).toBeInTheDocument();
  });

  it('selects track and calculates booking price in tracks tab', () => {
    render(
      <MotorsportComplianceModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        onClose={onCloseMock}
      />
    );

    fireEvent.click(screen.getByTestId('tab-tracks-booking'));

    // Click on Ələt track
    const alatTrack = screen.getByText(/Ələt Beynəlxalq Motorsport Kompleksi/i);
    fireEvent.click(alatTrack);

    expect(screen.getByText(/3420m • 18 Döngə/i)).toBeInTheDocument();

    // Click booking button
    const bookBtn = screen.getByText(/Trek Gününü Təsdiq Et/i);
    fireEvent.click(bookBtn);

    expect(screen.getByText(/Rezervasiya Təsdiqləndi!/i)).toBeInTheDocument();
  });

  it('answers exam questions and checks theoretical exam results', () => {
    render(
      <MotorsportComplianceModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        onClose={onCloseMock}
      />
    );

    fireEvent.click(screen.getByTestId('tab-exam'));

    // Answer first question
    const firstQuestionOptions = screen.getAllByRole('button', {
      name: /İXM Maddə 511.1 üzrə 500-1000 AZN cərimə/i,
    });
    fireEvent.click(firstQuestionOptions[0]);

    // Submit answers
    const submitBtn = screen.getByText(/Cavabları Yoxla/i);
    fireEvent.click(submitBtn);

    // Score should be displayed
    expect(screen.getByText(/İmtahan Balı:/i)).toBeInTheDocument();
  });

  it('generates passport and filters registry items in passport tab', () => {
    render(
      <MotorsportComplianceModal
        isOpen={true}
        vehicle={mockVehicle}
        currency="AZN"
        onClose={onCloseMock}
      />
    );

    fireEvent.click(screen.getByTestId('tab-passport-registry'));

    expect(screen.getByText(/İDMAN TEXNİKİ PASPORTU/i)).toBeInTheDocument();

    // Search query in registry
    const searchInput = screen.getByPlaceholderText(/Nömrə, VIN, pilot və ya model axtar/i);
    fireEvent.change(searchInput, { target: { value: 'Silvia' } });

    expect(screen.getByText(/Nissan Silvia S15/i)).toBeInTheDocument();
  });
});
