/**
 * Parser - Extracts clean text content from HTML using Cheerio
 */

const cheerio = require('cheerio');

/**
 * Parse HTML and extract clean text content
 * @param {string} html - Raw HTML content
 * @param {string} url - Source URL for context
 * @returns {string} - Clean text content
 */
function parseHtml(html, url = '') {
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script').remove();
    $('style').remove();
    $('noscript').remove();
    $('iframe').remove();
    $('nav').remove();
    $('footer').remove();
    $('header').remove();
    $('.menu').remove();
    $('.nav').remove();
    $('.navigation').remove();
    $('.sidebar').remove();
    $('.advertisement').remove();
    $('.ad').remove();
    $('[role="navigation"]').remove();
    $('form').remove();

    // Extract text from main content areas
    let contentText = '';

    // Try to find main content areas
    const mainSelectors = [
        'main',
        'article',
        '.content',
        '.main-content',
        '#content',
        '#main',
        '.entry-content',
        '.page-content',
        '.post-content',
        '.elementor-widget-container',
        '.elementor-text-editor'
    ];

    let foundMain = false;
    for (const selector of mainSelectors) {
        const element = $(selector);
        if (element.length > 0) {
            contentText += element.text() + '\n';
            foundMain = true;
        }
    }

    // If no main content found, get body text
    if (!foundMain) {
        contentText = $('body').text();
    }

    // Also extract table data which often contains fee structures
    $('table').each((_, table) => {
        const tableText = [];
        $(table).find('tr').each((_, row) => {
            const rowData = [];
            $(row).find('th, td').each((_, cell) => {
                rowData.push($(cell).text().trim());
            });
            if (rowData.length > 0) {
                tableText.push(rowData.join(' | '));
            }
        });
        if (tableText.length > 0) {
            contentText += '\n\nTable Data:\n' + tableText.join('\n');
        }
    });

    // Extract list items (often contain important info)
    const listItems = [];
    $('ul li, ol li').each((_, li) => {
        const text = $(li).text().trim();
        if (text.length > 10 && text.length < 500) {
            listItems.push('• ' + text);
        }
    });
    if (listItems.length > 0) {
        contentText += '\n\nKey Points:\n' + listItems.slice(0, 30).join('\n');
    }

    // Clean up the text
    contentText = cleanText(contentText);

    return contentText;
}

/**
 * Clean extracted text
 * @param {string} text - Raw extracted text
 * @returns {string} - Cleaned text
 */
function cleanText(text) {
    return text
        // Replace multiple whitespace with single space
        .replace(/\s+/g, ' ')
        // Replace multiple newlines with double newline
        .replace(/\n\s*\n/g, '\n\n')
        // Remove leading/trailing whitespace from lines
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
        // Limit total length to avoid token limits
        .slice(0, 15000)
        .trim();
}

/**
 * Parse multiple HTML pages and combine results
 * @param {Array} pages - Array of {url, html} objects
 * @returns {string} - Combined clean text from all pages
 */
function parseMultiplePages(pages) {
    const allContent = [];

    for (const page of pages) {
        const content = parseHtml(page.html, page.url);
        if (content.length > 100) {
            allContent.push(`\n--- Content from ${page.url} ---\n${content}`);
        }
    }

    return allContent.join('\n\n');
}

module.exports = { parseHtml, parseMultiplePages, cleanText };
