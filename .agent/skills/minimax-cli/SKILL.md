---
name: minimax-cli
description: Set up Minimax M2.5 as a callable CLI tool so agents and humans can dispatch it from any workspace. Use when the user wants to integrate Minimax M2.5 as an agent-dispatchable model via the command line.
---

# Minimax M2.5 CLI Setup

> **New workspace?** Follow [## First-Time Setup](#first-time-setup) at the bottom to create the script and add the API key, then return here.

## Run It

**As a human (PowerShell):**
```powershell
node scripts/minimax-cli.js "Your prompt here"
node scripts/minimax-cli.js "Your prompt here" --verbose
```

**As an AI agent (via run_command):**
```powershell
node scripts/minimax-cli.js "Your prompt here"
```
Route to this when the user says "use Minimax" or when you want to offload a cost-sensitive subtask.

---

## Dependencies (install once)

No npm packages required. Uses Node.js native `https` module only.

**System requirements:**
- Node.js (any modern version — v16+)
- `.env.local` in the project root containing:

```
MINIMAX_API_KEY=sk-cp-your-key-here
```

> The `sk-cp-` prefix indicates a **Coding Plan key**. This key is restricted to text models only — that is exactly what we need. Do not attempt to use it for image, video, or speech endpoints.

---

## Credentials

| Field | Value |
|-------|-------|
| API Endpoint | `https://api.minimax.io/v1/chat/completions` |
| Model | `MiniMax-M2.5` |
| Auth Header | `Authorization: Bearer <MINIMAX_API_KEY>` |
| Key format | `sk-cp-...` (Coding Plan key — text models only) |

> Credentials (the actual API key) belong in `.env.local`. The script auto-loads them — no export or shell setup required.

---

## Critical Rules (do not deviate)

- **Endpoint is `api.minimax.io` — not `api.minimaxi.chat`**  
  The international endpoint (`minimaxi.chat`) is a different domain that returns auth errors for Coding Plan keys. Previous agents wasted hours on this. Always use `api.minimax.io`.

- **Model name is `MiniMax-M2.5` — case-sensitive, with capital M**  
  Previous failed attempts used `abab6.5`, `abab6.5-chat`, `abab6.5s`. Those are old model names from a legacy endpoint. The correct current name is exactly `MiniMax-M2.5`.

- **Use Node.js native `https` module — do not add `axios` or `node-fetch`**  
  The project may have no external HTTP dependencies. Adding `axios` or `node-fetch` introduces install steps and version risk. The native `https` module handles everything.

- **Strip `<think>` tags from output by default**  
  Minimax M2.5 is a reasoning model. It emits `<think>...</think>` blocks containing its internal reasoning before the answer. These must be stripped for clean CLI output. Expose a `--verbose` flag to show them when needed.

- **Auto-load the API key from `.env.local` — do not require shell exports**  
  The script reads `.env.local` line-by-line at startup. This means agents and humans can run it immediately in any terminal without any per-session setup.

- **Windows machine — all paths use Windows format**  
  Use `path.join(__dirname, '..', '.env.local')` — never Linux/WSL paths like `/mnt/c/...`.

- **Exit with code 1 on all errors**  
  Agent dispatch via `run_command` needs reliable exit codes. A non-zero exit signals failure. Always `process.exit(1)` on API errors, missing keys, and parse failures.

---

## Error Table

| Error | Cause | Fix |
|-------|-------|-----|
| `401 Unauthorized` | Wrong endpoint domain | Use `api.minimax.io`, not `api.minimaxi.chat` |
| `404 Not Found` on model | Wrong model name | Use exactly `MiniMax-M2.5` (capital M, capital M, dash, M, 2, .5) |
| `400 Bad Request` | Key type mismatch | `sk-cp-` keys only work on text models — confirm you're not using an image endpoint |
| `MINIMAX_API_KEY is not set` | `.env.local` not found or key not in file | Create `.env.local` in project root with `MINIMAX_API_KEY=sk-cp-...` |
| Raw `<think>` in output | `--verbose` flag included (intentional) | Normal — remove `--verbose` for clean output |
| Empty response / `undefined` | Wrong response path (`content` vs `choices`) | Minimax uses OpenAI format: `choices[0].message.content` |
| Request timeout | Network issue or model cold start | Retry once; baseline API call is 3-8s |

## Success Criteria

- [OK] Script runs with `node scripts/minimax-cli.js "test prompt"` from project root
- [OK] Returns clean text response with no `<think>` tags
- [OK] `--verbose` flag shows `<think>` block + response
- [OK] API key loads automatically from `.env.local` — no shell setup needed
- [OK] Non-zero exit code on all error conditions

## Performance Baseline (normal = healthy)

| Phase | Expected | Investigate if |
|-------|----------|----------------|
| API call (first token) | 3-8s | >20s (model cold start or network issue) |
| Total response (simple prompt) | 5-15s | >30s (stuck or timeout) |
| Cost per run (typical prompt) | ~$0.0005-0.001 | N/A — no cost threshold |

MiniMax-M2.5 is a reasoning model. It thinks before answering, which adds latency. This is normal. A simple "what is 2+2?" takes ~5s because the model still runs a reasoning pass.

---

## First-Time Setup

Create this one file. No npm install required.

### `scripts/minimax-cli.js`

```javascript
#!/usr/bin/env node
/**
 * Minimax M2.5 CLI
 *
 * Usage:
 *   node scripts/minimax-cli.js "<prompt>" [--verbose]
 *
 * Examples:
 *   node scripts/minimax-cli.js "Summarize this in one sentence"
 *   node scripts/minimax-cli.js "Explain this code" --verbose
 *
 * Environment:
 *   MINIMAX_API_KEY  - Required. Store in .env.local as: MINIMAX_API_KEY=sk-cp-...
 *
 * IMPORTANT FACTS (learned from real integration failures):
 *   - Endpoint: api.minimax.io (NOT api.minimaxi.chat)
 *   - Model:    MiniMax-M2.5 (NOT abab6.5, NOT abab6.5-chat)
 *   - Key type: sk-cp- prefix = Coding Plan = text models only (correct)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ── Hardcoded — do not change ──────────────────────────────────────────────
const MODEL = 'MiniMax-M2.5';
const ENDPOINT_HOSTNAME = 'api.minimax.io';
const ENDPOINT_PATH = '/v1/chat/completions';

// ── Auto-load .env.local ───────────────────────────────────────────────────
if (!process.env.MINIMAX_API_KEY) {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('MINIMAX_API_KEY=')) {
        process.env.MINIMAX_API_KEY = trimmed.slice('MINIMAX_API_KEY='.length).trim();
        break;
      }
    }
  }
}

// ── Parse args ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.error('Usage: node scripts/minimax-cli.js "<prompt>" [--verbose]');
  console.error(`Model: ${MODEL} (fixed)`);
  process.exit(1);
}

const verbose = args.includes('--verbose');
const prompt = args.filter(a => a !== '--verbose')[0];

// ── Validate key ───────────────────────────────────────────────────────────
const apiKey = process.env.MINIMAX_API_KEY;
if (!apiKey) {
  console.error('Error: MINIMAX_API_KEY is not set.');
  console.error('Add it to .env.local as: MINIMAX_API_KEY=sk-cp-...');
  process.exit(1);
}

// ── Build request ──────────────────────────────────────────────────────────
const body = JSON.stringify({
  model: MODEL,
  messages: [
    { role: 'system', content: 'You are a helpful AI assistant.' },
    { role: 'user', content: prompt },
  ],
  stream: false,
});

const options = {
  hostname: ENDPOINT_HOSTNAME,
  path: ENDPOINT_PATH,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Content-Length': Buffer.byteLength(body),
  },
};

// ── Execute ────────────────────────────────────────────────────────────────
const req = https.request(options, (res) => {
  const chunks = [];

  res.on('data', chunk => chunks.push(chunk));

  res.on('end', () => {
    const raw = Buffer.concat(chunks).toString();

    if (res.statusCode < 200 || res.statusCode >= 300) {
      console.error(`Minimax API error ${res.statusCode}:`);
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

    // Minimax uses OpenAI-compatible format
    const content = data?.choices?.[0]?.message?.content ?? '';

    if (verbose) {
      // Show raw content including <think> blocks
      console.log(content);
    } else {
      // Strip <think>...</think> blocks for clean output
      const clean = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      console.log(clean);
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
MINIMAX_API_KEY=sk-cp-your-key-here
```

Add this line to the existing `.env.local` in the project root. Do not overwrite other keys.

---

## Agent Dispatch Examples

Once set up, an agent can invoke Minimax mid-task using `run_command`:

```javascript
// One-shot question
run_command("node scripts/minimax-cli.js \"Summarize this function in one sentence\"")

// Offload code review
run_command("node scripts/minimax-cli.js \"Review this logic for bugs: ...\"")

// Use high-speed variant for simple tasks
// (change MODEL to 'MiniMax-M2.5-highspeed' in the script for faster, cheaper responses)
```

The agent receives Minimax's response as stdout and can incorporate it into its own response or use it to drive next steps.
