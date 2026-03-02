import { MapPin, Phone, Clock, Instagram, MessageCircle, Facebook } from 'lucide-react';
import { businessConfig } from '../../config/business';

export default function Location() {
  return (
    <section id="contacto" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="section-label mb-3">Ubicación y Horarios</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">
            Visítanos en <span className="gold-text">{businessConfig.city}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="glass rounded-2xl p-6 border border-white/8 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-gold" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Dirección</p>
                <p className="text-white font-medium">{businessConfig.address}</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/8 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
                <Phone size={18} className="text-gold" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Teléfono</p>
                <a href={`tel:${businessConfig.phone}`} className="text-white font-medium hover:text-gold transition-colors">
                  {businessConfig.phone}
                </a>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center">
                  <Clock size={18} className="text-gold" />
                </div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Horarios</p>
              </div>
              <div className="space-y-2">
                {businessConfig.hours.map((h) => (
                  <div key={h.day} className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">{h.day}</span>
                    {h.closed ? (
                      <span className="text-xs px-2.5 py-1 rounded-full status-busy">Cerrado</span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full status-available">
                        {h.open} — {h.close}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/8">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Redes Sociales</p>
              <div className="flex gap-3">
                <a
                  href={`https://instagram.com/${businessConfig.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 glass rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:border-pink-500/40 transition-all text-sm"
                >
                  <Instagram size={16} />
                  Instagram
                </a>
                <a
                  href={`https://facebook.com/${businessConfig.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 glass rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:border-blue-500/40 transition-all text-sm"
                >
                  <Facebook size={16} />
                  Facebook
                </a>
              </div>
            </div>

            <a
              href={`https://wa.me/${businessConfig.whatsapp}?text=Hola! Quiero reservar una cita en Exclusive Barber`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-green-600 hover:bg-green-500 transition-all text-white font-semibold animate-pulse-gold"
            >
              <MessageCircle size={20} />
              Escribir por WhatsApp
            </a>
          </div>

          <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-white/10 relative" style={{ minHeight: '480px' }}>
            <a
              href="https://maps.google.com/?q=Calle+16+%236-45+Valledupar+Colombia"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <div className="relative w-full h-full bg-zinc-900" style={{ minHeight: '480px' }}>
                <svg
                  viewBox="0 0 800 480"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="800" height="480" fill="#1a1a1a" />
                  <rect x="0" y="0" width="800" height="480" fill="url(#grid)" />
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2a2a2a" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <line x1="0" y1="200" x2="800" y2="200" stroke="#2e2e2e" strokeWidth="28" />
                  <line x1="0" y1="280" x2="800" y2="280" stroke="#2e2e2e" strokeWidth="28" />
                  <line x1="300" y1="0" x2="300" y2="480" stroke="#2e2e2e" strokeWidth="28" />
                  <line x1="500" y1="0" x2="500" y2="480" stroke="#2e2e2e" strokeWidth="28" />
                  <line x1="0" y1="200" x2="800" y2="200" stroke="#252525" strokeWidth="2" />
                  <line x1="0" y1="280" x2="800" y2="280" stroke="#252525" strokeWidth="2" />
                  <line x1="300" y1="0" x2="300" y2="480" stroke="#252525" strokeWidth="2" />
                  <line x1="500" y1="0" x2="500" y2="480" stroke="#252525" strokeWidth="2" />
                  <line x1="0" y1="120" x2="800" y2="120" stroke="#222" strokeWidth="14" />
                  <line x1="0" y1="360" x2="800" y2="360" stroke="#222" strokeWidth="14" />
                  <line x1="150" y1="0" x2="150" y2="480" stroke="#222" strokeWidth="14" />
                  <line x1="650" y1="0" x2="650" y2="480" stroke="#222" strokeWidth="14" />
                  <rect x="160" y="50" width="130" height="60" rx="4" fill="#212121" />
                  <rect x="160" y="130" width="130" height="60" rx="4" fill="#212121" />
                  <rect x="320" y="50" width="170" height="140" rx="4" fill="#212121" />
                  <rect x="510" y="50" width="130" height="60" rx="4" fill="#212121" />
                  <rect x="510" y="130" width="130" height="60" rx="4" fill="#212121" />
                  <rect x="160" y="300" width="130" height="50" rx="4" fill="#212121" />
                  <rect x="160" y="370" width="130" height="90" rx="4" fill="#212121" />
                  <rect x="320" y="300" width="170" height="140" rx="4" fill="#1e1e1e" />
                  <rect x="510" y="300" width="130" height="50" rx="4" fill="#212121" />
                  <rect x="510" y="370" width="130" height="90" rx="4" fill="#212121" />
                  <rect x="660" y="50" width="100" height="60" rx="4" fill="#212121" />
                  <rect x="660" y="130" width="100" height="60" rx="4" fill="#212121" />
                  <rect x="0" y="50" width="140" height="60" rx="4" fill="#212121" />
                  <rect x="0" y="130" width="140" height="60" rx="4" fill="#212121" />
                  <rect x="0" y="300" width="140" height="140" rx="4" fill="#212121" />
                  <text x="225" y="83" textAnchor="middle" fill="#333" fontSize="9" fontFamily="sans-serif">Cra 7</text>
                  <text x="400" y="195" textAnchor="middle" fill="#444" fontSize="9" fontFamily="sans-serif">Calle 15</text>
                  <text x="400" y="275" textAnchor="middle" fill="#444" fontSize="9" fontFamily="sans-serif">Calle 16</text>
                  <circle cx="400" cy="240" r="22" fill="#D4AF37" fillOpacity="0.2" />
                  <circle cx="400" cy="240" r="14" fill="#D4AF37" fillOpacity="0.4" />
                  <circle cx="400" cy="240" r="7" fill="#D4AF37" />
                  <line x1="400" y1="218" x2="400" y2="210" stroke="#D4AF37" strokeWidth="2" />
                  <polygon points="394,210 406,210 400,196" fill="#D4AF37" />
                </svg>
                <div className="absolute inset-0 flex items-end justify-start p-5 pointer-events-none">
                  <div className="bg-dark/90 backdrop-blur-sm border border-gold/30 rounded-xl px-4 py-3">
                    <p className="text-gold text-xs font-semibold uppercase tracking-wider mb-0.5">Exclusive Barber</p>
                    <p className="text-zinc-300 text-xs">{businessConfig.address}</p>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-dark/70 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 mt-24">
                    <p className="text-zinc-400 text-xs">Clic para abrir en Google Maps</p>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
