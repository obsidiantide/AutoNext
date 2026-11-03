import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SosSafeModal } from '../SosSafeModal';

describe('SosSafeModal Component Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<SosSafeModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId('sos-safe-modal')).not.toBeInTheDocument();
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(<SosSafeModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByTestId('sos-safe-modal')).toBeInTheDocument();
    expect(
      screen.getByText(/Magistral SOS Qəza Çağırış Sütunları və Yol Çiyini Təhlükəsizliyi/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Azərbaycan Magistral SOS Qəza Çağırış Sütunları Şəbəkəsi/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<SosSafeModal isOpen={true} onClose={handleClose} />);
    const closeBtn = screen.getByTestId('sos-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<SosSafeModal isOpen={true} onClose={vi.fn()} />);

    // Tab: Simulator
    fireEvent.click(screen.getByTestId('tab-simulator'));
    expect(screen.getByText(/Hadisə və Yol Çiyini Parametrləri/i)).toBeInTheDocument();

    // Tab: Vehicles
    fireEvent.click(screen.getByTestId('tab-vehicles'));
    expect(screen.getByText(/Nəqliyyat Vasitəsi Presetləri və Qəza Avadanlıqları/i)).toBeInTheDocument();

    // Tab: Checklist
    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByText(/10-Nöqtə Qəza Çağırış və Təhlükəsizlik Reqlamenti/i)).toBeInTheDocument();

    // Tab: Exam
    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByText(/Magistral SOS və Yol Hərəkəti Qanunvericiliyi İmtahanı/i)).toBeInTheDocument();

    // Tab: Certificate
    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByText(/Rəsmi Elektron SOS Qəza və Texniki Yardım Arayışı/i)).toBeInTheDocument();

    // Tab: Registry
    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(screen.getByText(/Vahid SOS Qəza və Texniki Yardım Açıq Reyestri/i)).toBeInTheDocument();

    // Back to Radar
    fireEvent.click(screen.getByTestId('tab-radar'));
    expect(screen.getByText(/Azərbaycan Magistral SOS Qəza Çağırış Sütunları Şəbəkəsi/i)).toBeInTheDocument();
  });

  it('selects a corridor from radar grid and switches to simulator', () => {
    render(<SosSafeModal isOpen={true} onClose={vi.fn()} />);
    const simBtns = screen.getAllByText(/Simulyasiya et →/i);
    expect(simBtns.length).toBeGreaterThan(0);
    fireEvent.click(simBtns[1]); // select 2nd pillar

    expect(screen.getByText(/Hadisə və Yol Çiyini Parametrləri/i)).toBeInTheDocument();
  });

  it('interacts with sliders and inputs in simulator tab', () => {
    render(<SosSafeModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-simulator'));

    // Emergency type change
    const selectElem = screen.getByRole('combobox', { name: /Təcili Hadisə Növü:/i });
    fireEvent.change(selectElem, { target: { value: 'MEDICAL_EMERGENCY' } });
    expect(screen.getByText(/TƏBİB 113/i)).toBeInTheDocument();

    // High-vis vest toggle
    const vestCheckbox = screen.getByLabelText(/İşıqqaytarıcı jilet/i);
    fireEvent.click(vestCheckbox); // toggle
  });

  it('selects vehicle preset and reflects in simulator', () => {
    render(<SosSafeModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-vehicles'));

    const applyBtns = screen.getAllByText(/Tətbiq et →/i);
    expect(applyBtns.length).toBeGreaterThan(0);
    fireEvent.click(applyBtns[1]); // select Toyota Prado

    // Should navigate to simulator tab
    expect(screen.getByText(/Hadisə və Yol Çiyini Parametrləri/i)).toBeInTheDocument();
  });

  it('handles checklist item toggles, select-all, and reset buttons', () => {
    render(<SosSafeModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-checklist'));

    const selectAllBtn = screen.getByText(/Hamısını Seç/i);
    fireEvent.click(selectAllBtn);
    expect(screen.getByText(/10 \/ 10 \(100%\)/i)).toBeInTheDocument();

    const resetBtn = screen.getByText(/Sıfırla/i);
    fireEvent.click(resetBtn);
    expect(screen.getByText(/0 \/ 10 \(0%\)/i)).toBeInTheDocument();
  });

  it('answers exam questions and submits for grading', () => {
    render(<SosSafeModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-exam'));

    // Answer questions
    const optionABtns = screen.getAllByText(/B\)/i);
    optionABtns.forEach((btn) => fireEvent.click(btn));

    const submitBtn = screen.getByText(/İmtahanı Tamamla və Qiymətləndir →/i);
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Düzgün cavab sayı:/i)).toBeInTheDocument();
  });

  it('generates certificate from simulator and allows copy', () => {
    const clipboardWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardWriteText,
      },
    });

    render(<SosSafeModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-simulator'));

    const genBtn = screen.getByTestId('generate-sos-cert-btn');
    fireEvent.click(genBtn);

    // Navigated to certificate tab
    expect(screen.getByText(/Rəsmi Elektron SOS Qəza və Texniki Yardım Arayışı/i)).toBeInTheDocument();

    const copyBtn = screen.getByText(/Nömrəni Kopyala/i);
    fireEvent.click(copyBtn);
    expect(clipboardWriteText).toHaveBeenCalled();
  });

  it('switches currency between AZN, USD, and EUR', () => {
    render(<SosSafeModal isOpen={true} onClose={vi.fn()} />);
    const usdBtn = screen.getByRole('button', { name: 'USD' });
    fireEvent.click(usdBtn);
    expect(usdBtn).toHaveClass('bg-amber-500');

    const eurBtn = screen.getByRole('button', { name: 'EUR' });
    fireEvent.click(eurBtn);
    expect(eurBtn).toHaveClass('bg-amber-500');
  });
});
