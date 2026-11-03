import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VmsSafeModal } from '../VmsSafeModal';

describe('VmsSafeModal Component Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<VmsSafeModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId('vms-safe-modal')).not.toBeInTheDocument();
  });

  it('renders modal header, title, and default corridors tab when open', () => {
    render(<VmsSafeModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByTestId('vms-safe-modal')).toBeInTheDocument();
    expect(
      screen.getByText(/Magistral Dəyişən Məlumat Nişanları \(VMS \/ DMS\) & Qantry İdarəetmə Portalı/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Azərbaycan Magistrallarında Strateji Qantry Portalları və Dinamik VMS Tabloları/i)
    ).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<VmsSafeModal isOpen={true} onClose={handleClose} />);
    const closeBtn = screen.getByTestId('vms-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<VmsSafeModal isOpen={true} onClose={vi.fn()} />);

    // Tab: Simulator
    fireEvent.click(screen.getByTestId('tab-simulator'));
    expect(screen.getByText(/EN 12966 Optik Oxunaqlılıq və Təhlükəsizlik Qiymətləndirməsi/i)).toBeInTheDocument();

    // Tab: Fines
    fireEvent.click(screen.getByTestId('tab-fines'));
    expect(
      screen.getByText(/Nəqliyyat Preseti və İXM Qanunvericiliyi üzrə Cərimə Məzənnəsi/i)
    ).toBeInTheDocument();

    // Tab: Checklist
    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(
      screen.getByText(/VMS və Qantry Qurğularının 10-Bəndlik Texniki Uyğunluq Standartı/i)
    ).toBeInTheDocument();

    // Tab: Exam
    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(
      screen.getByText(/VMS, Qantry və Zolaq İdarəetmə Qaydaları üzrə Nəzəri İmtahan/i)
    ).toBeInTheDocument();

    // Tab: Certificate
    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(
      screen.getByText(/Rəsmi Elektron VMS Keçid və Optik Uyğunluq Sertifikatı/i)
    ).toBeInTheDocument();

    // Tab: Registry
    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(
      screen.getByText(/Vahid Açıq VMS və LCS Elektron Qeydiyyat Reyestri/i)
    ).toBeInTheDocument();

    // Tab: Corridors
    fireEvent.click(screen.getByTestId('tab-corridors'));
    expect(
      screen.getByText(/Azərbaycan Magistrallarında Strateji Qantry Portalları və Dinamik VMS Tabloları/i)
    ).toBeInTheDocument();
  });

  it('allows selecting a gantry in the corridors tab', () => {
    render(<VmsSafeModal isOpen={true} onClose={vi.fn()} />);
    const gantryCard = screen.getByText(/Bakı Dairəvi-1 Avtomobil Yolu/i);
    fireEvent.click(gantryCard);
    expect(screen.getByText(/Yasamal Dərəsi Viyaduk Qantry/i)).toBeInTheDocument();
  });

  it('interacts with simulator controls: lanes, LCS states, speed, and audio alert', () => {
    render(<VmsSafeModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-simulator'));

    // Click Lane #3
    const lane3Btn = screen.getByRole('button', { name: '#3' });
    fireEvent.click(lane3Btn);

    // Switch LCS to Red Cross
    const redCrossBtn = screen.getByRole('button', { name: /Qırmızı X \(Qapalı\)/i });
    fireEvent.click(redCrossBtn);

    // Should indicate administrative infraction alert for Red X under İXM 327.2
    expect(screen.getByText(/İnzibati Xəta Aşkarlanmışdır!/i)).toBeInTheDocument();
    expect(screen.getByText(/Qırmızı "X" altında hərəkət \(İXM 327\.2\)/i)).toBeInTheDocument();

    // Test siren audio button
    const sirenBtn = screen.getByRole('button', { name: /Siren & Siqnal Yoxla/i });
    fireEvent.click(sirenBtn);

    // Switch weather to Dense Fog
    const fogBtn = screen.getByRole('button', { name: /Qatı Duman/i });
    fireEvent.click(fogBtn);
    expect(screen.getByText(/DUMAN/i)).toBeInTheDocument();
  });

  it('interacts with vehicle presets and currency selector in fines tab', () => {
    render(<VmsSafeModal isOpen={true} onClose={vi.fn()} />);

    // Currency to USD
    const usdBtn = screen.getByRole('button', { name: 'USD' });
    fireEvent.click(usdBtn);

    fireEvent.click(screen.getByTestId('tab-fines'));

    // Select Actros TIR
    const actrosCard = screen.getByText(/Mercedes-Benz Actros 1845 TIR/i);
    fireEvent.click(actrosCard);
    expect(screen.getByText(/10-VM-202/i)).toBeInTheDocument();
  });

  it('manages 10-point checklist: toggle, reset, and select-all', () => {
    render(<VmsSafeModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-checklist'));

    // Click Reset
    const resetBtn = screen.getByRole('button', { name: 'Sıfırla' });
    fireEvent.click(resetBtn);
    expect(screen.getByText('0%')).toBeInTheDocument();

    // Click Select All
    const selectAllBtn = screen.getByRole('button', { name: 'Hamısını Seç' });
    fireEvent.click(selectAllBtn);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('completes theoretical exam and displays evaluation results', () => {
    render(<VmsSafeModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-exam'));

    // Submit without selecting
    const submitBtn = screen.getByRole('button', { name: /Cavabları Təsdiqlə və Qiymətləndir/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Nəticə: 0% \(0 \/ 10 düzgün\)/i)).toBeInTheDocument();
    expect(screen.getByText(/İmtahandan keçmədiniz/i)).toBeInTheDocument();

    // Restart exam
    const restartBtn = screen.getByRole('button', { name: /Yenidən Başla/i });
    fireEvent.click(restartBtn);
    expect(screen.getByRole('button', { name: /Cavabları Təsdiqlə və Qiymətləndir/i })).toBeInTheDocument();
  });

  it('generates certificate from simulator and handles copy and print', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(<VmsSafeModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-simulator'));

    // Click Generate Certificate
    const genCertBtn = screen.getByRole('button', { name: /Rəsmi VMS Sertifikatı Tərtib Et/i });
    fireEvent.click(genCertBtn);

    // Should switch to certificate tab
    expect(
      screen.getByText(/Rəsmi Elektron VMS Keçid və Optik Uyğunluq Sertifikatı/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/VMS-SAFE-AZ-2026 ELEKTRON SERTİFİKATI/i)).toBeInTheDocument();

    // Test print
    const printBtn = screen.getByRole('button', { name: /Çap Et/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    // Test copy
    const copyBtn = screen.getByRole('button', { name: /Kopyala/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('searches and filters the public registry', () => {
    render(<VmsSafeModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-registry'));

    const searchInput = screen.getByPlaceholderText(/Sertifikat, nömrə və ya qantry\.\.\./i);
    fireEvent.change(searchInput, { target: { value: '99-VM-101' } });

    expect(screen.getByText('99-VM-101')).toBeInTheDocument();
  });
});
