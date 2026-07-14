import { useInView } from '../../hooks/useInView'

export default function About() {
  const { ref: photoRef, inView: photoInView } = useInView()
  const { ref: textRef, inView: textInView } = useInView()
  const { ref: cardsRef, inView: cardsInView } = useInView()

  return (
    <div className="bg-bg-base">
      <section className="max-w-6xl mx-auto px-4 py-24 sm:py-32">
        <h1 className="font-display text-4xl sm:text-5xl text-text-primary mb-6">Sobre Mí</h1>
        <div className="w-16 h-0.5 bg-gold-500 mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Photo Column */}
          <div
            ref={photoRef}
            className={`transition-all duration-700 ease-out ${photoInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="relative group max-w-sm mx-auto">
              {/* Gold accent border */}
              <div className="absolute -inset-1 bg-gradient-to-br from-gold-500/20 via-gold-600/10 to-transparent rounded-[2rem] blur-sm group-hover:blur-md transition-all duration-500" />

              {/* Image container */}
              <div className="relative overflow-hidden rounded-[1.5rem] rounded-br-[3rem]">
                <img
                  src="/imagenes/neftali-portrait.jpg"
                  alt="Neftalí Tabares - Fotógrafo"
                  className="w-full h-auto object-cover aspect-[4/5] transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-dark-900/20 to-transparent" />

                {/* Name overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <p className="font-display text-2xl sm:text-3xl text-gold-400 mb-1">
                    Neftalí Tabares
                  </p>
                  <p className="text-text-dark-secondary text-sm tracking-wider uppercase">
                    Fotógrafo Profesional
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Text Column */}
          <div
            ref={textRef}
            className={`transition-all duration-700 ease-out delay-200 ${textInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <p className="text-text-secondary text-lg leading-relaxed mb-8">
              Soy <strong className="text-text-primary">Neftalí Tabares</strong>, fotógrafo colombiano
              radicado en New Jersey, en el condado de Morris.
            </p>
            <p className="text-text-secondary text-lg leading-relaxed mb-8">
              Me apasiona la <strong className="text-text-primary">fotografía de alimentos</strong>,
              el retrato y otros géneros. Mi objetivo es capturar momentos únicos con pasión y creatividad.
            </p>
            <p className="text-text-secondary text-lg leading-relaxed mb-10">
              Creo que cada plato tiene una historia que contar, y mi trabajo es hacer que esa historia
              sea visible para el mundo. Desde la textura de un ingrediente hasta el ambiente completo
              de un restaurante, me enfoco en crear imágenes que despiertan el apetito y conectan
              con los comensales.
            </p>

            {/* Decorative quote */}
            <div className="border-l-2 border-gold-500 pl-6 py-2">
              <p className="font-display text-xl sm:text-2xl text-text-primary italic leading-relaxed">
                "Capturando historias, <br />
                <span className="text-gold-500">un plato a la vez</span>"
              </p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div
          ref={cardsRef}
          className={`grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 transition-all duration-700 ease-out delay-400 ${cardsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="bg-surface border border-border-light rounded-xl p-6">
            <h3 className="font-display text-lg text-text-primary mb-2">Especialización</h3>
            <p className="text-text-secondary text-sm">
              Fotografía gastronómica para restaurantes. Imágenes que aumentan clics y ventas
              en menú y redes sociales.
            </p>
          </div>

          <div className="bg-surface border border-border-light rounded-xl p-6">
            <h3 className="font-display text-lg text-text-primary mb-2">Ubicación</h3>
            <p className="text-text-secondary text-sm">
              Morris County, New Jersey. Disponible para sesiones en todo el área metropolitana.
            </p>
          </div>

          <div className="bg-surface border border-border-light rounded-xl p-6">
            <h3 className="font-display text-lg text-text-primary mb-2">NEFTIK PHOTO</h3>
            <p className="text-text-secondary text-sm">
              Fotografía profesional con pasión y creatividad. Capturando momentos únicos
              desde 2020.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
