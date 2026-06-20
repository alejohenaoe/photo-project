import { supabase } from './supabase'

export interface Client {
  id: string
  profile_id: string | null
  name: string
  email: string
  phone: string | null
  is_active: boolean
  created_at: string
}

export interface Gallery {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Photo {
  id: string
  gallery_id: string
  filename: string
  storage_path: string
  preview_path: string
  size: number
  width: number | null
  height: number | null
  mime_type: string
  sort_order: number
  created_at: string
  deleted_at: string | null
}

export async function fetchGalleries() {
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Gallery[]
}

export async function fetchGallery(id: string) {
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Gallery
}

export async function createGallery(name: string, description?: string) {
  const { data, error } = await supabase
    .from('galleries')
    .insert({ name, description: description || null })
    .select()
    .single()
  if (error) throw error
  return data as Gallery
}

export async function updateGallery(id: string, updates: { name?: string; description?: string | null }) {
  const { data, error } = await supabase
    .from('galleries')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Gallery
}

export async function archiveGallery(id: string) {
  const { error } = await supabase
    .from('galleries')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function fetchPhotos(galleryId: string) {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('gallery_id', galleryId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data as Photo[]
}

export async function deletePhoto(id: string) {
  const { error } = await supabase
    .from('photos')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function updatePhotoSortOrder(photoId: string, sortOrder: number) {
  const { error } = await supabase
    .from('photos')
    .update({ sort_order: sortOrder })
    .eq('id', photoId)
  if (error) throw error
}

export async function fetchClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Client[]
}

export interface PhotoPermission {
  id: string
  photo_id: string
  client_id: string
  is_active: boolean
}

export async function fetchPermissions(clientId: string, galleryId: string) {
  const { data, error } = await supabase
    .from('photo_permissions')
    .select('photo_id, is_active')
    .eq('client_id', clientId)
    .in('photo_id', (await supabase
      .from('photos')
      .select('id')
      .eq('gallery_id', galleryId)
      .is('deleted_at', null)
    ).data?.map(p => p.id) || [])
  if (error) throw error
  return data as Pick<PhotoPermission, 'photo_id' | 'is_active'>[]
}

const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_URL + '/functions/v1'

export async function authorizeDownload(
  photoIds: string[],
  clientId: string,
  action: 'grant' | 'revoke',
) {
  const session = await supabase.auth.getSession()
  const token = session.data.session?.access_token

  const res = await fetch(`${FUNCTIONS_BASE}/authorize-download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ photoIds, clientId, action }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to update permissions')
  }

  return res.json()
}

export async function fetchClientGalleries() {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single()

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('profile_id', profile?.id)
    .single()

  if (!client) return []

  const { data: permissions, error: permError } = await supabase
    .from('photo_permissions')
    .select('photo_id')
    .eq('client_id', client.id)
    .eq('is_active', true)

  if (permError || !permissions || permissions.length === 0) return []

  const photoIds = permissions.map(p => p.photo_id)

  const { data: photos, error: photosError } = await supabase
    .from('photos')
    .select('gallery_id')
    .in('id', photoIds)
    .is('deleted_at', null)

  if (photosError || !photos) return []

  const galleryIds = [...new Set(photos.map(p => p.gallery_id))]

  const { data: galleries, error: galError } = await supabase
    .from('galleries')
    .select('*')
    .in('id', galleryIds)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (galError) throw galError
  return galleries as Gallery[]
}

export async function fetchClientPhotos(galleryId: string): Promise<(Photo & { can_download: boolean })[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single()

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('profile_id', profile?.id)
    .single()

  const { data: photos, error } = await supabase
    .from('photos')
    .select('*')
    .eq('gallery_id', galleryId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) throw error

  if (!client || !photos) return (photos || []).map(p => ({ ...p, can_download: false }))

  const { data: permData } = await supabase
    .from('photo_permissions')
    .select('photo_id')
    .eq('client_id', client.id)
    .eq('is_active', true)
    .in('photo_id', photos.map(p => p.id))

  const authorizedIds = new Set(permData?.map(p => p.photo_id) || [])

  return photos.map(p => ({
    ...p,
    can_download: authorizedIds.has(p.id),
  }))
}

export async function createClient(name: string, email: string, phone?: string | null) {
  const { data, error } = await supabase
    .from('clients')
    .insert({ name, email, phone: phone || null })
    .select()
    .single()
  if (error) throw error
  return data as Client
}

export async function updateClient(id: string, updates: { name?: string; email?: string; phone?: string | null }) {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Client
}

export async function activateClient(id: string, isActive: boolean) {
  const { error } = await supabase
    .from('clients')
    .update({ is_active: isActive })
    .eq('id', id)
  if (error) throw error
}

export async function generateAccessCode(clientId: string) {
  const session = await supabase.auth.getSession()
  const token = session.data.session?.access_token

  const res = await fetch(`${FUNCTIONS_BASE}/generate-access-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ clientId }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to generate access code')
  }

  return res.json() as Promise<{ code: string }>
}

export async function sendAccessEmail(email: string, code: string, clientName?: string) {
  const session = await supabase.auth.getSession()
  const token = session.data.session?.access_token

  const res = await fetch(`${FUNCTIONS_BASE}/send-access-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ email, code, clientName }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to send email')
  }

  return res.json() as Promise<{ sent: boolean }>
}

export interface AccessCode {
  id: string
  client_id: string
  code_hash: string
  is_active: boolean
  used_at: string | null
  expires_at: string | null
  created_at: string
}

export async function fetchClientAccessCodes(clientId: string) {
  const { data, error } = await supabase
    .from('access_codes')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as AccessCode[]
}

export interface ClientGalleryPermission {
  gallery_id: string
  gallery_name: string
  total_photos: number
  authorized_photos: number
}

export async function fetchClientGalleriesWithPermissions(clientId: string) {
  const { data: photos, error: photosError } = await supabase
    .from('photos')
    .select('id, gallery_id')
    .is('deleted_at', null)

  if (photosError) throw photosError
  if (!photos) return []

  const galleryIds = [...new Set(photos.map(p => p.gallery_id))]

  const { data: galleries, error: galError } = await supabase
    .from('galleries')
    .select('id, name')
    .in('id', galleryIds)
    .is('deleted_at', null)

  if (galError) throw galError
  if (!galleries) return []

  const galleryPhotoCounts = new Map<string, number>()
  const galleryPhotoIds = new Map<string, string[]>()
  for (const p of photos) {
    galleryPhotoCounts.set(p.gallery_id, (galleryPhotoCounts.get(p.gallery_id) || 0) + 1)
    if (!galleryPhotoIds.has(p.gallery_id)) galleryPhotoIds.set(p.gallery_id, [])
    galleryPhotoIds.get(p.gallery_id)!.push(p.id)
  }

  const allPhotoIds = photos.map(p => p.id)

  const { data: perms } = await supabase
    .from('photo_permissions')
    .select('photo_id')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .in('photo_id', allPhotoIds)

  const authorizedSet = new Set(perms?.map(p => p.photo_id) || [])

  const galleryPerms: ClientGalleryPermission[] = []
  for (const g of galleries) {
    const photoIdsForGallery = galleryPhotoIds.get(g.id) || []
    const authorized = photoIdsForGallery.filter(id => authorizedSet.has(id)).length
    galleryPerms.push({
      gallery_id: g.id,
      gallery_name: g.name,
      total_photos: galleryPhotoCounts.get(g.id) || 0,
      authorized_photos: authorized,
    })
  }

  return galleryPerms
}

export interface DownloadLogEntry {
  id: string
  photo_id: string
  client_id: string
  downloaded_at: string
}

export async function fetchClientDownloadLogs(clientId: string) {
  const { data, error } = await supabase
    .from('download_logs')
    .select('*')
    .eq('client_id', clientId)
    .order('downloaded_at', { ascending: false })
  if (error) throw error
  return data as DownloadLogEntry[]
}

export async function fetchGalleryPermissions(clientId: string, galleryId: string): Promise<Set<string>> {
  const { data: photos } = await supabase
    .from('photos')
    .select('id')
    .eq('gallery_id', galleryId)
    .is('deleted_at', null)

  if (!photos) return new Set()

  const photoIds = photos.map(p => p.id)

  const { data: perms } = await supabase
    .from('photo_permissions')
    .select('photo_id')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .in('photo_id', photoIds)

  return new Set(perms?.map(p => p.photo_id) || [])
}
