import { useState, useEffect } from 'react';
import { Menu, X, MessageCircle } from 'lucide-react';
import { businessConfig } from '../../config/business';

interface NavbarProps {
  onBooking: () => void;
}

export default function Navbar({ onBooking }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'Equipo', href: '#equipo' },
    { label: 'Galería', href: '#galeria' },
    { label: 'Contacto', href: '#contacto' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'py-3 backdrop-blur-2xl bg-dark/80 border-b border-gold/20 shadow-xl'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <a href="#inicio" className="flex items-center gap-2.5 group">
            <img
              src="/logo_exclusivebarber.png"
              alt="Exclusive Barber"
              className="w-10 h-10 object-contain"
            />
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              
                key={link.href}
                href={link.href}
                className="text-zinc-400 hover:text-white text-sm font-medium tracking-wide transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold-300 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            
              href={`https://wa.me/${businessConfig.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full glass border border-white/10 flex items-center justify-center text-green-400 hover:text-green-300 hover:border-green-400/40 transition-all duration-200 hover:scale-110"
            >
              <MessageCircle size={16} />
            </a>
            <button
              onClick={onBooking}
              className="btn-gold px-5 py-2 rounded-full text-sm font-semibold tracking-wide"
            >
              <span>Reservar Ahora</span>
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden w-9 h-9 glass rounded-full flex items-center justify-center text-zinc-300 hover:text-gold transition-colors"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden animate-fade-in">
          <div className="absolute inset-0 bg-dark/95 backdrop-blur-xl" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 right-0 w-72 h-full glass border-l border-white/10 flex flex-col pt-24 pb-8 px-8 animate-slide-in-right">
            <div className="flex flex-col gap-1 mb-8">
              {navLinks.map((link) => (
                
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 px-4 text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl text-lg font-medium transition-all"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3 mt-auto">
              
                href={`https://wa.me/${businessConfig.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-5 rounded-full glass border border-green-500/30 text-green-400 font-medium text-sm"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
              <button
                onClick={() => { onBooking(); setMenuOpen(false); }}
                className="btn-gold py-3 px-5 rounded-full text-sm font-semibold"
              >
                <span>Reservar Ahora</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}