import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AfezLogisticsModal } from '../AfezLogisticsModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('AfezLogisticsModal Component', () => {
  const mockVehicle = MOCK_VEHICLES[0];

  it('renders modal header, title and default calculator tab when open', () => {
    render(
      <AfezLogisticsModal
        isOpen={true}
        onClose={vi.fn()}
        currency="AZN"
        initialVehicle={mockVehicle}
      />
    );

    expect(screen.getByTestId('afez-logistics-modal')).toBeInTheDocument();
    expect(screen.getByText(/Ələt Azad İqtisadi Zonası \(AFEZ\) Multimodal Logistika və Gömrük Portalı/i)).toBeInTheDocument();
    expect(screen.getByText(/0% Vergi və Gömrük Qənaəti/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <AfezLogisticsModal
        isOpen={false}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <AfezLogisticsModal
        isOpen={true}
        onClose={onCloseMock}
      />
    );

    const closeBtn = screen.getByTestId('afez-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 6 navigation tabs', () => {
    render(
      <AfezLogisticsModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // Switch to Terminals tab
    const terminalsTab = screen.getByTestId('afez-tab-terminals');
    fireEvent.click(terminalsTab);
    expect(screen.getByText(/Strateji Hub/i)).toBeInTheDocument();

    // Switch to Telemetry tab
    const telemetryTab = screen.getByTestId('afez-tab-telemetry');
    fireEvent.click(telemetryTab);
    expect(screen.getByText(/SOLAS Chapter VI Reg 2 - Yoxlanılmış Ümumi Kütlə \(VGM\) Standı/i)).toBeInTheDocument();

    // Switch to Checklist tab
    const checklistTab = screen.getByTestId('afez-tab-checklist');
    fireEvent.click(checklistTab);
    expect(screen.getByText(/AFEZ Gömrük & Təhlükəsizlik Buraxılış Audit Balı/i)).toBeInTheDocument();

    // Switch to Exam tab
    const examTab = screen.getByTestId('afez-tab-exam');
    fireEvent.click(examTab);
    expect(screen.getByText(/AFEZ & Multimodal Logistika Qaydaları üzrə Nəzəri Test/i)).toBeInTheDocument();

    // Switch to Certificate tab
    const certTab = screen.getByTestId('afez-tab-certificate');
    fireEvent.click(certTab);
    expect(screen.getByText(/Vahid İctimai AFEZ-TIR Elektron Reyestri/i)).toBeInTheDocument();

    // Switch back to Calculator tab
    const calcTab = screen.getByTestId('afez-tab-calculator');
    fireEvent.click(calcTab);
    expect(screen.getByText(/Konteyner və Dəhliz Parametrlərinin Tənzimlənməsi/i)).toBeInTheDocument();
  });

  it('filters terminals by search query in terminals tab', () => {
    render(
      <AfezLogisticsModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const terminalsTab = screen.getByTestId('afez-tab-terminals');
    fireEvent.click(terminalsTab);

    const searchInput = screen.getByPlaceholderText(/Terminal adı, kod, rayon və ya gömrük postu/i);
    fireEvent.change(searchInput, { target: { value: 'Silk Way' } });

    expect(screen.getByText(/Silk Way Azad İqtisadi Zona Hava-Dəniz Multimodal Yük Terminalı/i)).toBeInTheDocument();
  });

  it('interacts with checklist and toggles items', () => {
    render(
      <AfezLogisticsModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const checklistTab = screen.getByTestId('afez-tab-checklist');
    fireEvent.click(checklistTab);

    const selectAllBtn = screen.getByText(/Hamısını/i);
    fireEvent.click(selectAllBtn);
    expect(screen.getByText(/AFEZ Gömrük & Təhlükəsizlik Buraxılış Audit Balı/i)).toBeInTheDocument();
  });

  it('answers exam questions and toggles results', () => {
    render(
      <AfezLogisticsModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const examTab = screen.getByTestId('afez-tab-exam');
    fireEvent.click(examTab);

    const resultBtn = screen.getByText(/Nəticəni Yoxla/i);
    fireEvent.click(resultBtn);

    expect(screen.getByText(/Nəticəni Gizlət/i)).toBeInTheDocument();
  });

  it('generates a new certificate and supports copy and print actions', () => {
    render(
      <AfezLogisticsModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const certTab = screen.getByTestId('afez-tab-certificate');
    fireEvent.click(certTab);

    const generateBtn = screen.getByTestId('generate-afez-certificate-btn');
    fireEvent.click(generateBtn);

    expect(screen.getByText(/RƏSMİ BURAXILIŞ TALONU • AFEZ-TIR-2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Kodu Kopyala/i)).toBeInTheDocument();

    const copyBtn = screen.getByText(/Kodu Kopyala/i);
    fireEvent.click(copyBtn);

    const printBtn = screen.getByText(/Çap Et/i);
    fireEvent.click(printBtn);
  });

  it('searches within the public registry table in certificate tab', () => {
    render(
      <AfezLogisticsModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const certTab = screen.getByTestId('afez-tab-certificate');
    fireEvent.click(certTab);

    const searchInput = screen.getByPlaceholderText(/Sertifikat nömrəsi və ya konteyner nömrəsi/i);
    fireEvent.change(searchInput, { target: { value: 'MSKU-749215-3' } });

    expect(screen.getByText(/AFEZ-TIR-2026-94812/i)).toBeInTheDocument();
  });
});
