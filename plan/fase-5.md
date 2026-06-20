Implement Phase 5 only.

Goal:
Allow clients to preview all photos while downloading only authorized photos.

Requirements:

Example:

Gallery contains 20 photos.

Client paid for 5.

Client can:

* View 20 previews (signed URLs)
* Download only 5 originals (signed URLs)

Implement:

* Permission assignment UI
* Download authorization Edge Function (validates permission, generates R2 signed URL)
* Signed URL generation via Supabase Edge Function (signs R2 URLs using S3 API)
* Download logging

Deliver:

* Full implementation
* Security review
* Abuse prevention analysis
