# Phase 2 — Authentication

## Objective

Allow users to securely log in using OTP verification via the eMessage API.

### Pages

```
/
```

```
/login
```

### Features

- [x] Enter Mobile Number (see note below — email dropped, eMessage only supports SMS)
- [x] Send OTP
- [x] Verify OTP
- [x] Create user record in Supabase
- [x] Save authenticated session
- [x] Redirect to Dashboard

### APIs

- eMessage API

### Components

- Input
- Button
- Card
- Toast

### Note

The eMessage docs only expose a `POST /messaging/v1/sms/push` endpoint — SMS
only, no email delivery. The login field was changed from "Email or Mobile
Number" to mobile-number-only (E.164 format) since there's no email channel
to send an OTP through. `email` stays as an optional column on `users` for
later profile use.
