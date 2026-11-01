import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GuardrailSafetyModal } from '../GuardrailSafetyModal';
import { MOCK_GUARDRAIL_CORRIDORS } from '../../data/mockGuardrailSafetyData';

describe('GuardrailSafetyModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default corridors tab when open', () => {
    render(<GuardrailSafetyModal {...defaultProps} />);
    expect(screen.getByText(/AAYDA & BDYP Highway Guardrail & VRS Safety Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/Strateji Magistral Yol Dəhlizləri və Çəpər Şəbəkəsi/i)).toBeInTheDocument();
  });

  it('does not render modal content when isOpen is false', () => {
    const { container } = render(<GuardrailSafetyModal {...defaultProps} isOpen={false} />);
    expect(container.querySelector('[data-testid="guardrail-tab-corridors"]')).not.toBeInTheDocument();
  });

  it('switches between all 8 navigation tabs cleanly', () => {
    render(<GuardrailSafetyModal {...defaultProps} />);

    // SCADA Tab
    fireEvent.click(screen.getByTestId('guardrail-tab-scada'));
    expect(screen.getByText(/Zərbə Parametrləri/i)).toBeInTheDocument();
    expect(screen.getByText(/Toqquşma Trayektoriyası və Dinamik Əyilmə Eni Simulyatoru/i)).toBeInTheDocument();

    // Vehicles Tab
    fireEvent.click(screen.getByTestId('guardrail-tab-vehicles'));
    expect(screen.getByText(/Avtomobil Filosu və EN 1317 Zərbə Presetləri/i)).toBeInTheDocument();

    // Indemnity Tab
    fireEvent.click(screen.getByTestId('guardrail-tab-indemnity'));
    expect(screen.getByText(/Yol İnfrastrukturuna Dəyən Zərərin Ödənilməsi & Cərimə/i)).toBeInTheDocument();
    expect(screen.getByText(/Dövlət Əmlakının Bərpası Kalkulyasiyası/i)).toBeInTheDocument();

    // Checklist Tab
    fireEvent.click(screen.getByTestId('guardrail-tab-checklist'));
    expect(screen.getByText(/10-Maddəlik Texniki VRS Təhlükəsizlik Yoxlama Vərəqəsi/i)).toBeInTheDocument();

    // Exam Tab
    fireEvent.click(screen.getByTestId('guardrail-tab-exam'));
    expect(screen.getByText(/VRS və Çəpər Təhlükəsizliyi İmtahan Simulyatoru/i)).toBeInTheDocument();

    // Certificate Tab
    fireEvent.click(screen.getByTestId('guardrail-tab-certificate'));
    expect(screen.getByText(/Rəsmi GUARD-SAFE-AZ-2026 Dövlət Sertifikatı/i)).toBeInTheDocument();

    // Registry Tab
    fireEvent.click(screen.getByTestId('guardrail-tab-registry'));
    expect(screen.getByText(/Vahid Dövlət Çəpər və Təhlükəsizlik Reyestri/i)).toBeInTheDocument();
  });

  it('filters corridors via search input', () => {
    render(<GuardrailSafetyModal {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/Dəhliz, marşrut və ya region üzrə axtar/i);

    fireEvent.change(searchInput, { target: { value: 'Yasamal' } });
    expect(screen.getByText(/Bakı Dairəvi-1 Avtomobil Yolu/i)).toBeInTheDocument();
  });

  it('selects a corridor and applies it to the simulation', () => {
    render(<GuardrailSafetyModal {...defaultProps} />);
    const selectButtons = screen.getAllByText(/Simulyasiyada Yoxla →/i);
    expect(selectButtons.length).toBeGreaterThan(0);
    fireEvent.click(selectButtons[0]);

    // Should switch to scada tab
    expect(screen.getByText(/Zərbə Parametrləri/i)).toBeInTheDocument();
  });

  it('interacts with checklist and toggles items', () => {
    render(<GuardrailSafetyModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('guardrail-tab-checklist'));

    const selectAllBtn = screen.getByText(/Hamısını Seç/i);
    fireEvent.click(selectAllBtn);
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText(/TAM UYĞUNDUR/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Bütününü Sil/i));
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('submits exam and shows results', () => {
    render(<GuardrailSafetyModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('guardrail-tab-exam'));

    const submitBtn = screen.getByText(/Nəticəni Təsdiqlə/i);
    fireEvent.click(submitBtn);

    expect(screen.getByText(/İmtahan Qiyməti/i)).toBeInTheDocument();
    expect(screen.getByText(/Yenidən Başla/i)).toBeInTheDocument();
  });

  it('generates certificate from simulation tab and navigates to certificate tab', () => {
    render(<GuardrailSafetyModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('guardrail-tab-scada'));

    const generateBtn = screen.getByText(/Dövlət Sertifikatı İstehsal Et/i);
    fireEvent.click(generateBtn);

    // Navigates to certificate tab and displays certificate
    expect(screen.getByText(/AZƏRBAYCAN AVTOMOBİL YOLLARI DÖVLƏT AGENTLİYİ/i)).toBeInTheDocument();
    expect(screen.getByText(/Sertifikat Nömrəsini Kopyala/i)).toBeInTheDocument();
  });

  it('filters active registry records in the registry tab', () => {
    render(<GuardrailSafetyModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('guardrail-tab-registry'));

    const searchInput = screen.getByPlaceholderText(/Sertifikat №, nömrə və ya yer üzrə axtar/i);
    fireEvent.change(searchInput, { target: { value: '99-GS-101' } });

    expect(screen.getByText(/99-GS-101/i)).toBeInTheDocument();
  });
});
