import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TunnelSafeModal } from '../TunnelSafeModal';

describe('TunnelSafeModal Component Suite', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <TunnelSafeModal
        isOpen={false}
        onClose={mockOnClose}
        currency="AZN"
        language="az"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default radar view when open', () => {
    render(
      <TunnelSafeModal
        isOpen={true}
        onClose={mockOnClose}
        currency="AZN"
        language="az"
      />
    );

    expect(screen.getByTestId('tunnel-safe-modal')).toBeInTheDocument();
    expect(
      screen.getByText(/Magistral Dağ Tünellərində Yanğın Təhlükəsizliyi/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('radar-view')).toBeInTheDocument();
  });

  it('calls onClose when top close button or footer close button is clicked', () => {
    render(
      <TunnelSafeModal
        isOpen={true}
        onClose={mockOnClose}
        currency="AZN"
        language="az"
      />
    );

    const closeBtn = screen.getByTestId('tunnel-safe-close-btn');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    const footerCloseBtn = screen.getByRole('button', { name: /Bağla/i });
    fireEvent.click(footerCloseBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(
      <TunnelSafeModal
        isOpen={true}
        onClose={mockOnClose}
        currency="AZN"
        language="az"
      />
    );

    // Switch to SCADA
    fireEvent.click(screen.getByTestId('tab-scada'));
    expect(screen.getByTestId('scada-view')).toBeInTheDocument();

    // Switch to Vehicles
    fireEvent.click(screen.getByTestId('tab-vehicles'));
    expect(screen.getByTestId('vehicles-view')).toBeInTheDocument();

    // Switch to Checklist
    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByTestId('checklist-view')).toBeInTheDocument();

    // Switch to Exam
    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByTestId('exam-view')).toBeInTheDocument();

    // Switch to Certificate
    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByTestId('certificate-view')).toBeInTheDocument();

    // Switch to Registry
    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(screen.getByTestId('registry-view')).toBeInTheDocument();

    // Switch back to Radar
    fireEvent.click(screen.getByTestId('tab-radar'));
    expect(screen.getByTestId('radar-view')).toBeInTheDocument();
  });

  it('allows selecting different tunnel corridors in radar view', () => {
    render(
      <TunnelSafeModal
        isOpen={true}
        onClose={mockOnClose}
        currency="AZN"
        language="az"
      />
    );

    const lachinCard = screen.getByTestId('corridor-card-lachin-transit');
    fireEvent.click(lachinCard);
    expect(screen.getByText(/Seçilmiş: Laçın-1 Magistral Tranzit Dağ Tuneli/i)).toBeInTheDocument();
  });

  it('triggers emergency PA audio horn button without crashing', () => {
    render(
      <TunnelSafeModal
        isOpen={true}
        onClose={mockOnClose}
        currency="AZN"
        language="az"
      />
    );

    const sirenBtn = screen.getByTestId('audio-siren-btn');
    fireEvent.click(sirenBtn);
    expect(sirenBtn).toBeInTheDocument();
  });

  it('interacts with SCADA sliders and updates telemetry', () => {
    render(
      <TunnelSafeModal
        isOpen={true}
        onClose={mockOnClose}
        currency="AZN"
        language="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-scada'));

    const fireSlider = screen.getByLabelText(/Yanğın İstilik Ayrılma Gücü/i);
    fireEvent.change(fireSlider, { target: { value: '50' } });
    expect(screen.getAllByText(/50 MW/i).length).toBeGreaterThan(0);

    const velocitySlider = screen.getByLabelText(/Tünel Uzununa Hava Sürəti/i);
    fireEvent.change(velocitySlider, { target: { value: '4.5' } });
    expect(screen.getAllByText(/4.5 m\/s/i).length).toBeGreaterThan(0);
  });

  it('selects vehicle preset and calculates statutory fines under İXM', () => {
    render(
      <TunnelSafeModal
        isOpen={true}
        onClose={mockOnClose}
        currency="AZN"
        language="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-vehicles'));

    // Select HazMat tanker
    const tankerCard = screen.getByTestId('vehicle-card-preset-tanker');
    fireEvent.click(tankerCard);
    expect(screen.getByText(/100 MW/i)).toBeInTheDocument();

    // Check maneuver fine
    const maneuverCheckbox = screen.getByRole('checkbox', {
      name: /Tuneldə qadağan olunmuş dönmə və ya əks hərəkət/i
    });
    fireEvent.click(maneuverCheckbox);

    expect(screen.getByText(/Hesablanmış Cəmi Cərimə Məbləği:/i)).toBeInTheDocument();
  });

  it('manages checklist item selections, select-all, and reset', () => {
    render(
      <TunnelSafeModal
        isOpen={true}
        onClose={mockOnClose}
        currency="AZN"
        language="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-checklist'));

    const resetBtn = screen.getByTestId('checklist-reset');
    fireEvent.click(resetBtn);
    expect(screen.getByText('0 / 100 Bal')).toBeInTheDocument();

    const selectAllBtn = screen.getByTestId('checklist-select-all');
    fireEvent.click(selectAllBtn);
    expect(screen.getByText('100 / 100 Bal')).toBeInTheDocument();
  });

  it('answers exam questions and submits exam for scoring', () => {
    render(
      <TunnelSafeModal
        isOpen={true}
        onClose={mockOnClose}
        currency="AZN"
        language="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-exam'));

    const submitBtn = screen.getByTestId('submit-exam-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Nəticə:/i)).toBeInTheDocument();
  });

  it('generates a new official certificate and handles print/copy actions', () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve())
      }
    });

    render(
      <TunnelSafeModal
        isOpen={true}
        onClose={mockOnClose}
        currency="AZN"
        language="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-certificate'));

    const generateBtn = screen.getByTestId('generate-cert-btn');
    fireEvent.click(generateBtn);

    expect(screen.getByTestId('certificate-card')).toBeInTheDocument();
    expect(screen.getByText(/RƏSMİ TUNEL TƏHLÜKƏSİZLİK SERTİFİKATI/i)).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', { name: /ID Kopyala/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('filters active registry entries in public registry tab', () => {
    render(
      <TunnelSafeModal
        isOpen={true}
        onClose={mockOnClose}
        currency="AZN"
        language="az"
      />
    );

    fireEvent.click(screen.getByTestId('tab-registry'));

    const searchInput = screen.getByPlaceholderText(/Qeydiyyat nişanı və ya ID/i);
    fireEvent.change(searchInput, { target: { value: 'Murovdağ' } });

    expect(
      screen.getByTestId('registry-item-TUNNEL-SAFE-AZ-2026-90412')
    ).toBeInTheDocument();
  });
});
