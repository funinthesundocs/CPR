---
description: Send an email via the AgentMail API using the visupport@agentmail.to inbox
---

# AgentMail Email Sender

## Configuration

| Field         | Value                                                                 |
|---------------|-----------------------------------------------------------------------|
| Inbox         | visupport@agentmail.to                                                |
| API Endpoint  | https://api.agentmail.to/inboxes/visupport@agentmail.to/messages/send |
| Auth          | Bearer token (API key)                                                |
| API Key       | am_us_e8dbc7465f1b28cdb6e63866abdf44b4245a8a834b40556aee8de931cbc7e24e |

## Steps

1. Construct the JSON payload with `to`, `subject`, and `text` (and optionally `html`) fields.

// turbo
2. Send the email via curl:

```powershell
curl -X POST https://api.agentmail.to/inboxes/visupport@agentmail.to/messages/send `
  -H "Authorization: Bearer am_us_e8dbc7465f1b28cdb6e63866abdf44b4245a8a834b40556aee8de931cbc7e24e" `
  -H "Content-Type: application/json" `
  -d '{
    "to": "<RECIPIENT_EMAIL>",
    "subject": "<SUBJECT>",
    "text": "<PLAIN_TEXT_BODY>"
  }'
```

Replace `<RECIPIENT_EMAIL>`, `<SUBJECT>`, and `<PLAIN_TEXT_BODY>` with actual values before running.

> Optionally include an `"html"` field alongside `"text"` for rich HTML emails.

3. Confirm the response returns a `200 OK` or relevant success status.

## Notes

- The `from` address is always `visupport@agentmail.to` (set by the inbox).
- No password is required — authentication is entirely API-key based.
- For HTML emails, pass both `"text"` (fallback) and `"html"` fields.
