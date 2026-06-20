# Use Cases — Photography Client Portal MVP

## Actors

| Actor | Description |
|---|---|
| **Visitor** | Anonymous user browsing the public website |
| **Client** | Registered user who can view and download photos |
| **Photographer** | Owner/administrator of the system. Sole user with full access. |

---

## Visitor (Anonymous)

### UC-01 — Browse public website
Navigate landing, services, portfolio, about, and contact pages. No authentication required.

### UC-02 — Request a quote
Fill out and submit a quote request form (name, email, phone, business type, session type, event date, location, duration, budget, notes).

---

## Client (Authenticated)

### UC-03 — Activate account with access code
Enter a 6-digit access code received from the photographer. If valid, proceed to account creation.

### UC-04 — Log in
Authenticate with email/username and password after activation.

### UC-05 — View assigned galleries
See a list of galleries the photographer has shared with them.

### UC-06 — Preview photos in a gallery
View all photos in a gallery as watermarked previews. No permission check for previews — all gallery photos are visible.

### UC-07 — Download authorized photos
Download only the photos the photographer has explicitly granted permission for. Each download is logged.

### UC-08 — Edit profile
Update personal information (name, phone, etc.). Password cannot be changed.

---

## Photographer (Owner/Admin)

### UC-09 — Log in
Authenticate with email and password.

### UC-10 — Create a client
Register a new client in the system (name, email).

### UC-11 — Generate an access code
Generate a random 6-digit access code for a client. The code is stored hashed. The photographer can deactivate the code at any time.

### UC-12 — Send access code to client
Send the access code to the client via email. The system provides the code to the photographer for delivery.

### UC-13 — Deactivate client access code
Revoke a client's access code, preventing account activation or login.

### UC-14 — Create a gallery
Create a new gallery with a name and optional description.

### UC-15 — Upload photos to a gallery
Select original photos from the device. The browser generates watermarked previews (resized, optimized JPEG/WebP) and uploads both originals and previews to Cloudflare R2.

### UC-16 — Edit a gallery
Update gallery name, description, or reorder photos.

### UC-17 — Archive a gallery
Soft-delete a gallery. It becomes hidden from clients but data is preserved.

### UC-18 — Assign download permissions to a client
Select which specific photos a client can download from a gallery.

### UC-19 — Enable / disable client access
Activate or deactivate a client's ability to log in and view galleries. Does not delete data.

### UC-20 — Review download logs
View a log of which photos were downloaded, by which client, and when.

### UC-21 — View quote requests
See all incoming quote requests from visitors.

### UC-22 — Update quote request status
Mark a quote request as read or archived.
