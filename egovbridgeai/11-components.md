# Phase 11 — shadcn/ui Components

> All 16 accounted for. Card/Button/Input/Textarea/Select/Table/Badge/
> Avatar/Dialog/Separator/ScrollArea/Skeleton/Sonner were already installed
> in earlier phases as each feature needed them. Alert and Dropdown Menu are
> now installed too (no new dependencies — both build on the same
> `@base-ui/react` package already in use), though nothing consumes them yet.
> "Form" isn't a separate installable piece in this project's shadcn style
> (`base-nova`, built on `@base-ui/react` rather than react-hook-form + zod)
> — running `shadcn add form` created no file and added no dependency. Every
> form built so far (login, submit-report, chat, summarizer) already uses
> plain `<form>` + `useState` + `Label`, which is this toolkit's native
> pattern, so there's nothing to change.

- Card
- Button
- Input
- Textarea
- Select
- Form
- Table
- Badge
- Avatar
- Alert
- Dialog
- Dropdown Menu
- Separator
- ScrollArea
- Skeleton
- Toast (Sonner)
