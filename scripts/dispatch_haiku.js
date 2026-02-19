#!/usr/bin/env node
/**
 * Dispatch: Run fareharbor-manifest skill via Claude 3.5 Haiku
 * Reads SKILL.md and aci_manifest.py, sends to Haiku as an agent task.
 * Includes timing and token cost analysis.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load API key from .env.local
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

if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY not set. Add to .env.local as ANTHROPIC_API_KEY=sk-ant-...');
    process.exit(1);
}

const SKILL_PATH = path.join(__dirname, '..', '.agent', 'skills', 'fareharbor-manifest', 'SKILL.md');
const SCRIPT_PATH = path.join(__dirname, 'aci_manifest.py');

const skillContent = fs.readFileSync(SKILL_PATH, 'utf8');
const scriptContent = fs.readFileSync(SCRIPT_PATH, 'utf8');

const prompt = `You are an AI agent being dispatched with a skill and a Python script to execute.

SKILL INSTRUCTIONS:
${skillContent}

THE SCRIPT (already written and ready at scripts/aci_manifest.py):
\`\`\`python
${scriptContent}
\`\`\`

YOUR TASK:
1. Confirm you understand the skill's purpose in one sentence
2. Output the exact PowerShell command to run the script (from c:\\Antigravity\\CPR)
3. Report what you expect will happen based on the skill

Be direct. Output a powershell code block containing: python scripts/aci_manifest.py`;

const body = JSON.stringify({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: 'You are a capable AI agent. When given a skill and a script to execute, respond with a brief confirmation and the exact shell command in a powershell code block. Do not explain at length — be terse and action-oriented.',
    messages: [{ role: 'user', content: prompt }],
});

// Anthropic claude-haiku-4-5 pricing (confirmed Oct 2025)
const PRICE_INPUT_PER_M = 1.00;   // $1.00 / 1M input tokens
const PRICE_OUTPUT_PER_M = 5.00;   // $5.00 / 1M output tokens

console.log('Dispatching to Claude 3.5 Haiku...\n');

const t0 = Date.now();
let tApiDone, tScriptStart, tScriptDone;

const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
    },
};

const req = https.request(options, (res) => {
    const chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => {
        tApiDone = Date.now();
        const raw = Buffer.concat(chunks).toString();
        if (res.statusCode < 200 || res.statusCode >= 300) {
            console.error(`Anthropic API error ${res.statusCode}:`, raw);
            process.exit(1);
        }
        const data = JSON.parse(raw);

        // Extract text content (Anthropic returns array of blocks)
        const content = data?.content
            ?.filter(b => b.type === 'text')
            ?.map(b => b.text)
            ?.join('\n') ?? '';
        const usage = data?.usage ?? {};

        console.log('=== HAIKU RESPONSE ===\n');
        console.log(content);
        console.log('\n=== END ===\n');

        // Execute if Haiku outputs the script command
        const pyMatch = content.match(/python\s+scripts\/aci_manifest\.py/);
        tScriptStart = Date.now();
        if (pyMatch) {
            console.log('--- Executing script as instructed by Haiku ---');
            try {
                const output = execSync('python scripts/aci_manifest.py', {
                    cwd: path.join(__dirname, '..'),
                    encoding: 'utf8',
                    timeout: 120000,
                    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
                });
                console.log(output);
            } catch (e) {
                console.error('Script error:', e.stdout || e.message);
            }
        } else {
            console.log('[!] Haiku did not output a python run command — check response above.');
        }
        tScriptDone = Date.now();

        // Timing
        const apiMs = tApiDone - t0;
        const scriptMs = tScriptDone - tScriptStart;
        const totalMs = Date.now() - t0;

        // Cost
        const inputTokens = usage.input_tokens ?? 0;
        const outputTokens = usage.output_tokens ?? 0;
        const totalTokens = inputTokens + outputTokens;
        const inputCost = (inputTokens / 1_000_000) * PRICE_INPUT_PER_M;
        const outputCost = (outputTokens / 1_000_000) * PRICE_OUTPUT_PER_M;
        const totalCost = inputCost + outputCost;

        console.log('============================================================');
        console.log('  BENCHMARK REPORT — Claude 3.5 Haiku');
        console.log('============================================================');
        console.log(`  Model             : ${data.model}`);
        console.log(`  Haiku API call    : ${(apiMs / 1000).toFixed(2)}s`);
        console.log(`  Python script     : ${pyMatch ? (scriptMs / 1000).toFixed(2) + 's' : 'N/A (not executed)'}`);
        console.log(`  Total wall time   : ${(totalMs / 1000).toFixed(2)}s`);
        console.log('------------------------------------------------------------');
        console.log(`  Input tokens      : ${inputTokens.toLocaleString()}`);
        console.log(`  Output tokens     : ${outputTokens.toLocaleString()}`);
        console.log(`  Total tokens      : ${totalTokens.toLocaleString()}`);
        console.log('------------------------------------------------------------');
        console.log(`  Input cost        : $${inputCost.toFixed(6)}`);
        console.log(`  Output cost       : $${outputCost.toFixed(6)}`);
        console.log(`  TOTAL COST        : $${totalCost.toFixed(6)}`);
        console.log('============================================================');
    });
});

req.on('error', (err) => {
    console.error('Request failed:', err.message);
    process.exit(1);
});

req.write(body);
req.end();
