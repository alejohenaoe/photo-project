import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGallery, useCreateGallery, useUpdateGallery, useClients } from '../../../hooks/useGalleries'

export default function GalleryForm() {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()

  const { data: existing } = useGallery(id || '')
  const { data: clients } = useClients()
  const create = useCreateGallery()
  const update = useUpdateGallery()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState<string>('')
  const [downloadLimit, setDownloadLimit] = useState(0)

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setDescription(existing.description || '')
      setClientId(existing.client_id || '')
      setDownloadLimit(existing.download_limit)
    }
  }, [existing])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    if (isEditing) {
      await update.mutateAsync({
        id: id!,
        name: name.trim(),
        description: description.trim() || null,
        client_id: clientId || null,
        download_limit: downloadLimit,
      })
    } else {
      await create.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        clientId: clientId || null,
        downloadLimit,
      })
    }
    navigate('/admin/galleries')
  }

  const isPending = create.isPending || update.isPending

  return (
    <div className="max-w-lg animate-fade-in">
      <div className="bg-surface border border-border-light rounded-xl p-6">
        <h1 className="text-xl font-bold text-text-primary mb-6">{isEditing ? 'Editar Galería' : 'Nueva Galería'}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary font-medium mb-1.5">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary font-medium mb-1.5">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary font-medium mb-1.5">Cliente Asignado</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
            >
              <option value="">— Sin asignar —</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-secondary font-medium mb-1.5">
              Límite de Descargas <span className="text-text-muted font-normal">(0 = ilimitado)</span>
            </label>
            <input
              type="number"
              min={0}
              value={downloadLimit}
              onChange={(e) => setDownloadLimit(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="bg-gold-500 text-dark-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gold-400 transition-all hover:shadow-lg hover:shadow-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/galleries')}
              className="text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
