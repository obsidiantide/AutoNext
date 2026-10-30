import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MaritimeSarModal } from '../MaritimeSarModal';

describe('MaritimeSarModal Component', () => {
  const mockOnClose = vi.fn();

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <MaritimeSarModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(<MaritimeSarModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText(/Dövlət Dəniz və Liman Agentliyi \(DDAA\) Xəzər SAR Portalı/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Axtarış-Xilasetmə, Bələdçi Katerləri, Sahil Mühafizəsi/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('tab-radar')).toBeInTheDocument();
    expect(screen.getByTestId('station-card-SAR_BAKU_BAY')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<MaritimeSarModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByTestId('maritime-sar-close-btn');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 8 navigation tabs', () => {
    render(<MaritimeSarModal isOpen={true} onClose={mockOnClose} />);

    // Tab 2: Calculator
    fireEvent.click(screen.getByTestId('tab-calculator'));
    expect(screen.getByText(/Dəniz Təxirəsalınmaz Əməliyyat Parametrləri/i)).toBeInTheDocument();
    expect(screen.getByTestId('golden-hour-banner')).toBeInTheDocument();

    // Tab 3: Weather
    fireEvent.click(screen.getByTestId('tab-weather'));
    expect(screen.getByText(/Dəniz Hidrometeoroloji & Dalğa Standı/i)).toBeInTheDocument();

    // Tab 4: Fleet
    fireEvent.click(screen.getByTestId('tab-fleet'));
    expect(screen.getByText(/Damen Stan Pilot 2205 Medevac & SAR Cutter/i)).toBeInTheDocument();

    // Tab 5: Checklist
    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByText(/10 Bəndlik SOLAS & Dəniz Axtarış-Xilasetmə/i)).toBeInTheDocument();

    // Tab 6: Exam
    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByText(/Dəniz Nəqliyyat Hüququ & IAMSAR Reqlamenti/i)).toBeInTheDocument();

    // Tab 7: Certificate
    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByText(/Aktiv Şəhadətnamə Mövcud Deyil/i)).toBeInTheDocument();

    // Tab 8: Registry
    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(screen.getByText(/Vahid Dəniz Axtarış-Xilasetmə \(SAR\) Əməliyyatları Reyestri/i)).toBeInTheDocument();
  });

  it('filters stations by search query in radar tab', () => {
    render(<MaritimeSarModal isOpen={true} onClose={mockOnClose} />);

    const searchInput = screen.getByTestId('station-search-input');
    fireEvent.change(searchInput, { target: { value: 'Çilov' } });

    expect(screen.getByText(/Çilov Adası Dərinlik və Neft Daşları SAR Bazası/i)).toBeInTheDocument();
    expect(screen.queryByText(/Neftçala Kür Çayı/i)).not.toBeInTheDocument();
  });

  it('applies quick emergency mission presets and transitions to calculator', () => {
    render(<MaritimeSarModal isOpen={true} onClose={mockOnClose} />);

    const presetBtn = screen.getByTestId('preset-PRESET_OIL_ROCKS_MEDEVAC');
    fireEvent.click(presetBtn);

    expect(screen.getByText(/Dəniz Təxirəsalınmaz Əməliyyat Parametrləri/i)).toBeInTheDocument();
    expect(screen.getByText(/22 Dəniz Mili/i)).toBeInTheDocument();
  });

  it('interacts with calculator sliders and toggles', () => {
    render(<MaritimeSarModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-calculator'));

    const distanceSlider = screen.getByTestId('distance-slider');
    fireEvent.change(distanceSlider, { target: { value: '35' } });
    expect(screen.getByText(/35 Dəniz Mili/i)).toBeInTheDocument();

    const diverCheckbox = screen.getByTestId('checkbox-divers');
    fireEvent.click(diverCheckbox);
    expect(diverCheckbox).toBeChecked();
  });

  it('interacts with weather tab sliders and environmental toggles', () => {
    render(<MaritimeSarModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-weather'));

    const waveSlider = screen.getByTestId('wave-height-slider');
    fireEvent.change(waveSlider, { target: { value: '2.5' } });
    expect(screen.getByText(/2.5 Metr/i)).toBeInTheDocument();

    const windSlider = screen.getByTestId('wind-speed-slider');
    fireEvent.change(windSlider, { target: { value: '30' } });
    expect(screen.getByText(/30 Knot/i)).toBeInTheDocument();

    const nightCheckbox = screen.getByTestId('checkbox-night');
    fireEvent.click(nightCheckbox);
    expect(nightCheckbox).toBeChecked();
  });

  it('toggles checklist items and uses Bütün Bəndləri Təsdiqlə button', () => {
    render(<MaritimeSarModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-checklist'));

    const item = screen.getByTestId('checklist-item-CHK_EPIRB_SART');
    fireEvent.click(item);
    expect(screen.getByText(/1 \/ 10/i)).toBeInTheDocument();

    const checkAllBtn = screen.getByTestId('check-all-btn');
    fireEvent.click(checkAllBtn);
    expect(screen.getByText(/10 \/ 10/i)).toBeInTheDocument();
  });

  it('answers exam questions, submits exam, and displays grade result', () => {
    render(<MaritimeSarModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-exam'));

    const optBtn = screen.getByTestId('exam-option-EXAM_SAR_01-1');
    fireEvent.click(optBtn);

    const submitBtn = screen.getByTestId('submit-exam-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByTestId('exam-result-badge')).toBeInTheDocument();

    const resetBtn = screen.getByTestId('reset-exam-btn');
    fireEvent.click(resetBtn);
    expect(screen.getByTestId('submit-exam-btn')).toBeInTheDocument();
  });

  it('generates an official clearance certificate, copies code, and triggers print', () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<MaritimeSarModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-calculator'));

    const issueBtn = screen.getByTestId('issue-sar-cert-btn');
    fireEvent.click(issueBtn);

    expect(screen.getByTestId('active-certificate-view')).toBeInTheDocument();
    expect(screen.getByText(/SAR-CASPIAN-AZ-2026-/i)).toBeInTheDocument();

    const copyBtn = screen.getByTestId('copy-cert-btn');
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalled();

    const printBtn = screen.getByTestId('print-cert-btn');
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    printSpy.mockRestore();
  });

  it('filters public registry by search query', () => {
    render(<MaritimeSarModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-registry'));

    const registryInput = screen.getByTestId('registry-search-input');
    fireEvent.change(registryInput, { target: { value: '88102' } });

    expect(screen.getByTestId('registry-card-SAR-CASPIAN-AZ-2026-88102')).toBeInTheDocument();
    expect(screen.queryByTestId('registry-card-SAR-CASPIAN-AZ-2026-72419')).not.toBeInTheDocument();
  });
});
