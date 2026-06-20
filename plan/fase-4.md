Implement Phase 4 only.

Goal:
Build gallery management and upload workflow.

Photographer can:

* Create gallery
* Edit gallery
* Archive gallery
* Upload photos

Upload workflow:

1. Photographer selects originals in the browser.
2. Frontend generates watermarked previews using canvas API (resize, watermark overlay, JPEG/WebP output).
3. Frontend uploads two files per photo to Cloudflare R2:
   * `originals/{gallery_id}/{photo_id}.jpg`
   * `previews/{gallery_id}/{photo_id}.jpg`
4. Metadata (filename, size, dimensions, gallery_id) is saved to Supabase `photos` table.
5. Loading states and progress indicators shown during upload.

Requirements:

* Gallery CRUD
* Dual-upload workflow (original + preview)
* Photo management (reorder, delete)
* Pagination
* Search

Storage (Cloudflare R2):

* `originals` — private bucket
* `previews` — private bucket (signed URLs only)

Deliver:

* Database updates
* Cloudflare R2 integration
* Browser-based preview generation
* Admin UI
* Documentation
