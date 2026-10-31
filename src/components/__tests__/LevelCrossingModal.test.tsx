import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LevelCrossingModal } from '../LevelCrossingModal';

describe('LevelCrossingModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    targetCar: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal header, title, and default radar tab when open', () => {
    render(<LevelCrossingModal {...defaultProps} />);
    expect(screen.getByText(/ADY, AAYDA & BDYP Həmsəviyyəli Dəmiryolu Keçidləri SCADA Portalı/i)).toBeInTheDocument();
    expect(screen.getByTestId('tab-radar-btn')).toBeInTheDocument();
    expect(screen.getAllByText(/Sabunçu - Zabrat Həmsəviyyəli Dəmiryolu Keçidi/i).length).toBeGreaterThan(0);
  });

  it('calls onClose when close button is clicked', () => {
    render(<LevelCrossingModal {...defaultProps} />);
    const closeBtn = screen.getByTestId('btn-modal-close');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('switches between all 7 navigation tabs cleanly', () => {
    render(<LevelCrossingModal {...defaultProps} />);

    // Calculator tab
    fireEvent.click(screen.getByTestId('tab-calculator-btn'));
    expect(screen.getByText(/Sürətli Nəqliyyat Kateqoriyası Şablonları/i)).toBeInTheDocument();

    // Simulator tab
    fireEvent.click(screen.getByTestId('tab-simulator-btn'));
    expect(screen.getByText(/ADY SCADA 2-Yollu Həmsəviyyəli Keçid Diaqramı/i)).toBeInTheDocument();

    // Checklist tab
    fireEvent.click(screen.getByTestId('tab-checklist-btn'));
    expect(screen.getByText(/10-Bəndlik Texniki Yoxlama/i)).toBeInTheDocument();

    // Exam tab
    fireEvent.click(screen.getByTestId('tab-exam-btn'));
    expect(screen.getByText(/Dəmir Yolu Keçidlərində Hərəkət Qaydaları və Maddə 44 İmtahanı/i)).toBeInTheDocument();

    // Certificate tab
    fireEvent.click(screen.getByTestId('tab-certificate-btn'));
    expect(screen.getByText(/Hələ Rəsmi Keçid Sertifikatı Yaradılmayıb/i)).toBeInTheDocument();

    // Registry tab
    fireEvent.click(screen.getByTestId('tab-registry-btn'));
    expect(screen.getByPlaceholderText(/Qeydiyyat nişanı, sertifikat və ya keçid axtar.../i)).toBeInTheDocument();
  });

  it('selects a different level crossing asset on the radar tab', () => {
    render(<LevelCrossingModal {...defaultProps} />);
    const card = screen.getByTestId('crossing-card-qobustan_sangachal');
    fireEvent.click(card);
    expect(screen.getByText(/Bakı - Ələt - Qazax - Gürcüstan Sərhədi \(M-2\)/i)).toBeInTheDocument();
  });

  it('applies vehicle presets and updates calculation on calculator tab', () => {
    render(<LevelCrossingModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-calculator-btn'));

    const harvesterBtn = screen.getByTestId('preset-btn-preset_oversize_harvester');
    fireEvent.click(harvesterBtn);

    const plateInput = screen.getByTestId('input-vehicle-plate') as HTMLInputElement;
    expect(plateInput.value).toBe('01-AG-404');
  });

  it('interacts with simulator controls including obstacle toggle and emergency ATS trip', () => {
    render(<LevelCrossingModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-simulator-btn'));

    const obstacleBtn = screen.getByTestId('btn-toggle-sim-obstacle');
    fireEvent.click(obstacleBtn);
    expect(screen.getByText(/Maneəni Götür/i)).toBeInTheDocument();

    const tripBtn = screen.getByTestId('btn-emergency-ats-trip');
    fireEvent.click(tripBtn);
    expect(screen.getByText(/Lokomotiv kabinasına ALSN\/ETCS qəza əyləc komandası ötürüldü/i)).toBeInTheDocument();
  });

  it('toggles checklist items and uses the select-all button', () => {
    render(<LevelCrossingModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-checklist-btn'));

    const item = screen.getByTestId('checklist-item-chk_stopping_distance');
    fireEvent.click(item);

    const selectAllBtn = screen.getByTestId('btn-select-all-checklist');
    fireEvent.click(selectAllBtn);
    expect(screen.getByText(/10 \/ 10 \(100%\)/i)).toBeInTheDocument();
  });

  it('submits the exam and displays evaluation results', () => {
    render(<LevelCrossingModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-exam-btn'));

    // Answer first question
    const q1Opt = screen.getByTestId('exam-q-1-opt-1');
    fireEvent.click(q1Opt);

    const submitBtn = screen.getByTestId('btn-submit-exam');
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Nəticə:/i)).toBeInTheDocument();
  });

  it('generates a certificate, handles copy and print operations', () => {
    const clipboardSpy = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardSpy,
      },
    });
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<LevelCrossingModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-calculator-btn'));

    const generateBtn = screen.getByTestId('btn-generate-cert-from-calc');
    fireEvent.click(generateBtn);

    expect(screen.getByText(/Rəsmi Sənəd UID:/i)).toBeInTheDocument();

    const copyBtn = screen.getByTestId('btn-copy-cert-id');
    fireEvent.click(copyBtn);
    expect(clipboardSpy).toHaveBeenCalled();

    const printBtn = screen.getByTestId('btn-print-cert');
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });

  it('searches and filters entries in the public registry tab', () => {
    render(<LevelCrossingModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-registry-btn'));

    const searchInput = screen.getByTestId('input-registry-search');
    fireEvent.change(searchInput, { target: { value: '01-AG-404' } });

    expect(screen.getByText('01-AG-404')).toBeInTheDocument();
  });
});
