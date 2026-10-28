import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ElectronicSealModal } from '../ElectronicSealModal';
import { MOCK_VEHICLES } from '../../data/mockVehicles';

describe('ElectronicSealModal Component', () => {
  const mockVehicle = MOCK_VEHICLES[0];

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default telemetry stand when open', () => {
    render(
      <ElectronicSealModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
        currency="AZN"
        lang="az"
      />
    );

    expect(
      screen.getByText(/Gömrük Elektron İntellektual Plomb & Tranzit Geofencing Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Telemetriya Standı/i)).toBeInTheDocument();
    expect(screen.getByText(/E-Lock İnteraktiv Panel/i)).toBeInTheDocument();
  });

  it('does not render anything when isOpen is false', () => {
    const { container } = render(
      <ElectronicSealModal
        isOpen={false}
        onClose={mockOnClose}
        vehicle={mockVehicle}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <ElectronicSealModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /Bağla/i });
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches between all navigation tabs cleanly', () => {
    render(
      <ElectronicSealModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
      />
    );

    // Switch to Corridor tab
    fireEvent.click(screen.getByText(/Dəhliz Geofencing/i));
    expect(
      screen.getByText(/Azərbaycan Respublikasının Strateji Tranzit Dəhlizləri və Geofencing Radarı/i)
    ).toBeInTheDocument();

    // Switch to Calculator tab
    fireEvent.click(screen.getByText(/Rüsum & Cərimə/i));
    expect(screen.getByText(/Dövlət Rüsumu & Maliyyə Hesabatı/i)).toBeInTheDocument();

    // Switch to Checklist tab
    fireEvent.click(screen.getByText(/10-Nöqtəli Audit/i));
    expect(
      screen.getByText(/10-Nöqtəli DGK & AYNA Elektron Plomb Təhlükəsizlik Auditi/i)
    ).toBeInTheDocument();

    // Switch to Exam tab
    fireEvent.click(screen.getByText(/DGK İmtahanı/i));
    expect(
      screen.getByText(/DGK & AYNA Tranzit Rejimi və Elektron Plomb İmtahan Simulyatoru/i)
    ).toBeInTheDocument();

    // Switch to Registry tab
    fireEvent.click(screen.getByText(/Vahid Reyestr/i));
    expect(
      screen.getByText(/Dövlət Gömrük Komitəsi Elektron Plomb Vahid Açıq Reyestri/i)
    ).toBeInTheDocument();
  });

  it('interacts with E-Lock simulation buttons (cut cable, open door)', () => {
    render(
      <ElectronicSealModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
      />
    );

    const cutCableBtn = screen.getByText(/⚠️ Kabeli Qır \/ Kəs/i);
    fireEvent.click(cutCableBtn);
    expect(screen.getByText(/Kabeli Bərpa Et/i)).toBeInTheDocument();
    expect(screen.getByText(/KƏSİLMİŞ İLMƏ/i)).toBeInTheDocument();

    const doorBtn = screen.getByText(/🚪 Qapını Aç/i);
    fireEvent.click(doorBtn);
    expect(screen.getByText(/Qapını Bağla/i)).toBeInTheDocument();
  });

  it('loads presets and updates state accordingly', () => {
    render(
      <ElectronicSealModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
      />
    );

    const presetBtn = screen.getByText('10-GS-505');
    fireEvent.click(presetBtn);
    expect(screen.getByDisplayValue('10-GS-505')).toBeInTheDocument();
    expect(screen.getByDisplayValue('CMAU-482019-3')).toBeInTheDocument();
  });

  it('generates an official certificate and switches to certificate tab', () => {
    render(
      <ElectronicSealModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
      />
    );

    const generateBtn = screen.getByText(/Rəsmi Sertifikat Yarat/i);
    fireEvent.click(generateBtn);

    expect(
      screen.getByText(/ELEKTRON İNTELLEKTUAL TRANZİT PLOMBU SERTİFİKATI/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Məlumatları Kopyala/i)).toBeInTheDocument();
    expect(screen.getByText(/Çap Et/i)).toBeInTheDocument();
  });

  it('searches and filters in the unified registry tab', () => {
    render(
      <ElectronicSealModal
        isOpen={true}
        onClose={mockOnClose}
        vehicle={mockVehicle}
      />
    );

    fireEvent.click(screen.getByText(/Vahid Reyestr/i));
    const searchInput = screen.getByPlaceholderText(/Qeydiyyat nişanı, sertifikat №/i);

    fireEvent.change(searchInput, { target: { value: '99-EL-101' } });
    expect(screen.getByText('99-EL-101')).toBeInTheDocument();
  });
});
