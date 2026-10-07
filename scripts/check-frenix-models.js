/**
 * Frenix model checker.
 *
 * Usage:
 *   node scripts/check-frenix-models.js
 *   node scripts/check-frenix-models.js --all
 *   node scripts/check-frenix-models.js --list
 *   node scripts/check-frenix-models.js --pattern "gpt|claude|gemini"
 *
 * Reads FRENIX_API_KEY from .env or the current shell environment.
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BASE_URL = process.env.FRENIX_BASE_URL || 'https://api.frenix.sh/v1';
const API_KEY = process.env.FRENIX_API_KEY;
const DELAY_MS = Number.parseInt(process.env.FRENIX_TEST_DELAY_MS, 10) || 6500;
const TIMEOUT_MS = Number.parseInt(process.env.FRENIX_TEST_TIMEOUT_MS, 10) || 45000;
const OUTPUT_PATH = path.join(__dirname, 'frenix-model-check-results.json');

const args = process.argv.slice(2);
const testAll = args.includes('--all');
const listOnly = args.includes('--list');
const patternArgIndex = args.indexOf('--pattern');
const modelArgIndex = args.indexOf('--model');
const pattern = patternArgIndex >= 0 ? args[patternArgIndex + 1] : '(^|/)(gpt|chatgpt|o[0-9]|claude)';
const singleModel = modelArgIndex >= 0 ? args[modelArgIndex + 1] : null;
const nonChatPattern = /(image|dall|tts|whisper|embedding|embed|moderation|veo|wan|video|stable|flux|sdxl|sora)/i;

const fallbackModels = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4.1-nano',
    'gpt-5',
    'gpt-5-mini',
    'gpt-5-nano',
    'o3',
    'o3-mini',
    'o4-mini',
    'claude-3-5-sonnet-20241022',
    'claude-3-7-sonnet-20250219',
    'claude-sonnet-4-20250514',
    'claude-opus-4-20250514',
    'claude-3-haiku-20240307'
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getErrorMessage(error) {
    const status = error.response?.status || 'network';
    const apiError = error.response?.data?.error?.message
        || error.response?.data?.message
        || error.message
        || 'Unknown error';

    return `HTTP ${status}: ${String(apiError).replace(/\s+/g, ' ').slice(0, 220)}`;
}

function normalizeModelList(payload) {
    const models = Array.isArray(payload?.data) ? payload.data : [];
    return models
        .map(item => (typeof item === 'string' ? item : item.id || item.name || item.model))
        .filter(Boolean);
}

async function getModels() {
    const response = await axios.get(`${BASE_URL}/models`, {
        headers: {
            Authorization: `Bearer ${API_KEY}`
        },
        timeout: TIMEOUT_MS
    });

    return normalizeModelList(response.data);
}

async function testChatModel(model) {
    const startedAt = Date.now();
    try {
        const response = await axios.post(`${BASE_URL}/chat/completions`, {
            model,
            messages: [
                { role: 'system', content: 'Reply with OK only.' },
                { role: 'user', content: 'Health check.' }
            ],
            temperature: 0,
            max_tokens: 8,
            stream: false
        }, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: TIMEOUT_MS
        });

        const content = response.data?.choices?.[0]?.message?.content || '';
        return {
            model,
            working: true,
            status: response.status,
            latencyMs: Date.now() - startedAt,
            sample: content.trim().slice(0, 80)
        };
    } catch (error) {
        return {
            model,
            working: false,
            latencyMs: Date.now() - startedAt,
            error: getErrorMessage(error)
        };
    }
}

async function main() {
    if (!API_KEY) {
        console.error('FRENIX_API_KEY is missing. Add it to .env or your shell environment.');
        process.exit(1);
    }

    const discoveredModels = await getModels().catch(error => {
        console.error(`Could not read /models: ${getErrorMessage(error)}`);
        return [];
    });

    if (listOnly) {
        const modelListPath = path.join(__dirname, 'frenix-models.json');
        fs.writeFileSync(modelListPath, JSON.stringify({
            checkedAt: new Date().toISOString(),
            baseUrl: BASE_URL,
            count: discoveredModels.length,
            models: discoveredModels
        }, null, 2));

        console.log(`Discovered models: ${discoveredModels.length}`);
        discoveredModels.forEach(model => console.log(`- ${model}`));
        console.log('');
        console.log(`Saved model list: ${modelListPath}`);
        return;
    }

    const regex = new RegExp(pattern, 'i');
    let modelsToTest;

    if (singleModel) {
        modelsToTest = [singleModel];
    } else if (testAll) {
        modelsToTest = discoveredModels.length > 0 ? discoveredModels : fallbackModels;
    } else {
        const source = discoveredModels.length > 0 ? discoveredModels : fallbackModels;
        modelsToTest = source.filter(model => regex.test(model) && !nonChatPattern.test(model));
    }

    modelsToTest = [...new Set(modelsToTest)].sort();

    if (modelsToTest.length === 0) {
        console.log('No models matched. Try --all or --pattern "gpt|claude|gemini".');
        return;
    }

    console.log(`Frenix base URL: ${BASE_URL}`);
    console.log(`Discovered models: ${discoveredModels.length}`);
    console.log(`Testing models: ${modelsToTest.length}`);
    console.log(`Delay between tests: ${DELAY_MS}ms`);
    console.log('');

    const results = [];
    for (let index = 0; index < modelsToTest.length; index++) {
        const model = modelsToTest[index];
        process.stdout.write(`[${index + 1}/${modelsToTest.length}] ${model} ... `);

        const result = await testChatModel(model);
        results.push(result);

        if (result.working) {
            console.log(`WORKING (${result.latencyMs}ms)`);
        } else {
            console.log(`FAILED (${result.error})`);
        }

        if (index < modelsToTest.length - 1) {
            await sleep(DELAY_MS);
        }
    }

    const report = {
        checkedAt: new Date().toISOString(),
        baseUrl: BASE_URL,
        discoveredModelCount: discoveredModels.length,
        discoveredModels,
        testedModelCount: results.length,
        working: results.filter(item => item.working).map(item => item.model),
        failed: results.filter(item => !item.working).map(item => ({
            model: item.model,
            error: item.error
        })),
        results
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2));

    console.log('');
    console.log('Working models:');
    report.working.forEach(model => console.log(`- ${model}`));
    if (report.working.length === 0) console.log('- none');

    console.log('');
    console.log('Failed models:');
    report.failed.forEach(item => console.log(`- ${item.model}: ${item.error}`));
    if (report.failed.length === 0) console.log('- none');

    console.log('');
    console.log(`Saved report: ${OUTPUT_PATH}`);
}

main().catch(error => {
    console.error(getErrorMessage(error));
    process.exit(1);
});
