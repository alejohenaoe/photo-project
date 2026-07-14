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
    <div className="max-w-lg animate-fade-in">
      <div className="bg-surface border border-border-light rounded-xl p-6">
        <h1 className="text-xl font-bold text-text-primary mb-6">{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h1>
        {error && <p className="text-error text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary font-medium mb-1.5">Nombre</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary font-medium mb-1.5">Correo</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
              required
              type="email"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary font-medium mb-1.5">Teléfono</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-bg-base border border-border-light rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-gold-500 text-dark-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gold-400 transition-all hover:shadow-lg hover:shadow-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {saving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/clients')}
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
