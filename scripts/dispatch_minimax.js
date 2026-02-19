#!/usr/bin/env node
/**
 * Dispatch: Run fareharbor-manifest skill via Minimax
 * Reads SKILL.md and aci_manifest.py, sends to Minimax as an agent task.
 * Includes timing and token cost analysis.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load API key
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
1. Confirm you understand the skill's purpose
2. Run the script by executing: python scripts/aci_manifest.py (from the c:\\Antigravity\\CPR directory)
3. Report back:
   - What date was targeted
   - What PAX count was extracted
   - Whether the email was sent successfully
   - Any errors encountered

Execute now. The script is self-contained — just run it.`;

const body = JSON.stringify({
    model: 'MiniMax-M2.5',
    messages: [
        { role: 'system', content: 'You are a capable AI agent. When given a skill and a script, you execute it by outputting the shell command to run it, then interpret the expected output based on your understanding. Be direct and action-oriented.' },
        { role: 'user', content: prompt },
    ],
    stream: false,
});

// -- Pricing constants (MiniMax M2.5, per million tokens) --
const PRICE_INPUT_PER_M = 0.21;   // $0.21 / 1M input tokens
const PRICE_OUTPUT_PER_M = 0.84;   // $0.84 / 1M output tokens

console.log('Dispatching to Minimax M2.5...\n');

const t0 = Date.now();
let tApiDone, tScriptDone;

const options = {
    hostname: 'api.minimax.io',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
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
            console.error(`API error ${res.statusCode}:`, raw);
            process.exit(1);
        }
        const data = JSON.parse(raw);
        const content = data?.choices?.[0]?.message?.content ?? '';
        const usage = data?.usage ?? {};

        // Strip <think> blocks
        const clean = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        console.log('=== MINIMAX RESPONSE ===\n');
        console.log(clean);
        console.log('\n=== END ===\n');

        // Execute the script if Minimax instructs it
        const pyMatch = clean.match(/python\s+scripts\/aci_manifest\.py/);
        const tScriptStart = Date.now();
        if (pyMatch) {
            console.log('--- Executing script as instructed by Minimax ---');
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
        }
        tScriptDone = Date.now();

        // -- Timing --
        const apiMs = tApiDone - t0;
        const scriptMs = tScriptDone - tScriptStart;
        const totalMs = Date.now() - t0;

        // -- Cost --
        const inputTokens = usage.prompt_tokens ?? 0;
        const outputTokens = usage.completion_tokens ?? 0;
        const totalTokens = usage.total_tokens ?? 0;
        const inputCost = (inputTokens / 1_000_000) * PRICE_INPUT_PER_M;
        const outputCost = (outputTokens / 1_000_000) * PRICE_OUTPUT_PER_M;
        const totalCost = inputCost + outputCost;

        console.log('============================================================');
        console.log('  BENCHMARK REPORT');
        console.log('============================================================');
        console.log(`  Minimax API call  : ${(apiMs / 1000).toFixed(2)}s`);
        console.log(`  Python script     : ${(scriptMs / 1000).toFixed(2)}s`);
        console.log(`  Total wall time   : ${(totalMs / 1000).toFixed(2)}s`);
        console.log('------------------------------------------------------------');
        console.log(`  Prompt tokens     : ${inputTokens.toLocaleString()}`);
        console.log(`  Completion tokens : ${outputTokens.toLocaleString()}`);
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
