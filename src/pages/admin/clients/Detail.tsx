import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  useClients, useUpdateClient, useActivateClient,
  useGenerateAccessCode, useSendAccessEmail,
  useClientAccessCodes, useClientDownloadLogs, useGalleries,
} from '../../../hooks/useGalleries'

export default function ClientDetail() {
  const { id } = useParams()
  const { data: clients } = useClients()
  const client = clients?.find(c => c.id === id) ?? null

  const updateClient = useUpdateClient()
  const activateClient = useActivateClient()
  const generateCode = useGenerateAccessCode(id)
  const sendEmail = useSendAccessEmail()

  const { data: accessCodes, isLoading: loadingCodes } = useClientAccessCodes(id || '')
  const { data: galleries } = useGalleries()
  const assignedGalleries = galleries?.filter(g => g.client_id === id) || []
  const { data: downloadLogs, isLoading: loadingLogs } = useClientDownloadLogs(id || '')

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleCopyCode() {
    if (!generatedCode) return
    await navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (client === null) {
    return <p className="text-text-muted">Cargando...</p>
  }
  const c = client!

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await updateClient.mutateAsync({ id: c.id, name: name.trim(), email: email.trim(), phone: phone.trim() || null })
    setEditing(false)
  }

  function startEditing() {
    setName(c.name)
    setEmail(c.email)
    setPhone(c.phone || '')
    setEditing(true)
  }

  async function handleToggleActive() {
    await activateClient.mutateAsync({ id: c.id, isActive: !c.is_active })
  }

  async function handleGenerateCode() {
    setGeneratedCode(null)
    setEmailSent(false)
    const result = await generateCode.mutateAsync(c.id)
    setGeneratedCode(result.code)
  }

  async function handleSendEmail() {
    if (!generatedCode) return
    await sendEmail.mutateAsync({ email: c.email, code: generatedCode, clientName: c.name })
    setEmailSent(true)
  }

  const latestCode = accessCodes && accessCodes.length > 0 ? accessCodes[0] : null

  return (
    <div className="animate-fade-in">
      <Link to="/admin/clients" className="text-sm text-gold-600 hover:text-gold-500 transition-colors">&larr; Clientes</Link>
      <h1 className="text-2xl font-bold text-text-primary mt-2 mb-6">{c.name} &mdash; {c.email}</h1>

      <div className="grid gap-6 max-w-2xl">
        {/* Client Info */}
        <div className="bg-surface border border-border-light rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Información del Cliente</h2>
            {!editing && (
              <button onClick={startEditing} className="text-sm text-gold-600 hover:text-gold-500 transition-colors">Editar</button>
            )}
          </div>
          {editing ? (
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs text-text-muted mb-1">Nombre</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-bg-base border border-border-light rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all" required />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Correo</label>
                <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-bg-base border border-border-light rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all" required type="email" />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Teléfono</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-bg-base border border-border-light rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={updateClient.isPending} className="bg-gold-500 text-dark-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
                  {updateClient.isPending ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="text-sm text-text-muted hover:text-text-secondary transition-colors">Cancelar</button>
              </div>
            </form>
          ) : (
            <div className="space-y-2 text-sm">
              <div><span className="text-text-muted">Nombre:</span> <span className="text-text-primary">{c.name}</span></div>
              <div><span className="text-text-muted">Correo:</span> <span className="text-text-primary">{c.email}</span></div>
              <div><span className="text-text-muted">Teléfono:</span> <span className="text-text-primary">{c.phone || '—'}</span></div>
              <div className="flex items-center gap-2">
                <span className="text-text-muted">Estado:</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_active ? 'bg-success-bg text-success border border-success/20' : 'bg-error-bg text-error border border-error/20'}`}>
                  {c.is_active ? 'Activo' : 'Inactivo'}
                </span>
                <button
                  onClick={handleToggleActive}
                  disabled={activateClient.isPending}
                  className="text-xs text-text-muted hover:text-text-secondary transition-colors ml-2 disabled:opacity-50"
                >
                  {c.is_active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
              {c.profile_id && (
                <div><span className="text-text-muted">Cuenta:</span> <span className="text-success">Activada</span></div>
              )}
            </div>
          )}
        </div>

        {/* Access Code */}
        <div className="bg-surface border border-border-light rounded-xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">Código de Acceso</h2>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleGenerateCode}
                disabled={generateCode.isPending}
                className="bg-gold-500 text-dark-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gold-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {generateCode.isPending ? 'Generando...' : 'Generar Nuevo Código'}
              </button>
              {generatedCode && (
                <button
                  onClick={handleSendEmail}
                  disabled={sendEmail.isPending || emailSent}
                  className="border border-border-medium text-text-secondary px-4 py-2 rounded-lg text-sm hover:border-gold-500 hover:text-gold-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {emailSent ? 'Correo Enviado' : sendEmail.isPending ? 'Enviando...' : 'Enviar por Correo'}
                </button>
              )}
            </div>
            {generatedCode && (
              <div className="bg-gold-500/5 border border-gold-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-text-muted">Comparte este código con el cliente:</p>
                  <button
                    onClick={handleCopyCode}
                    className="text-xs text-gold-600 hover:text-gold-500 transition-colors flex items-center gap-1"
                  >
                    {copied ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>
                <p className="text-2xl tracking-widest font-mono font-bold text-gold-600 select-all">{generatedCode}</p>
              </div>
            )}
            {latestCode && (
              <div className="text-xs text-text-muted space-y-0.5">
                <p>Último código creado: {new Date(latestCode.created_at).toLocaleDateString()}</p>
                <p>Estado: {latestCode.is_active ? (latestCode.used_at ? 'Usado' : 'Activo') : 'Desactivado'}</p>
              </div>
            )}
            {loadingCodes && <p className="text-xs text-text-muted">Cargando historial de códigos...</p>}
          </div>
        </div>

        {/* Assigned Galleries */}
        <div className="bg-surface border border-border-light rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Galerías Asignadas</h2>
            <Link to="/admin/galleries/new" className="text-sm text-gold-600 hover:text-gold-500 transition-colors">+ Nueva Galería</Link>
          </div>
          {assignedGalleries.length > 0 ? (
            <div className="space-y-2">
              {assignedGalleries.map(g => {
                const exhausted = g.download_limit > 0 && g.download_count >= g.download_limit
                return (
                  <div key={g.id} className="flex items-center justify-between border-b border-border-light pb-2 last:border-0">
                    <div>
                      <Link to={`/admin/galleries/${g.id}`} className="text-sm font-medium text-text-primary hover:text-gold-600 transition-colors">
                        {g.name}
                      </Link>
                      <p className="text-xs text-text-muted">
                        {g.download_limit > 0
                          ? `${g.download_count} / ${g.download_limit} descargas`
                          : `${g.download_count} descargas (ilimitado)`}
                        {exhausted && <span className="text-gold-600 ml-1">— Completado</span>}
                      </p>
                    </div>
                    <Link
                      to={`/admin/galleries/${g.id}/edit`}
                      className="text-sm text-text-muted hover:text-gold-600 transition-colors"
                    >
                      Editar
                    </Link>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No hay galerías asignadas.</p>
          )}
        </div>

        {/* Download Log */}
        <div className="bg-surface border border-border-light rounded-xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">Registro de Descargas</h2>
          {loadingLogs ? (
            <p className="text-sm text-text-muted">Cargando...</p>
          ) : downloadLogs && downloadLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted border-b border-border-light">
                    <th className="pb-2 pr-4 font-medium">ID de Foto</th>
                    <th className="pb-2 pr-4 font-medium">Fecha</th>
                    <th className="pb-2 font-medium">Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {downloadLogs.slice(0, 20).map(log => (
                    <tr key={log.id} className="border-b border-border-light last:border-0">
                      <td className="py-2 pr-4 text-xs font-mono text-text-secondary">{log.photo_id.slice(0, 8)}...</td>
                      <td className="py-2 pr-4 text-text-secondary">{new Date(log.downloaded_at).toLocaleDateString()}</td>
                      <td className="py-2 text-text-secondary">{new Date(log.downloaded_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-text-muted">No hay descargas aún.</p>
          )}
        </div>
      </div>
    </div>
  )
}
