import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AidSafeModal } from '../AidSafeModal';

describe('AidSafeModal Component Suite', () => {
  it('renders modal header, title, and default tab when open', () => {
    render(<AidSafeModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByTestId('aid-safe-modal')).toBeInTheDocument();
    expect(
      screen.getByText(/Magistral Yollarda Avtomatik Hadisə Aşkarlama \(AID\) & CCTV Video Analitika Portalı/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Respublika Magistral Avtomobil Yollarında AID CCTV Şəbəkəsi/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<AidSafeModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<AidSafeModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByTestId('aid-safe-close-btn');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches cleanly between all 5 navigation tabs', () => {
    render(<AidSafeModal isOpen={true} onClose={vi.fn()} />);

    // SCADA Video Analitika
    fireEvent.click(screen.getByRole('button', { name: /SCADA Video Analitika/i }));
    expect(screen.getByText(/Hadisə və Kamera Simulyasiya Parametrləri/i)).toBeInTheDocument();

    // Nəqliyyat Preserləri & İXM
    fireEvent.click(screen.getByRole('button', { name: /Nəqliyyat Preserləri & İXM/i }));
    expect(screen.getByText(/Həqiqi Azərbaycan Magistral Ssenariləri və Nəqliyyat Preserləri/i)).toBeInTheDocument();

    // Standartlar & İmtahan
    fireEvent.click(screen.getByRole('button', { name: /Standartlar & İmtahan/i }));
    expect(screen.getByText(/10-Mərhələli AID və Video Analitika Texniki Uyğunluq Standartı/i)).toBeInTheDocument();

    // Sertifikat & Reyestr
    fireEvent.click(screen.getByRole('button', { name: /Sertifikat & Reyestr/i }));
    expect(screen.getByText(/RƏSMİ ELEKTRON HADİSƏ ŞƏHADƏTNAMƏSİ/i)).toBeInTheDocument();

    // Back to Dəhlizlər & Kameralar
    fireEvent.click(screen.getByRole('button', { name: /Dəhlizlər & Kameralar/i }));
    expect(screen.getByText(/Respublika Magistral Avtomobil Yollarında AID CCTV Şəbəkəsi/i)).toBeInTheDocument();
  });

  it('allows selecting a camera from the radar grid', () => {
    render(<AidSafeModal isOpen={true} onClose={vi.fn()} />);

    const br1Camera = screen.getByText(/Bakı Dairəvi-1 Avtomobil Yolu/i);
    fireEvent.click(br1Camera);

    expect(screen.getAllByText(/AID-BR1-KM07/i).length).toBeGreaterThan(0);
  });

  it('interacts with incident type selector and updates SCADA parameters', () => {
    render(<AidSafeModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /SCADA Video Analitika/i }));

    const stoppedBtn = screen.getByRole('button', { name: /Zolaqda Dayanmış Avtomobil/i });
    fireEvent.click(stoppedBtn);

    expect(screen.getByText(/OBSTACLE/i)).toBeInTheDocument();
  });

  it('applies vehicle presets and displays updated license plate in presets tab', () => {
    render(<AidSafeModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Nəqliyyat Preserləri & İXM/i }));

    const tirPreset = screen.getByText(/Mercedes-Benz Actros 1845 TIR/i);
    fireEvent.click(tirPreset);

    expect(screen.getByText(/10-AD-202/i)).toBeInTheDocument();
  });

  it('interacts with checklist and checks all items', () => {
    render(<AidSafeModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Standartlar & İmtahan/i }));

    const selectAllBtn = screen.getByRole('button', { name: /Hamısını Seç/i });
    fireEvent.click(selectAllBtn);

    const resetBtn = screen.getByRole('button', { name: /Sıfırla/i });
    fireEvent.click(resetBtn);
  });

  it('submits theoretical exam and displays score evaluation', () => {
    render(<AidSafeModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Standartlar & İmtahan/i }));

    const submitBtn = screen.getByRole('button', { name: /Cavabları Təsdiqlə və Qiymətləndir/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Nəticə:/i)).toBeInTheDocument();
  });

  it('handles copy and print in certificate tab', () => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<AidSafeModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Sertifikat & Reyestr/i }));

    const copyBtn = screen.getByRole('button', { name: /Kopyala/i });
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    const printBtn = screen.getByRole('button', { name: /Çap Et/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });

  it('filters active registry entries in public registry tab', () => {
    render(<AidSafeModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Sertifikat & Reyestr/i }));

    const searchInput = screen.getByPlaceholderText(/Nömrə, sertifikat və ya dəhliz.../i);
    fireEvent.change(searchInput, { target: { value: '99-AI-101' } });

    expect(screen.getAllByText(/99-AI-101/i).length).toBeGreaterThan(0);
  });
});
