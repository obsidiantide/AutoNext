import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MetroIntermodalModal } from '../MetroIntermodalModal';

describe('MetroIntermodalModal Component Suite', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <MetroIntermodalModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default tab (calculator) when open', () => {
    render(<MetroIntermodalModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByTestId('metro-intermodal-modal')).toBeInTheDocument();
    expect(screen.getByText('Bakı Metropoliteni & AYNA Yerüstü NMM Portalı')).toBeInTheDocument();
    expect(screen.getByTestId('metro-calculator-view')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<MetroIntermodalModal isOpen={true} onClose={mockOnClose} />);

    const closeBtn = screen.getByTestId('metro-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches between all 6 navigation tabs cleanly', () => {
    render(<MetroIntermodalModal isOpen={true} onClose={mockOnClose} />);

    // Hubs Radar
    fireEvent.click(screen.getByTestId('tab-hubs-radar'));
    expect(screen.getByTestId('metro-radar-view')).toBeInTheDocument();

    // Underground Safety
    fireEvent.click(screen.getByTestId('tab-underground-safety'));
    expect(screen.getByTestId('metro-safety-view')).toBeInTheDocument();

    // Exam Simulator
    fireEvent.click(screen.getByTestId('tab-exam-simulator'));
    expect(screen.getByTestId('metro-exam-view')).toBeInTheDocument();

    // Pass Generator
    fireEvent.click(screen.getByTestId('tab-pass-generator'));
    expect(screen.getByTestId('metro-pass-view')).toBeInTheDocument();

    // Registry Lookup
    fireEvent.click(screen.getByTestId('tab-registry-lookup'));
    expect(screen.getByTestId('metro-registry-view')).toBeInTheDocument();

    // Back to Calculator
    fireEvent.click(screen.getByTestId('tab-savings-calculator'));
    expect(screen.getByTestId('metro-calculator-view')).toBeInTheDocument();
  });

  it('applies vehicle presets and updates calculator parameters', () => {
    render(<MetroIntermodalModal isOpen={true} onClose={mockOnClose} />);

    const presetBtn = screen.getByTestId('preset-btn-preset_electric_ev');
    fireEvent.click(presetBtn);

    const plateInput = screen.getByDisplayValue('77-EV-303');
    expect(plateInput).toBeInTheDocument();
  });

  it('toggles LPG/CNG fire safety checkbox and reflects prohibition', () => {
    render(<MetroIntermodalModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-underground-safety'));
    expect(screen.getByTestId('metro-safety-view')).toBeInTheDocument();

    const lpgCheckbox = screen.getByTestId('checkbox-lpg-cng');
    fireEvent.click(lpgCheckbox);

    expect(screen.getByText(/LPG\/CNG: Yeraltıya Giriş Qadağandır!/i)).toBeInTheDocument();
  });

  it('interacts with exam simulator and grades the quiz', () => {
    render(<MetroIntermodalModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-exam-simulator'));

    // Select options for questions
    const q1Option = screen.getByTestId('exam-option-metro_q1-1');
    fireEvent.click(q1Option);

    const submitBtn = screen.getByTestId('submit-exam-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Nəticə:/i)).toBeInTheDocument();
  });

  it('generates a new digital pass and navigates to pass generator view', () => {
    render(<MetroIntermodalModal isOpen={true} onClose={mockOnClose} />);

    const generateBtn = screen.getByTestId('generate-pass-btn');
    fireEvent.click(generateBtn);

    expect(screen.getByTestId('metro-pass-view')).toBeInTheDocument();
    expect(screen.getByText('BAKI METROPOLİTENİ QSC & AYNA')).toBeInTheDocument();
  });

  it('filters active registry permits by search query', () => {
    render(<MetroIntermodalModal isOpen={true} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('tab-registry-lookup'));

    const searchInput = screen.getByTestId('input-registry-search');
    fireEvent.change(searchInput, { target: { value: '10-BM-100' } });

    expect(screen.getByText('10-BM-100')).toBeInTheDocument();
  });
});
