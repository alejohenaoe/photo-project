const projects = [
  { id: 1, image: 'https://picsum.photos/seed/port-mesa/800/600', title: 'La Mesa — Menú Invierno', category: 'Menú' },
  { id: 2, image: 'https://picsum.photos/seed/port-cafe/800/600', title: 'Café Artesanal — Identidad Visual', category: 'Redes' },
  { id: 3, image: 'https://picsum.photos/seed/port-bistro/800/600', title: 'Bistró Parisienne — Platos Especiales', category: 'Menú' },
  { id: 4, image: 'https://picsum.photos/seed/port-tacos/800/600', title: 'Taquería El Sol — Redes Sociales', category: 'Redes' },
  { id: 5, image: 'https://picsum.photos/seed/port-sushi/800/600', title: 'Sushi Garden — Lanzamiento', category: 'Restaurante' },
  { id: 6, image: 'https://picsum.photos/seed/port-pizza/800/600', title: 'Pizzería Napolitana — Menú Digital', category: 'Menú' },
  { id: 7, image: 'https://picsum.photos/seed/port-campo/800/600', title: 'Restaurante Campo — Fotografía de Ambiente', category: 'Restaurante' },
  { id: 8, image: 'https://picsum.photos/seed/port-helado/800/600', title: 'Heladería Artisan — Producto', category: 'Producto' },
  { id: 9, image: 'https://picsum.photos/seed/port-chef/800/600', title: 'Chef María — Retrato Profesional', category: 'Retrato' },
]

export default function Portfolio() {
  return (
    <div className="bg-bg-base">
      <section className="max-w-6xl mx-auto px-4 py-24 sm:py-32">
        <h1 className="font-display text-4xl sm:text-5xl text-text-primary mb-6">Portafolio</h1>
        <div className="w-16 h-0.5 bg-gold-500 mb-8" />
        <p className="text-text-secondary text-lg max-w-2xl leading-relaxed mb-16">
          Explora una selección de nuestros mejores trabajos. Cada proyecto refleja nuestro
          compromiso con la calidad y la creatividad en fotografía gastronómica.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects.map((item, idx) => (
            <div
              key={item.id}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-bg-surface border border-border-light cursor-pointer"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-xs text-gold-500 font-medium">{item.category}</span>
                <h3 className="text-text-dark-primary text-sm font-medium mt-0.5">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
