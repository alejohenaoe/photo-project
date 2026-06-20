import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useClientPhotos, useGallery } from '../../hooks/useGalleries'
import { getViewUrls, getDownloadUrl } from '../../lib/r2'

export default function ClientGalleryView() {
  const { id } = useParams<{ id: string }>()
  const { data: gallery, isLoading: loadingGallery } = useGallery(id!)
  const { data: photos, isLoading: loadingPhotos } = useClientPhotos(id!)
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const [downloading, setDownloading] = useState<string | null>(null)
  const [error, setError] = useState('')

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

  async function handleDownload(photoId: string) {
    setError('')
    setDownloading(photoId)
    try {
      const { url, filename } = await getDownloadUrl(photoId)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar')
    } finally {
      setDownloading(null)
    }
  }

  if (loadingGallery || loadingPhotos) return <p className="text-gray-500">Cargando...</p>
  if (!gallery) return <p className="text-red-500">Galería no encontrada</p>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/client" className="text-sm text-gray-500 hover:underline">&larr; Mis Galerías</Link>
      <h1 className="text-2xl font-bold mt-2 mb-2">{gallery.name}</h1>
      {gallery.description && (
        <p className="text-sm text-gray-500 mb-6">{gallery.description}</p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-2 mb-4">
          {error}
        </div>
      )}

      {!photos || photos.length === 0 ? (
        <p className="text-gray-500">No hay fotos disponibles en esta galería.</p>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">
            {photos.filter((p) => p.can_download).length} de {photos.length} fotos disponibles para descargar
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative">
                {imageUrls[photo.id] ? (
                  <img
                    src={imageUrls[photo.id]}
                    alt={photo.filename}
                    className="w-full aspect-square object-cover rounded border bg-gray-100"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full aspect-square rounded border bg-gray-200 animate-pulse" />
                )}

                {photo.can_download && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handleDownload(photo.id)}
                      disabled={downloading === photo.id}
                      className="bg-white text-gray-900 px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 disabled:opacity-50 shadow-lg"
                    >
                      {downloading === photo.id ? '...' : 'Descargar'}
                    </button>
                  </div>
                )}

                <div className="absolute top-2 right-2">
                  {photo.can_download ? (
                    <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">Descargable</span>
                  ) : (
                    <span className="bg-gray-500/70 text-white text-xs px-1.5 py-0.5 rounded">Solo Vista Previa</span>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1 truncate">{photo.filename}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
