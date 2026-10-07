/**
 * Fetcher - Downloads HTML content from KLH website using Scrapling.
 */

const path = require('path');
const { execFile } = require('child_process');

const PYTHON_COMMAND = process.env.PYTHON_COMMAND || 'python';
const SCRAPLING_HELPER = path.join(__dirname, 'scrapling_fetcher.py');
const SCRAPLING_PROCESS_TIMEOUT_MS = Number.parseInt(process.env.SCRAPLING_PROCESS_TIMEOUT_MS, 10) || 120000;

function runScrapling(urls) {
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
    const payload = await runScrapling(uniqueUrls);

    if (Array.isArray(payload.errors)) {
        for (const item of payload.errors) {
            console.error(`Failed to fetch a page: ${item.url} - ${item.error}`);
        }
    }

    return Array.isArray(payload.results) ? payload.results : [];
}

module.exports = { fetchPage, fetchMultiplePages };
