# Phase 12 — Complete User Flow

> This is the whole app (Phases 1–9) chained together — nothing new to
> build, just verifying the wiring matches the diagram. One gap found and
> fixed: submitting a report redirected to `/dashboard` instead of
> `/dashboard/reports` ("My Reports") as this diagram specifies —
> `report-form.tsx` now redirects there. Every other step (Landing → Login →
> Send/Verify OTP → Dashboard → Submit Report/AI Assistant →
> eReport/eGov AI → Save Report/Save Chat History) already matched. Route
> guards confirmed live: `/`, `/login` render; every `/dashboard/*` route
> redirects (307) when unauthenticated.

```text
Landing Page
      │
      ▼
Login
      │
      ▼
Send OTP
      │
      ▼
Verify OTP
      │
      ▼
Dashboard
      │
      ├──────────────┐
      │              │
      ▼              ▼
Submit Report     AI Assistant
      │              │
      ▼              ▼
eReport API      eGov AI API
      │              │
      ▼              ▼
Save Report      Save Chat History
      │
      ▼
My Reports
```
