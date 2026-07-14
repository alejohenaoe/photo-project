const services = [
  {
    title: 'Fotografía de Menú',
    description: 'Imágenes profesionales de tus platos para menús impresos, digitales y delivery. Hacemos que cada platillo se vea tan delicioso como sabe.',
    image: 'https://picsum.photos/seed/serv-menu/800/500',
  },
  {
    title: 'Fotografía de Restaurante',
    description: 'Capturamos la esencia de tu espacio: ambientes, decoración, iluminación y la experiencia completa que viven tus comensales.',
    image: 'https://picsum.photos/seed/serv-ambiente/800/500',
  },
  {
    title: 'Contenido para Redes',
    description: 'Imágenes optimizadas para Instagram, TikTok y Facebook que generan engagement y atraen nuevos clientes a tu restaurante.',
    image: 'https://picsum.photos/seed/serv-redes/800/500',
  },
  {
    title: 'Fotografía de Producto',
    description: 'Ingredientes, empaques, botellas y productos de línea propia con iluminación profesional que resalta cada detalle.',
    image: 'https://picsum.photos/seed/serv-producto/800/500',
  },
]

export default function Services() {
  return (
    <div className="bg-bg-base">
      <section className="max-w-6xl mx-auto px-4 py-24 sm:py-32">
        <h1 className="font-display text-4xl sm:text-5xl text-text-primary mb-6">Servicios</h1>
        <div className="w-16 h-0.5 bg-gold-500 mb-8" />
        <p className="text-text-secondary text-lg max-w-2xl leading-relaxed mb-16">
          Especialistas en hacer que la comida se vea tan deliciosa como sabe. Cada servicio
          está diseñado para potenciar la imagen de tu restaurante.
        </p>

        <div className="space-y-12">
          {services.map((service, i) => (
            <div
              key={service.title}
              className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}
            >
              <div className="w-full lg:w-1/2">
                <div className="aspect-[16/10] rounded-xl overflow-hidden border border-border-light">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <h2 className="font-display text-2xl sm:text-3xl text-text-primary mb-4">{service.title}</h2>
                <p className="text-text-secondary leading-relaxed">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
