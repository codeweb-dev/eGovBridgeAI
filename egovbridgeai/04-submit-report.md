# Phase 4 — Submit Government Report

## Objective

Allow users to submit reports using the eReport API.

### Route

```
/dashboard/report/new
```

### Features

- [x] Select Report Category
- [x] Enter Report Title
- [x] Enter Description
- [x] Submit Report
- [x] Save metadata to Supabase
- [x] Show success notification

### API

- eReport API

### Components

- Form
- Select
- Textarea
- Button
- Toast

### Note

The real eReport `submit_complaint` endpoint requires more than category/title/
description: complainant name, gender, email, mobile, and a full region →
province → municipality → barangay location (all required fields, per the
API docs). The form collects those too — mobile is taken from the logged-in
user automatically, and name/email prefill from their profile if already on
file and get saved back to `users` on submit. Attachments (`evidences`) are
skipped — that's the "Report Attachments" future enhancement.
