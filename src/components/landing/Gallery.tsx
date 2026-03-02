import { galleryItems } from '../../data';

export default function Gallery() {
  return (
    <section id="galeria" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="section-label mb-3">Galería</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">
            Nuestro <span className="gold-text">Trabajo</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Cada corte es una obra de arte. Aquí algunos de nuestros mejores trabajos.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[180px]">
          {galleryItems.map((item, i) => (
            <div
              key={item.id}
              className={`relative overflow-hidden rounded-2xl cursor-pointer group ${
                i === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
            >
              <img
                src={item.url}
                alt={item.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-xs font-semibold text-gold bg-dark/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
