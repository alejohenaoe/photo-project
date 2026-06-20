import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useGallery, usePhotos, useDeletePhoto } from '../../../hooks/useGalleries'
import { getViewUrls } from '../../../lib/r2'

export default function GalleryDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: gallery, isLoading: loadingGallery } = useGallery(id!)
  const { data: photos, isLoading: loadingPhotos } = usePhotos(id!)
  const deletePhoto = useDeletePhoto()
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})

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

  if (loadingGallery || loadingPhotos) return <p className="text-gray-500">Cargando...</p>
  if (!gallery) return <p className="text-red-500">Galería no encontrada</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/admin/galleries" className="text-sm text-gray-500 hover:underline">&larr; Galerías</Link>
          <h1 className="text-2xl font-bold mt-1">{gallery.name}</h1>
          {gallery.description && (
            <p className="text-sm text-gray-500 mt-1">{gallery.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            to={`/admin/galleries/${id}/upload`}
            className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
          >
            Subir Fotos
          </Link>
          <Link
            to={`/admin/galleries/${id}/permissions`}
            className="text-sm text-blue-600 hover:underline self-center"
          >
            Permisos
          </Link>
          <Link
            to={`/admin/galleries/${id}/edit`}
            className="text-sm text-gray-600 hover:underline self-center"
          >
            Editar
          </Link>
        </div>
      </div>

      {!photos || photos.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-4">No hay fotos en esta galería aún.</p>
          <Link
            to={`/admin/galleries/${id}/upload`}
            className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
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
                  className="w-full aspect-square object-cover rounded border bg-gray-100"
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-square rounded border bg-gray-200 animate-pulse" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => {
                    if (confirm('¿Eliminar esta foto?')) {
                      deletePhoto.mutate({ photoId: photo.id, galleryId: id! })
                    }
                  }}
                  className="bg-red-600 text-white px-3 py-1 rounded text-xs"
                >
                  Eliminar
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">{photo.filename}</p>
            </div>
          ))}
        </div>
      )}

      {photos && photos.length > 0 && (
        <p className="text-sm text-gray-400 mt-6">{photos.length} foto{photos.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  )
}
