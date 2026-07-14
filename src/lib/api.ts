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
  client_id: string | null
  download_limit: number
  download_count: number
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

export async function createGallery(name: string, description?: string, clientId?: string | null, downloadLimit?: number) {
  const { data, error } = await supabase
    .from('galleries')
    .insert({
      name,
      description: description || null,
      client_id: clientId || null,
      download_limit: downloadLimit ?? 0,
    })
    .select()
    .single()
  if (error) throw error
  return data as Gallery
}

export async function updateGallery(
  id: string,
  updates: {
    name?: string
    description?: string | null
    client_id?: string | null
    download_limit?: number
  },
) {
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

const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_URL + '/functions/v1'

export async function fetchClientGalleries(): Promise<Gallery[]> {
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

  const { data: galleries, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('client_id', client.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
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

  let galleryInfo: { download_limit: number; download_count: number } | null = null
  if (client) {
    const { data: g } = await supabase
      .from('galleries')
      .select('download_limit, download_count')
      .eq('id', galleryId)
      .single()
    galleryInfo = g
  }

  const canDownload = galleryInfo
    ? galleryInfo.download_limit === 0 || galleryInfo.download_count < galleryInfo.download_limit
    : false

  const { data: photos, error } = await supabase
    .from('photos')
    .select('*')
    .eq('gallery_id', galleryId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) throw error

  return (photos || []).map(p => ({ ...p, can_download: canDownload }))
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
