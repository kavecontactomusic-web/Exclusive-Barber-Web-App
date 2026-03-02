export interface Service {
  id: string;
  name: string;
  category: 'cortes' | 'barba' | 'tratamientos' | 'depilacion' | 'masajes' | 'cejas';
  duration: number;
  price: number;
  description: string;
  popular?: boolean;
}

export interface Barber {
  id: string;
  name: string;
  shortName: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  available: boolean;
  pin: string;
  commission: number;
  phone: string;
  avatar: string;
  bio: string;
  totalServicesMonth: number;
  earningsMonth: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Booking {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceId: string;
  serviceName: string;
  barberId: string;
  barberName: string;
  date: string;
  time: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  date: string;
  rating: number;
  text: string;
  avatar: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  category: string;
  alt: string;
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface BusinessConfig {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  city: string;
  country: string;
  hours: BusinessHours[];
  mapEmbedUrl: string;
  primaryColor: string;
  accentColor: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

export interface BookingState {
  step: number;
  selectedService: Service | null;
  selectedBarber: Barber | null;
  selectedDate: string;
  selectedTime: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
}
