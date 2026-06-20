import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  useClients, useUpdateClient, useActivateClient,
  useGenerateAccessCode, useSendAccessEmail,
  useClientAccessCodes, useClientGalleriesWithPermissions, useClientDownloadLogs,
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
  const { data: galleryPerms, isLoading: loadingPerms } = useClientGalleriesWithPermissions(id || '')
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
    return <p className="text-gray-500">Cargando...</p>
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
    <div>
      <Link to="/admin/clients" className="text-sm text-blue-600 hover:underline">&larr; Clientes</Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">{c.name} &mdash; {c.email}</h1>

      <div className="grid gap-6 max-w-2xl">
        {/* Client Info */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Información del Cliente</h2>
            {!editing && (
              <button onClick={startEditing} className="text-sm text-blue-600 hover:underline">Editar</button>
            )}
          </div>
          {editing ? (
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Correo</label>
                <input value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" required type="email" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Teléfono</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={updateClient.isPending} className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50">
                  {updateClient.isPending ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="text-sm text-gray-600 hover:underline">Cancelar</button>
              </div>
            </form>
          ) : (
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-500">Nombre:</span> {c.name}</div>
              <div><span className="text-gray-500">Correo:</span> {c.email}</div>
              <div><span className="text-gray-500">Teléfono:</span> {c.phone || '—'}</div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Estado:</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {c.is_active ? 'Activo' : 'Inactivo'}
                </span>
                <button
                  onClick={handleToggleActive}
                  disabled={activateClient.isPending}
                  className="text-xs text-red-600 hover:underline ml-2 disabled:opacity-50"
                >
                  {c.is_active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
              {c.profile_id && (
                <div><span className="text-gray-500">Cuenta:</span> <span className="text-green-700">Activada</span></div>
              )}
            </div>
          )}
        </div>

        {/* Access Code */}
        <div className="border rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Código de Acceso</h2>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={handleGenerateCode}
                disabled={generateCode.isPending}
                className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
              >
                {generateCode.isPending ? 'Generando...' : 'Generar Nuevo Código'}
              </button>
              {generatedCode && (
                <button
                  onClick={handleSendEmail}
                  disabled={sendEmail.isPending || emailSent}
                  className="border px-4 py-2 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  {emailSent ? 'Correo Enviado' : sendEmail.isPending ? 'Enviando...' : 'Enviar por Correo'}
                </button>
              )}
            </div>
            {generatedCode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-500">Comparte este código con el cliente:</p>
                  <button
                    onClick={handleCopyCode}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {copied ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>
                <p className="text-2xl tracking-widest font-mono font-bold select-all">{generatedCode}</p>
              </div>
            )}
            {latestCode && (
              <div className="text-xs text-gray-500 space-y-0.5">
                <p>Último código creado: {new Date(latestCode.created_at).toLocaleDateString()}</p>
                <p>Estado: {latestCode.is_active ? (latestCode.used_at ? 'Usado' : 'Activo') : 'Desactivado'}</p>
              </div>
            )}
            {loadingCodes && <p className="text-xs text-gray-400">Cargando historial de códigos...</p>}
          </div>
        </div>

        {/* Assigned Galleries */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Galerías Asignadas</h2>
            <Link to="/admin/galleries" className="text-sm text-blue-600 hover:underline">+ Asignar Galería</Link>
          </div>
          {loadingPerms ? (
            <p className="text-sm text-gray-400">Cargando...</p>
          ) : galleryPerms && galleryPerms.length > 0 ? (
            <div className="space-y-2">
              {galleryPerms.map(gp => (
                <div key={gp.gallery_id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <Link to={`/admin/galleries/${gp.gallery_id}`} className="text-sm font-medium hover:underline">
                      {gp.gallery_name}
                    </Link>
                    <p className="text-xs text-gray-500">{gp.authorized_photos} de {gp.total_photos} fotos autorizadas</p>
                  </div>
                  <Link
                    to={`/admin/galleries/${gp.gallery_id}/permissions`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Gestionar
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay galerías asignadas.</p>
          )}
        </div>

        {/* Download Log */}
        <div className="border rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Registro de Descargas</h2>
          {loadingLogs ? (
            <p className="text-sm text-gray-400">Cargando...</p>
          ) : downloadLogs && downloadLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 pr-4">ID de Foto</th>
                    <th className="pb-2 pr-4">Fecha</th>
                    <th className="pb-2">Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {downloadLogs.slice(0, 20).map(log => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-xs font-mono">{log.photo_id.slice(0, 8)}...</td>
                      <td className="py-2 pr-4">{new Date(log.downloaded_at).toLocaleDateString()}</td>
                      <td className="py-2">{new Date(log.downloaded_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay descargas aún.</p>
          )}
        </div>
      </div>
    </div>
  )
}
