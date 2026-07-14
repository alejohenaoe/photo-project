export default function About() {
  return (
    <div className="bg-bg-base">
      <section className="max-w-6xl mx-auto px-4 py-24 sm:py-32">
        <h1 className="font-display text-4xl sm:text-5xl text-text-primary mb-6">Sobre Mí</h1>
        <div className="w-16 h-0.5 bg-gold-500 mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-text-secondary text-lg leading-relaxed mb-6">
              Soy <strong className="text-text-primary">Neftalí Tabares</strong>, fotógrafo colombiano
              radicado en New Jersey, en el condado de Morris.
            </p>
            <p className="text-text-secondary text-lg leading-relaxed mb-6">
              Me apasiona la <strong className="text-text-primary">fotografía de alimentos</strong>,
              el retrato y otros géneros. Mi objetivo es capturar momentos únicos con pasión y creatividad.
            </p>
            <p className="text-text-secondary text-lg leading-relaxed">
              Creo que cada plato tiene una historia que contar, y mi trabajo es hacer que esa historia
              sea visible para el mundo. Desde la textura de un ingrediente hasta el ambiente completo
              de un restaurante, me enfoco en crear imágenes que despiertan el apetito y conectan
              con los comensales.
            </p>
          </div>

          <div className="space-y-6">
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
        </div>
      </section>
    </div>
  )
}
