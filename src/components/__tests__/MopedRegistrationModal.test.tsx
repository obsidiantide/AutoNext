import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MopedRegistrationModal } from '../MopedRegistrationModal';

describe('MopedRegistrationModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<MopedRegistrationModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default calculator tab when open', () => {
    render(<MopedRegistrationModal {...defaultProps} />);
    expect(
      screen.getByText('Moped, Motosiklet və Elektrik Skuter Dövlət Qeydiyyatı Portalı')
    ).toBeInTheDocument();
    expect(screen.getByText('Tənzimləmə & Rüsum Kalkulyatoru')).toBeInTheDocument();
    expect(screen.getByText('Dövlət Qeydiyyat Rüsumları')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<MopedRegistrationModal {...defaultProps} />);
    const closeBtn = screen.getByLabelText('Bağla');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 5 navigation tabs', () => {
    render(<MopedRegistrationModal {...defaultProps} />);

    // Safety tab
    fireEvent.click(screen.getByRole('button', { name: /Dəbilqə & Kuryer Təhlükəsizliyi/i }));
    expect(screen.getByText('Dəbilqə Təhlükəsizlik İndeksi')).toBeInTheDocument();

    // MERO tab
    fireEvent.click(screen.getByRole('button', { name: /MERO Qeydiyyat Radarı/i }));
    expect(screen.getByPlaceholderText(/MERO şöbəsi, rayon və ya ünvan axtar/i)).toBeInTheDocument();

    // Certificate tab
    fireEvent.click(screen.getByRole('button', { name: /DQN & E-Qeydiyyat Vəsiqəsi/i }));
    expect(screen.getByText(/MOPED ELEKTRON QEYDİYYAT ŞƏHADƏTNAMƏSİ/i)).toBeInTheDocument();

    // Registry tab
    fireEvent.click(screen.getByRole('button', { name: /Dövlət Reyestri Axtarışı/i }));
    expect(screen.getByPlaceholderText(/DQN nömrəsi/i)).toBeInTheDocument();

    // Calculator tab
    fireEvent.click(screen.getByRole('button', { name: /Tənzimləmə & Rüsum Kalkulyatoru/i }));
    expect(screen.getByText('Mühərrik Növü')).toBeInTheDocument();
  });

  it('updates calculation when toggling electric motor power type and adjusting sliders', () => {
    render(<MopedRegistrationModal {...defaultProps} />);

    const electricBtn = screen.getByRole('button', { name: /Elektrik Mühərriki/i });
    fireEvent.click(electricBtn);
    expect(screen.getByText(/Elektrik Gücü:/i)).toBeInTheDocument();

    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBeGreaterThan(0);
    fireEvent.change(sliders[0], { target: { value: '8.0' } });
  });

  it('applies quick preset scenarios when clicked', () => {
    render(<MopedRegistrationModal {...defaultProps} />);

    const presetBtn = screen.getByRole('button', {
      name: /Bolt Food Eko-Skuter Kuryeri/i,
    });
    fireEvent.click(presetBtn);

    expect(screen.getByText(/Elektrik Gücü:/i)).toBeInTheDocument();
  });

  it('filters MERO registration centers and books an appointment in MERO tab', () => {
    render(<MopedRegistrationModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /MERO Qeydiyyat Radarı/i }));
    const searchInput = screen.getByPlaceholderText(/MERO şöbəsi, rayon və ya ünvan axtar/i);

    fireEvent.change(searchInput, { target: { value: 'Zabrat' } });
    expect(screen.getByText(/BDYP Zabrat Baş Dövlət Qeydiyyat-İmtahan/i)).toBeInTheDocument();

    const selectBtn = screen.getAllByRole('button', { name: /Bu Şöbəni Seç|Seçilib/i })[0];
    fireEvent.click(selectBtn);
    expect(screen.getByText(/MERO şöbəsinə elektron növbə təsdiqləndi/i)).toBeInTheDocument();
  });

  it('handles print and certificate copy operations in certificate tab', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });

    render(<MopedRegistrationModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /DQN & E-Qeydiyyat Vəsiqəsi/i }));

    const copyBtn = screen.getByRole('button', { name: /Sənəd Nömrəsini Kopyala/i });
    fireEvent.click(copyBtn);
    expect(screen.getByText('Kopyalandı!')).toBeInTheDocument();

    const printBtn = screen.getByRole('button', { name: /Çap Et \/ PDF/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });

  it('searches and filters records in the unified registry tab', () => {
    render(<MopedRegistrationModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Dövlət Reyestri Axtarışı/i }));
    const searchInput = screen.getByPlaceholderText(/DQN nömrəsi/i);

    fireEvent.change(searchInput, { target: { value: '99-A-102' } });
    expect(screen.getByText('Honda Dio AF-68 (50cc)')).toBeInTheDocument();

    const viewBtn = screen.getAllByRole('button', { name: /Vəsiqəyə Bax/i })[0];
    fireEvent.click(viewBtn);
    expect(screen.getByText(/MOPED ELEKTRON QEYDİYYAT ŞƏHADƏTNAMƏSİ/i)).toBeInTheDocument();
  });
});
