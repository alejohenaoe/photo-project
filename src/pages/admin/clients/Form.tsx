import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useClients, useUpdateClient } from '../../../hooks/useGalleries'
import { createClient } from '../../../lib/api'

export default function ClientForm() {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()
  const { data: clients } = useClients()
  const existing = clients?.find(c => c.id === id)
  const update = useUpdateClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setEmail(existing.email)
      setPhone(existing.phone || '')
    }
  }, [existing])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setError('')
    setSaving(true)
    try {
      if (isEditing) {
        await update.mutateAsync({ id: id!, name: name.trim(), email: email.trim(), phone: phone.trim() || null })
      } else {
        await createClient(name.trim(), email.trim(), phone.trim() || null)
      }
      navigate('/admin/clients')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el cliente')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Correo</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            required
            type="email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/clients')}
            className="text-sm text-gray-600 hover:underline"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
