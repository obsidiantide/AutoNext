import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DigitalTwinItsModal } from '../DigitalTwinItsModal';

describe('DigitalTwinItsModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    targetCar: null,
  };

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <DigitalTwinItsModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(<DigitalTwinItsModal {...defaultProps} />);
    expect(
      screen.getByText(/Milli Ağıllı Nəqliyyat Sistemi \(NITS\) & Rəqəmsal Əkiz 3D BIM Baku Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('tab-content-radar')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<DigitalTwinItsModal {...defaultProps} onClose={onClose} />);
    const closeBtn = screen.getByTestId('modal-close-btn');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 8 navigation tabs', () => {
    render(<DigitalTwinItsModal {...defaultProps} />);

    const tabs = [
      { id: 'vsl-sim', contentTestId: 'tab-content-vsl-sim' },
      { id: 'physics-flow', contentTestId: 'tab-content-physics-flow' },
      { id: 'weather-grip', contentTestId: 'tab-content-weather-grip' },
      { id: 'checklist', contentTestId: 'tab-content-checklist' },
      { id: 'exam', contentTestId: 'tab-content-exam' },
      { id: 'certificate', contentTestId: 'tab-content-certificate' },
      { id: 'registry', contentTestId: 'tab-content-registry' },
      { id: 'radar', contentTestId: 'tab-content-radar' },
    ];

    tabs.forEach(({ id, contentTestId }) => {
      const tabBtn = screen.getByTestId(`tab-btn-${id}`);
      fireEvent.click(tabBtn);
      expect(screen.getByTestId(contentTestId)).toBeInTheDocument();
    });
  });

  it('allows selecting a corridor in radar tab and switches to VSL sim', () => {
    render(<DigitalTwinItsModal {...defaultProps} />);

    const airportCard = screen.getByTestId('corridor-card-CORRIDOR_HEYDAR_ALIYEV_AVE');
    fireEvent.click(airportCard);

    expect(screen.getAllByText(/Hava Limanı Sürət Şosesi/i).length).toBeGreaterThanOrEqual(1);
  });

  it('applies quick scenario presets and updates telemetry in VSL sim tab', () => {
    render(<DigitalTwinItsModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-btn-vsl-sim'));
    expect(screen.getByTestId('tab-content-vsl-sim')).toBeInTheDocument();

    const shamakhiPresetBtn = screen.getByText(/Şamaxı Aşırımı/i);
    fireEvent.click(shamakhiPresetBtn);

    expect(screen.getAllByText(/QARA BUZ/i).length).toBeGreaterThanOrEqual(1);
  });

  it('toggles checklist items and marks all compliant on select-all click', () => {
    render(<DigitalTwinItsModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-btn-checklist'));
    expect(screen.getByTestId('tab-content-checklist')).toBeInTheDocument();

    const selectAllBtn = screen.getByTestId('checklist-select-all-btn');
    fireEvent.click(selectAllBtn);

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('TAM UYĞUNDUR')).toBeInTheDocument();
  });

  it('completes exam questions and submits for score evaluation', () => {
    render(<DigitalTwinItsModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-btn-exam'));
    expect(screen.getByTestId('tab-content-exam')).toBeInTheDocument();

    const q1Opt = screen.getByTestId('exam-q1-opt1');
    fireEvent.click(q1Opt);

    const submitBtn = screen.getByTestId('exam-submit-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Nəticə:/i)).toBeInTheDocument();
  });

  it('handles certificate generation, copying hash, and print trigger', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const copySpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText: copySpy } });

    render(<DigitalTwinItsModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-btn-certificate'));
    expect(screen.getByTestId('tab-content-certificate')).toBeInTheDocument();

    const generateBtn = screen.getByTestId('generate-cert-btn');
    fireEvent.click(generateBtn);

    const copyBtn = screen.getByTestId('copy-hash-btn');
    fireEvent.click(copyBtn);
    expect(copySpy).toHaveBeenCalled();

    const printBtn = screen.getByTestId('print-cert-btn');
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    printSpy.mockRestore();
  });

  it('filters corridor certificates in public registry tab', () => {
    render(<DigitalTwinItsModal {...defaultProps} />);

    fireEvent.click(screen.getByTestId('tab-btn-registry'));
    expect(screen.getByTestId('tab-content-registry')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Sertifikat ID və ya qurum axtar/i);
    fireEvent.change(searchInput, { target: { value: '9041' } });

    expect(screen.getByText('NITS-TWIN-AZ-2026-9041')).toBeInTheDocument();
  });
});
