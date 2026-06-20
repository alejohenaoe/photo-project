import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usePhotos, useClients, useAuthorizeDownload, useGalleryPermissions } from '../../../hooks/useGalleries'

export default function GalleryPermissions() {
  const { id: galleryId } = useParams<{ id: string }>()
  const { data: photos, isLoading: loadingPhotos } = usePhotos(galleryId!)
  const { data: clients, isLoading: loadingClients } = useClients()
  const authorize = useAuthorizeDownload()

  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())

  const { data: existingPermissions } = useGalleryPermissions(
    selectedClient || '',
    galleryId!,
  )

  function togglePhoto(photoId: string) {
    setSelectedPhotos((prev) => {
      const next = new Set(prev)
      if (next.has(photoId)) next.delete(photoId)
      else next.add(photoId)
      return next
    })
  }

  function selectAll() {
    if (!photos) return
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set())
    } else {
      setSelectedPhotos(new Set(photos.map((p) => p.id)))
    }
  }

  async function handleGrant() {
    if (!selectedClient || selectedPhotos.size === 0) return
    await authorize.mutateAsync({ photoIds: Array.from(selectedPhotos), clientId: selectedClient, action: 'grant' })
    setSelectedPhotos(new Set())
  }

  async function handleRevoke() {
    if (!selectedClient || selectedPhotos.size === 0) return
    await authorize.mutateAsync({ photoIds: Array.from(selectedPhotos), clientId: selectedClient, action: 'revoke' })
    setSelectedPhotos(new Set())
  }

  if (loadingPhotos || loadingClients) return <p className="text-gray-500">Cargando...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to={`/admin/galleries/${galleryId}`} className="text-sm text-gray-500 hover:underline">&larr; Volver a Galería</Link>
          <h1 className="text-2xl font-bold mt-1">Permisos de Fotos</h1>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="w-56 shrink-0">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Clientes</h2>
          <div className="flex flex-col gap-1">
            {clients?.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelectedClient(c.id); setSelectedPhotos(new Set()) }}
                className={`text-left px-3 py-2 rounded text-sm ${
                  selectedClient === c.id ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1">
          {!selectedClient ? (
            <p className="text-gray-500 text-sm">Selecciona un cliente para gestionar permisos</p>
          ) : !photos || photos.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay fotos en esta galería</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={selectAll}
                    className="text-sm text-gray-600 hover:underline"
                  >
                    {selectedPhotos.size === photos.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                  </button>
                  <span className="text-sm text-gray-400">
                    {selectedPhotos.size} de {photos.length} seleccionados
                  </span>
                  {existingPermissions && (
                    <span className="text-sm text-gray-400">
                      ({existingPermissions.size} autorizados)
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGrant}
                    disabled={selectedPhotos.size === 0 || authorize.isPending}
                    className="bg-green-700 text-white px-3 py-1.5 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                  >
                    {authorize.isPending ? 'Guardando...' : 'Conceder Acceso'}
                  </button>
                  <button
                    onClick={handleRevoke}
                    disabled={selectedPhotos.size === 0 || authorize.isPending}
                    className="bg-red-700 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    Revocar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {photos.map((photo) => {
                  const isAuthorized = existingPermissions?.has(photo.id)
                  const isSelected = selectedPhotos.has(photo.id)
                  return (
                    <div
                      key={photo.id}
                      onClick={() => togglePhoto(photo.id)}
                      className={`relative cursor-pointer rounded border-2 transition-colors ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-300'
                          : isAuthorized
                            ? 'border-green-400'
                            : 'border-transparent'
                      }`}
                    >
                      <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                        {photo.filename}
                      </div>
                      {isAuthorized && (
                        <div className="absolute top-1 left-1 bg-green-500 text-white text-xs rounded px-1">
                          ok
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1 truncate">{photo.filename}</p>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
