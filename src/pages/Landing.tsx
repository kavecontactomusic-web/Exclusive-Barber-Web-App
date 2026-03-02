import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/landing/Hero';
import Services from '../components/landing/Services';
import Team from '../components/landing/Team';
import BeardCraft from '../components/landing/BeardCraft';
import Testimonials from '../components/landing/Testimonials';
import WhyUs from '../components/landing/WhyUs';
import Gallery from '../components/landing/Gallery';
import Location from '../components/landing/Location';
import Products from '../components/landing/Products';
import BookingCTA from '../components/landing/BookingCTA';
import BookingModal from '../components/booking/BookingModal';
import type { Service } from '../types';

export default function LandingPage() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);

  const openBooking = (service?: Service) => {
    setPreselectedService(service || null);
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-dark relative">
      <div className="grain-overlay" />

      <Navbar onBooking={() => openBooking()} />

      <main>
        <Hero onBooking={() => openBooking()} />
        <Services onBooking={openBooking} />
        <BeardCraft />
        <Team onBooking={() => openBooking()} />
        <Gallery />
        <Testimonials />
        <WhyUs />
        <BookingCTA onBooking={() => openBooking()} />
        <Products />
        <Location />
      </main>

      <Footer />

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        preselectedService={preselectedService}
      />
    </div>
  );
}
