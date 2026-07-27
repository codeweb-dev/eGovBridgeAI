# Phase 7 — Government Document Summarizer

## Objective

Summarize government documents using AI.

### Route

```
/dashboard/summarize
```

### Features

- [x] Paste document
- [x] Click Summarize
- [x] Display summary
- [x] Save summary history

### API

- eGov AI API

### Components

- Textarea
- Button
- Card

### Note

The eGov AI docs have no dedicated "summarize" endpoint — this reuses the
same `ai_assistant/generate` call from Phase 6 with a summarization prompt
wrapped around the pasted text. Summary history is saved to the same
`ai_history` table as the chat assistant, distinguished by a new `kind`
column (`'assistant'` vs `'summarizer'`) so the two histories don't mix on
either page.
