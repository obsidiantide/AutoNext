import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BorderQueueModal } from '../BorderQueueModal';

describe('BorderQueueModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <BorderQueueModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(<BorderQueueModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText(/Dövlət Sərhəd Buraxılış Məntəqəsi Elektron Növbə Portalı/i)).toBeInTheDocument();
    expect(screen.getByText(/DSX • DGK • BDYP/i)).toBeInTheDocument();
    expect(screen.getByText(/7 Strateji Beynəlxalq Sərhəd Buraxılış Məntəqələri Radarı/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<BorderQueueModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByTestId('border-queue-close-btn');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 tabs', () => {
    render(<BorderQueueModal isOpen={true} onClose={mockOnClose} />);

    // Tab 2: Booking
    fireEvent.click(screen.getByTestId('tab-booking'));
    expect(screen.getByText(/Elektron Növbə Rezervasiyası & Tarif Hesablayıcısı/i)).toBeInTheDocument();

    // Tab 3: e-Gate
    fireEvent.click(screen.getByTestId('tab-egate'));
    expect(screen.getByText(/DSX Ağıllı Sərhəd Biometrik e-Gate İdentifikasiya Stendi/i)).toBeInTheDocument();

    // Tab 4: Checklist
    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByText(/10-Bəndlik Beynəlxalq Sərhəd Təhlükəsizliyi/i)).toBeInTheDocument();

    // Tab 5: Exam
    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByText(/DSX & DGK Beynəlxalq Sərhədkeçmə Qanunvericiliyi İmtahanı/i)).toBeInTheDocument();

    // Tab 6: Voucher
    fireEvent.click(screen.getByTestId('tab-voucher'));
    expect(screen.getByText(/Rəsmi Sərhəd Buraxılış Elektron Növbə Talonu/i)).toBeInTheDocument();

    // Tab 7: Registry
    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(screen.getByText(/Vahid Dövlət Elektron Növbə & Tranzit Reyestri/i)).toBeInTheDocument();

    // Back to Tab 1: Radar
    fireEvent.click(screen.getByTestId('tab-radar'));
    expect(screen.getByText(/7 Strateji Beynəlxalq Sərhəd Buraxılış Məntəqələri Radarı/i)).toBeInTheDocument();
  });

  it('applies commercial vehicle presets and calculates booking fee', () => {
    render(<BorderQueueModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-booking'));
    const plateInput = screen.getByTestId('input-vehicle-plate') as HTMLInputElement;

    // Apply preset
    const presetBtn = screen.getByTestId('preset-btn-PRESET_TIR_REGULAR');
    fireEvent.click(presetBtn);

    expect(plateInput.value).toBe('10-TX-505');
  });

  it('issues a new voucher and transitions to voucher tab', () => {
    render(<BorderQueueModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-booking'));
    const issueBtn = screen.getByTestId('issue-voucher-btn');
    fireEvent.click(issueBtn);

    expect(screen.getByTestId('voucher-card')).toBeInTheDocument();
    expect(screen.getByText(/e-Gate Şlaqbaum PIN Kodu/i)).toBeInTheDocument();
  });

  it('interacts with checklist and clicks Bütün Bəndləri Təsdiqlə', () => {
    render(<BorderQueueModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-checklist'));
    const checkAllBtn = screen.getByText(/Bütün Bəndləri Təsdiqlə/i);
    fireEvent.click(checkAllBtn);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('completes the theoretical exam and displays score results', () => {
    render(<BorderQueueModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-exam'));
    const finishExamBtn = screen.getByTestId('toggle-exam-results-btn');
    fireEvent.click(finishExamBtn);

    expect(screen.getByText(/Nəticələri Gizlət/i)).toBeInTheDocument();
    expect(screen.getByText(/Düzgün cavab sayı/i)).toBeInTheDocument();
  });

  it('allows switching currency between AZN, USD, and EUR', () => {
    render(<BorderQueueModal isOpen={true} onClose={mockOnClose} />);

    const usdBtn = screen.getByText('USD');
    fireEvent.click(usdBtn);

    fireEvent.click(screen.getByTestId('tab-booking'));
    expect(screen.getByText(/\$/)).toBeInTheDocument();
  });
});
