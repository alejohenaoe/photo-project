import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  is_read: boolean
  created_at: string
}

export default function Contacts() {
  const queryClient = useQueryClient()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: messages, isLoading } = useQuery({
    queryKey: ['contact-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as ContactMessage[]
    },
  })

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] })
    },
  })

  const deleteMessage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] })
      if (expandedId === deletedId) setExpandedId(null)
    },
  })

  function toggleExpand(msg: ContactMessage) {
    setExpandedId(expandedId === msg.id ? null : msg.id)
    if (!msg.is_read) markRead.mutate(msg.id)
  }

  const unreadCount = messages?.filter((m) => !m.is_read).length ?? 0

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mensajes de Contacto</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gold-500 mt-1">{unreadCount} sin leer</p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-text-muted text-sm py-12 text-center">Cargando mensajes...</div>
      ) : !messages?.length ? (
        <div className="text-text-muted text-sm py-12 text-center">No hay mensajes aún.</div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-surface border rounded-xl overflow-hidden transition-colors ${
                expandedId === msg.id
                  ? 'border-gold-500/50'
                  : msg.is_read
                    ? 'border-border-light hover:border-dark-600'
                    : 'border-gold-500/30 hover:border-gold-500/50'
              }`}
            >
              <button
                onClick={() => toggleExpand(msg)}
                className="w-full text-left px-5 py-4 flex items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!msg.is_read && (
                      <span className="w-2 h-2 rounded-full bg-gold-500 shrink-0" />
                    )}
                    <span className={`font-medium text-sm ${msg.is_read ? 'text-text-secondary' : 'text-text-primary'}`}>
                      {msg.name}
                    </span>
                    <span className="text-text-muted text-xs">·</span>
                    <span className="text-text-muted text-xs">{msg.email}</span>
                  </div>
                  <p className={`text-sm truncate ${msg.is_read ? 'text-text-muted' : 'text-text-secondary'}`}>
                    {msg.message}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-text-muted text-xs whitespace-nowrap">
                    {new Date(msg.created_at).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className={`text-text-muted text-xs transition-transform ${expandedId === msg.id ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </div>
              </button>

              {expandedId === msg.id && (
                <div className="border-t border-border-light px-5 py-4">
                  <p className="text-text-secondary text-sm whitespace-pre-wrap leading-relaxed mb-4">
                    {msg.message}
                  </p>
                  <div className="flex items-center gap-3">
                    <a
                      href={`mailto:${msg.email}?subject=RE: Mensaje de contacto - NEFTIK PHOTO`}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gold-500/10 text-gold-600 border border-gold-500/30 hover:bg-gold-500/20 transition-colors"
                    >
                      Responder por email
                    </a>
                    <button
                      onClick={() => deleteMessage.mutate(msg.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-dark-700 text-text-muted border border-dark-600 hover:text-red-400 hover:border-red-400/30 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
