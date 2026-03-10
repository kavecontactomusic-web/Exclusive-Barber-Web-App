import type { Service, Barber, Booking, Testimonial, GalleryItem, Product } from '../types';

export const services: Service[] = [
  {
    id: 'corte-clasico',
    name: 'Corte Clásico',
    category: 'cortes',
    duration: 30,
    price: 20000,
    description: 'Corte preciso y estilizado con técnicas clásicas de barbería.',
    popular: true,
  },
  {
    id: 'corte-barba',
    name: 'Corte + Barba',
    category: 'cortes',
    duration: 45,
    price: 35000,
    description: 'Combo completo: corte de cabello más perfilado y arreglo de barba.',
    popular: true,
  },
  {
    id: 'perfilado-barba',
    name: 'Perfilado de Barba',
    category: 'barba',
    duration: 30,
    price: 25000,
    description: 'Definición y forma perfecta para tu barba con acabado impecable.',
  },
  {
    id: 'tratamiento-aminoacidos',
    name: 'Tratamiento Aminoácidos',
    category: 'tratamientos',
    duration: 45,
    price: 35000,
    description: 'Nutrición profunda capilar para cabello suave, brillante y sano.',
  },
  {
    id: 'depilacion-nasal',
    name: 'Depilación Nasal',
    category: 'depilacion',
    duration: 15,
    price: 15000,
    description: 'Eliminación precisa de vello nasal con cera especial hipoalergénica.',
  },
  {
    id: 'masaje-capilar',
    name: 'Masaje Capilar',
    category: 'masajes',
    duration: 30,
    price: 25000,
    description: 'Relajante masaje del cuero cabelludo para estimular la circulación.',
  },
  {
    id: 'cejas',
    name: 'Diseño de Cejas',
    category: 'cejas',
    duration: 15,
    price: 10000,
    description: 'Definición y arreglo de cejas para un look más prolijo y masculino.',
  },
  {
    id: 'afeitado-clasico',
    name: 'Afeitado Clásico',
    category: 'barba',
    duration: 30,
    price: 20000,
    description: 'Afeitado navaja con toallas calientes para una experiencia de lujo.',
    popular: true,
  },
];

export const barbers: Barber[] = [
  {
    id: 'juan-p',
    name: 'Juan Pérez',
    shortName: 'Juan P.',
    specialties: ['Cortes Clásicos', 'Fade', 'Diseño de Cejas'],
    rating: 4.9,
    reviewCount: 243,
    available: true,
    pin: '1234',
    commission: 40,
    phone: '+57 300 123 4567',
    avatar: 'JP',
    bio: '8 años de experiencia. Especialista en fades y cortes modernos.',
    totalServicesMonth: 87,
    earningsMonth: 2610000,
  },
  {
    id: 'carlos-m',
    name: 'Carlos Martínez',
    shortName: 'Carlos M.',
    specialties: ['Barba', 'Afeitado Clásico', 'Tratamientos'],
    rating: 4.8,
    reviewCount: 189,
    available: false,
    pin: '5678',
    commission: 40,
    phone: '+57 301 234 5678',
    avatar: 'CM',
    bio: '6 años de experiencia. Maestro del afeitado clásico y cuidado de barba.',
    totalServicesMonth: 72,
    earningsMonth: 2160000,
  },
  {
    id: 'andres-q',
    name: 'Andrés Quiroz',
    shortName: 'Andrés Q.',
    specialties: ['Masajes', 'Depilación', 'Tratamientos Capilares'],
    rating: 4.7,
    reviewCount: 156,
    available: true,
    pin: '9012',
    commission: 40,
    phone: '+57 302 345 6789',
    avatar: 'AQ',
    bio: '4 años de experiencia. Especialista en tratamientos y relajación capilar.',
    totalServicesMonth: 65,
    earningsMonth: 1950000,
  },
];

export const bookings: Booking[] = [];

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Santiago Vargas',
    date: 'hace 2 días',
    rating: 5,
    text: 'El mejor corte que me han hecho en Valledupar. Juan es un artista, muy detallista y profesional. El ambiente del lugar es increíble.',
    avatar: 'SV',
  },
  {
    id: 't2',
    name: 'Mateo Restrepo',
    date: 'hace 1 semana',
    rating: 5,
    text: 'Carlos me salvó la barba. Llevaba meses sin un buen perfilado y él la dejó perfecta. 100% recomendado.',
    avatar: 'MR',
  },
  {
    id: 't3',
    name: 'Alejandro Pérez',
    date: 'hace 1 semana',
    rating: 5,
    text: 'El tratamiento de aminoácidos fue espectacular. Mi cabello quedó suavísimo. Andrés muy profesional y amable.',
    avatar: 'AP',
  },
  {
    id: 't4',
    name: 'Nicolás Ríos',
    date: 'hace 2 semanas',
    rating: 5,
    text: 'Reservar fue muy fácil y llegué a la hora exacta. Sin esperas. El corte quedó exactamente como quería. Volveré pronto.',
    avatar: 'NR',
  },
  {
    id: 't5',
    name: 'Daniel Moreno',
    date: 'hace 3 semanas',
    rating: 4,
    text: 'Excelente servicio y muy buen ambiente. Los barberos saben lo que hacen. El combo corte + barba es una pasada.',
    avatar: 'DM',
  },
  {
    id: 't6',
    name: 'Camilo Torres',
    date: 'hace 1 mes',
    rating: 5,
    text: 'Vine desde Bogotá y quedé impresionado. Nivel premium a precio justo. Ya tengo mi cita para cuando vuelva.',
    avatar: 'CT',
  },
];

