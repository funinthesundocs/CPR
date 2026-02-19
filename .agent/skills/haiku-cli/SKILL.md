---
name: haiku-cli
description: Set up Claude Haiku 4.5 as a callable CLI tool so agents and humans can dispatch it from any workspace without consuming Antigravity Ultra plan tokens. Use when the user wants a fast, cheap Anthropic model for agent dispatch that is isolated from their primary plan.
---

# Claude Haiku 4.5 CLI Setup

> **New workspace?** Follow [## First-Time Setup](#first-time-setup) at the bottom to create the script and add the API key, then return here.

## Run It

**As a human (PowerShell):**
```powershell
node scripts/haiku-cli.js "Your prompt here"
node scripts/haiku-cli.js "Your prompt here" --verbose
```

**As an AI agent (via run_command):**
```powershell
node scripts/haiku-cli.js "Your prompt here"
```

Route to this for fast Anthropic-quality responses on cost-sensitive or high-frequency subtasks.

---

## Dependencies (install once)

No npm packages required. Uses Node.js native `https` module only.

**System requirements:**
- Node.js v16+
- `.env.local` in the project root containing:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

> The user's Antigravity Ultra plan provides Sonnet/Opus tokens through Antigravity's own infrastructure. The `ANTHROPIC_API_KEY` stored in `.env.local` is ONLY used by this script — it will never be called by the main agent interface. The two pipelines are completely separate. Do not confuse them.

---

## Credentials

| Field | Value |
|-------|-------|
| API Endpoint | `https://api.anthropic.com/v1/messages` |
| Model | `claude-haiku-4-5` |
| Auth Header | `x-api-key: <ANTHROPIC_API_KEY>` |
| API Version Header | `anthropic-version: 2023-06-01` |
| Key format | `sk-ant-...` |

> The actual deployed model version confirmed live: `claude-haiku-4-5-20251001`. Anthropic resolves the alias automatically — always use `claude-haiku-4-5` (the alias), not the dated version string.

---

## Critical Rules (do not deviate)

- **Model ID is `claude-haiku-4-5` — NOT `claude-3-5-haiku-20241022`**  
  The first attempt used `claude-3-5-haiku-20241022` and got a `404 not_found_error`. Anthropic deprecated this ID. The correct current alias is `claude-haiku-4-5`. If you see 404 on model, this is the cause.

- **Anthropic Messages API is NOT the same as OpenAI Chat Completions**  
  Do not use the OpenAI response path (`choices[0].message.content`). Anthropic returns `content` as an **array of typed blocks**: `[{ type: "text", text: "..." }, ...]`. You must filter for `type === "text"` and map `.text`. Using the OpenAI path silently returns `undefined`.

- **Auth header is `x-api-key` — NOT `Authorization: Bearer ...`**  
  Minimax and OpenAI-compatible APIs use `Authorization: Bearer`. Anthropic uses a different header name: `x-api-key`. This header is required alongside `anthropic-version`.

- **Always send `anthropic-version: 2023-06-01`**  
  Anthropic requires this header on every request. Omitting it returns a 400 error.

- **This key is for Haiku ONLY — never use it for Sonnet or Opus**  
  The user pays for Antigravity Ultra which provides Sonnet/Opus via Antigravity's infrastructure. This API key is a separate personal key the user provided exclusively for Haiku CLI use. Never hardcode a different Anthropic model into this script.

- **Use Node.js native `https` module — do not add `axios` or `node-fetch`**  
  No external dependencies. Every extra package is an install step and a failure point.

- **Auto-load the API key from `.env.local` — do not require shell exports**  
  The script reads `.env.local` line-by-line at startup. Agents and humans can run it in any terminal without per-session setup.

- **Windows machine — all paths use Windows format**  
  Use `path.join(__dirname, '..', '.env.local')` — never Linux/WSL paths like `/mnt/c/...`.

- **`--verbose` outputs model name and token counts to stderr**  
  In verbose mode, the metadata line (`[Model: ... | Input: ... | Output: ...]`) goes to `stderr` and the response goes to `stdout`. This keeps stdout clean for piping while still surfacing debug info.

---

## Error Table

| Error | Cause | Fix |
|-------|-------|-----|
| `404 not_found_error: model: claude-3-5-haiku-20241022` | Deprecated model ID | Use `claude-haiku-4-5` |
| `401 authentication_error` | Wrong auth header name | Use `x-api-key`, not `Authorization: Bearer` |
| `400 bad_request` | Missing `anthropic-version` header | Add `anthropic-version: 2023-06-01` to headers |
| Response is `undefined` / empty | Using OpenAI response path `choices[0]` | Use Anthropic path: `data.content.filter(b => b.type === 'text').map(b => b.text).join('\n')` |
| `ANTHROPIC_API_KEY is not set` | `.env.local` missing or key not present | Create/edit `.env.local` in project root with `ANTHROPIC_API_KEY=sk-ant-...` |
| Sonnet/Opus tokens consumed from personal key | Wrong model in script | Verify `const MODEL = 'claude-haiku-4-5'` — never change this |

## Success Criteria

- [OK] `node scripts/haiku-cli.js "What model are you? One sentence."` returns a clean text response
- [OK] `--verbose` prints `[Model: claude-haiku-4-5-20251001 | Input: X | Output: Y tokens]` to stderr
- [OK] API key loads automatically from `.env.local` — no shell setup needed
- [OK] Non-zero exit code on all error conditions
- [OK] No Anthropic tokens consumed from the Antigravity Ultra plan (verify by checking: the response comes from `api.anthropic.com` via this script, not via Antigravity's model routing)

## Performance Baseline (normal = healthy)

| Phase | Expected | Investigate if |
|-------|----------|----------------|
| API call (simple prompt) | 2-5s | >15s (network or cold start) |
| Total response | 3-6s | >20s (request stuck) |
| Input tokens (typical prompt) | 20-50 | N/A |
| Output tokens (typical response) | 15-100 | N/A |
| Cost per run (typical) | ~$0.003-0.010 | N/A |

Haiku 4.5 is Anthropic's fastest small model. It does NOT have a reasoning/thinking phase — responses are direct, with no `<think>` tags to strip.

---

## First-Time Setup

Create this one file. No npm install required.

### `scripts/haiku-cli.js`

```javascript
#!/usr/bin/env node
/**
 * Claude Haiku 4.5 CLI
 *
 * IMPORTANT: This script is hardcoded to claude-haiku-4-5 ONLY.
 * It will NEVER call Sonnet, Opus, or any other Anthropic model.
 * The ANTHROPIC_API_KEY in .env.local is for Haiku use only.
 *
 * Usage:
 *   node scripts/haiku-cli.js "<prompt>" [--verbose]
 *
 * Examples:
 *   node scripts/haiku-cli.js "Summarize this function"
 *   node scripts/haiku-cli.js "Debug this logic" --verbose
 *
 * Environment:
 *   ANTHROPIC_API_KEY  - Required. Stored in .env.local as ANTHROPIC_API_KEY=sk-ant-...
 *
 * IMPORTANT FACTS (learned from real integration failures):
 *   - Model:   claude-haiku-4-5  (NOT claude-3-5-haiku-20241022 — that ID returns 404)
 *   - Auth:    x-api-key header  (NOT Authorization: Bearer — that's OpenAI format)
 *   - Version: anthropic-version: 2023-06-01 header is required
 *   - Format:  response is data.content[] array of blocks, NOT data.choices[0].message.content
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ── Hardcoded model — DO NOT CHANGE ──────────────────────────────────────────
const MODEL = 'claude-haiku-4-5';
const ENDPOINT_HOSTNAME = 'api.anthropic.com';
const ENDPOINT_PATH = '/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MAX_TOKENS = 4096;

// ── Auto-load .env.local ──────────────────────────────────────────────────────
if (!process.env.ANTHROPIC_API_KEY) {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
        const lines = fs.readFileSync(envPath, 'utf8').split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('ANTHROPIC_API_KEY=')) {
                process.env.ANTHROPIC_API_KEY = trimmed.slice('ANTHROPIC_API_KEY='.length).trim();
                break;
            }
        }
    }
}

// ── Parse args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.error('Usage: node scripts/haiku-cli.js "<prompt>" [--verbose]');
    console.error(`Model: ${MODEL} (fixed)`);
    process.exit(1);
}

const verbose = args.includes('--verbose');
const prompt = args.filter(a => a !== '--verbose')[0];

// ── Validate API key ──────────────────────────────────────────────────────────
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY is not set.');
    console.error('Add it to .env.local as: ANTHROPIC_API_KEY=sk-ant-...');
    process.exit(1);
}

// ── Build request ─────────────────────────────────────────────────────────────
const body = JSON.stringify({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: 'You are a helpful AI assistant.',
    messages: [
        { role: 'user', content: prompt },
    ],
});

const options = {
    hostname: ENDPOINT_HOSTNAME,
    path: ENDPOINT_PATH,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'Content-Length': Buffer.byteLength(body),
    },
};

// ── Execute request ───────────────────────────────────────────────────────────
const req = https.request(options, (res) => {
    const chunks = [];

    res.on('data', chunk => chunks.push(chunk));

    res.on('end', () => {
        const raw = Buffer.concat(chunks).toString();

        if (res.statusCode < 200 || res.statusCode >= 300) {
            console.error(`Anthropic API error ${res.statusCode}:`);
            try {
                console.error(JSON.stringify(JSON.parse(raw), null, 2));
            } catch {
                console.error(raw);
            }
            process.exit(1);
        }

        let data;
        try {
            data = JSON.parse(raw);
        } catch {
            console.error('Failed to parse response:', raw);
            process.exit(1);
        }

        // Anthropic Messages API returns content as an array of typed blocks.
        // This is NOT the same as OpenAI's choices[0].message.content.
        const content = data?.content
            ?.filter(b => b.type === 'text')
            ?.map(b => b.text)
            ?.join('\n') ?? '';

        if (verbose) {
            // Metadata to stderr keeps stdout clean for piping
            console.error(`[Model: ${data.model} | Input: ${data.usage?.input_tokens} | Output: ${data.usage?.output_tokens} tokens]`);
            console.log(content);
        } else {
            console.log(content);
        }
    });
});

req.on('error', (err) => {
    console.error('Request failed:', err.message);
    process.exit(1);
});

req.write(body);
req.end();
```

### `.env.local` entry to add

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Add this line to the existing `.env.local` in the project root. Do not overwrite other keys (e.g. `MINIMAX_API_KEY`, Supabase keys, etc.).

---

## Token Isolation Guarantee

This is the most important thing to communicate to the user before asking for their key:

```
You ↔ Antigravity UI
        └── Antigravity routes to Sonnet/Opus via YOUR PLAN (Ultra allocation)
            — Antigravity does NOT read .env.local

You (or agent via run_command) → node scripts/haiku-cli.js "..."
        └── script reads ANTHROPIC_API_KEY from .env.local
        └── calls api.anthropic.com directly → Haiku ONLY
```

The script is hardcoded to `claude-haiku-4-5`. There is no code path that calls any other model.

---

## Agent Dispatch Examples

```javascript
// One-shot question
run_command("node scripts/haiku-cli.js \"Is this valid JSON?\"")

// Code review
run_command("node scripts/haiku-cli.js \"Review this for obvious bugs: ...\"")

// Verbose (shows token count + model version)
run_command("node scripts/haiku-cli.js \"Summarize this\" --verbose")
```

The agent receives Haiku's response as stdout and can relay it or use it to drive next steps.
