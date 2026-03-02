import { useEffect, useRef } from 'react';
import { ChevronDown, Star } from 'lucide-react';
import { businessConfig } from '../../config/business';

interface HeroProps {
  onBooking: () => void;
}

export default function Hero({ onBooking }: HeroProps) {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    const particles: HTMLDivElement[] = [];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDelay = `${Math.random() * 8}s`;
      p.style.animationDuration = `${6 + Math.random() * 6}s`;
      const size = 1 + Math.random() * 3;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      container.appendChild(p);
      particles.push(p);
    }

    return () => particles.forEach((p) => p.remove());
  }, []);

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 30% 50%, #1a1100 0%, #080808 60%, #020202 100%)',
      }}
    >
      <div className="particles-container" ref={particlesRef} />

      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(212,175,55,0.03) 80px, rgba(212,175,55,0.03) 81px), repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(212,175,55,0.03) 80px, rgba(212,175,55,0.03) 81px)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-20 pb-12">

        <div className="inline-flex items-center gap-2 glass-gold px-4 py-2 rounded-full mb-6 animate-fade-in">
          <Star size={12} className="text-gold fill-gold" />
          <span className="section-label text-xs">Barbería Premium en {businessConfig.city}</span>
          <Star size={12} className="text-gold fill-gold" />
        </div>

        <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold leading-tight mb-6 animate-slide-up">
          <span className="text-white">Tu estilo,</span>
          <br />
          <span className="gold-shimmer">nuestra pasión</span>
        </h1>

        <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
          Experiencia premium de barbería en {businessConfig.city}. Maestros del corte y la barba,
          comprometidos con tu imagen y confianza.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
          <button
            onClick={onBooking}
            className="btn-gold px-8 py-4 rounded-full text-base font-semibold tracking-wide w-full sm:w-auto"
          >
            Reservar Cita
          </button>
          <a
            href="#servicios"
            className="btn-outline-gold px-8 py-4 rounded-full text-base font-semibold tracking-wide w-full sm:w-auto text-center"
          >
            Ver Servicios
          </a>
        </div>
      </div>

      <a
        href="#servicios"
        className="relative z-10 flex flex-col items-center gap-1.5 mb-10 group cursor-pointer"
        style={{ animation: 'bounce 2s infinite' }}
      >
        <span className="text-zinc-500 text-[10px] tracking-[0.25em] uppercase group-hover:text-zinc-300 transition-colors">Descubrir</span>
        <ChevronDown size={18} className="text-gold group-hover:translate-y-1 transition-transform" />
      </a>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark to-transparent" />
    </section>
  );
}
