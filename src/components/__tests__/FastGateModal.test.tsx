import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastGateModal, FastGateModalProps } from '../FastGateModal';

describe('FastGateModal Component Suite', () => {
  const defaultProps: FastGateModalProps = {
    isOpen: true,
    onClose: vi.fn(),
    currency: 'AZN',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<FastGateModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders modal header and default radar tab when open', () => {
    render(<FastGateModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByText(/Magistral Qəza və Xilasetmə Ayrıcı Zolaq Keçidləri/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText(/AAYDA • FHN 112 • BDYP/i)[0]).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<FastGateModal {...defaultProps} onClose={onClose} />);
    const closeBtn = screen.getByTestId('fast-gate-close-btn');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when footer close button is clicked', () => {
    const onClose = vi.fn();
    render(<FastGateModal {...defaultProps} onClose={onClose} />);
    const footerCloseBtn = screen.getByTestId('fast-gate-footer-close-btn');
    fireEvent.click(footerCloseBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<FastGateModal {...defaultProps} />);

    // Simulator Tab
    fireEvent.click(screen.getByTestId('tab-simulator'));
    expect(screen.getByText(/Qəza və Contraflow Parametrləri/i)).toBeInTheDocument();

    // Sanctions Tab
    fireEvent.click(screen.getByTestId('tab-sanctions'));
    expect(screen.getByText(/Nəqliyyat Kateqoriyaları və İnzibati Xətalar/i)).toBeInTheDocument();

    // Checklist Tab
    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByText(/10 Bəndlik Dövlət Standartı/i)).toBeInTheDocument();

    // Exam Tab
    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByText(/10 Suallıq Magistral Qəza Keçidləri/i)).toBeInTheDocument();

    // Certificate Tab
    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByText(/FÖVQƏLADƏ OPERATİV KEÇİD/i)).toBeInTheDocument();

    // Registry Tab
    fireEvent.click(screen.getByTestId('tab-registry'));
    expect(screen.getByText(/Vahid Dövlət Qəza Keçidləri & Fast-Gate Açıq Reyestri/i)).toBeInTheDocument();

    // Radar Tab
    fireEvent.click(screen.getByTestId('tab-radar'));
    expect(screen.getByText(/6 Strateji Fast-Gate Qəza Keçidi/i)).toBeInTheDocument();
  });

  it('selects a zone from the radar grid and navigates to simulator', () => {
    render(<FastGateModal {...defaultProps} />);
    const zoneCard = screen.getByTestId('zone-card-zone-fg-2');
    fireEvent.click(zoneCard);

    const goToSimBtn = screen.getByTestId('go-to-simulator-btn');
    fireEvent.click(goToSimBtn);
    expect(screen.getByText(/Qəza və Contraflow Parametrləri/i)).toBeInTheDocument();
  });

  it('interacts with sliders, gate toggle and audio test button in simulator tab', () => {
    render(<FastGateModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-simulator'));

    // Mainline queue slider
    const queueSlider = screen.getByTestId('slider-queue-km');
    fireEvent.change(queueSlider, { target: { value: '6.0' } });

    // Gate toggle button
    const toggleBtn = screen.getByTestId('gate-toggle-btn');
    fireEvent.click(toggleBtn);
    expect(screen.getByText(/AÇIQ \(Contraflow\)/i)).toBeInTheDocument();

    // Audio chime test button
    const audioBtn = screen.getByTestId('audio-chime-btn');
    fireEvent.click(audioBtn);
  });

  it('selects vehicle presets and displays sanctions in sanctions tab', () => {
    render(<FastGateModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-sanctions'));

    // Select civilian unauthorized U-turn preset
    const civilianPreset = screen.getByTestId('vehicle-preset-veh-fg-4');
    fireEvent.click(civilianPreset);

    expect(screen.getByText(/QANUNSUZ KEÇİD \/ CƏRİMƏ/i)).toBeInTheDocument();
    expect(screen.getByText(/İXM Maddə 327.4/i)).toBeInTheDocument();
  });

  it('interacts with technical checklist items, check all and reset', () => {
    render(<FastGateModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-checklist'));

    const resetBtn = screen.getByTestId('reset-checklist-btn');
    fireEvent.click(resetBtn);
    expect(screen.getByText(/Qeyri-kafi/i)).toBeInTheDocument();

    const checkAllBtn = screen.getByTestId('check-all-btn');
    fireEvent.click(checkAllBtn);
    expect(screen.getByText(/Tam Uyğundur/i)).toBeInTheDocument();
  });

  it('completes exam with autofill and evaluates score', () => {
    render(<FastGateModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-exam'));

    const autofillBtn = screen.getByTestId('exam-autofill-btn');
    fireEvent.click(autofillBtn);

    expect(screen.getByTestId('exam-score-banner')).toBeInTheDocument();
    expect(screen.getByText(/10 \/ 10 \(%100\)/i)).toBeInTheDocument();
  });

  it('generates a new voucher, copies code and filters registry', () => {
    render(<FastGateModal {...defaultProps} />);
    fireEvent.click(screen.getByTestId('tab-certificate'));

    const genBtn = screen.getByTestId('generate-cert-btn');
    fireEvent.click(genBtn);

    const copyBtn = screen.getByTestId('copy-cert-code-btn');
    fireEvent.click(copyBtn);

    // Switch to registry tab
    fireEvent.click(screen.getByTestId('tab-registry'));
    const searchInput = screen.getByTestId('registry-search-input');
    fireEvent.change(searchInput, { target: { value: '00-FHN-112' } });

    expect(screen.getAllByText(/00-FHN-112/i).length).toBeGreaterThan(0);
  });
});
