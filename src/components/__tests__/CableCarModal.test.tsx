import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CableCarModal } from '../CableCarModal';

describe('CableCarModal Component', () => {
  it('does not render when isOpen is false', () => {
    render(<CableCarModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId('cablecar-modal-backdrop')).toBeNull();
  });

  it('renders modal header, title and default radar tab when open', () => {
    render(<CableCarModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByTestId('cablecar-modal-backdrop')).toBeInTheDocument();
    expect(screen.getByText(/Kanat Yolları & Funikulyor Təhlükəsizlik Portalı/i)).toBeInTheDocument();
    expect(screen.getByTestId('cablecar-radar-tab-content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<CableCarModal isOpen={true} onClose={handleClose} />);
    const closeBtn = screen.getByTestId('cablecar-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 7 navigation tabs', () => {
    render(<CableCarModal isOpen={true} onClose={vi.fn()} />);

    // Switch to Anemometer tab
    fireEvent.click(screen.getByTestId('tab-anemometer'));
    expect(screen.getByTestId('cablecar-anemometer-tab-content')).toBeInTheDocument();

    // Switch to Cable MRT tab
    fireEvent.click(screen.getByTestId('tab-cable-mrt'));
    expect(screen.getByTestId('cablecar-mrt-tab-content')).toBeInTheDocument();

    // Switch to Fare Calculator tab
    fireEvent.click(screen.getByTestId('tab-fare-calc'));
    expect(screen.getByTestId('cablecar-fare-tab-content')).toBeInTheDocument();

    // Switch to Checklist tab
    fireEvent.click(screen.getByTestId('tab-checklist'));
    expect(screen.getByTestId('cablecar-checklist-tab-content')).toBeInTheDocument();

    // Switch to Exam tab
    fireEvent.click(screen.getByTestId('tab-exam'));
    expect(screen.getByTestId('cablecar-exam-tab-content')).toBeInTheDocument();

    // Switch to Certificate tab
    fireEvent.click(screen.getByTestId('tab-certificate'));
    expect(screen.getByTestId('cablecar-certificate-tab-content')).toBeInTheDocument();

    // Switch back to Radar tab
    fireEvent.click(screen.getByTestId('tab-radar'));
    expect(screen.getByTestId('cablecar-radar-tab-content')).toBeInTheDocument();
  });

  it('filters installations by search input', () => {
    render(<CableCarModal isOpen={true} onClose={vi.fn()} />);
    const searchInput = screen.getByPlaceholderText(/Xətt, kurort və ya rayon axtar/i);

    fireEvent.change(searchInput, { target: { value: 'Funikulyor' } });
    expect(screen.getByText(/Bakı Şəhər Funikulyoru/i)).toBeInTheDocument();
    expect(screen.queryByText(/Ağbulaq Kreslolu/i)).toBeNull();
  });

  it('applies visitor preset and navigates to fare calculation', () => {
    render(<CableCarModal isOpen={true} onClose={vi.fn()} />);

    const presetBtn = screen.getByText(/Bakı Şəhər Gəzintisi \(Tələbə \/ Gənclər\)/i);
    fireEvent.click(presetBtn);

    expect(screen.getByTestId('cablecar-fare-tab-content')).toBeInTheDocument();
    expect(screen.getByText(/Uşaqlar \(6-12 yaş\) və tələbələr üçün 50% endirim tətbiq edildi/i)).toBeInTheDocument();
  });

  it('interacts with currency switcher and gear add-on in fare tab', () => {
    render(<CableCarModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByTestId('tab-fare-calc'));

    // Check gear add-on checkbox
    const gearCheckbox = screen.getByRole('checkbox');
    fireEvent.click(gearCheckbox);
    expect(gearCheckbox).toBeChecked();

    // Click USD currency button
    const usdButton = screen.getByRole('button', { name: 'USD' });
    fireEvent.click(usdButton);
    expect(screen.getByText(/\$/i)).toBeInTheDocument();
  });

  it('interacts with checklist and clicks Bütün Bəndləri Təsdiqlə', () => {
    render(<CableCarModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByTestId('tab-checklist'));
    const selectAllBtn = screen.getByText(/Bütün Bəndləri Təsdiqlə/i);
    fireEvent.click(selectAllBtn);

    expect(screen.getByText(/10 \/ 10 \(100%\)/i)).toBeInTheDocument();
  });

  it('generates a new certificate and handles copy and print actions', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    const clipboardSpy = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardSpy,
      },
    });

    render(<CableCarModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByTestId('tab-checklist'));
    const certCreateBtn = screen.getByText(/FHN Sertifikatı Yarat/i);
    fireEvent.click(certCreateBtn);

    expect(screen.getByTestId('cablecar-certificate-tab-content')).toBeInTheDocument();
    expect(screen.getByText(/SƏRNİŞİN KANAT YOLU İSTİSMAR ŞƏHADƏTNAMƏSİ/i)).toBeInTheDocument();

    // Copy action
    const copyBtn = screen.getByText(/Kopyala/i);
    fireEvent.click(copyBtn);
    expect(clipboardSpy).toHaveBeenCalled();

    // Print action
    const printBtn = screen.getByText(/Çap et/i);
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    printSpy.mockRestore();
  });
});
