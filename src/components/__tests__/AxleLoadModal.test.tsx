import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AxleLoadModal } from '../AxleLoadModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('AxleLoadModal Component', () => {
  const mockVehicle = MOCK_VEHICLES[0];

  it('renders modal header, title, and default calculator tab when open', () => {
    render(
      <AxleLoadModal
        isOpen={true}
        onClose={vi.fn()}
        currency="AZN"
        vehicle={mockVehicle}
      />
    );

    expect(screen.getByTestId('axle-load-modal')).toBeInTheDocument();
    expect(
      screen.getByText(/AYNA & BDYP Avtomatik Dinamik Tərəzi \(WIM\) & Ox Yükü Nəzarət Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/WIM-AZ-2026/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <AxleLoadModal
        isOpen={false}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <AxleLoadModal
        isOpen={true}
        onClose={onCloseMock}
      />
    );

    const closeBtn = screen.getByTestId('axle-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(
      <AxleLoadModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // Switch to Radar tab
    const radarTab = screen.getByTestId('axle-tab-radar');
    fireEvent.click(radarTab);
    expect(screen.getByPlaceholderText(/WIM stansiyası və ya magistral axtar/i)).toBeInTheDocument();

    // Switch to Bridge tab
    const bridgeTab = screen.getByTestId('axle-tab-bridge');
    fireEvent.click(bridgeTab);
    expect(screen.getByText(/Körpü və Aşırımların Dinamik Yük və Əyilmə/i)).toBeInTheDocument();

    // Switch to Checklist tab
    const checklistTab = screen.getByTestId('axle-tab-checklist');
    fireEvent.click(checklistTab);
    expect(screen.getByText(/10 Maddəlik Ağır Tonajlı Nəqliyyat Təhlükəsizlik Çeklisti/i)).toBeInTheDocument();

    // Switch to Exam tab
    const examTab = screen.getByTestId('axle-tab-exam');
    fireEvent.click(examTab);
    expect(screen.getByText(/AYNA & BDYP Çəki və Ox İntizamı Nəzəri İmtahanı/i)).toBeInTheDocument();

    // Switch to Certificate tab
    const certTab = screen.getByTestId('axle-tab-certificate');
    fireEvent.click(certTab);
    expect(screen.getByText(/Aktiv WIM Sertifikatı Mövcud Deyil/i)).toBeInTheDocument();

    // Switch to Registry tab
    const registryTab = screen.getByTestId('axle-tab-registry');
    fireEvent.click(registryTab);
    expect(screen.getByPlaceholderText(/Qeydiyyat nömrəsi və ya sertifikat ID axtar/i)).toBeInTheDocument();
  });

  it('applies a heavy haulage preset and updates values', () => {
    render(
      <AxleLoadModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // Click the second preset (MAN TGX Overweight)
    const presetBtn = screen.getByText(/10-TX-404/i);
    fireEvent.click(presetBtn);

    // Plate should update
    const plateInput = screen.getByDisplayValue('10-TX-404');
    expect(plateInput).toBeInTheDocument();
  });

  it('generates a new WIM certificate and transitions to certificate tab', () => {
    render(
      <AxleLoadModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const generateBtn = screen.getByTestId('generate-cert-btn');
    fireEvent.click(generateBtn);

    expect(screen.getByText(/RƏSMİ WIM AVTOMATİK ÇƏKİ & OX YÜKÜ SERTİFİKATI/i)).toBeInTheDocument();
    expect(screen.getByTestId('copy-cert-btn')).toBeInTheDocument();
    expect(screen.getByTestId('print-cert-btn')).toBeInTheDocument();
  });

  it('supports clipboard copy and print on certificate tab', () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });
    const printMock = vi.fn();
    window.print = printMock;

    render(
      <AxleLoadModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const generateBtn = screen.getByTestId('generate-cert-btn');
    fireEvent.click(generateBtn);

    const copyBtn = screen.getByTestId('copy-cert-btn');
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalled();

    const printBtn = screen.getByTestId('print-cert-btn');
    fireEvent.click(printBtn);
    expect(printMock).toHaveBeenCalled();
  });

  it('allows toggling checklist items and resets them', () => {
    render(
      <AxleLoadModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const checklistTab = screen.getByTestId('axle-tab-checklist');
    fireEvent.click(checklistTab);

    // Click select all
    const selectAllBtn = screen.getByText('Hamısını Seç');
    fireEvent.click(selectAllBtn);
    expect(screen.getByText('100%')).toBeInTheDocument();

    // Click reset
    const resetBtn = screen.getByText('Sıfırla');
    fireEvent.click(resetBtn);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('filters radar stations when searching', () => {
    render(
      <AxleLoadModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const radarTab = screen.getByTestId('axle-tab-radar');
    fireEvent.click(radarTab);

    const searchInput = screen.getByPlaceholderText(/WIM stansiyası və ya magistral axtar/i);
    fireEvent.change(searchInput, { target: { value: 'Giləzi' } });

    expect(screen.getByText(/Giləzi WIM Postu/i)).toBeInTheDocument();
  });

  it('filters registry records when typing in registry search', () => {
    render(
      <AxleLoadModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const registryTab = screen.getByTestId('axle-tab-registry');
    fireEvent.click(registryTab);

    const searchInput = screen.getByPlaceholderText(/Qeydiyyat nömrəsi və ya sertifikat ID axtar/i);
    fireEvent.change(searchInput, { target: { value: '99-ZZ-990' } });

    expect(screen.getByText('99-ZZ-990')).toBeInTheDocument();
  });
});
