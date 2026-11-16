# Design write-up — IEM Admission MEAN POC

## Choices made
- **Three layers kept from the HLD.** Angular (presentation), Express on Node (application), MongoDB (data). Angular never touches the database; it only speaks HTTP/JSON.
- **Server is the source of truth.** Every field is validated twice: Angular reactive-form validators for instant feedback, and `utils/validate.js` on the server, which returns field-level errors the form displays inline.
- **RBAC on the server.** JWT carries user id + role; `requireAuth` + `requireRole` guard every protected router. Applicant queries are always filtered by `applicantId = req.user.id`, so another user's record returns 404. Public registration hard-codes `role: 'applicant'`; staff accounts come only from `npm run seed`.
- **Files outside the database.** Multer writes PDFs to disk with random hex names; MongoDB stores only name, key, size, MIME and date. Downloads go through an authenticated route that checks owner/admin, so no guessable public URL exists.
- **Status is a state machine, not a field.** A transition table defines allowed moves; the PATCH route rejects anything else (including skips and leaving a final state) and appends a history entry with admin id, time and remarks.
- **Locking.** Submit validates the full record, requires at least one PDF, generates `IEM-YYYY-NNNN`, sets `locked = true`. All edit/upload routes reject locked records with 409.
- **Aggregation, not loops.** The dashboard uses one `$facet` pipeline (`$match` out drafts, `$group` by status / course / department+status, `$lookup` course names) so counting happens inside MongoDB.
- **Embedded sub-documents** for documents and status history: they are always read with their application, so one query serves the detail and status pages.

## What we would improve (Phase 2)
- Email verification, notifications on status change.
- Eligibility check and merit list (rank order, 12th % tie-break) with admin-configurable cutoffs.
- Payment gateway with server-side callback verification.
- Move uploads to cloud storage with signed URLs; virus scanning.
- Refresh tokens / httpOnly cookies instead of localStorage; rate limiting on login.
- Atomic application-number counter collection to avoid races under concurrency.
- Automated test suite (Jest + Supertest, Angular unit tests) in CI, and HTTPS deployment.
