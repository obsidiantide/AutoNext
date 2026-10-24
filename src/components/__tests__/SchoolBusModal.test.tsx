import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SchoolBusModal } from '../SchoolBusModal';

describe('SchoolBusModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<SchoolBusModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default technical audit tab when open', () => {
    render(<SchoolBusModal {...defaultProps} />);
    expect(
      screen.getByText('Məktəbli Avtobusları və Şagird Daşınması Portalı')
    ).toBeInTheDocument();
    expect(screen.getByText(/UNECE R107 & Nazirlər Kabinetinin 141 №-li Qərarı/i)).toBeInTheDocument();
    expect(screen.getByTestId('technical-score')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<SchoolBusModal {...defaultProps} />);
    const closeBtn = screen.getByTestId('school-bus-close-btn');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 5 navigation tabs', () => {
    render(<SchoolBusModal {...defaultProps} />);

    // Tab 2: Driver & Chaperone
    fireEvent.click(screen.getByTestId('school-bus-tab-driver'));
    expect(screen.getByText(/Məktəbli Sürücüsü və Müşayiətçi \(Bələdçi\) Standartları/i)).toBeInTheDocument();
    expect(screen.getByTestId('driver-eligibility-badge')).toBeInTheDocument();

    // Tab 3: Routes & Pricing
    fireEvent.click(screen.getByTestId('school-bus-tab-routes'));
    expect(screen.getByText(/Məktəbli Marşrutu və Aylıq Xidmət Haqqı Kalkulyatoru/i)).toBeInTheDocument();
    expect(screen.getByTestId('monthly-student-fee')).toBeInTheDocument();

    // Tab 4: Registry
    fireEvent.click(screen.getByTestId('school-bus-tab-registry'));
    expect(screen.getByTestId('registry-search-input')).toBeInTheDocument();

    // Tab 5: Certificate
    fireEvent.click(screen.getByTestId('school-bus-tab-certificate'));
    expect(screen.getByTestId('cert-number-display')).toBeInTheDocument();
    expect(screen.getByTestId('copy-cert-btn')).toBeInTheDocument();
    expect(screen.getByTestId('print-cert-btn')).toBeInTheDocument();

    // Back to Tab 1: Audit
    fireEvent.click(screen.getByTestId('school-bus-tab-audit'));
    expect(screen.getByTestId('technical-score')).toBeInTheDocument();
  });

  it('selects a different vehicle preset and updates checklist', () => {
    render(<SchoolBusModal {...defaultProps} />);

    const sprintePresetBtn = screen.getByTestId('preset-btn-bus_mercedes_sprinter');
    fireEvent.click(sprintePresetBtn);

    // Mercedes Sprinter preset has 2 deficiencies configured
    expect(screen.getByText(/Qüsur Aşkarlandı/i)).toBeInTheDocument();
  });

  it('toggles checklist items and recalculates score and fine amount', () => {
    render(<SchoolBusModal {...defaultProps} />);

    // Toggle off a checklist item
    const speedLimiterItem = screen.getByTestId('checklist-item-speedLimiter60kmh');
    fireEvent.click(speedLimiterItem);

    // Fine amount and deficiencies should appear
    expect(screen.getByTestId('fine-amount')).toBeInTheDocument();
  });

  it('handles driver qualifications input in Driver tab', () => {
    render(<SchoolBusModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('school-bus-tab-driver'));

    const categorySelect = screen.getByTestId('driver-license-category-select');
    fireEvent.change(categorySelect, { target: { value: 'B' } });

    // Driver should now be disqualified due to invalid B category
    expect(screen.getByText(/UYĞUNSUZLUQ AŞKARLANDI/i)).toBeInTheDocument();
  });

  it('calculates tuition fee and generates certificate from Routes tab', () => {
    render(<SchoolBusModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('school-bus-tab-routes'));

    const categorySelect = screen.getByTestId('calc-category-select');
    fireEvent.change(categorySelect, { target: { value: 'coach' } });

    const generateBtn = screen.getByTestId('generate-cert-btn');
    fireEvent.click(generateBtn);

    // Should transition to certificate tab
    expect(screen.getByTestId('cert-number-display')).toBeInTheDocument();
  });

  it('filters active registry permits by search query', () => {
    render(<SchoolBusModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('school-bus-tab-registry'));

    const searchInput = screen.getByTestId('registry-search-input');
    fireEvent.change(searchInput, { target: { value: '99-JS-412' } });

    expect(screen.getByText('99-JS-412')).toBeInTheDocument();
  });

  it('copies certificate info and triggers print', () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<SchoolBusModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('school-bus-tab-certificate'));

    const copyBtn = screen.getByTestId('copy-cert-btn');
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalled();

    const printBtn = screen.getByTestId('print-cert-btn');
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });
});
