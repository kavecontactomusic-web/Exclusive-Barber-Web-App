import type { BusinessConfig } from '../types';

export const businessConfig: BusinessConfig = {
  name: 'Exclusive Barber',
  tagline: 'Tu estilo, nuestra pasión',
  address: ' Cl 6c #14A -15, Los angeles, Valledupar',
  phone: '573144110530',
  whatsapp: '573144110530',
  email: 'exclusivebarber94@gmail.com',
  instagram: 'exclusivebarber94',
  tiktok: 'exclusivebarber94',
  facebook: '1AxQs5JiYT',
  city: 'Valledupar',
  country: 'Colombia',
  primaryColor: '#D4AF37',
  accentColor: '#6B4C2B',
  mapEmbedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=-73.2632%2C10.4824%2C-73.2592%2C10.4864&layer=mapnik&marker=10.4844%2C-73.2612',
  hours: [
    { day: 'Lunes', open: '09:00', close: '19:00', closed: false },
    { day: 'Martes', open: '09:00', close: '19:00', closed: false },
    { day: 'Miércoles', open: '09:00', close: '19:00', closed: false },
    { day: 'Jueves', open: '09:00', close: '19:00', closed: false },
    { day: 'Viernes', open: '09:00', close: '19:00', closed: false },
    { day: 'Sábado', open: '09:00', close: '18:00', closed: false },
    { day: 'Domingo', open: '', close: '', closed: true },
  ],
};
