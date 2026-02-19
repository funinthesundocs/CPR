#!/usr/bin/env node
/**
 * Minimax M2.5 CLI
 *
 * Usage:
 *   node scripts/minimax-cli.js "<prompt>" [model] [--verbose]
 *
 * Examples:
 *   node scripts/minimax-cli.js "Explain how async/await works in JS"
 *   node scripts/minimax-cli.js "Write a sort function" MiniMax-M2.5-highspeed
 *   node scripts/minimax-cli.js "Debug this code" --verbose
 *
 * Models:
 *   MiniMax-M2.5            (default - best quality)
 *   MiniMax-M2.5-highspeed  (faster, slightly lower quality)
 *   MiniMax-M2.1
 *   MiniMax-M2.1-highspeed
 *   MiniMax-M2
 *
 * Environment:
 *   MINIMAX_API_KEY  - Required. Set in .env.local or via $env:MINIMAX_API_KEY
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ── Load .env.local if MINIMAX_API_KEY isn't already set ─────────────────────
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

// ── Constants ─────────────────────────────────────────────────────────────────
const ENDPOINT_HOSTNAME = 'api.minimax.io';
const ENDPOINT_PATH = '/v1/chat/completions';
const DEFAULT_MODEL = 'MiniMax-M2.5';

// ── Parse args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.error('Usage: node scripts/minimax-cli.js "<prompt>" [model] [--verbose]');
    console.error('Models: MiniMax-M2.5 (default), MiniMax-M2.5-highspeed, MiniMax-M2.1, MiniMax-M2');
    process.exit(1);
}

const verbose = args.includes('--verbose');
const cleanArgs = args.filter(a => a !== '--verbose');

const prompt = cleanArgs[0];
const model = cleanArgs[1] || DEFAULT_MODEL;

// ── Validate API key ──────────────────────────────────────────────────────────
const apiKey = process.env.MINIMAX_API_KEY;
if (!apiKey) {
    console.error('Error: MINIMAX_API_KEY is not set.');
    console.error('Add it to .env.local as: MINIMAX_API_KEY=sk-cp-...');
    console.error('Or set it for this session: $env:MINIMAX_API_KEY="sk-cp-..."');
    process.exit(1);
}

// ── Build request ─────────────────────────────────────────────────────────────
const body = JSON.stringify({
    model,
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

// ── Execute request ───────────────────────────────────────────────────────────
const req = https.request(options, (res) => {
    const chunks = [];

    res.on('data', chunk => chunks.push(chunk));

    res.on('end', () => {
        const raw = Buffer.concat(chunks).toString();

        if (res.statusCode < 200 || res.statusCode >= 300) {
            console.error(`Minimax API error ${res.statusCode}:`);
            try {
                const err = JSON.parse(raw);
                console.error(JSON.stringify(err, null, 2));
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

        const content = data?.choices?.[0]?.message?.content ?? '';

        if (verbose) {
            // Show full content including <think> tags
            console.log(content);
        } else {
            // Strip <think>...</think> blocks for clean output
            const clean = content
                .replace(/<think>[\s\S]*?<\/think>/g, '')
                .trim();
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
