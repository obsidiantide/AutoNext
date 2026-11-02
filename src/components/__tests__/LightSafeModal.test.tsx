import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LightSafeModal } from '../LightSafeModal';

describe('LightSafeModal Component Suite', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<LightSafeModal isOpen={false} onClose={mockOnClose} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders modal header, title, and default tab (radar) when open', () => {
    render(<LightSafeModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('LIGHT-SAFE-AZ-2026')).toBeInTheDocument();
    expect(screen.getByText(/Respublika Magistral Ağıllı İşıqlandırma SCADA Şəbəkəsi/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<LightSafeModal isOpen={true} onClose={mockOnClose} />);
    const closeBtn = screen.getByTestId('light-safe-close-btn');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<LightSafeModal isOpen={true} onClose={mockOnClose} />);

    // Simulator Tab
    fireEvent.click(screen.getByTestId('light-tab-simulator'));
    expect(screen.getByText(/Fotometrik Şüalanma və Görmə Xətti Vizualizasiyası/i)).toBeInTheDocument();

    // Vehicles Tab
    fireEvent.click(screen.getByTestId('light-tab-vehicles'));
    expect(screen.getByText(/Nəqliyyat İşıq Profilləri və İnzibati Xətalar Məcəlləsi/i)).toBeInTheDocument();

    // Checklist Tab
    fireEvent.click(screen.getByTestId('light-tab-checklist'));
    expect(screen.getByText(/10 Maddəlik Magistral İşıqlandırma və Elektrik Təhlükəsizlik Yoxlaması/i)).toBeInTheDocument();

    // Exam Tab
    fireEvent.click(screen.getByTestId('light-tab-exam'));
    expect(screen.getByText(/Magistral İşıqlandırma və Gecə Hərəkəti Təhlükəsizliyi İmtahanı/i)).toBeInTheDocument();

    // Certificate Tab
    fireEvent.click(screen.getByTestId('light-tab-certificate'));
    expect(screen.getByText(/Rəsmi Dövlət AAYDA & Azərişıq Elektron Fotometrik Uyğunluq Sertifikatı/i)).toBeInTheDocument();

    // Registry Tab
    fireEvent.click(screen.getByTestId('light-tab-registry'));
    expect(screen.getByPlaceholderText(/Sertifikat ID, DQN, dəhliz və ya SİMA UID üzrə axtarış/i)).toBeInTheDocument();
  });

  it('selects a corridor from the radar grid', () => {
    render(<LightSafeModal isOpen={true} onClose={mockOnClose} />);
    const corridorCard = screen.getByText(/Bakı Dairəvi-1 Avtomobil Yolu/i);
    fireEvent.click(corridorCard);
    expect(screen.getByText(/Aktiv Dəhliz: Km 5\+800 - 9\+400/i)).toBeInTheDocument();
  });

  it('interacts with sliders and inputs in simulator tab', () => {
    render(<LightSafeModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('light-tab-simulator'));

    const speedSlider = screen.getByDisplayValue('110');
    fireEvent.change(speedSlider, { target: { value: '80' } });
    expect(screen.getByText('80 km/s')).toBeInTheDocument();
  });

  it('switches vehicle presets in vehicles tab', () => {
    render(<LightSafeModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('light-tab-vehicles'));

    const pradoCard = screen.getByText(/Toyota Land Cruiser Prado TX/i);
    fireEvent.click(pradoCard);
    expect(screen.getByText('10-LX-202')).toBeInTheDocument();
  });

  it('toggles checklist items and handles check all', () => {
    render(<LightSafeModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('light-tab-checklist'));

    const checkAllBtn = screen.getByText('Hamısını Seç');
    fireEvent.click(checkAllBtn);
    expect(screen.getByText(/Uyğunluq: 100% \(10\/10\)/i)).toBeInTheDocument();
  });

  it('completes exam with auto fill and submits result', () => {
    render(<LightSafeModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('light-tab-exam'));

    const autoFillBtn = screen.getByText('Avtomatik Doldur');
    fireEvent.click(autoFillBtn);

    const submitBtn = screen.getByText('Nəticəni Yoxla');
    fireEvent.click(submitBtn);

    expect(screen.getByText(/İMTAHAN UĞURLA BAŞA ÇATDI/i)).toBeInTheDocument();
    expect(screen.getByText(/Toplanan bal: 100%/i)).toBeInTheDocument();
  });

  it('generates a new certificate from simulator status banner', () => {
    render(<LightSafeModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('light-tab-simulator'));

    const certBtn = screen.getByText('Sertifikat Tərtib Et');
    fireEvent.click(certBtn);

    expect(screen.getAllByText(/LIGHT-SAFE-AZ-2026/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Sertifikat ID:')).toBeInTheDocument();
  });

  it('handles copy and print in certificate tab', () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });
    const printMock = vi.fn();
    window.print = printMock;

    render(<LightSafeModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('light-tab-certificate'));

    const copyBtn = screen.getByText('Kopyala');
    fireEvent.click(copyBtn);
    expect(writeTextMock).toHaveBeenCalled();

    const printBtn = screen.getByText('Çap Et');
    fireEvent.click(printBtn);
    expect(printMock).toHaveBeenCalled();
  });

  it('filters certificates in registry tab', () => {
    render(<LightSafeModal isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('light-tab-registry'));

    const searchInput = screen.getByPlaceholderText(/Sertifikat ID, DQN, dəhliz və ya SİMA UID üzrə axtarış/i);
    fireEvent.change(searchInput, { target: { value: '99-LX-101' } });

    expect(screen.getByText('99-LX-101')).toBeInTheDocument();
  });
});
