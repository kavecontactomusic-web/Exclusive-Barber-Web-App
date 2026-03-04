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
  mapEmbedUrl: 'https://maps.google.com/maps?q=10.484470953195434,-73.26120884694197&z=17&output=embed',
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