export const galleryItems: GalleryItem[] = [
  {
    id: 'g1',
    url: 'https://nluoncxldluzogipjdvr.supabase.co/storage/v1/object/public/gallery/WhatsApp%20Image%202026-03-02%20at%208.38.53%20PM.jpeg',
    category: 'Cortes',
    alt: 'Trabajo Exclusive Barber',
  },
  {
    id: 'g2',
    url: 'https://nluoncxldluzogipjdvr.supabase.co/storage/v1/object/public/gallery/WhatsApp%20Image%202026-03-02%20at%208.39.54%20PM.jpeg',
    category: 'Cortes',
    alt: 'Trabajo Exclusive Barber',
  },
  {
    id: 'g3',
    url: 'https://nluoncxldluzogipjdvr.supabase.co/storage/v1/object/public/gallery/WhatsApp%20Image%202026-03-02%20at%208.40.53%20PM.jpeg',
    category: 'Barba',
    alt: 'Trabajo Exclusive Barber',
  },
  {
    id: 'g4',
    url: 'https://nluoncxldluzogipjdvr.supabase.co/storage/v1/object/public/gallery/WhatsApp%20Image%202026-03-02%20at%208.59.05%20PM.jpeg',
    category: 'Barba',
    alt: 'Trabajo Exclusive Barber',
  },
  {
    id: 'g5',
    url: 'https://nluoncxldluzogipjdvr.supabase.co/storage/v1/object/public/gallery/WhatsApp%20Image%202026-03-02%20at%208.59.06%20PM.jpeg',
    category: 'Ambiente',
    alt: 'Trabajo Exclusive Barber',
  },
  {
    id: 'g6',
    url: 'https://nluoncxldluzogipjdvr.supabase.co/storage/v1/object/public/gallery/WhatsApp%20Image%202026-03-02%20at%208.59.07%20PM%20(1).jpeg',
    category: 'Cortes',
    alt: 'Trabajo Exclusive Barber',
  },
  {
    id: 'g7',
    url: 'https://nluoncxldluzogipjdvr.supabase.co/storage/v1/object/public/gallery/WhatsApp%20Image%202026-03-02%20at%208.59.07%20PM.jpeg',
    category: 'Ambiente',
    alt: 'Trabajo Exclusive Barber',
  },
  {
    id: 'g8',
    url: 'https://nluoncxldluzogipjdvr.supabase.co/storage/v1/object/public/gallery/WhatsApp%20Image%202026-03-02%20at%208.59.09%20PM.jpeg',
    category: 'Cortes',
    alt: 'Trabajo Exclusive Barber',
  },
];

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Pomada Mate Premium',
    brand: 'American Crew',
    price: 45000,
    description: 'Control fuerte, acabado mate. Para estilos modernos y clásicos.',
    image: 'https://images.pexels.com/photos/3735640/pexels-photo-3735640.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Styling',
  },
  {
    id: 'p2',
    name: 'Aceite de Barba Gold',
    brand: 'Exclusive Barber',
    price: 38000,
    description: 'Hidratación profunda con aceite de argán y vitamina E.',
    image: 'https://images.pexels.com/photos/6621472/pexels-photo-6621472.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Barba',
  },
  {
    id: 'p3',
    name: 'Shampoo Anticaída',
    brand: 'Paul Mitchell',
    price: 55000,
    description: 'Fórmula reforzante con biotina y keratina para cabello fuerte.',
    image: 'https://images.pexels.com/photos/4202325/pexels-photo-4202325.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Cuidado',
  },
];

export const formatCOP = (amount: number): string => {
  return `$${amount.toLocaleString('es-CO').replace(',', '.')}`;
};

export const generateTimeSlots = (date: string, barberId: string): { time: string; available: boolean }[] => {
  const slots = [];
  const occupiedSlots: Record<string, string[]> = {
    'juan-p': ['09:00', '10:00', '14:30', '16:00'],
    'carlos-m': ['09:30', '11:00', '13:00', '15:00'],
    'andres-q': ['10:00', '12:00', '14:00', '17:00'],
  };

  const today = new Date().toISOString().split('T')[0];
  const isToday = date === today;
  const currentHour = new Date().getHours();
  const currentMin = new Date().getMinutes();

  for (let hour = 9; hour < 18; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      const occupied = (occupiedSlots[barberId] || []).includes(timeStr);
      const isPast = isToday && (hour < currentHour || (hour === currentHour && min <= currentMin));
      slots.push({ time: timeStr, available: !occupied && !isPast });
    }
  }
  return slots;
};