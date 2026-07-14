import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useClientPhotos, useClientGalleries } from '../../hooks/useGalleries'
import { getViewUrls, getDownloadUrl } from '../../lib/r2'

export default function ClientGalleryView() {
  const { id } = useParams<{ id: string }>()
  const { data: galleries } = useClientGalleries()
  const gallery = galleries?.find(g => g.id === id)
  const { data: photos, isLoading: loadingPhotos } = useClientPhotos(id!)
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const [downloading, setDownloading] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [downloadingBatch, setDownloadingBatch] = useState(false)

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

  function toggleSelection(photoId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(photoId)) next.delete(photoId)
      else next.add(photoId)
      return next
    })
  }

  function toggleSelectAll() {
    if (!photos) return
    if (selected.size === photos.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(photos.map(p => p.id)))
    }
  }

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

  async function handleBatchDownload() {
    if (selected.size === 0) return
    setError('')
    setDownloadingBatch(true)
    try {
      const promises = Array.from(selected).map(async (photoId) => {
        const { url, filename } = await getDownloadUrl(photoId)
        return { url, filename }
      })
      const results = await Promise.allSettled(promises)
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { url, filename } = result.value
          const a = document.createElement('a')
          a.href = url
          a.download = filename
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          await new Promise(r => setTimeout(r, 200))
        }
      }
      setSelected(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar')
    } finally {
      setDownloadingBatch(false)
    }
  }

  if (!gallery || loadingPhotos) return <p className="text-text-muted px-4">Cargando...</p>

  const canDownloadBatch = gallery.download_limit === 0 || gallery.download_count < gallery.download_limit
  const remaining = gallery.download_limit > 0
    ? gallery.download_limit - gallery.download_count
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <Link to="/client" className="text-sm text-gold-600 hover:text-gold-500 transition-colors">&larr; Mis Galerías</Link>
      <div className="flex items-center justify-between mt-2 mb-2">
        <h1 className="text-2xl font-bold text-text-primary">{gallery.name}</h1>
        {!canDownloadBatch && (
          <span className="text-xs bg-gold-500/10 text-gold-600 border border-gold-500/30 px-2 py-0.5 rounded-full">Completada</span>
        )}
      </div>
      {gallery.description && (
        <p className="text-sm text-text-muted mb-2">{gallery.description}</p>
      )}

      {/* Remaining downloads */}
      {gallery.download_limit > 0 && (
        <p className={`text-sm mb-4 ${!canDownloadBatch ? 'text-gold-600' : 'text-text-muted'}`}>
          Te quedan <strong>{remaining}</strong> de <strong>{gallery.download_limit}</strong> descargas
        </p>
      )}

      {error && (
        <div className="bg-error-bg border border-error/20 text-error text-sm rounded-lg px-4 py-2.5 mb-4">
          {error}
        </div>
      )}

      {!photos || photos.length === 0 ? (
        <p className="text-text-muted">No hay fotos disponibles en esta galería.</p>
      ) : (
        <>
          {/* Selection toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="text-sm text-text-muted hover:text-gold-600 transition-colors"
              >
                {selected.size === photos.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
              </button>
              <span className="text-sm text-text-muted">
                {selected.size} de {photos.length} seleccionados
              </span>
            </div>
            {canDownloadBatch && selected.size > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    Array.from(selected).forEach(id => handleDownload(id))
                  }}
                  className="text-sm text-text-muted hover:text-gold-600 transition-colors self-center"
                >
                  Descargar individual
                </button>
                <button
                  onClick={handleBatchDownload}
                  disabled={downloadingBatch}
                  className="bg-gold-500 text-dark-900 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gold-400 transition-all hover:shadow-lg hover:shadow-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {downloadingBatch ? 'Descargando...' : `Descargar (${selected.size})`}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo) => {
              const isDownloading = downloading === photo.id
              const isSelected = selected.has(photo.id)
              const isLimitReached = !photo.can_download
              return (
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

                  {/* Hover overlay with actions */}
                  {photo.can_download && (
                    <div className="absolute inset-0 bg-dark-900/0 group-hover:bg-dark-900/60 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => handleDownload(photo.id)}
                        disabled={isDownloading}
                        className="bg-gold-500 text-dark-900 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gold-400 transition-all disabled:opacity-50 shadow-lg"
                      >
                        {isDownloading ? '...' : 'Descargar'}
                      </button>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {isLimitReached ? (
                      <span className="bg-bg-elevated/80 text-text-muted text-xs px-1.5 py-0.5 rounded-lg border border-border-light">Inactiva</span>
                    ) : (
                      <span className="bg-success-bg text-success text-xs px-1.5 py-0.5 rounded-lg border border-success/20">Descargable</span>
                    )}
                  </div>

                  {/* Checkbox for batch selection */}
                  {photo.can_download && (
                    <div className="absolute top-2 right-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(photo.id)}
                        className="w-4 h-4 rounded bg-bg-base border-border-medium text-gold-500 focus:ring-gold-500/30 cursor-pointer accent-gold-500"
                      />
                    </div>
                  )}

                  <p className="text-xs text-text-muted mt-1.5 truncate">{photo.filename}</p>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
