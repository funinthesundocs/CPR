---
name: agentmail
description: Send emails via the AgentMail API from any agent or workflow. Supports plain text and HTML emails. Use when any task requires sending a notification, report, confirmation, or alert email from the visupport@agentmail.to inbox.
---

# AgentMail — Email Sending Skill

> Send emails programmatically using the AgentMail API. Works on Windows (PowerShell) and any OS.

## Configuration

| Field | Value |
|-------|-------|
| Inbox | visupport@agentmail.to |
| API Endpoint | https://api.agentmail.to/inboxes/visupport@agentmail.to/messages/send |
| API Key | am_us_e8dbc7465f1b28cdb6e63866abdf44b4245a8a834b40556aee8de931cbc7e24e |
| From address | visupport@agentmail.to (fixed by inbox — cannot be changed) |

---

## How to Send an Email

### Windows (PowerShell) — ALWAYS use this on Windows

```powershell
Invoke-RestMethod -Method POST `
  -Uri "https://api.agentmail.to/inboxes/visupport@agentmail.to/messages/send" `
  -Headers @{
    "Authorization" = "Bearer am_us_e8dbc7465f1b28cdb6e63866abdf44b4245a8a834b40556aee8de931cbc7e24e"
    "Content-Type"  = "application/json"
  } `
  -Body '{"to": "RECIPIENT@EMAIL.COM", "subject": "SUBJECT HERE", "text": "BODY HERE"}'
```

### Linux / macOS (curl)

```bash
curl -X POST https://api.agentmail.to/inboxes/visupport@agentmail.to/messages/send \
  -H "Authorization: Bearer am_us_e8dbc7465f1b28cdb6e63866abdf44b4245a8a834b40556aee8de931cbc7e24e" \
  -H "Content-Type: application/json" \
  -d '{"to": "RECIPIENT@EMAIL.COM", "subject": "SUBJECT HERE", "text": "BODY HERE"}'
```

### With HTML body (either OS)

Add an `"html"` field alongside `"text"`. Always include both — `"text"` is the fallback for email clients that don't render HTML:

```json
{
  "to": "RECIPIENT@EMAIL.COM",
  "subject": "SUBJECT HERE",
  "text": "Plain text fallback body.",
  "html": "<h1>Rich HTML body</h1><p>Content here.</p>"
}
```

---

## Send Process

1. **Identify the recipient, subject, and body** from the task context
2. **Choose the correct command** for the current OS (Windows = `Invoke-RestMethod`, others = `curl`)
3. **Construct the JSON payload** — always include both `to`, `subject`, and `text` at minimum
4. **Execute the command**
5. **Verify success** — a successful response returns a `message_id` and `thread_id`. If you see those fields, the email was delivered.

---

## Critical Rules

- **Never use `curl` syntax on Windows PowerShell** — PowerShell aliases `curl` to `Invoke-WebRequest`, which has completely different parameter syntax and will fail with a header binding error. Use `Invoke-RestMethod` instead.
- **Always include a `text` field** even when sending HTML — it is the plain-text fallback and required by most email clients.
- **The `from` address cannot be changed** — all emails send from `visupport@agentmail.to`.
- **No newline escape sequences in PowerShell body strings** — use actual line breaks or `\n` only in JSON; PowerShell won't interpolate `\n` inside single-quoted strings.

---

## Error Table

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot bind parameter 'Headers'` | Using `curl` on Windows PowerShell | Switch to `Invoke-RestMethod` with `-Headers @{...}` syntax |
| `401 Unauthorized` | Wrong or missing API key | Verify the Bearer token matches the key in Configuration above |
| `400 Bad Request` | Missing required field (`to`, `subject`, or `text`) | Ensure all three fields are present in the JSON body |
| No `message_id` in response | Silent failure or wrong endpoint | Check the URI matches exactly — inbox address must be in the path |

---

## Success Criteria

- [OK] Command executed without errors
- [OK] Response contains `message_id` and `thread_id`
- [OK] Correct OS command used (PowerShell vs curl)
- [OK] Both `text` and `html` fields included if sending rich email

---

## First-Time Verification

To confirm the API connection is live in a new workspace, send a test email to yourself:

```powershell
Invoke-RestMethod -Method POST `
  -Uri "https://api.agentmail.to/inboxes/visupport@agentmail.to/messages/send" `
  -Headers @{
    "Authorization" = "Bearer am_us_e8dbc7465f1b28cdb6e63866abdf44b4245a8a834b40556aee8de931cbc7e24e"
    "Content-Type"  = "application/json"
  } `
  -Body '{"to": "visupport@agentmail.to", "subject": "AgentMail Connectivity Test", "text": "Connection confirmed."}'
```

A `message_id` in the response confirms the API is working.
