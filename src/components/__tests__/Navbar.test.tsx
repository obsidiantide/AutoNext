import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '../Navbar';
import { Currency, Language, Vehicle } from '../../types/vehicle';

describe('Navbar Component', () => {
  const defaultProps = {
    currency: 'AZN' as Currency,
    setCurrency: vi.fn(),
    lang: 'en' as Language,
    setLang: vi.fn(),
    theme: 'system' as const,
    onToggleTheme: vi.fn(),
    comparedVehicles: [] as Vehicle[],
    favoritesCount: 0,
    isFavoritesFilterActive: false,
    onToggleFavoritesFilter: vi.fn(),
    onOpenCompare: vi.fn(),
    onOpenCalculator: vi.fn(),
    onOpenAiAdvisor: vi.fn(),
    onOpenCreateListing: vi.fn(),
  };

  it('renders the brand logo and text correctly', () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByText('Auto')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('PRO')).toBeInTheDocument();
  });

  it('calls setLang when a language is selected', () => {
    render(<Navbar {...defaultProps} />);
    const azButton = screen.getByText('az');
    fireEvent.click(azButton);
    expect(defaultProps.setLang).toHaveBeenCalledWith('az');
  });

  it('calls setCurrency when a currency is selected', () => {
    render(<Navbar {...defaultProps} />);
    const usdButton = screen.getByText('$');
    fireEvent.click(usdButton);
    expect(defaultProps.setCurrency).toHaveBeenCalledWith('USD');
  });

  it('displays compared vehicles count if there are compared vehicles', () => {
    const mockVehicle = {
      id: '1',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      price: 25000,
      currency: 'AZN',
      mileage: 50000,
      engineVolume: 2.5,
      power: 203,
      city: 'Baku',
      views: 100,
      postedAt: '2023-10-01',
      images: ['image1.jpg'],
      isDealer: false,
      hasDamage: false,
      isVerified: true,
      condition: 'Excellent',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      bodyType: 'Sedan',
      color: 'Black'
    } as unknown as Vehicle;

    render(<Navbar {...defaultProps} comparedVehicles={[mockVehicle]} />);
    // Check if the badge "1" is rendered
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('displays favorites count if there are favorites', () => {
    render(<Navbar {...defaultProps} favoritesCount={3} />);
    // Check if the badge "3" is rendered
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls appropriate callbacks when feature buttons are clicked', () => {
    render(<Navbar {...defaultProps} />);
    
    // Calculator button (en) -> 'Loan Calculator'
    const calculatorBtn = screen.getByText('Loan Calculator');
    fireEvent.click(calculatorBtn);
    expect(defaultProps.onOpenCalculator).toHaveBeenCalled();

    // AI Advisor
    const aiAdvisorBtn = screen.getByText('AI Advisor');
    fireEvent.click(aiAdvisorBtn);
    expect(defaultProps.onOpenAiAdvisor).toHaveBeenCalled();

    // Compare
    const compareBtn = screen.getByText('Compare');
    fireEvent.click(compareBtn);
    expect(defaultProps.onOpenCompare).toHaveBeenCalled();

    // Post Ad (en) -> '+ Post a Car'
    const postAdBtn = screen.getByText('+ Post a Car');
    fireEvent.click(postAdBtn);
    expect(defaultProps.onOpenCreateListing).toHaveBeenCalled();

    // Favorites
    const favoritesBtn = screen.getByText('Seçilmişlər');
    fireEvent.click(favoritesBtn);
    expect(defaultProps.onToggleFavoritesFilter).toHaveBeenCalled();
  });

  it('renders and calls onOpenParking when provided', () => {
    const onOpenParking = vi.fn();
    render(<Navbar {...defaultProps} onOpenParking={onOpenParking} />);

    const parkingBtn = screen.getByTestId('navbar-parking-btn');
    expect(parkingBtn).toBeInTheDocument();
    fireEvent.click(parkingBtn);
    expect(onOpenParking).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenFuelStations when provided', () => {
    const onOpenFuelStations = vi.fn();
    render(<Navbar {...defaultProps} onOpenFuelStations={onOpenFuelStations} />);

    const fuelBtn = screen.getByTestId('navbar-fuel-stations-btn');
    expect(fuelBtn).toBeInTheDocument();
    fireEvent.click(fuelBtn);
    expect(onOpenFuelStations).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenEuroprotocol when provided', () => {
    const onOpenEuroprotocol = vi.fn();
    render(<Navbar {...defaultProps} onOpenEuroprotocol={onOpenEuroprotocol} />);

    const euroBtn = screen.getByTestId('navbar-europrotocol-btn');
    expect(euroBtn).toBeInTheDocument();
    fireEvent.click(euroBtn);
    expect(onOpenEuroprotocol).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenGreenCard when provided', () => {
    const onOpenGreenCard = vi.fn();
    render(<Navbar {...defaultProps} onOpenGreenCard={onOpenGreenCard} />);

    const gcBtn = screen.getByTestId('navbar-green-card-btn');
    expect(gcBtn).toBeInTheDocument();
    fireEvent.click(gcBtn);
    expect(onOpenGreenCard).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenTaxiCompliance when provided', () => {
    const onOpenTaxiCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenTaxiCompliance={onOpenTaxiCompliance} />);

    const taxiBtn = screen.getByTestId('navbar-taxi-compliance-btn');
    expect(taxiBtn).toBeInTheDocument();
    fireEvent.click(taxiBtn);
    expect(onOpenTaxiCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenTuningCompliance when provided', () => {
    const onOpenTuningCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenTuningCompliance={onOpenTuningCompliance} />);

    const tuningBtn = screen.getByTestId('navbar-tuning-compliance-btn');
    expect(tuningBtn).toBeInTheDocument();
    fireEvent.click(tuningBtn);
    expect(onOpenTuningCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenScrappage when provided', () => {
    const onOpenScrappage = vi.fn();
    render(<Navbar {...defaultProps} onOpenScrappage={onOpenScrappage} />);

    const scrappageBtn = screen.getByTestId('navbar-scrappage-btn');
    expect(scrappageBtn).toBeInTheDocument();
    fireEvent.click(scrappageBtn);
    expect(onOpenScrappage).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenImpoundLot when provided', () => {
    const onOpenImpoundLot = vi.fn();
    render(<Navbar {...defaultProps} onOpenImpoundLot={onOpenImpoundLot} />);

    const impoundBtn = screen.getByTestId('navbar-impound-lot-btn');
    expect(impoundBtn).toBeInTheDocument();
    fireEvent.click(impoundBtn);
    expect(onOpenImpoundLot).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenSpecialTraffic when provided', () => {
    const onOpenSpecialTraffic = vi.fn();
    render(<Navbar {...defaultProps} onOpenSpecialTraffic={onOpenSpecialTraffic} />);

    const specialTrafficBtn = screen.getByTestId('navbar-special-traffic-btn');
    expect(specialTrafficBtn).toBeInTheDocument();
    fireEvent.click(specialTrafficBtn);
    expect(onOpenSpecialTraffic).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenDriverLicense when provided', () => {
    const onOpenDriverLicense = vi.fn();
    render(<Navbar {...defaultProps} onOpenDriverLicense={onOpenDriverLicense} />);

    const driverLicenseBtn = screen.getByTestId('navbar-driver-license-btn');
    expect(driverLicenseBtn).toBeInTheDocument();
    fireEvent.click(driverLicenseBtn);
    expect(onOpenDriverLicense).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenTireCompliance when provided', () => {
    const onOpenTireCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenTireCompliance={onOpenTireCompliance} />);

    const tireBtn = screen.getByTestId('navbar-tire-compliance-btn');
    expect(tireBtn).toBeInTheDocument();
    fireEvent.click(tireBtn);
    expect(onOpenTireCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenHeadlightCompliance when provided', () => {
    const onOpenHeadlightCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenHeadlightCompliance={onOpenHeadlightCompliance} />);

    const headlightBtn = screen.getByTestId('navbar-headlight-compliance-btn');
    expect(headlightBtn).toBeInTheDocument();
    fireEvent.click(headlightBtn);
    expect(onOpenHeadlightCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenPassengerSafety when provided', () => {
    const onOpenPassengerSafety = vi.fn();
    render(<Navbar {...defaultProps} onOpenPassengerSafety={onOpenPassengerSafety} />);

    const safetyBtn = screen.getByTestId('navbar-passenger-safety-btn');
    expect(safetyBtn).toBeInTheDocument();
    fireEvent.click(safetyBtn);
    expect(onOpenPassengerSafety).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenEmissionsCompliance when provided', () => {
    const onOpenEmissionsCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenEmissionsCompliance={onOpenEmissionsCompliance} />);

    const emissionsBtn = screen.getByTestId('navbar-emissions-compliance-btn');
    expect(emissionsBtn).toBeInTheDocument();
    fireEvent.click(emissionsBtn);
    expect(onOpenEmissionsCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenBrakeSteering when provided', () => {
    const onOpenBrakeSteering = vi.fn();
    render(<Navbar {...defaultProps} onOpenBrakeSteering={onOpenBrakeSteering} />);

    const brakeBtn = screen.getByTestId('navbar-brake-steering-btn');
    expect(brakeBtn).toBeInTheDocument();
    fireEvent.click(brakeBtn);
    expect(onOpenBrakeSteering).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenVisibilityHorn when provided', () => {
    const onOpenVisibilityHorn = vi.fn();
    render(<Navbar {...defaultProps} onOpenVisibilityHorn={onOpenVisibilityHorn} />);

    const visBtn = screen.getByTestId('navbar-visibility-horn-btn');
    expect(visBtn).toBeInTheDocument();
    fireEvent.click(visBtn);
    expect(onOpenVisibilityHorn).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenForensicPlate when provided', () => {
    const onOpenForensicPlate = vi.fn();
    render(<Navbar {...defaultProps} onOpenForensicPlate={onOpenForensicPlate} />);

    const forensicBtn = screen.getByTestId('navbar-forensic-plate-btn');
    expect(forensicBtn).toBeInTheDocument();
    fireEvent.click(forensicBtn);
    expect(onOpenForensicPlate).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenBodyworkAdvertising when provided', () => {
    const onOpenBodyworkAdvertising = vi.fn();
    render(<Navbar {...defaultProps} onOpenBodyworkAdvertising={onOpenBodyworkAdvertising} />);

    const bodyworkBtn = screen.getByTestId('navbar-bodywork-advertising-btn');
    expect(bodyworkBtn).toBeInTheDocument();
    fireEvent.click(bodyworkBtn);
    expect(onOpenBodyworkAdvertising).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenTachographWorkRest when provided', () => {
    const onOpenTachographWorkRest = vi.fn();
    render(<Navbar {...defaultProps} onOpenTachographWorkRest={onOpenTachographWorkRest} />);

    const tachoBtn = screen.getByTestId('navbar-tachograph-work-rest-btn');
    expect(tachoBtn).toBeInTheDocument();
    fireEvent.click(tachoBtn);
    expect(onOpenTachographWorkRest).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenHvBatterySafety when provided', () => {
    const onOpenHvBatterySafety = vi.fn();
    render(<Navbar {...defaultProps} onOpenHvBatterySafety={onOpenHvBatterySafety} />);

    const hvBtn = screen.getByTestId('navbar-hv-battery-safety-btn');
    expect(hvBtn).toBeInTheDocument();
    fireEvent.click(hvBtn);
    expect(onOpenHvBatterySafety).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenSuspensionChassis when provided', () => {
    const onOpenSuspensionChassis = vi.fn();
    render(<Navbar {...defaultProps} onOpenSuspensionChassis={onOpenSuspensionChassis} />);

    const btn = screen.getByTestId('navbar-suspension-chassis-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenSuspensionChassis).toHaveBeenCalledTimes(1);
  });

  it('renders and calls onOpenDriverMedical when provided', () => {
    const onOpenDriverMedical = vi.fn();
    render(<Navbar {...defaultProps} onOpenDriverMedical={onOpenDriverMedical} />);

    const btn = screen.getByTestId('navbar-driver-medical-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenDriverMedical).toHaveBeenCalledTimes(1);
  });

  it('renders driving school button and calls onOpenDrivingSchool when clicked', () => {
    const onOpenDrivingSchool = vi.fn();
    render(<Navbar {...defaultProps} onOpenDrivingSchool={onOpenDrivingSchool} />);

    const btn = screen.getByTestId('navbar-driving-school-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenDrivingSchool).toHaveBeenCalledTimes(1);
  });

  it('renders ADR compliance button and calls onOpenAdrCompliance when clicked', () => {
    const onOpenAdrCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenAdrCompliance={onOpenAdrCompliance} />);

    const btn = screen.getByTestId('navbar-adr-compliance-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenAdrCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders oversize cargo permit button and calls onOpenOversizePermit when clicked', () => {
    const onOpenOversizePermit = vi.fn();
    render(<Navbar {...defaultProps} onOpenOversizePermit={onOpenOversizePermit} />);

    const btn = screen.getByTestId('navbar-oversize-permit-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenOversizePermit).toHaveBeenCalledTimes(1);
  });

  it('renders accident forensics button and calls onOpenAccidentForensics when clicked', () => {
    const onOpenAccidentForensics = vi.fn();
    render(<Navbar {...defaultProps} onOpenAccidentForensics={onOpenAccidentForensics} />);

    const btn = screen.getByTestId('navbar-accident-forensics-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenAccidentForensics).toHaveBeenCalledTimes(1);
  });

  it('renders special signal & siren button and calls onOpenSpecialSignal when clicked', () => {
    const onOpenSpecialSignal = vi.fn();
    render(<Navbar {...defaultProps} onOpenSpecialSignal={onOpenSpecialSignal} />);

    const btn = screen.getByTestId('navbar-special-signal-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenSpecialSignal).toHaveBeenCalledTimes(1);
  });

  it('renders vehicle auction button and calls onOpenVehicleAuction when clicked', () => {
    const onOpenVehicleAuction = vi.fn();
    render(<Navbar {...defaultProps} onOpenVehicleAuction={onOpenVehicleAuction} />);

    const btn = screen.getByTestId('navbar-vehicle-auction-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenVehicleAuction).toHaveBeenCalledTimes(1);
  });

  it('renders customs transit button and calls onOpenCustomsTransit when clicked', () => {
    const onOpenCustomsTransit = vi.fn();
    render(<Navbar {...defaultProps} onOpenCustomsTransit={onOpenCustomsTransit} />);

    const btn = screen.getByTestId('navbar-customs-transit-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenCustomsTransit).toHaveBeenCalledTimes(1);
  });

  it('renders Yolumuz Qarabağa button and calls onOpenKarabakhPermit when clicked', () => {
    const onOpenKarabakhPermit = vi.fn();
    render(<Navbar {...defaultProps} onOpenKarabakhPermit={onOpenKarabakhPermit} />);

    const btn = screen.getByTestId('navbar-karabakh-permit-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenKarabakhPermit).toHaveBeenCalledTimes(1);
  });

  it('renders DVX vehicle tax button and calls onOpenVehicleTax when clicked', () => {
    const onOpenVehicleTax = vi.fn();
    render(<Navbar {...defaultProps} onOpenVehicleTax={onOpenVehicleTax} />);

    const btn = screen.getByTestId('navbar-vehicle-tax-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenVehicleTax).toHaveBeenCalledTimes(1);
  });

  it('renders AMB & İSB Bonus-Malus button and calls onOpenBonusMalus when clicked', () => {
    const onOpenBonusMalus = vi.fn();
    render(<Navbar {...defaultProps} onOpenBonusMalus={onOpenBonusMalus} />);

    const btn = screen.getByTestId('navbar-bonus-malus-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenBonusMalus).toHaveBeenCalledTimes(1);
  });

  it('renders ETSN & BDYP Eco-Sticker LEZ button and calls onOpenEcoSticker when clicked', () => {
    const onOpenEcoSticker = vi.fn();
    render(<Navbar {...defaultProps} onOpenEcoSticker={onOpenEcoSticker} />);

    const btn = screen.getByTestId('navbar-eco-sticker-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenEcoSticker).toHaveBeenCalledTimes(1);
  });

  it('renders AMB & ALA Leasing button and calls onOpenLeasing when clicked', () => {
    const onOpenLeasing = vi.fn();
    render(<Navbar {...defaultProps} onOpenLeasing={onOpenLeasing} />);

    const btn = screen.getByTestId('navbar-leasing-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenLeasing).toHaveBeenCalledTimes(1);
  });

  it('renders ACRA & BDYP Car Rental button and calls onOpenRental when clicked', () => {
    const onOpenRental = vi.fn();
    render(<Navbar {...defaultProps} onOpenRental={onOpenRental} />);

    const btn = screen.getByTestId('navbar-rental-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenRental).toHaveBeenCalledTimes(1);
  });

  it('renders RİNN, AYNA, AZS & BDYP ADAS Calibration button and calls onOpenAdas when clicked', () => {
    const onOpenAdas = vi.fn();
    render(<Navbar {...defaultProps} onOpenAdas={onOpenAdas} />);

    const btn = screen.getByTestId('navbar-adas-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenAdas).toHaveBeenCalledTimes(1);
  });

  it('renders AMB, İSB & BDYP Total Loss / Salvage button and calls onOpenSalvage when clicked', () => {
    const onOpenSalvage = vi.fn();
    render(<Navbar {...defaultProps} onOpenSalvage={onOpenSalvage} />);

    const btn = screen.getByTestId('navbar-salvage-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenSalvage).toHaveBeenCalledTimes(1);
  });

  it('renders RİNN, AYNA & ABADA International Freight button and calls onOpenFreight when clicked', () => {
    const onOpenFreight = vi.fn();
    render(<Navbar {...defaultProps} onOpenFreight={onOpenFreight} />);

    const btn = screen.getByTestId('navbar-freight-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenFreight).toHaveBeenCalledTimes(1);
  });

  it('renders AYNA & BBIQ Intercity Bus button and calls onOpenIntercityBus when clicked', () => {
    const onOpenIntercityBus = vi.fn();
    render(<Navbar {...defaultProps} onOpenIntercityBus={onOpenIntercityBus} />);

    const btn = screen.getByTestId('navbar-intercity-bus-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenIntercityBus).toHaveBeenCalledTimes(1);
  });

  it('renders BDYP, DİN & AYNA Moped Registration button and calls onOpenMopedRegistration when clicked', () => {
    const onOpenMopedRegistration = vi.fn();
    render(<Navbar {...defaultProps} onOpenMopedRegistration={onOpenMopedRegistration} />);

    const btn = screen.getByTestId('navbar-moped-registration-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenMopedRegistration).toHaveBeenCalledTimes(1);
  });

  it('renders Elm və Təhsil Nazirliyi, AYNA & BDYP School Bus button and calls onOpenSchoolBus when clicked', () => {
    const onOpenSchoolBus = vi.fn();
    render(<Navbar {...defaultProps} onOpenSchoolBus={onOpenSchoolBus} />);

    const btn = screen.getByTestId('navbar-school-bus-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenSchoolBus).toHaveBeenCalledTimes(1);
  });

  it('renders KTN & DAXA Agricultural Machinery button and calls onOpenTractorCompliance when clicked', () => {
    const onOpenTractorCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenTractorCompliance={onOpenTractorCompliance} />);

    const btn = screen.getByTestId('navbar-tractor-compliance-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenTractorCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders AAF & BDYP Motorsport button and calls onOpenMotorsportCompliance when clicked', () => {
    const onOpenMotorsportCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenMotorsportCompliance={onOpenMotorsportCompliance} />);

    const btn = screen.getByTestId('navbar-motorsport-compliance-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenMotorsportCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders TƏBİB & BDYP Ambulance 103 button and calls onOpenAmbulanceCompliance when clicked', () => {
    const onOpenAmbulanceCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenAmbulanceCompliance={onOpenAmbulanceCompliance} />);

    const btn = screen.getByTestId('navbar-ambulance-compliance-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenAmbulanceCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders DİN & RNM Sobriety Alcotest button and calls onOpenSobrietyCompliance when clicked', () => {
    const onOpenSobrietyCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenSobrietyCompliance={onOpenSobrietyCompliance} />);

    const btn = screen.getByTestId('navbar-sobriety-compliance-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenSobrietyCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders XİN & BDYP Diplomatic Corps button and calls onOpenDiplomaticCompliance when clicked', () => {
    const onOpenDiplomaticCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenDiplomaticCompliance={onOpenDiplomaticCompliance} />);

    const btn = screen.getByTestId('navbar-diplomatic-compliance-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenDiplomaticCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders SHXÇDX & MN Military Duty button and calls onOpenMilitaryDuty when clicked', () => {
    const onOpenMilitaryDuty = vi.fn();
    render(<Navbar {...defaultProps} onOpenMilitaryDuty={onOpenMilitaryDuty} />);

    const btn = screen.getByTestId('navbar-military-duty-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenMilitaryDuty).toHaveBeenCalledTimes(1);
  });

  it('renders FHN & DYNX Fire Safety button and calls onOpenFireSafety when clicked', () => {
    const onOpenFireSafety = vi.fn();
    render(<Navbar {...defaultProps} onOpenFireSafety={onOpenFireSafety} />);

    const btn = screen.getByTestId('navbar-fire-safety-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenFireSafety).toHaveBeenCalledTimes(1);
  });

  it('renders DİN & NİİM Safe City button and calls onOpenSafeCity when clicked', () => {
    const onOpenSafeCity = vi.fn();
    render(<Navbar {...defaultProps} onOpenSafeCity={onOpenSafeCity} />);

    const btn = screen.getByTestId('navbar-safe-city-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenSafeCity).toHaveBeenCalledTimes(1);
  });

  it('renders DMAA & AZAL Airport Ramp button and calls onOpenAirportRamp when clicked', () => {
    const onOpenAirportRamp = vi.fn();
    render(<Navbar {...defaultProps} onOpenAirportRamp={onOpenAirportRamp} />);

    const btn = screen.getByTestId('navbar-airport-ramp-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenAirportRamp).toHaveBeenCalledTimes(1);
  });

  it('renders DDLA & ASCO Maritime Port button and calls onOpenMaritimePort when clicked', () => {
    const onOpenMaritimePort = vi.fn();
    render(<Navbar {...defaultProps} onOpenMaritimePort={onOpenMaritimePort} />);

    const btn = screen.getByTestId('navbar-maritime-port-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenMaritimePort).toHaveBeenCalledTimes(1);
  });

  it('renders ADY Railway Compliance button and calls onOpenRailwayCompliance when clicked', () => {
    const onOpenRailwayCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenRailwayCompliance={onOpenRailwayCompliance} />);

    const btn = screen.getByTestId('navbar-railway-compliance-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenRailwayCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders Baku Metro Intermodal Compliance button and calls onOpenMetroCompliance when clicked', () => {
    const onOpenMetroCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenMetroCompliance={onOpenMetroCompliance} />);

    const btn = screen.getByTestId('navbar-metro-compliance-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenMetroCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders DTA & FHN Cable Car Compliance button and calls onOpenCableCarCompliance when clicked', () => {
    const onOpenCableCarCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenCableCarCompliance={onOpenCableCarCompliance} />);

    const btn = screen.getByTestId('navbar-cablecar-compliance-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenCableCarCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA & FHN Winter Mountain Pass Compliance button and calls onOpenWinterPassCompliance when clicked', () => {
    const onOpenWinterPassCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenWinterPassCompliance={onOpenWinterPassCompliance} />);

    const btn = screen.getByTestId('navbar-winterpass-compliance-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenWinterPassCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders DGK & FHN TIR & Green Corridor button and calls onOpenTirCarnetCompliance when clicked', () => {
    const onOpenTirCarnetCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenTirCarnetCompliance={onOpenTirCarnetCompliance} />);

    const btn = screen.getByTestId('navbar-tircarnet-compliance-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenTirCarnetCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders AQTA & DGK Biosecurity button and calls onOpenBiosecurityCompliance when clicked', () => {
    const onOpenBiosecurityCompliance = vi.fn();
    render(<Navbar {...defaultProps} onOpenBiosecurityCompliance={onOpenBiosecurityCompliance} />);

    const btn = screen.getByTestId('navbar-biosecurity-compliance-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenBiosecurityCompliance).toHaveBeenCalledTimes(1);
  });

  it('renders Azərişıq V2G Smart Grid button and calls onOpenV2gSmartGrid when clicked', () => {
    const onOpenV2gSmartGrid = vi.fn();
    render(<Navbar {...defaultProps} onOpenV2gSmartGrid={onOpenV2gSmartGrid} />);

    const btn = screen.getByTestId('navbar-v2g-smart-grid-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenV2gSmartGrid).toHaveBeenCalledTimes(1);
  });

  it('renders AFEZ Multimodal Logistics button and calls onOpenAfezLogistics when clicked', () => {
    const onOpenAfezLogistics = vi.fn();
    render(<Navbar {...defaultProps} onOpenAfezLogistics={onOpenAfezLogistics} />);

    const btn = screen.getByTestId('navbar-afez-logistics-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenAfezLogistics).toHaveBeenCalledTimes(1);
  });

  it('renders AYNA WIM Axle Load button and calls onOpenAxleLoad when clicked', () => {
    const onOpenAxleLoad = vi.fn();
    render(<Navbar {...defaultProps} onOpenAxleLoad={onOpenAxleLoad} />);

    const btn = screen.getByTestId('navbar-axle-load-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenAxleLoad).toHaveBeenCalledTimes(1);
  });

  it('renders DGK Electronic Seal button and calls onOpenElectronicSeal when clicked', () => {
    const onOpenElectronicSeal = vi.fn();
    render(<Navbar {...defaultProps} onOpenElectronicSeal={onOpenElectronicSeal} />);

    const btn = screen.getByTestId('navbar-electronic-seal-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenElectronicSeal).toHaveBeenCalledTimes(1);
  });

  it('renders AYNA Intercity Mobility button and calls onOpenIntercityMobility when clicked', () => {
    const onOpenIntercityMobility = vi.fn();
    render(<Navbar {...defaultProps} onOpenIntercityMobility={onOpenIntercityMobility} />);

    const btn = screen.getByTestId('navbar-intercity-mobility-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenIntercityMobility).toHaveBeenCalledTimes(1);
  });

  it('renders FHN DYNX & BDYP ADR Tanker Safety button and calls onOpenTankerSafety when clicked', () => {
    const onOpenTankerSafety = vi.fn();
    render(<Navbar {...defaultProps} onOpenTankerSafety={onOpenTankerSafety} />);

    const btn = screen.getByTestId('navbar-tanker-safety-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenTankerSafety).toHaveBeenCalledTimes(1);
  });

  it('renders ETSN, AYNA & BDYP LEZ Eco-Zone button and calls onOpenLezEco when clicked', () => {
    const onOpenLezEco = vi.fn();
    render(<Navbar {...defaultProps} onOpenLezEco={onOpenLezEco} />);

    const btn = screen.getByTestId('navbar-lez-eco-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenLezEco).toHaveBeenCalledTimes(1);
  });

  it('renders ADY, AYNA & BDYP Piggyback Rail button and calls onOpenPiggybackRail when clicked', () => {
    const onOpenPiggybackRail = vi.fn();
    render(<Navbar {...defaultProps} onOpenPiggybackRail={onOpenPiggybackRail} />);

    const btn = screen.getByTestId('navbar-piggyback-rail-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenPiggybackRail).toHaveBeenCalledTimes(1);
  });

  it('renders DGK, AYNA & BDYP Customs Scanner button and calls onOpenCustomsScanner when clicked', () => {
    const onOpenCustomsScanner = vi.fn();
    render(<Navbar {...defaultProps} onOpenCustomsScanner={onOpenCustomsScanner} />);

    const btn = screen.getByTestId('navbar-customs-scanner-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenCustomsScanner).toHaveBeenCalledTimes(1);
  });

  it('renders AYNA, BDYP & FHN Autonomous Vehicle button and calls onOpenAutonomousVehicle when clicked', () => {
    const onOpenAutonomousVehicle = vi.fn();
    render(<Navbar {...defaultProps} onOpenAutonomousVehicle={onOpenAutonomousVehicle} />);

    const btn = screen.getByTestId('navbar-autonomous-vehicle-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenAutonomousVehicle).toHaveBeenCalledTimes(1);
  });

  it('renders RİNN, AYNA & BDYP Intelligent Transport Systems button and calls onOpenAdaptiveTraffic when clicked', () => {
    const onOpenAdaptiveTraffic = vi.fn();
    render(<Navbar {...defaultProps} onOpenAdaptiveTraffic={onOpenAdaptiveTraffic} />);

    const btn = screen.getByTestId('navbar-adaptive-traffic-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenAdaptiveTraffic).toHaveBeenCalledTimes(1);
  });

  it('renders DSX, DGK & BDYP Cross-Border e-Queue button and calls onOpenBorderQueue when clicked', () => {
    const onOpenBorderQueue = vi.fn();
    render(<Navbar {...defaultProps} onOpenBorderQueue={onOpenBorderQueue} />);

    const btn = screen.getByTestId('navbar-border-queue-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenBorderQueue).toHaveBeenCalledTimes(1);
  });

  it('renders DDAA, AZAL & Silk Way West Air Cargo button and calls onOpenAirCargo when clicked', () => {
    const onOpenAirCargo = vi.fn();
    render(<Navbar {...defaultProps} onOpenAirCargo={onOpenAirCargo} />);

    const btn = screen.getByTestId('navbar-air-cargo-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenAirCargo).toHaveBeenCalledTimes(1);
  });

  it('renders DDAA, FHN & TƏBİB Helicopter Emergency Medical Services (HEMS) button and calls onOpenHemsAviation when clicked', () => {
    const onOpenHemsAviation = vi.fn();
    render(<Navbar {...defaultProps} onOpenHemsAviation={onOpenHemsAviation} />);

    const btn = screen.getByTestId('navbar-hems-aviation-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenHemsAviation).toHaveBeenCalledTimes(1);
  });

  it('renders DDAA, FHN & DSX Maritime Search & Rescue (SAR) button and calls onOpenMaritimeSar when clicked', () => {
    const onOpenMaritimeSar = vi.fn();
    render(<Navbar {...defaultProps} onOpenMaritimeSar={onOpenMaritimeSar} />);

    const btn = screen.getByTestId('navbar-maritime-sar-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenMaritimeSar).toHaveBeenCalledTimes(1);
  });

  it('renders Azercosmos, AYNA & BDYP Satellite GNSS Fleet Telemetry button and calls onOpenSatelliteFleet when clicked', () => {
    const onOpenSatelliteFleet = vi.fn();
    render(<Navbar {...defaultProps} onOpenSatelliteFleet={onOpenSatelliteFleet} />);

    const btn = screen.getByTestId('navbar-satellite-fleet-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenSatelliteFleet).toHaveBeenCalledTimes(1);
  });

  it('renders RİNN, AzInTelecom & BDYP Cloud Transportation Data Center button and calls onOpenCloudTransportData when clicked', () => {
    const onOpenCloudTransportData = vi.fn();
    render(<Navbar {...defaultProps} onOpenCloudTransportData={onOpenCloudTransportData} />);

    const btn = screen.getByTestId('navbar-cloud-transport-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenCloudTransportData).toHaveBeenCalledTimes(1);
  });

  it('renders RİNN, AYNA & BDYP National ITS Digital Twin button and calls onOpenDigitalTwinIts when clicked', () => {
    const onOpenDigitalTwinIts = vi.fn();
    render(<Navbar {...defaultProps} onOpenDigitalTwinIts={onOpenDigitalTwinIts} />);

    const btn = screen.getByTestId('navbar-digital-twin-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenDigitalTwinIts).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, FHN & BDYP Highway Tunnel SCADA button and calls onOpenHighwayTunnel when clicked', () => {
    const onOpenHighwayTunnel = vi.fn();
    render(<Navbar {...defaultProps} onOpenHighwayTunnel={onOpenHighwayTunnel} />);

    const btn = screen.getByTestId('navbar-highway-tunnel-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenHighwayTunnel).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, FHN & BDYP Highway Smart Bridge & Viaduct SHM button and calls onOpenBridgeShm when clicked', () => {
    const onOpenBridgeShm = vi.fn();
    render(<Navbar {...defaultProps} onOpenBridgeShm={onOpenBridgeShm} />);

    const btn = screen.getByTestId('navbar-bridge-shm-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenBridgeShm).toHaveBeenCalledTimes(1);
  });

  it('renders AYNA & BDYP Urban Micromobility & Bicycle Lanes button and calls onOpenMicromobility when clicked', () => {
    const onOpenMicromobility = vi.fn();
    render(<Navbar {...defaultProps} onOpenMicromobility={onOpenMicromobility} />);

    const btn = screen.getByTestId('navbar-micromobility-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenMicromobility).toHaveBeenCalledTimes(1);
  });

  it('renders ADY, AAYDA & BDYP Highway-Railway Level Crossing button and calls onOpenLevelCrossing when clicked', () => {
    const onOpenLevelCrossing = vi.fn();
    render(<Navbar {...defaultProps} onOpenLevelCrossing={onOpenLevelCrossing} />);

    const btn = screen.getByTestId('navbar-level-crossing-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenLevelCrossing).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, FHN, ADSEA & BDYP Highway Underpass Flooding SCADA button and calls onOpenHighwayFlood when clicked', () => {
    const onOpenHighwayFlood = vi.fn();
    render(<Navbar {...defaultProps} onOpenHighwayFlood={onOpenHighwayFlood} />);

    const btn = screen.getByTestId('navbar-highway-flood-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenHighwayFlood).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, FHN & BDYP Highway Landslide & Slope Stability SCADA button and calls onOpenSlopeSafe when clicked', () => {
    const onOpenSlopeSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenSlopeSafe={onOpenSlopeSafe} />);

    const btn = screen.getByTestId('navbar-slope-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenSlopeSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, ETSN & BDYP Highway Wildlife Crossing button and calls onOpenWildlifeCrossing when clicked', () => {
    const onOpenWildlifeCrossing = vi.fn();
    render(<Navbar {...defaultProps} onOpenWildlifeCrossing={onOpenWildlifeCrossing} />);

    const btn = screen.getByTestId('navbar-wildlife-crossing-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenWildlifeCrossing).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, ETSN & BDYP Highway Acoustic Noise Barrier button and calls onOpenNoiseBarrier when clicked', () => {
    const onOpenNoiseBarrier = vi.fn();
    render(<Navbar {...defaultProps} onOpenNoiseBarrier={onOpenNoiseBarrier} />);

    const btn = screen.getByTestId('navbar-noise-barrier-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenNoiseBarrier).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, ETSN & BDYP Highway Fog, Dust Storm & Low Visibility button and calls onOpenFogSafe when clicked', () => {
    const onOpenFogSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenFogSafe={onOpenFogSafe} />);

    const btn = screen.getByTestId('navbar-fog-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenFogSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, FHN & BDYP Highway Avalanche & Blizzard button and calls onOpenAvalancheSafe when clicked', () => {
    const onOpenAvalancheSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenAvalancheSafe={onOpenAvalancheSafe} />);

    const btn = screen.getByTestId('navbar-avalanche-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenAvalancheSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, ETSN & BDYP Highway Crosswind & Gale-Force button and calls onOpenWindSafe when clicked', () => {
    const onOpenWindSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenWindSafe={onOpenWindSafe} />);

    const btn = screen.getByTestId('navbar-wind-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenWindSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, FHN & BDYP Highway Emergency Escape Ramp (EER) button and calls onOpenEscapeRamp when clicked', () => {
    const onOpenEscapeRamp = vi.fn();
    render(<Navbar {...defaultProps} onOpenEscapeRamp={onOpenEscapeRamp} />);

    const btn = screen.getByTestId('navbar-escape-ramp-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenEscapeRamp).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA & BDYP Highway Asphalt Heat Protection & Rutting button and calls onOpenAsphaltGuard when clicked', () => {
    const onOpenAsphaltGuard = vi.fn();
    render(<Navbar {...defaultProps} onOpenAsphaltGuard={onOpenAsphaltGuard} />);

    const btn = screen.getByTestId('navbar-asphalt-guard-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenAsphaltGuard).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA & BDYP Highway Guardrail & VRS Safety button and calls onOpenGuardrailSafety when clicked', () => {
    const onOpenGuardrailSafety = vi.fn();
    render(<Navbar {...defaultProps} onOpenGuardrailSafety={onOpenGuardrailSafety} />);

    const btn = screen.getByTestId('navbar-guardrail-safety-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenGuardrailSafety).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, AYNA & BDYP Highway Overheight (OHVDS) button and calls onOpenOverheightSafe when clicked', () => {
    const onOpenOverheightSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenOverheightSafe={onOpenOverheightSafe} />);

    const btn = screen.getByTestId('navbar-overheight-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenOverheightSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, ETSN & BDYP Highway Skid Resistance (SKID-SAFE) button and calls onOpenSkidSafe when clicked', () => {
    const onOpenSkidSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenSkidSafe={onOpenSkidSafe} />);

    const btn = screen.getByTestId('navbar-skid-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenSkidSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, FHN & BDYP Highway Mountain Tunnel Fire Safety (TUNNEL-SAFE) button and calls onOpenTunnelSafe when clicked', () => {
    const onOpenTunnelSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenTunnelSafe={onOpenTunnelSafe} />);

    const btn = screen.getByTestId('navbar-tunnel-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenTunnelSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA & BDYP Highway Road Markings (MARK-SAFE) button and calls onOpenMarkSafe when clicked', () => {
    const onOpenMarkSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenMarkSafe={onOpenMarkSafe} />);

    const btn = screen.getByTestId('navbar-mark-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenMarkSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA & BDYP Highway Work Zone (WORKZONE-SAFE) button and calls onOpenWorkZoneSafe when clicked', () => {
    const onOpenWorkZoneSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenWorkZoneSafe={onOpenWorkZoneSafe} />);

    const btn = screen.getByTestId('navbar-work-zone-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenWorkZoneSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, Azərişıq & BDYP Highway Smart LED Lighting (LIGHT-SAFE) button and calls onOpenLightSafe when clicked', () => {
    const onOpenLightSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenLightSafe={onOpenLightSafe} />);

    const btn = screen.getByTestId('navbar-light-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenLightSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, FHN & BDYP Highway Emergency Call Box (SOS-SAFE) button and calls onOpenSosSafe when clicked', () => {
    const onOpenSosSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenSosSafe={onOpenSosSafe} />);

    const btn = screen.getByTestId('navbar-sos-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenSosSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, AYNA & BDYP Highway VMS & Dynamic Gantry (VMS-SAFE) button and calls onOpenVmsSafe when clicked', () => {
    const onOpenVmsSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenVmsSafe={onOpenVmsSafe} />);

    const btn = screen.getByTestId('navbar-vms-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenVmsSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, AYNA & BDYP Highway Automatic Incident Detection (AID-SAFE) button and calls onOpenAidSafe when clicked', () => {
    const onOpenAidSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenAidSafe={onOpenAidSafe} />);

    const btn = screen.getByTestId('navbar-aid-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenAidSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, AYNA & BDYP Highway Rest Areas & Driver Fatigue (REST-SAFE) button and calls onOpenRestSafe when clicked', () => {
    const onOpenRestSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenRestSafe={onOpenRestSafe} />);

    const btn = screen.getByTestId('navbar-rest-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenRestSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, ETSN, AYNA & BDYP Highway RWIS & Black Ice (RWIS-SAFE) button and calls onOpenRwisSafe when clicked', () => {
    const onOpenRwisSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenRwisSafe={onOpenRwisSafe} />);

    const btn = screen.getByTestId('navbar-rwis-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenRwisSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, AYNA & BDYP Highway Ramp Metering (RAMP-SAFE) button and calls onOpenRampSafe when clicked', () => {
    const onOpenRampSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenRampSafe={onOpenRampSafe} />);

    const btn = screen.getByTestId('navbar-ramp-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenRampSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, AYNA & BDYP Highway Section Control (SECTION-SAFE) button and calls onOpenSectionSafe when clicked', () => {
    const onOpenSectionSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenSectionSafe={onOpenSectionSafe} />);

    const btn = screen.getByTestId('navbar-section-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenSectionSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, FHN & BDYP Highway Fast-Gate Median Crossover button and calls onOpenFastGate when clicked', () => {
    const onOpenFastGate = vi.fn();
    render(<Navbar {...defaultProps} onOpenFastGate={onOpenFastGate} />);

    const btn = screen.getByTestId('navbar-fast-gate-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenFastGate).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, AYNA & BDYP Highway Crash Cushions & Impact Attenuators button and calls onOpenCushionSafe when clicked', () => {
    const onOpenCushionSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenCushionSafe={onOpenCushionSafe} />);

    const btn = screen.getByTestId('navbar-cushion-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenCushionSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA, ETSN & BDYP Highway Wildlife Crossings & Eco-Ducts button and calls onOpenFaunaSafe when clicked', () => {
    const onOpenFaunaSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenFaunaSafe={onOpenFaunaSafe} />);

    const btn = screen.getByTestId('navbar-fauna-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenFaunaSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA & BDYP Highway Anti-Glare Screens & Glare Defense button and calls onOpenGlareSafe when clicked', () => {
    const onOpenGlareSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenGlareSafe={onOpenGlareSafe} />);

    const btn = screen.getByTestId('navbar-glare-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenGlareSafe).toHaveBeenCalledTimes(1);
  });

  it('renders AAYDA & BDYP Highway Rumble Strips button and calls onOpenRumbleSafe when clicked', () => {
    const onOpenRumbleSafe = vi.fn();
    render(<Navbar {...defaultProps} onOpenRumbleSafe={onOpenRumbleSafe} />);

    const btn = screen.getByTestId('navbar-rumble-safe-btn');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onOpenRumbleSafe).toHaveBeenCalledTimes(1);
  });
});
