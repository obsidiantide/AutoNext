import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SectionSafeModal } from '../SectionSafeModal';

describe('SectionSafeModal Component Suite', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN' as const,
  };

  it('does not render when isOpen is false', () => {
    render(<SectionSafeModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('section-safe-modal')).not.toBeInTheDocument();
  });

  it('renders modal header, branding, and default radar tab when open', () => {
    render(<SectionSafeModal {...defaultProps} />);
    expect(screen.getByTestId('section-safe-modal')).toBeInTheDocument();
    expect(
      screen.getByText(/Magistral Section Control \(Point-to-Point Ortalama Sürət\) Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('section-radar-tab')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<SectionSafeModal {...defaultProps} onClose={onClose} />);
    const closeBtn = screen.getByTestId('section-safe-close-btn');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 8 navigation tabs', () => {
    render(<SectionSafeModal {...defaultProps} />);

    // Simulator Tab
    fireEvent.click(screen.getByTestId('section-tab-simulator'));
    expect(screen.getByTestId('section-simulator-tab')).toBeInTheDocument();

    // Sanctions Tab
    fireEvent.click(screen.getByTestId('section-tab-sanctions'));
    expect(screen.getByTestId('section-sanctions-tab')).toBeInTheDocument();

    // Checklist Tab
    fireEvent.click(screen.getByTestId('section-tab-checklist'));
    expect(screen.getByTestId('section-checklist-tab')).toBeInTheDocument();

    // Exam Tab
    fireEvent.click(screen.getByTestId('section-tab-exam'));
    expect(screen.getByTestId('section-exam-tab')).toBeInTheDocument();

    // Certificate Tab
    fireEvent.click(screen.getByTestId('section-tab-certificate'));
    expect(screen.getByTestId('section-certificate-tab')).toBeInTheDocument();

    // Registry Tab
    fireEvent.click(screen.getByTestId('section-tab-registry'));
    expect(screen.getByTestId('section-registry-tab')).toBeInTheDocument();

    // About Tab
    fireEvent.click(screen.getByTestId('section-tab-about'));
    expect(screen.getByTestId('section-about-tab')).toBeInTheDocument();

    // Back to Radar Tab
    fireEvent.click(screen.getByTestId('section-tab-radar'));
    expect(screen.getByTestId('section-radar-tab')).toBeInTheDocument();
  });

  it('allows selecting a zone card from the radar grid', () => {
    render(<SectionSafeModal {...defaultProps} />);
    const zoneCard = screen.getByTestId('section-zone-card-sec-02');
    fireEvent.click(zoneCard);
    expect(screen.getAllByText(/Heydər Əliyev Beynəlxalq Aeroportu Şossesi/i).length).toBeGreaterThanOrEqual(1);
  });

  it('interacts with SCADA simulator sliders and updates calculations', () => {
    render(<SectionSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('section-tab-simulator'));
    expect(screen.getByTestId('section-simulator-tab')).toBeInTheDocument();

    const sliders = screen.getAllByRole('slider');
    const transitInput = sliders[0];
    // Adjust speed limit or transit time
    fireEvent.change(transitInput, { target: { value: '450' } });
    expect(screen.getByText(/450 saniyə/i)).toBeInTheDocument();
  });

  it('switches vehicle presets in sanctions tab and updates details', () => {
    render(<SectionSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('section-tab-sanctions'));
    expect(screen.getByTestId('section-sanctions-tab')).toBeInTheDocument();

    const porscheCard = screen.getByText(/Porsche 911 Carrera 4S/i);
    fireEvent.click(porscheCard);
    expect(screen.getAllByText(/10-SC-202/i).length).toBeGreaterThanOrEqual(1);
  });

  it('toggles checklist items, selects all, and resets', () => {
    render(<SectionSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('section-tab-checklist'));
    expect(screen.getByTestId('section-checklist-tab')).toBeInTheDocument();

    // Reset checklist
    const resetBtn = screen.getByRole('button', { name: /Sıfırla/i });
    fireEvent.click(resetBtn);
    expect(screen.getByText(/0 \/ 10 \(0%\)/i)).toBeInTheDocument();

    // Select all
    const selectAllBtn = screen.getByRole('button', { name: /Hamısını Seç/i });
    fireEvent.click(selectAllBtn);
    expect(screen.getByText(/10 \/ 10 \(100%\)/i)).toBeInTheDocument();
  });

  it('answers exam questions and submits for grading evaluation', () => {
    render(<SectionSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('section-tab-exam'));
    expect(screen.getByTestId('section-exam-tab')).toBeInTheDocument();

    const optionBtn = screen.getAllByRole('button', { name: /B\)/i })[0];
    fireEvent.click(optionBtn);

    const submitBtn = screen.getByRole('button', { name: /İmtahanı Tamamla və Qiymətləndir/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Nəticə:/i)).toBeInTheDocument();
  });

  it('generates an electronic certificate and handles code copying', () => {
    render(<SectionSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('section-tab-simulator'));

    const genBtn = screen.getByRole('button', { name: /E-Sertifikat Yarat/i });
    fireEvent.click(genBtn);

    expect(screen.getByTestId('section-certificate-tab')).toBeInTheDocument();
    expect(screen.getByText(/SECTION-SAFE-AZ-2026 SERTİFİKATI/i)).toBeInTheDocument();

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    const copyBtn = screen.getByRole('button', { name: /Kodu Kopyala/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('filters public registry records by search query', () => {
    render(<SectionSafeModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('section-tab-registry'));
    expect(screen.getByTestId('section-registry-tab')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Nömrə və ya kod axtar\.\.\./i);
    fireEvent.change(searchInput, { target: { value: '10-SC-202' } });

    expect(screen.getByText('10-SC-202')).toBeInTheDocument();
    expect(screen.queryByText('99-SC-101')).not.toBeInTheDocument();
  });
});
