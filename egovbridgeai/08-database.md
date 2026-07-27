# Phase 8 — Database Design

> Already implemented — see `supabase/migrations/0001_create_users.sql`,
> `0002_create_reports.sql`, and `0003_create_ai_history.sql`, built ahead of
> schedule in Phases 2, 4, and 6 since each needed a table to write to.
> `ai_history` also picked up a `kind` column in `0004_add_kind_to_ai_history.sql`
> (Phase 7) to separate chat history from summarizer history — not in the
> original spec above, but required once both features shared the table.

## users

| Column | Type |
|---------|------|
| id | uuid |
| email | text |
| phone | text |
| full_name | text |
| created_at | timestamp |

---

## reports

| Column | Type |
|---------|------|
| id | uuid |
| user_id | uuid |
| report_api_id | text |
| category | text |
| title | text |
| description | text |
| status | text |
| created_at | timestamp |

---

## ai_history

| Column | Type |
|---------|------|
| id | uuid |
| user_id | uuid |
| prompt | text |
| response | text |
| created_at | timestamp |
