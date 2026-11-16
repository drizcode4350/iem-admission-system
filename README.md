# IEM Admission System — MEAN Stack POC

Team Fried Fish (P5) · PCCCS504 Software Engineering Lab

An online admission POC: **Angular** form → **Express** API (on **Node.js**) → **MongoDB** (via Mongoose).
Implements all four POC modules: Document Upload, Auth & RBAC, Status Workflow, Admin Dashboard.

## Layers

| Layer | Folder | Role |
|---|---|---|
| Presentation (A) | `client/` | Angular 17 SPA in the browser. Reactive forms, client-side validation for feedback only. Talks to the API via HTTP/JSON. |
| Application (E on N) | `server/src/` | Express routes + middleware running inside one Node.js process. JWT auth, role checks, validation, status rules, multer uploads. |
| Data (M) | MongoDB | `users`, `courses`, `applications` (documents & status history embedded). PDF bytes on disk in `server/uploads/`, only references in MongoDB. |

Request–response loop: Angular `http.post` → Express route → Mongoose query → MongoDB → JSON back → Angular updates the page.

## Prerequisites
- Node.js 18+ (20 recommended)
- MongoDB 6+ running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

## Run

```bash
# 1. API
cd server
cp .env.example .env        # edit MONGO_URI / JWT_SECRET
npm install
npm run seed                # creates courses + admin & director accounts
npm run dev                 # http://localhost:3000/api

# 2. Front end (new terminal)
cd client
npm install
npm start                   # http://localhost:4200
```

### Seeded accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@iem.edu.in | Admin@1234 |
| Director | director@iem.edu.in | Director@1234 |

Applicants register themselves at `/register` (public sign-up can only ever create applicants).

## Try it
1. Register as an applicant → fill the form → **Save draft** → drag a PDF into the upload zone.
2. **Review application** → **Confirm & submit** → you get a number like `IEM-2026-0001`; the record is locked.
3. Log in as admin → queue → **View** → move it Submitted → Under Review → Accepted/Rejected (only valid next states are offered, and the server rejects anything else).
4. Log back in as the applicant → **Status** shows the timeline and remarks.
5. Log in as director → read-only overview from the aggregation pipeline.

## API

| Method & path | Role | Purpose |
|---|---|---|
| POST /api/auth/register | Public | Create applicant |
| POST /api/auth/login | Public | Returns JWT + role |
| GET /api/auth/me | Any | Current user |
| GET /api/courses | Any | Open courses |
| GET /api/applications/mine | Applicant | Own application |
| POST /api/applications | Applicant | Create draft |
| PUT /api/applications/:id | Applicant | Update own draft |
| POST /api/applications/:id/documents | Applicant | Upload PDF (multer) |
| DELETE /api/applications/:id/documents/:docId | Applicant | Remove PDF from draft |
| POST /api/applications/:id/submit | Applicant | Validate, number, lock |
| GET /api/documents/:docId | Owner / Admin | Authenticated download |
| GET /api/admin/applications | Admin | Search / filter / paginate |
| GET /api/admin/applications/:id | Admin | Detail + allowed next states |
| PATCH /api/admin/applications/:id/status | Admin | Validated transition |
| GET /api/dashboard/summary | Admin, Director | Aggregation counts |

## Where each module lives
- **Document Upload** — `server/src/middleware/upload.js` (PDF MIME + extension, 5 MB, 5 files, random names), `routes/documents.js` (no public file URLs).
- **Auth & RBAC** — `middleware/auth.js` (`requireAuth`, `requireRole`), bcrypt hashing in `routes/auth.js`. Angular `role.guard.ts` is UX only.
- **Status Workflow** — `utils/status.js` transition table, enforced in `routes/admin.js`; every change appended to `statusHistory`.
- **Admin Dashboard** — `routes/dashboard.js` `$match` + `$group` (+ `$lookup`, `$facet`). SQL equivalent: `SELECT status, COUNT(*) ... GROUP BY status`.

## Verified behaviour (server tests run against a real MongoDB)
Registration ignores a `role: admin` field · submit without a PDF → 400 · `.txt` upload → 400 · submit → `IEM-2026-0001` · editing a locked record → 409 · applicant calling admin API → 403 · Submitted → Accepted skip → 400 · Submitted → Under Review → 200 · director changing status → 403 · summary returns counts by status/course.
