import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGallery, useCreateGallery, useUpdateGallery } from '../../../hooks/useGalleries'

export default function GalleryForm() {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()

  const { data: existing } = useGallery(id || '')
  const create = useCreateGallery()
  const update = useUpdateGallery()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setDescription(existing.description || '')
    }
  }, [existing])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    if (isEditing) {
      await update.mutateAsync({ id: id!, name: name.trim(), description: description.trim() || null })
    } else {
      await create.mutateAsync({ name: name.trim(), description: description.trim() || undefined })
    }
    navigate('/admin/galleries')
  }

  const isPending = create.isPending || update.isPending

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Editar Galería' : 'Nueva Galería'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            rows={3}
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/galleries')}
            className="text-sm text-gray-600 hover:underline"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
