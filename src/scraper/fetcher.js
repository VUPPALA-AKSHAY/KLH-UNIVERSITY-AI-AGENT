/**
 * Fetcher - Downloads HTML content from KLH website using Scrapling.
 */

const path = require('path');
const { execFile } = require('child_process');

const PYTHON_COMMAND = process.env.PYTHON_COMMAND || 'python';
const SCRAPLING_HELPER = path.join(__dirname, 'scrapling_fetcher.py');
const SCRAPLING_PROCESS_TIMEOUT_MS = Number.parseInt(process.env.SCRAPLING_PROCESS_TIMEOUT_MS, 10) || 120000;

function runScrapling(urls) {
    // Vercel's Node runtime cannot spawn Python; call the Scrapling Python
    // function deployed alongside it instead.
    if (process.env.VERCEL) {
        return runScraplingRemote(urls, selfUrl());
    }

    // If a remote Scrapling service is configured, use it.
    if (process.env.SCRAPER_URL) {
        return runScraplingRemote(urls, process.env.SCRAPER_URL);
    }

    return new Promise((resolve, reject) => {
        execFile(PYTHON_COMMAND, [SCRAPLING_HELPER, ...urls], {
            timeout: SCRAPLING_PROCESS_TIMEOUT_MS,
            maxBuffer: 30 * 1024 * 1024,
            windowsHide: true
        }, (error, stdout, stderr) => {
            if (stderr) {
                stderr.trim().split(/\r?\n/).forEach(line => console.log(line));
            }

            if (error) {
                const message = stderr.trim() || error.message;
                reject(new Error(`Scrapling failed: ${message}`));
                return;
            }

            try {
                const payload = JSON.parse(stdout);
                resolve(payload);
            } catch (parseError) {
                reject(new Error(`Scrapling returned invalid JSON: ${parseError.message}`));
            }
        });
    });
}

async function runScraplingRemote(urls, baseUrl) {
    const axios = require('axios');

    const base = String(baseUrl).replace(/\/$/, '');
    const endpoint = `${base}/api/scrape`;
    console.log(`Calling Scrapling function: ${endpoint}`);

    const response = await axios.post(endpoint, { urls }, {
        timeout: SCRAPLING_PROCESS_TIMEOUT_MS,
        maxBodyLength: Infinity,
        headers: { 'Content-Type': 'application/json' }
    });

    return response.data;
}

function selfUrl() {
    const configured = process.env.SCRAPER_URL || process.env.VERCEL_URL;
    if (!configured) {
        throw new Error('VERCEL_URL is not set; cannot reach the Scrapling function');
    }
    return String(configured).startsWith('http') ? configured : `https://${configured}`;
}

/**
 * Fetch HTML content from a URL
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} - HTML content
 */
async function fetchPage(url) {
    const pages = await fetchMultiplePages([url]);
    const page = pages[0];

    if (!page) {
        throw new Error(`Failed to fetch ${url}`);
    }

    return page.html;
}

/**
 * Fetch multiple pages using Scrapling
 * @param {Array<string>} urls - Array of URLs to fetch
 * @returns {Promise<Array>} - Array of {url, html} objects
 */
async function fetchMultiplePages(urls) {
    const uniqueUrls = [...new Set(urls.filter(Boolean))];
    if (uniqueUrls.length === 0) {
        return [];
    }

    console.log(`Scrapling scraping ${uniqueUrls.length} URL(s)`);

    try {
        const payload = await runScrapling(uniqueUrls);

        if (Array.isArray(payload.errors)) {
            for (const item of payload.errors) {
                console.error(`Failed to fetch a page: ${item.url} - ${item.error}`);
            }
        }

        const results = Array.isArray(payload.results) ? payload.results : [];
        if (results.length > 0) {
            return results;
        }

        console.log('Scrapling returned no pages, falling back to direct fetch');
    } catch (error) {
        console.error(`Scrapling unavailable (${error.message}), falling back to direct fetch`);
    }

    return fetchWithAxios(uniqueUrls);
}

async function fetchWithAxios(urls) {
    const axios = require('axios');
    const results = [];

    for (const url of urls) {
        try {
            const response = await axios.get(url, {
                timeout: 20000,
                responseType: 'text',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9'
                },
                maxRedirects: 5,
                validateStatus: (status) => status >= 200 && status < 400
            });
            results.push({ url, html: response.data });
            console.log(`Fetched ${url} (${String(response.data || '').length} chars)`);
        } catch (error) {
            console.error(`Failed to fetch ${url}: ${error.message}`);
        }
    }

    return results;
}

module.exports = { fetchPage, fetchMultiplePages };
