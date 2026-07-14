import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useGallery, usePhotos, useDeletePhoto, useClients } from '../../../hooks/useGalleries'
import { getViewUrls } from '../../../lib/r2'

export default function GalleryDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: gallery, isLoading: loadingGallery } = useGallery(id!)
  const { data: photos, isLoading: loadingPhotos } = usePhotos(id!)
  const { data: clients } = useClients()
  const deletePhoto = useDeletePhoto()
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})

  const assignedClient = clients?.find(c => c.id === gallery?.client_id)

  useEffect(() => {
    if (!photos || photos.length === 0) return
    const paths = photos.map((p) => p.preview_path)
    getViewUrls(paths, 'previews')
      .then((urls) => {
        const map: Record<string, string> = {}
        photos.forEach((p, i) => { map[p.id] = urls[i] })
        setImageUrls(map)
      })
      .catch(() => {})
  }, [photos])

  if (loadingGallery || loadingPhotos) return <p className="text-text-muted">Cargando...</p>
  if (!gallery) return <p className="text-error">Galería no encontrada</p>

  const isExhausted = gallery.download_limit > 0 && gallery.download_count >= gallery.download_limit

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <Link to="/admin/galleries" className="text-sm text-gold-600 hover:text-gold-500 transition-colors">&larr; Galerías</Link>
          <h1 className="text-2xl font-bold text-text-primary mt-1">{gallery.name}</h1>
          {gallery.description && (
            <p className="text-sm text-text-muted mt-1">{gallery.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            to={`/admin/galleries/${id}/upload`}
            className="bg-gold-500 text-dark-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gold-400 transition-all hover:shadow-lg hover:shadow-gold-500/20 active:scale-[0.98]"
          >
            Subir Fotos
          </Link>
          <Link
            to={`/admin/galleries/${id}/edit`}
            className="border border-border-medium text-text-secondary px-4 py-2 rounded-lg text-sm hover:border-gold-500 hover:text-gold-600 transition-all self-center"
          >
            Editar
          </Link>
        </div>
      </div>

      {/* Client info + download stats */}
      {gallery.client_id && (
        <div className="bg-surface border border-border-light rounded-xl p-4 mb-6 text-sm space-y-1.5">
          <div>
            <span className="text-text-muted">Cliente:</span>{' '}
            {assignedClient ? (
              <Link to={`/admin/clients/${gallery.client_id}`} className="text-gold-600 hover:text-gold-500 transition-colors">
                {assignedClient.name}
              </Link>
            ) : (
              <span className="text-text-muted">—</span>
            )}
          </div>
          <div>
            <span className="text-text-muted">Descargas:</span>{' '}
            {gallery.download_limit > 0 ? (
              <span className={isExhausted ? 'text-gold-600 font-medium' : 'text-text-primary'}>
                {gallery.download_count} / {gallery.download_limit}
              </span>
            ) : (
              <span className="text-text-primary">{gallery.download_count} (ilimitado)</span>
            )}
            {isExhausted && (
              <span className="ml-2 text-xs bg-gold-500/10 text-gold-600 border border-gold-500/30 px-2 py-0.5 rounded-full">Completado</span>
            )}
          </div>
        </div>
      )}

      {!photos || photos.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border-light rounded-xl">
          <p className="text-text-muted mb-5">No hay fotos en esta galería aún.</p>
          <Link
            to={`/admin/galleries/${id}/upload`}
            className="bg-gold-500 text-dark-900 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gold-400 transition-all inline-block"
          >
            Subir Fotos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative">
              {imageUrls[photo.id] ? (
                <img
                  src={imageUrls[photo.id]}
                  alt={photo.filename}
                  className="w-full aspect-square object-cover rounded-lg border border-border-light bg-bg-elevated"
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-square rounded-lg border border-border-light bg-bg-elevated animate-pulse" />
              )}
              <div className="absolute inset-0 bg-dark-900/0 group-hover:bg-dark-900/60 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => {
                    if (confirm('¿Eliminar esta foto?')) {
                      deletePhoto.mutate({ photoId: photo.id, galleryId: id! })
                    }
                  }}
                  className="bg-error/80 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-error transition-all backdrop-blur-sm"
                >
                  Eliminar
                </button>
              </div>
              <p className="text-xs text-text-muted mt-1.5 truncate">{photo.filename}</p>
            </div>
          ))}
        </div>
      )}

      {photos && photos.length > 0 && (
        <p className="text-sm text-text-muted mt-6">{photos.length} foto{photos.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  )
}
