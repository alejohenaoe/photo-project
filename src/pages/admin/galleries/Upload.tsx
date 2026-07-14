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
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Subir Fotos</h1>
        <button
          onClick={() => navigate(`/admin/galleries/${galleryId}`)}
          className="text-sm text-text-muted hover:text-gold-600 transition-colors"
        >
          ← Volver a la galería
        </button>
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-border-medium rounded-xl p-10 sm:p-16 text-center mb-6 hover:border-gold-500/50 transition-colors bg-bg-elevated/50 cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <p className="text-lg font-display text-text-primary mb-2">Arrastra tus imágenes aquí</p>
        <p className="text-sm text-text-muted mb-5">o</p>
        <span className="bg-gold-500 text-dark-900 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gold-400 transition-all inline-block">
          Seleccionar Archivos
        </span>
        <p className="text-xs text-text-muted mt-4">JPG, PNG, HEIC · Las previews se generan automáticamente</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {items.length > 0 && (
        <>
          <div className="flex flex-wrap gap-3 mb-4 text-sm">
            <span className="text-text-secondary"><strong className="text-text-primary">{items.length}</strong> seleccionados</span>
            <span className="text-text-secondary"><strong className="text-success">{doneCount}</strong> subidos</span>
            <span className="text-text-secondary"><strong className="text-error">{errorCount}</strong> fallidos</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-6">
            {items.map((item, i) => (
              <div key={i} className="relative group">
                <img
                  src={item.preview}
                  alt={item.file.name}
                  className="w-full aspect-square object-cover rounded-lg border border-border-light bg-bg-elevated"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {item.status === 'uploading' && (
                    <div className="w-7 h-7 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {item.status === 'done' && (
                    <div className="w-7 h-7 bg-success/80 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                      &#10003;
                    </div>
                  )}
                  {item.status === 'error' && (
                    <div className="w-7 h-7 bg-error/80 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                      !
                    </div>
                  )}
                </div>
                {item.status === 'pending' && (
                  <button
                    onClick={() => removeItem(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-error/80 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-error transition-all"
                  >
                    &times;
                  </button>
                )}
                {item.status === 'error' && (
                  <div className="absolute -bottom-6 left-0 right-0 text-xs text-error truncate">
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
                className="bg-gold-500 text-dark-900 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gold-400 transition-all hover:shadow-lg hover:shadow-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
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
                className="text-sm text-text-muted hover:text-gold-600 transition-colors"
              >
                Listo →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
