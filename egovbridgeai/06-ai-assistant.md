# Phase 6 — AI Assistant

## Objective

Allow users to ask government-related questions.

### Route

```
/dashboard/assistant
```

### Features

- [x] Chat interface
- [x] Send prompts
- [x] Receive AI responses
- [x] Save chat history

### API

- eGov AI API

### Components

- ScrollArea
- Input
- Button
- Card

### Note

The eGov AI docs exposed several endpoints beyond chat (speech maker, tourism,
laws & regulations, translator, document extractor) — only `ai_assistant/generate`
is wired up here since that's what this phase asks for. `category` is hardcoded
to `"PH"` (every example in the docs scopes to the Philippines; no other
locale was given). The other generators are there if a later phase wants them.
