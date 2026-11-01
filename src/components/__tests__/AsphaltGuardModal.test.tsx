import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AsphaltGuardModal } from '../AsphaltGuardModal';
import { MOCK_ASPHALT_CORRIDORS } from '../../data/mockAsphaltGuardData';

describe('AsphaltGuardModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default corridors tab when open', () => {
    render(<AsphaltGuardModal {...defaultProps} />);
    expect(screen.getAllByText(/ASPHALT-GUARD-AZ-2026/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Strateji Magistral İstilik & Rutting Nəzarət Dəhlizləri/i)
    ).toBeInTheDocument();
  });

  it('does not render modal content when isOpen is false', () => {
    const { container } = render(<AsphaltGuardModal {...defaultProps} isOpen={false} />);
    expect(container.querySelector('[data-testid="asphalt-tab-corridors"]')).not.toBeInTheDocument();
  });

  it('switches between all 8 navigation tabs cleanly', () => {
    render(<AsphaltGuardModal {...defaultProps} />);

    // SCADA Tab
    fireEvent.click(screen.getByTestId('asphalt-tab-scada'));
    expect(
      screen.getByText(/SCADA Termal & Plastik Axma Parametrləri/i)
    ).toBeInTheDocument();

    // Vehicles Tab
    fireEvent.click(screen.getByTestId('asphalt-tab-vehicles'));
    expect(screen.getByText(/Avtomobil Nəqliyyatı & Ox Yükü Presets/i)).toBeInTheDocument();

    // Calculator Tab
    fireEvent.click(screen.getByTestId('asphalt-tab-calculator'));
    expect(
      screen.getByText(/İnzibati Xətalar Məcəlləsi \(İXM 353\.1 & 353\.2\) Cərimə Kalkulyatoru/i)
    ).toBeInTheDocument();

    // Checklist Tab
    fireEvent.click(screen.getByTestId('asphalt-tab-checklist'));
    expect(
      screen.getByText(/10-Maddəlik Texniki Asfalt Mühafizəsi & Yay Təhlükəsizliyi Yoxlama Vərəqəsi/i)
    ).toBeInTheDocument();

    // Exam Tab
    fireEvent.click(screen.getByTestId('asphalt-tab-exam'));
    expect(
      screen.getByText(/10-Suallıq Yol Səthi Mühafizəsi & Yay İstilik Reqlamenti İmtahanı/i)
    ).toBeInTheDocument();

    // Certificate Tab
    fireEvent.click(screen.getByTestId('asphalt-tab-certificate'));
    expect(
      screen.getByText(/YAY MÖVSÜMÜ İSTİLİK VƏ ASFALT MÜHAFİZƏSİ BURAXILIŞ VƏRƏQƏSİ/i)
    ).toBeInTheDocument();

    // Registry Tab
    fireEvent.click(screen.getByTestId('asphalt-tab-registry'));
    expect(
      screen.getByText(/ASPHALT-GUARD-AZ-2026 Vahid Dövlət Reyestri/i)
    ).toBeInTheDocument();
  });

  it('filters strategic corridors by search query', () => {
    render(<AsphaltGuardModal {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/Dəhliz, marşrut və ya region axtar\.\.\./i);
    fireEvent.change(searchInput, { target: { value: 'Kürdəmir' } });

    expect(screen.getAllByText((content) => content.includes('Kürdəmir')).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Sumqayıt/i)).not.toBeInTheDocument();
  });

  it('selects a corridor and updates technical summary', () => {
    render(<AsphaltGuardModal {...defaultProps} />);
    const secondCorridorName = MOCK_ASPHALT_CORRIDORS[1].nameAz;
    const secondCorridorCard = screen.getByText(secondCorridorName);
    fireEvent.click(secondCorridorCard);

    expect(
      screen.getByText((content) => content.includes(`Seçilmiş Dəhliz: ${secondCorridorName}`))
    ).toBeInTheDocument();
  });

  it('selects vehicle preset and updates vehicle state', () => {
    render(<AsphaltGuardModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('asphalt-tab-vehicles'));

    const tipper = screen.getByText(/KamAZ-6520 Ağır Tikinti Özüboşaldanı/i);
    fireEvent.click(tipper);
    expect(screen.getByText('10-TM-202')).toBeInTheDocument();
  });

  it('interacts with checklist toggles and handles check-all and reset', () => {
    render(<AsphaltGuardModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('asphalt-tab-checklist'));

    // Check All
    fireEvent.click(screen.getByText('Hamısını Seç'));
    expect(screen.getByText(/100%/i)).toBeInTheDocument();

    // Reset
    fireEvent.click(screen.getByText('Sıfırla'));
    expect(screen.getByText(/0%/i)).toBeInTheDocument();
  });

  it('completes theoretical exam questions and submits results', () => {
    render(<AsphaltGuardModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('asphalt-tab-exam'));

    // Click some answer options
    const targetOption = screen.getByText('+32°C və yuxarı');
    fireEvent.click(targetOption);

    const submitBtn = screen.getByText('Cavabları Təsdiqlə və Qiymətləndir');
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Qiymət:/i)).toBeInTheDocument();
  });

  it('generates a new clearance certificate from calculator tab', () => {
    render(<AsphaltGuardModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('asphalt-tab-calculator'));

    const generateBtn = screen.getByText(/Rəsmi İcazə \/ Qərar Sənədi Yarat/i);
    fireEvent.click(generateBtn);

    expect(
      screen.getByText(/YAY MÖVSÜMÜ İSTİLİK VƏ ASFALT MÜHAFİZƏSİ BURAXILIŞ VƏRƏQƏSİ/i)
    ).toBeInTheDocument();
  });

  it('filters certificates in registry tab', () => {
    render(<AsphaltGuardModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('asphalt-tab-registry'));

    const registrySearch = screen.getByPlaceholderText(/Sertifikat no, nömrə və ya dəhliz\.\.\./i);
    fireEvent.change(registrySearch, { target: { value: '88102' } });

    expect(screen.getByText('ASPHALT-GUARD-AZ-2026-88102')).toBeInTheDocument();
    expect(screen.queryByText('ASPHALT-GUARD-AZ-2026-92451')).not.toBeInTheDocument();
  });
});
