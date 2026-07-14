import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchGalleries, fetchGallery, createGallery, updateGallery, archiveGallery,
  fetchPhotos, deletePhoto, fetchClients,
  fetchClientGalleries, fetchClientPhotos,
  updateClient, activateClient, generateAccessCode, sendAccessEmail,
  fetchClientAccessCodes, fetchClientDownloadLogs,
  type Gallery, type Photo, type Client, type AccessCode,
  type DownloadLogEntry,
} from '../lib/api'

export function useGalleries() {
  return useQuery<Gallery[]>({
    queryKey: ['galleries'],
    queryFn: fetchGalleries,
  })
}

export function useGallery(id: string) {
  return useQuery<Gallery>({
    queryKey: ['gallery', id],
    queryFn: () => fetchGallery(id),
    enabled: !!id,
  })
}

export function useCreateGallery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, description, clientId, downloadLimit }: { name: string; description?: string; clientId?: string | null; downloadLimit?: number }) =>
      createGallery(name, description, clientId, downloadLimit),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['galleries'] }),
  })
}

export function useUpdateGallery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; name?: string; description?: string | null; client_id?: string | null; download_limit?: number }) =>
      updateGallery(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['galleries'] })
      qc.invalidateQueries({ queryKey: ['gallery'] })
    },
  })
}

export function useArchiveGallery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => archiveGallery(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['galleries'] }),
  })
}

export function usePhotos(galleryId: string) {
  return useQuery<Photo[]>({
    queryKey: ['photos', galleryId],
    queryFn: () => fetchPhotos(galleryId),
    enabled: !!galleryId,
  })
}

export function useDeletePhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ photoId }: { photoId: string; galleryId: string }) => deletePhoto(photoId),
    onSuccess: (_data, variables) => qc.invalidateQueries({ queryKey: ['photos', variables.galleryId] }),
  })
}

export function useClients() {
  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: fetchClients,
  })
}

export function useClientGalleries() {
  return useQuery<Gallery[]>({
    queryKey: ['client-galleries'],
    queryFn: fetchClientGalleries,
  })
}

export function useClientPhotos(galleryId: string) {
  return useQuery<(Photo & { can_download: boolean })[]>({
    queryKey: ['client-photos', galleryId],
    queryFn: () => fetchClientPhotos(galleryId),
    enabled: !!galleryId,
  })
}

export function useUpdateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; name?: string; email?: string; phone?: string | null }) =>
      updateClient(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}

export function useActivateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => activateClient(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}

export function useGenerateAccessCode(clientId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => generateAccessCode(id),
    onSuccess: () => {
      if (clientId) qc.invalidateQueries({ queryKey: ['access-codes', clientId] })
    },
  })
}

export function useSendAccessEmail() {
  return useMutation({
    mutationFn: ({ email, code, clientName }: { email: string; code: string; clientName?: string }) =>
      sendAccessEmail(email, code, clientName),
  })
}

export function useClientAccessCodes(clientId: string) {
  return useQuery<AccessCode[]>({
    queryKey: ['access-codes', clientId],
    queryFn: () => fetchClientAccessCodes(clientId),
    enabled: !!clientId,
  })
}

export function useClientDownloadLogs(clientId: string) {
  return useQuery<DownloadLogEntry[]>({
    queryKey: ['download-logs', clientId],
    queryFn: () => fetchClientDownloadLogs(clientId),
    enabled: !!clientId,
  })
}
