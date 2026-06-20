export default function QuoteRequest() {
  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Solicitar Cotización</h1>
      <p className="text-gray-600 mb-8">Completa el formulario y te contactaremos.</p>
      <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Nombre</label>
          <input className="border rounded px-3 py-2 text-sm" placeholder="Tu nombre" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Correo</label>
          <input className="border rounded px-3 py-2 text-sm" type="email" placeholder="tu@correo.com" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Teléfono</label>
          <input className="border rounded px-3 py-2 text-sm" placeholder="+1 555-0000" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Tipo de Negocio</label>
          <select className="border rounded px-3 py-2 text-sm">
            <option>Boda</option>
            <option>Restaurante</option>
            <option>Evento</option>
            <option>Comercial</option>
            <option>Producto</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Tipo de Sesión</label>
          <select className="border rounded px-3 py-2 text-sm">
            <option>Sesión de Fotos</option>
            <option>Video</option>
            <option>Ambos</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Fecha del Evento</label>
          <input className="border rounded px-3 py-2 text-sm" type="date" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Ubicación</label>
          <input className="border rounded px-3 py-2 text-sm" placeholder="Ciudad, Estado" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Duración</label>
          <select className="border rounded px-3 py-2 text-sm">
            <option>1 hora</option>
            <option>2 horas</option>
            <option>4 horas</option>
            <option>Día completo</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Presupuesto Est.</label>
          <select className="border rounded px-3 py-2 text-sm">
            <option>&lt;$500</option>
            <option>$500 – $1,000</option>
            <option>$1,000 – $2,000</option>
            <option>&gt;$2,000</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Notas</label>
          <textarea className="border rounded px-3 py-2 text-sm" rows={4} placeholder="Cuéntanos sobre tu proyecto..." />
        </div>
        <button
          type="submit"
          className="bg-gray-900 text-white px-6 py-3 rounded hover:bg-gray-800 self-start"
        >
          Enviar Solicitud
        </button>
      </form>
    </div>
  )
}
