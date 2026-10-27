import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WinterPassModal } from '../WinterPassModal';

describe('WinterPassModal Component', () => {
  it('does not render when isOpen is false', () => {
    render(<WinterPassModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId('winter-pass-modal')).toBeNull();
  });

  it('renders modal header, title and default radar tab when open', () => {
    render(<WinterPassModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByTestId('winter-pass-modal')).toBeInTheDocument();
    expect(screen.getByText(/Qış Dağ Aşırımları və Təhlükəsizlik Portalı/i)).toBeInTheDocument();
    expect(screen.getByTestId('tab-content-radar')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<WinterPassModal isOpen={true} onClose={handleClose} />);
    const closeBtn = screen.getByTestId('winter-pass-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches between all tabs', () => {
    render(<WinterPassModal isOpen={true} onClose={vi.fn()} />);

    // De-Icing tab
    fireEvent.click(screen.getByTestId('tab-deicing'));
    expect(screen.getByTestId('tab-content-deicing')).toBeInTheDocument();

    // Machinery tab
    fireEvent.click(screen.getByTestId('tab-machinery'));
    expect(screen.getByTestId('tab-content-machinery')).toBeInTheDocument();

    // Chains tab
    fireEvent.click(screen.getByTestId('tab-chains'));
    expect(screen.getByTestId('tab-content-chains')).toBeInTheDocument();

    // Checklist & Exam tab
    fireEvent.click(screen.getByTestId('tab-checklist-exam'));
    expect(screen.getByTestId('tab-content-checklist-exam')).toBeInTheDocument();

    // Certificate tab
    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByTestId('tab-content-certificate')).toBeInTheDocument();

    // Back to Radar
    fireEvent.click(screen.getByTestId('tab-radar'));
    expect(screen.getByTestId('tab-content-radar')).toBeInTheDocument();
  });

  it('filters mountain passes by search query in radar tab', () => {
    render(<WinterPassModal isOpen={true} onClose={vi.fn()} />);
    const searchInput = screen.getByPlaceholderText(/Aşırım adı, rayon və ya magistral/i);

    fireEvent.change(searchInput, { target: { value: 'Şahdağ' } });
    expect(screen.getByTestId('pass-card-r1_shahdag_laza')).toBeInTheDocument();
    expect(screen.queryByTestId('pass-card-m4_agsu_pass')).toBeNull();
  });

  it('allows selecting different passes and updates selection', () => {
    render(<WinterPassModal isOpen={true} onClose={vi.fn()} />);
    const passCard = screen.getByTestId('pass-card-r19_murovdag_pass');
    fireEvent.click(passCard);

    expect(passCard).toHaveClass('ring-1');
  });

  it('calculates de-icing reagent requirements in deicing tab', () => {
    render(<WinterPassModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-deicing'));

    // Select Calcium Chloride
    fireEvent.click(screen.getByTestId('reagent-select-cacl2_liquid'));
    expect(screen.getByText(/Kalsium Xlorid \(CaCl₂\)/i)).toBeInTheDocument();
  });

  it('dispatches winter machinery in machinery tab', () => {
    render(<WinterPassModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-machinery'));

    fireEvent.click(screen.getByTestId('machinery-select-rotary_snow_blower'));
    const dispatchBtn = screen.getByTestId('dispatch-machinery-btn');
    fireEvent.click(dispatchBtn);

    expect(screen.getByText(/Texnika uğurla dispetçerləşdirildi/i)).toBeInTheDocument();
  });

  it('applies vehicle presets in tire chains tab', () => {
    render(<WinterPassModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-chains'));

    const presetBtn = screen.getByTestId('preset-btn-g63_amg');
    fireEvent.click(presetBtn);

    expect(screen.getByText(/10-AA-777/i)).toBeInTheDocument();
  });

  it('toggles checklist items and evaluates score', () => {
    render(<WinterPassModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-checklist-exam'));

    const item = screen.getByTestId('checklist-item-tire_chains');
    fireEvent.click(item); // uncheck
    expect(screen.getByText(/Nəticə:/i)).toBeInTheDocument();
  });

  it('submits theoretical exam and displays pass/fail result', () => {
    render(<WinterPassModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-checklist-exam'));

    // Select options for question 1 and 2
    fireEvent.click(screen.getByTestId('exam-q1-opt1'));
    fireEvent.click(screen.getByTestId('exam-q2-opt1'));

    const submitBtn = screen.getByTestId('submit-exam-btn');
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Düzgün Cavablar:/i)).toBeInTheDocument();
  });

  it('generates a new winter mountain pass clearance certificate', () => {
    render(<WinterPassModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByTestId('tab-certificate'));

    const genBtn = screen.getByTestId('generate-cert-btn');
    fireEvent.click(genBtn);

    expect(screen.getByTestId('certificate-voucher')).toBeInTheDocument();
    expect(screen.getByText(/RƏSMİ DAĞ AŞIRIMI QIŞ BURAXILIŞ VƏRƏQƏSİ/i)).toBeInTheDocument();
  });
});
