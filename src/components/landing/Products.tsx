import { ShoppingBag } from 'lucide-react';
import { products, formatCOP } from '../../data';

export default function Products() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="section-label mb-3">Productos</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">
            Línea de <span className="gold-text">Grooming</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Los mejores productos para mantener tu look entre visitas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="glass rounded-2xl overflow-hidden card-hover border border-white/8 group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent" />
                <span className="absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full glass border border-white/20 text-zinc-300">
                  {product.category}
                </span>
              </div>
              <div className="p-6">
                <p className="text-zinc-500 text-xs mb-1">{product.brand}</p>
                <h3 className="font-serif text-lg font-bold text-white mb-2 group-hover:text-gold transition-colors">
                  {product.name}
                </h3>
                <p className="text-zinc-500 text-sm mb-4 leading-relaxed">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl font-bold gold-text">{formatCOP(product.price)}</span>
                  <a
                    href={`https://wa.me/573144110530?text=Hola!%20Estoy%20interesado%20en%20este%20producto:%20${encodeURIComponent(product.name)}%20-%20${formatCOP(product.price)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-semibold text-dark bg-gold hover:bg-gold-100 px-4 py-2 rounded-full transition-all hover:scale-105"
                  >
                    <ShoppingBag size={13} />
                    Comprar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}