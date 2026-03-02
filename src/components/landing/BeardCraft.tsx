import { Scissors } from 'lucide-react';

export default function BeardCraft() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #1a1100 0%, #080808 50%, #0d0800 100%)' }}
      />
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, #D4AF37 0, #D4AF37 1px, transparent 0, transparent 50%)',
        backgroundSize: '20px 20px',
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px flex-1 max-w-xs bg-gradient-to-r from-transparent to-gold/50" />
          <Scissors size={24} className="text-gold" />
          <div className="h-px flex-1 max-w-xs bg-gradient-to-l from-transparent to-gold/50" />
        </div>

        <h2 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold italic mb-4">
          <span className="text-white">El Arte de la</span>
          <br />
          <span className="gold-shimmer">Barba Perfecta</span>
        </h2>

        <p className="text-zinc-400 text-xl max-w-3xl mx-auto leading-relaxed mb-8">
          Más que un corte — es una experiencia. Cada visita a{' '}
          <span className="text-gold font-semibold">Exclusive Barber</span> es un ritual de
          masculinidad y estilo diseñado para hacerte sentir y verte en tu mejor versión.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12">
          {[
            { num: '01', title: 'Precisión', desc: 'Cada línea trazada con maestría absoluta' },
            { num: '02', title: 'Estilo', desc: 'Tu personalidad expresada en cada corte' },
            { num: '03', title: 'Confianza', desc: 'Sal sintiéndote en tu mejor versión' },
          ].map((item) => (
            <div key={item.num} className="glass-gold rounded-2xl p-6 text-left">
              <div className="font-mono text-4xl font-bold text-gold/30 mb-3">{item.num}</div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
