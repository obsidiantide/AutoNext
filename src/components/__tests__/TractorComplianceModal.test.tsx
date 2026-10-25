import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TractorComplianceModal } from '../TractorComplianceModal';

describe('TractorComplianceModal Component', () => {
  const defaultProps = {
    isOpen: true,
    currency: 'AZN' as const,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default audit tab when open', () => {
    render(<TractorComplianceModal {...defaultProps} />);

    expect(screen.getByText(/KTN & DAXA Aqrotexnika və Traktor Portalı/i)).toBeInTheDocument();
    expect(screen.getByText(/Kənd Təsərrüfatı Nazirliyi, Baş Dövlət Texniki Nəzarət Müfəttişliyi/i)).toBeInTheDocument();
    expect(screen.getByText(/DAXA 10-Bəndlik Texniki Baxış və Təhlükəsizlik Auditi/i)).toBeInTheDocument();
    expect(screen.getByText(/Texniki Baxış Balı/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<TractorComplianceModal {...defaultProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls onClose when close button is clicked', () => {
    render(<TractorComplianceModal {...defaultProps} />);
    const closeBtn = screen.getByLabelText('Bağla');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 6 navigation tabs', () => {
    render(<TractorComplianceModal {...defaultProps} />);

    // Tab 2: Driver & Exam
    fireEvent.click(screen.getByRole('button', { name: /Sürücülük \(A–F\) & İmtahan/i }));
    expect(screen.getByText(/Traktorçu-Maşinist Vəsiqəsi Kateqoriyaları/i)).toBeInTheDocument();
    expect(screen.getByText(/DAXA Nəzəri İmtahan Simulyatoru/i)).toBeInTheDocument();

    // Tab 3: Field Transit
    fireEvent.click(screen.getByRole('button', { name: /Sahəyə Çıxış & Şose Rejimi/i }));
    expect(screen.getByText(/Sahəyə Çıxış və Yol Hərəkəti Təhlükəsizliyi Şərtləri/i)).toBeInTheDocument();

    // Tab 4: EKTİS Subsidy
    fireEvent.click(screen.getByRole('button', { name: /EKTİS Subsidiya & Lizinq/i }));
    expect(screen.getByText(/Aqrar Subsidiya Şurası & EKTİS Lizinq Şərtləri/i)).toBeInTheDocument();
    expect(screen.getByText(/Dövlət Subsidiyası \(40%\)/i)).toBeInTheDocument();

    // Tab 5: Regional Centers
    fireEvent.click(screen.getByRole('button', { name: /Regional Müfəttişliklər/i }));
    expect(screen.getByText(/Regional Dövlət Aqrar Xidmətlər Agentliyi \(DAXA\) Müfəttişlikləri/i)).toBeInTheDocument();

    // Tab 6: Certificate
    fireEvent.click(screen.getByRole('button', { name: /^Qeydiyyat Şəhadətnaməsi$/i }));
    expect(screen.getAllByText(/Baş Dövlət Texniki Nəzarət Müfəttişliyi/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/DAXA Vahid Aqrotexnika İctimai Axtarış Reyestri/i)).toBeInTheDocument();
  });

  it('toggles checklist items and recalculates score and fines', () => {
    render(<TractorComplianceModal {...defaultProps} />);

    // Toggle chassis match
    const chassisItem = screen.getByText(/Şassi və mühərrik nömrələrinin texniki pasportla eyniliyi/i);
    fireEvent.click(chassisItem);

    // Fine should increase by 150 AZN
    expect(screen.getByText(/150 ₼/i)).toBeInTheDocument();
    expect(screen.getByText(/⚠️ Bərpa tələb olunur/i)).toBeInTheDocument();

    // Toggle it back
    fireEvent.click(chassisItem);
    expect(screen.getByText(/Sanksiya yoxdur/i)).toBeInTheDocument();
    expect(screen.getByText(/✅ Texniki cəhətdən saz/i)).toBeInTheDocument();
  });

  it('interacts with theory exam questions and toggles explanations in driver tab', () => {
    render(<TractorComplianceModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Sürücülük \(A–F\) & İmtahan/i }));

    const explainBtn = screen.getByRole('button', { name: /Hüquqi İzahları Göstər/i });
    fireEvent.click(explainBtn);
    expect(screen.getByText(/YHQ Əlavə 1 Bənd 1.3 & KTN Təhlükəsizlik Qaydası/i)).toBeInTheDocument();

    // Hide explanations
    fireEvent.click(screen.getByRole('button', { name: /İzahları Gizlə/i }));
    expect(screen.queryByText(/YHQ Əlavə 1 Bənd 1.3 & KTN Təhlükəsizlik Qaydası/i)).not.toBeInTheDocument();
  });

  it('updates transit safety analysis when changing surface and speed', () => {
    render(<TractorComplianceModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Sahəyə Çıxış & Şose Rejimi/i }));

    // Change machinery to crawler
    const machinerySelect = screen.getByDisplayValue(/Təkərli Traktor/i);
    fireEvent.change(machinerySelect, { target: { value: 'crawler' } });

    // On asphalt highway, crawler is strictly banned
    expect(screen.getByText(/Yolda Hərəkət Qadağandır \(İXM Pozuntusu\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Metal tırtıllı traktorların asfalt örtüklü/i)).toBeInTheDocument();

    // Switch to dirt field road
    const surfaceSelect = screen.getByDisplayValue(/Asfalt Örtüklü Dövlət Avtomobil Yolu/i);
    fireEvent.change(surfaceSelect, { target: { value: 'dirt_field_road' } });

    expect(screen.getByText(/Yolda Hərəkətə İcazə Verilir/i)).toBeInTheDocument();
  });

  it('updates subsidy calculations and currency in subsidy tab', () => {
    render(<TractorComplianceModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /EKTİS Subsidiya & Lizinq/i }));

    // Switch currency to USD
    fireEvent.click(screen.getByRole('button', { name: 'USD' }));
    expect(screen.getAllByText(/\$/i).length).toBeGreaterThanOrEqual(1);

    // Switch currency to EUR
    fireEvent.click(screen.getByRole('button', { name: 'EUR' }));
    expect(screen.getAllByText(/€/i).length).toBeGreaterThanOrEqual(1);
  });

  it('books appointment slot in regional centers tab', () => {
    render(<TractorComplianceModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Regional Müfəttişliklər/i }));

    const slotBtn = screen.getByRole('button', { name: '11:00' });
    fireEvent.click(slotBtn);

    const bookBtn = screen.getByRole('button', { name: /Növbə Rezerv Et/i });
    fireEvent.click(bookBtn);

    expect(screen.getByText(/Növbə Təsdiqləndi!/i)).toBeInTheDocument();
  });

  it('generates certificate from audit tab and navigates to certificate view', () => {
    render(<TractorComplianceModal {...defaultProps} />);

    const issueBtn = screen.getByRole('button', { name: /Rəsmi DAXA Qeydiyyat Şəhadətnaməsi Ver/i });
    fireEvent.click(issueBtn);

    expect(screen.getAllByText(/Baş Dövlət Texniki Nəzarət Müfəttişliyi/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/KTN-TEX-2026-/i).length).toBeGreaterThanOrEqual(1);
  });

  it('filters certificates by search in unified registry', () => {
    render(<TractorComplianceModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /^Qeydiyyat Şəhadətnaməsi$/i }));

    const searchInput = screen.getByPlaceholderText(/DQN və ya Şəhadətnamə №.../i);
    fireEvent.change(searchInput, { target: { value: '99-TA-102' } });

    expect(screen.getAllByText('99-TA-102').length).toBeGreaterThanOrEqual(1);
  });
});
