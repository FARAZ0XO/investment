import { useState } from 'react';
import { BookingAndLocation } from './components/BookingAndLocation';
import { ClientPortal } from './components/ClientPortal';
import { ContactModal } from './components/ContactModal';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { InvestmentCalculator } from './components/InvestmentCalculator';
import { Navbar } from './components/Navbar';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { PropertyListings } from './components/PropertyListings';
import { TestimonialsSection } from './components/TestimonialsSection';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { PROPERTY_LISTINGS, type PropertyListing } from './data/properties';
import type { InvestmentInput } from './utils/investmentMath';

export default function App() {
  const [contactOpen, setContactOpen] = useState(false);
  const [detailProperty, setDetailProperty] = useState<PropertyListing | null>(null);
  const [bookingPropertyId, setBookingPropertyId] = useState<string>(PROPERTY_LISTINGS[0].id);
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [calculatorExternal, setCalculatorExternal] = useState<
    (Partial<InvestmentInput> & { propertyTitle?: string }) | undefined
  >(undefined);
  const [portalRefreshTrigger, setPortalRefreshTrigger] = useState(0);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectForBooking = (property: PropertyListing) => {
    setBookingPropertyId(property.id);
    scrollToSection('booking-location');
  };

  const handleSelectForCalculator = (property: PropertyListing) => {
    setCalculatorExternal({
      propertyTitle: property.title,
      propertyPricePkr: property.pricePkr,
      downPaymentPercent: property.downPaymentPercent,
      tenureYears: Math.max(property.tenureYears, 5),
      annualAppreciationPercent: property.annualAppreciationPercent,
      annualRentalYieldPercent: property.annualRentalYieldPercent,
    });
    scrollToSection('calculator');
  };

  const handleApplyCalculatorToBooking = (summaryText: string, propertyId?: string) => {
    if (propertyId) setBookingPropertyId(propertyId);
    setBookingNotes(summaryText);
    scrollToSection('booking-location');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar onOpenContact={() => setContactOpen(true)} />

      <main>
        <HeroSection
          onOpenContact={() => setContactOpen(true)}
          onJumpToBooking={() => scrollToSection('booking-location')}
        />

        <PropertyListings
          onSelectForBooking={handleSelectForBooking}
          onSelectForCalculator={handleSelectForCalculator}
          onOpenDetail={(property) => setDetailProperty(property)}
        />

        <InvestmentCalculator
          externalInput={calculatorExternal}
          onApplyToBooking={handleApplyCalculatorToBooking}
        />

        <ClientPortal refreshTrigger={portalRefreshTrigger} />

        <TestimonialsSection />

        <BookingAndLocation
          selectedPropertyId={bookingPropertyId}
          prefilledNotes={bookingNotes}
          onBookingCreated={() => setPortalRefreshTrigger((n) => n + 1)}
        />
      </main>

      <Footer onOpenContact={() => setContactOpen(true)} />

      <PropertyDetailModal
        property={detailProperty}
        onClose={() => setDetailProperty(null)}
        onBookVisit={handleSelectForBooking}
        onLoadCalculator={handleSelectForCalculator}
      />

      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />

      <WhatsAppWidget />
    </div>
  );
}
