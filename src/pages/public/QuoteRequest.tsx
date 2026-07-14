export default function QuoteRequest() {
  return (
    <div className="min-h-screen py-24 px-4 bg-bg-base">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-4xl sm:text-5xl text-text-primary mb-4">Solicitar Cotización</h1>
        <p className="text-text-secondary mb-10 text-lg">Completa el formulario y te contactaremos en 24 horas.</p>

        <form className="bg-surface border border-border-light rounded-xl p-6 sm:p-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary font-medium">Nombre</label>
              <input
                className="bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                placeholder="Tu nombre"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary font-medium">Correo</label>
              <input
                className="bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                type="email"
                placeholder="tu@correo.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary font-medium">Teléfono</label>
              <input
                className="bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                placeholder="+1 555-0000"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary font-medium">Tipo de Negocio</label>
              <select className="bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all">
                <option>Restaurante</option>
                <option>Café</option>
                <option>Food Truck</option>
                <option>Hotel</option>
                <option>Catering</option>
                <option>Otro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary font-medium">Tipo de Sesión</label>
              <select className="bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all">
                <option>Sesión de Fotos</option>
                <option>Video</option>
                <option>Ambos</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary font-medium">Fecha del Evento</label>
              <input
                className="bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                type="date"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary font-medium">Ubicación</label>
              <input
                className="bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                placeholder="Ciudad, Estado"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary font-medium">Duración</label>
              <select className="bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all">
                <option>1 hora</option>
                <option>2 horas</option>
                <option>4 horas</option>
                <option>Día completo</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Presupuesto Est.</label>
            <select className="bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all">
              <option>&lt;$500</option>
              <option>$500 – $1,000</option>
              <option>$1,000 – $2,000</option>
              <option>&gt;$2,000</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Notas</label>
            <textarea
              className="bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all resize-none"
              rows={4}
              placeholder="Cuéntanos sobre tu proyecto..."
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto bg-gold-500 text-dark-900 px-8 py-3 rounded-lg font-medium hover:bg-gold-400 transition-all hover:shadow-xl hover:shadow-gold-500/25 active:scale-[0.98]"
          >
            Enviar Solicitud
          </button>
        </form>
      </div>
    </div>
  )
}
