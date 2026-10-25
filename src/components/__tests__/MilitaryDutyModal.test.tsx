import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MilitaryDutyModal } from '../MilitaryDutyModal';

describe('MilitaryDutyModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <MilitaryDutyModal isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, title, and default audit tab when open', () => {
    render(<MilitaryDutyModal isOpen={true} onClose={mockOnClose} />);

    expect(
      screen.getByText('Hərbi-Nəqliyyat Vəzifəsi & Qara Qeydiyyat Nişanları')
    ).toBeInTheDocument();
    expect(screen.getByText('SHXÇDX & MN Rəsmi Portalı')).toBeInTheDocument();
    expect(screen.getByText('10-Bəndlik Hazırlıq & Qara Nişan')).toBeInTheDocument();
    expect(
      screen.getByText('Azərbaycan Respublikası Hərbi Qeydiyyat Nişanı (YHQ Maddə 27)')
    ).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<MilitaryDutyModal isOpen={true} onClose={mockOnClose} />);
    const closeBtn = screen.getByRole('button', { name: 'Bağla' });
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('switches between all 6 navigation tabs cleanly', () => {
    render(<MilitaryDutyModal isOpen={true} onClose={mockOnClose} />);

    // Convoy tab
    const convoyTab = screen.getByRole('button', { name: /Taktiki Kolon Marşı/i });
    fireEvent.click(convoyTab);
    expect(
      screen.getByText('Taktiki Hərbi Kolon Marş Simulyatoru & Sürət Tənzimi')
    ).toBeInTheDocument();

    // Calculator tab
    const calcTab = screen.getByRole('button', { name: /Səfərbərlik Kompensasiyası/i });
    fireEvent.click(calcTab);
    expect(
      screen.getByText('Səfərbərlik Təlimi İcarə Kompensasiyası & Yanacaq Təminatı')
    ).toBeInTheDocument();

    // Divisions tab
    const divisionsTab = screen.getByRole('button', { name: /SHXÇDX İdarələri/i });
    fireEvent.click(divisionsTab);
    expect(
      screen.getByText('SHXÇDX Səfərbərlik İdarələri & Qərargah Radarı')
    ).toBeInTheDocument();

    // Exam tab
    const examTab = screen.getByRole('button', { name: /Nəzəri İmtahan/i });
    fireEvent.click(examTab);
    expect(
      screen.getByText('10-Suallıq Hərbi Kolon & Səfərbərlik Testi')
    ).toBeInTheDocument();

    // Certificate tab
    const certTab = screen.getByRole('button', { name: /Elektron Şəhadətnamə/i });
    fireEvent.click(certTab);
    expect(
      screen.getByText('Hərbi-Nəqliyyat Vəzifəsi Elektron Qeydiyyat Şəhadətnaməsi')
    ).toBeInTheDocument();
  });

  it('selects vehicle preset and updates black plate in audit tab', () => {
    render(<MilitaryDutyModal isOpen={true} onClose={mockOnClose} />);

    const uazPreset = screen.getByRole('button', { name: /UAZ Patriot/i });
    fireEvent.click(uazPreset);

    // Plate should display SHX format for UAZ
    expect(screen.getAllByText(/012 SHX 01/i).length).toBeGreaterThanOrEqual(1);
  });

  it('toggles checklist items and handles select-all button', () => {
    render(<MilitaryDutyModal isOpen={true} onClose={mockOnClose} />);

    const selectAllBtn = screen.getByRole('button', { name: /✓ Bütün Bəndləri Təsdiqlə/i });
    fireEvent.click(selectAllBtn);

    expect(screen.getByText(/100 \/ 100 Bal \(100%\)/i)).toBeInTheDocument();
  });

  it('interacts with convoy controls in convoy tab', () => {
    render(<MilitaryDutyModal isOpen={true} onClose={mockOnClose} />);

    const convoyTab = screen.getByRole('button', { name: /Taktiki Kolon Marşı/i });
    fireEvent.click(convoyTab);

    // Toggle adverse weather checkbox
    const adverseCheckbox = screen.getByRole('checkbox');
    fireEvent.click(adverseCheckbox);
    expect(adverseCheckbox).toBeChecked();

    // Select mountain terrain scenario
    const mountainScenario = screen.getByRole('button', { name: /Dağlıq Ərazilər/i });
    fireEvent.click(mountainScenario);
    expect(screen.getAllByText('25 km/saat').length).toBeGreaterThanOrEqual(1);
  });

  it('adjusts duration and updates calculation in calculator tab', () => {
    render(<MilitaryDutyModal isOpen={true} onClose={mockOnClose} />);

    const calcTab = screen.getByRole('button', { name: /Səfərbərlik Kompensasiyası/i });
    fireEvent.click(calcTab);

    // Change category to heavy truck
    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: 'heavy_truck_6x6' } });

    expect(screen.getByText(/90.00 AZN/i)).toBeInTheDocument();
  });

  it('filters divisions and registers booking in divisions tab', () => {
    render(<MilitaryDutyModal isOpen={true} onClose={mockOnClose} />);

    const divisionsTab = screen.getByRole('button', { name: /SHXÇDX İdarələri/i });
    fireEvent.click(divisionsTab);

    const searchInput = screen.getByPlaceholderText('Rayon və ya şəhər axtar...');
    fireEvent.change(searchInput, { target: { value: 'Yasamal' } });

    expect(screen.getByText('Bakı Şəhəri Yasamal Rayon SHXÇDX İdarəsi')).toBeInTheDocument();

    const bookBtns = screen.getAllByRole('button', { name: /Qəbul Növbəsi Yazıl →/i });
    fireEvent.click(bookBtns[0]);

    expect(
      screen.getByText('✓ Növbə qəbulu uğurla qeydə alındı! SMS bildiriş göndərildi.')
    ).toBeInTheDocument();
  });

  it('completes theoretical exam and displays verification result in exam tab', () => {
    render(<MilitaryDutyModal isOpen={true} onClose={mockOnClose} />);

    const examTab = screen.getByRole('button', { name: /Nəzəri İmtahan/i });
    fireEvent.click(examTab);

    const checkBtn = screen.getByRole('button', { name: 'Cavabları Yoxla' });
    fireEvent.click(checkBtn);

    expect(
      screen.getByText(/TƏƏSSÜF Kİ, minimal keçid balı/i)
    ).toBeInTheDocument();
  });

  it('generates certificate from audit tab and interacts with print/copy in certificate tab', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<MilitaryDutyModal isOpen={true} onClose={mockOnClose} />);

    const createCertBtn = screen.getByRole('button', { name: 'Şəhadətnamə Yarat →' });
    fireEvent.click(createCertBtn);

    expect(
      screen.getByText('Hərbi-Nəqliyyat Vəzifəsi Elektron Qeydiyyat Şəhadətnaməsi')
    ).toBeInTheDocument();

    const printBtn = screen.getByRole('button', { name: /Çap Et/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();

    printSpy.mockRestore();
  });
});
