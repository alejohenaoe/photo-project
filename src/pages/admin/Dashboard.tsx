export default function AdminDashboard() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary mb-8">Panel</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { num: '12', label: 'Clientes', icon: '◉' },
          { num: '8', label: 'Galerías', icon: '◻' },
          { num: '156', label: 'Descargas', icon: '≡' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface border border-border-light rounded-xl p-6 hover:border-gold-500/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-bold text-gold-600">{stat.num}</span>
              <span className="text-text-muted text-xl">{stat.icon}</span>
            </div>
            <p className="text-text-secondary text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-surface border border-border-light rounded-xl p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gold-600 mb-4">Actividad Reciente</h2>
          <ul className="space-y-3">
            {[
              'Maria G. descargó 5 fotos de <strong>Boda — John & Maria</strong>',
              'John S. activó su cuenta',
              'Nueva cotización de <strong>Cafe Central</strong>',
              'Subidas 24 fotos a <strong>Evento — La Bodega</strong>',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-2 shrink-0" />
                <span className="text-text-secondary" dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        </div>

        {/* Pending Quotes */}
        <div className="bg-surface border border-border-light rounded-xl p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gold-600 mb-4">Cotizaciones Pendientes</h2>
          <div className="space-y-3">
            {[
              { name: 'Cafe Central', type: 'Fotos de evento', time: 'Hace 2 días', budget: '$500-$1k' },
              { name: 'Blue Bottle Coffee', type: 'Fotos de interiores', time: 'Hace 5 días', budget: '$1k-$2k' },
            ].map((quote, i) => (
              <div key={i} className="border border-border-light rounded-lg p-4 hover:border-gold-500/40 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-600 border border-gold-500/30 font-medium">NUEVO</span>
                  <span className="font-medium text-text-primary text-sm">{quote.name}</span>
                </div>
                <p className="text-text-muted text-xs">{quote.type} · {quote.time} · Presupuesto: {quote.budget}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
