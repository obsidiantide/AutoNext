import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntercityMobilityModal } from '../IntercityMobilityModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

const mockVehicle = MOCK_VEHICLES[0];

describe('IntercityMobilityModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
    window.print = vi.fn();
  });

  it('renders modal when isOpen is true', () => {
    render(<IntercityMobilityModal isOpen={true} onClose={vi.fn()} vehicle={mockVehicle} />);

    expect(screen.getByTestId('intercity-mobility-modal')).toBeInTheDocument();
    expect(
      screen.getByText('Şəhərlərarası Müntəzəm Sərnişin Daşıma və Tender Qiymətləndirmə Portalı')
    ).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <IntercityMobilityModal isOpen={false} onClose={vi.fn()} vehicle={mockVehicle} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('calls onClose when close buttons are clicked', () => {
    const handleClose = vi.fn();
    render(<IntercityMobilityModal isOpen={true} onClose={handleClose} vehicle={mockVehicle} />);

    fireEvent.click(screen.getByTestId('modal-close-btn'));
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('modal-bottom-close-btn'));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('switches between all 7 tabs seamlessly', () => {
    render(<IntercityMobilityModal isOpen={true} onClose={vi.fn()} vehicle={mockVehicle} />);

    // Default: Tender
    expect(screen.getByText('AYNA Müsabiqə Balı')).toBeInTheDocument();

    // Tab 2: Routes
    fireEvent.click(screen.getByTestId('tab-btn-routes'));
    expect(
      screen.getByText('Azərbaycan Respublikası Üzrə 7 Strateji Şəhərlərarası Magistral Dəhliz')
    ).toBeInTheDocument();

    // Tab 3: Telemetry
    fireEvent.click(screen.getByTestId('tab-btn-telemetry'));
    expect(screen.getByText('Canlı Göyərtə Telemetriyası və Qayda Pozuntusu Radarı')).toBeInTheDocument();

    // Tab 4: Checklist
    fireEvent.click(screen.getByTestId('tab-btn-checklist'));
    expect(
      screen.getByText('10-Mərhələli Rəsmi Texniki və Təhlükəsizlik Reqlamenti')
    ).toBeInTheDocument();

    // Tab 5: Exam
    fireEvent.click(screen.getByTestId('tab-btn-exam'));
    expect(
      screen.getByText('AYNA & RİNN Şəhərlərarası Daşıyıcı İmtahan Simulyatoru (10 Sual)')
    ).toBeInTheDocument();

    // Tab 6: Certificate
    fireEvent.click(screen.getByTestId('tab-btn-certificate'));
    expect(screen.getByText('Lisenziya Hələ Tərtib Edilməyib')).toBeInTheDocument();

    // Tab 7: Registry
    fireEvent.click(screen.getByTestId('tab-btn-registry'));
    expect(screen.getByText('AYNA Vahid Açıq Daşıyıcı və Lisenziya Reyestri')).toBeInTheDocument();
  });

  it('applies bus fleet presets correctly', () => {
    render(<IntercityMobilityModal isOpen={true} onClose={vi.fn()} vehicle={mockVehicle} />);

    // Apply preset 3 (BYD Electric)
    fireEvent.click(screen.getByTestId('preset-btn-bus-3'));

    // Check that preset-3 vehicle plate is loaded in the input
    const plateInput = screen.getByDisplayValue('77-MB-707');
    expect(plateInput).toBeInTheDocument();
  });

  it('allows answering theoretical exam questions and submitting', () => {
    render(<IntercityMobilityModal isOpen={true} onClose={vi.fn()} vehicle={mockVehicle} />);

    fireEvent.click(screen.getByTestId('tab-btn-exam'));

    // Select option B for Q1 (correct option)
    fireEvent.click(screen.getByTestId('exam-q1-opt1'));

    // Submit exam
    fireEvent.click(screen.getByTestId('submit-exam-btn'));

    expect(screen.getByText(/Nəticə:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Hüquqi Əsas:/i).length).toBeGreaterThan(0);
  });

  it('generates a certificate and handles copy and print', () => {
    render(<IntercityMobilityModal isOpen={true} onClose={vi.fn()} vehicle={mockVehicle} />);

    // Generate from Tender tab
    fireEvent.click(screen.getByTestId('generate-cert-btn'));

    // Should switch to Certificate tab and show certificate sheet
    expect(screen.getByTestId('certificate-sheet')).toBeInTheDocument();
    expect(
      screen.getByText('MÜNTƏZƏM ŞƏHƏRLƏRARASI SƏRNİŞİN DAŞIMA LİSENZİYASI')
    ).toBeInTheDocument();

    // Click copy
    fireEvent.click(screen.getByTestId('copy-cert-btn'));
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    // Click print
    fireEvent.click(screen.getByTestId('print-cert-btn'));
    expect(window.print).toHaveBeenCalled();
  });

  it('filters public registry by search query', () => {
    render(<IntercityMobilityModal isOpen={true} onClose={vi.fn()} vehicle={mockVehicle} />);

    fireEvent.click(screen.getByTestId('tab-btn-registry'));

    const searchInput = screen.getByPlaceholderText('Qeydiyyat nişanı və ya nömrə...');
    fireEvent.change(searchInput, { target: { value: '99-JH-101' } });

    expect(screen.getByText('99-JH-101')).toBeInTheDocument();
    expect(screen.queryByText('10-TX-505')).not.toBeInTheDocument();
  });
});
