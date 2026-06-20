const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_URL + '/functions/v1'

export async function uploadPhoto(galleryId: string, file: File, preview: Blob): Promise<{ photoId: string }> {
  const form = new FormData()
  form.append('galleryId', galleryId)
  form.append('file', file)
  form.append('preview', preview, `preview-${file.name}`)

  const res = await fetch(`${FUNCTIONS_BASE}/upload-photo`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Upload failed')
  }
  return res.json()
}

export async function getViewUrls(paths: string[], bucket: 'previews' | 'originals' = 'previews'): Promise<string[]> {
  const res = await fetch(`${FUNCTIONS_BASE}/get-view-urls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paths, bucket }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to get view URLs')
  }
  const data = await res.json()
  return data.urls as string[]
}

export async function getDownloadUrl(photoId: string): Promise<{ url: string; filename: string }> {
  const { supabase } = await import('./supabase')
  const session = await supabase.auth.getSession()
  const token = session.data.session?.access_token

  const res = await fetch(`${FUNCTIONS_BASE}/get-download-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ photoId }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to get download URL')
  }

  return res.json()
}

export async function createPreviewBlob(file: File, maxDimension = 1200, quality = 0.8): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  let { width, height } = bitmap
  if (width > height && width > maxDimension) {
    height = (height / width) * maxDimension
    width = maxDimension
  } else if (height > maxDimension) {
    width = (width / height) * maxDimension
    height = maxDimension
  }
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob failed'))
      },
      'image/jpeg',
      quality,
    )
  })
}
