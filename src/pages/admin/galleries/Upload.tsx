import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { uploadPhoto, createPreviewBlob } from '../../../lib/r2'

interface UploadItem {
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

export default function GalleryUpload() {
  const { id: galleryId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<UploadItem[]>([])
  const [activeUploads, setActiveUploads] = useState(0)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const newItems: UploadItem[] = Array.from(files).map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      status: 'pending' as const,
    }))
    setItems((prev) => [...prev, ...newItems])
    inputRef.current!.value = ''
  }

  async function uploadItem(item: UploadItem, index: number) {
    setItems((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], status: 'uploading' }
      return copy
    })

    try {
      const previewBlob = await createPreviewBlob(item.file).catch(() => item.file)
      await uploadPhoto(galleryId!, item.file, previewBlob)

      setItems((prev) => {
        const copy = [...prev]
        copy[index] = { ...copy[index], status: 'done' }
        return copy
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al subir'
      setItems((prev) => {
        const copy = [...prev]
        copy[index] = { ...copy[index], status: 'error', error: message }
        return copy
      })
    }
  }

  async function startUpload() {
    const pending = items.map((item, i) => ({ item, i })).filter(({ item }) => item.status === 'pending')
    if (pending.length === 0) return

    setActiveUploads(pending.length)

    const concurrency = 1
    for (let i = 0; i < pending.length; i += concurrency) {
      const batch = pending.slice(i, i + concurrency)
      await Promise.all(batch.map(({ item, i }) => uploadItem(item, i)))
      await new Promise((r) => setTimeout(r, 50))
    }

    qc.invalidateQueries({ queryKey: ['photos', galleryId] })
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const pendingCount = items.filter((i) => i.status === 'pending').length
  const doneCount = items.filter((i) => i.status === 'done').length
  const errorCount = items.filter((i) => i.status === 'error').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Subir Fotos</h1>
        <button
          onClick={() => navigate(`/admin/galleries/${galleryId}`)}
          className="text-sm text-gray-600 hover:underline"
        >
          Volver a la galería
        </button>
      </div>

      <div className="mb-6">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-900 file:text-white hover:file:bg-gray-800"
        />
      </div>

      {items.length > 0 && (
        <>
          <div className="flex gap-3 mb-4 text-sm text-gray-600">
            <span>{items.length} seleccionados</span>
            <span>{doneCount} subidos</span>
            <span>{errorCount} fallidos</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 mb-6">
            {items.map((item, i) => (
              <div key={i} className="relative group">
                <img
                  src={item.preview}
                  alt={item.file.name}
                  className="w-full aspect-square object-cover rounded border"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {item.status === 'uploading' && (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {item.status === 'done' && (
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      &#10003;
                    </div>
                  )}
                  {item.status === 'error' && (
                    <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      !
                    </div>
                  )}
                </div>
                {item.status === 'pending' && (
                  <button
                    onClick={() => removeItem(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center"
                  >
                    &times;
                  </button>
                )}
                {item.status === 'error' && (
                  <div className="absolute -bottom-6 left-0 right-0 text-xs text-red-600 truncate">
                    {item.error}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {pendingCount > 0 && (
              <button
                onClick={startUpload}
                disabled={activeUploads > 0}
                className="bg-gray-900 text-white px-6 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
              >
                {activeUploads > 0 ? 'Subiendo...' : `Subir ${pendingCount} fotos`}
              </button>
            )}
            {doneCount > 0 && (
              <button
                onClick={() => {
                  setItems([])
                  navigate(`/admin/galleries/${galleryId}`)
                }}
                className="text-sm text-gray-600 hover:underline"
              >
                Listo
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
