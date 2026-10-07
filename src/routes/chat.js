/**
 * Chat Routes - API endpoints for the chat functionality
 */

const express = require('express');
const router = express.Router();

const { findRelevantUrls } = require('../scraper/urlMapper');
const { fetchMultiplePages } = require('../scraper/fetcher');
const { parseMultiplePages } = require('../scraper/parser');
const { generateResponse, generateFallbackResponse, getAvailableModels, callTavilySearch, callGeminiAPIStream, AI_MODELS } = require('../ai/gemini');

// ===================================
// Chat Memory (Brain) - Last 20 messages per session
// ===================================
const chatMemory = new Map();
const MAX_HISTORY = 20; // Keep last 20 messages (10 turns)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Clean up old sessions periodically
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, data] of chatMemory.entries()) {
        if (now - data.lastActive > SESSION_TIMEOUT) {
            chatMemory.delete(sessionId);
            console.log(`🧹 Cleaned up chat session: ${sessionId}`);
        }
    }
}, 5 * 60 * 1000); // Check every 5 minutes

/**
 * POST /api/chat
 * Main chat endpoint - receives user query, scrapes relevant pages, returns AI response
 */
router.post('/chat', async (req, res) => {
    try {
        const { message, model = 'cloudflare', sessionId = 'default' } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Please provide a message'
            });
        }

        const userQuery = message.trim();
        console.log(`\n💬 User Query: "${userQuery}"`);
        console.log(`🤖 Selected Model: ${model}`);
        console.log(`🧠 Session: ${sessionId}`);

        // Get or create conversation history for this session
        if (!chatMemory.has(sessionId)) {
            chatMemory.set(sessionId, { history: [], lastActive: Date.now() });
        }
        const session = chatMemory.get(sessionId);
        session.lastActive = Date.now();
        const history = session.history;

        console.log(`💾 Chat memory: ${history.length} messages in session`);

        // Step 1: Determine mode
        const mode = req.body.mode || 'fast';
        const isVoiceMode = req.body.voice_mode || false;

        console.log(`🧠 Mode: ${mode}${isVoiceMode ? ' (Voice Personality 🎤)' : ''}`);

        let scrapedContent = null;
        let searchResults = null;
        let urls = [];
        let categories = [];

        if (mode === 'thinking') {
            // THINKING MODE: Skip scraping, use web search only
            console.log('🤔 Thinking mode: Skipping URL scraping, using web search...');
            searchResults = await callTavilySearch(userQuery);
            // Sources will come from searchResults
            if (searchResults && searchResults.sources) {
                urls = searchResults.sources.map(s => s.url);
            }
            categories = ['web-search'];
        } else {
            // FAST MODE: Scrape KLH website URLs
            const result = findRelevantUrls(userQuery);
            urls = result.urls;
            categories = result.categories;
            console.log(`🔍 Identified categories: ${categories.join(', ') || 'general'}`);
            console.log(`🌐 URLs to scrape: ${urls.join(', ')}`);

            // Fetch and parse content
            try {
                console.log('🔄 Fetching fresh content from KLH website...');
                const pages = await fetchMultiplePages(urls);

                if (pages.length > 0) {
                    scrapedContent = parseMultiplePages(pages);
                    console.log(`📄 Scraped ${scrapedContent.length} characters of content`);
                }
            } catch (fetchError) {
                console.error('⚠️ Scraping failed:', fetchError.message);
            }
        }

        // Step 2: Generate AI response (with conversation history)
        let response;
        if (scrapedContent && scrapedContent.length > 50) {
            response = await generateResponse(userQuery, scrapedContent, model, searchResults, isVoiceMode, history);
        } else if (searchResults) {
            // Thinking mode with web search results
            response = await generateResponse(userQuery, null, model, searchResults, isVoiceMode, history);
        } else {
            console.log('⚠️ Minimal or no content, using fallback');
            response = await generateFallbackResponse(userQuery, scrapedContent, searchResults);
        }

        // Step 3: Save to conversation memory
        const answerText = typeof response === 'object' ? response.answer : response;
        history.push({ role: 'user', content: userQuery });
        history.push({ role: 'assistant', content: answerText });

        // Keep only last MAX_HISTORY messages
        while (history.length > MAX_HISTORY) {
            history.shift();
        }
        console.log(`💾 Updated chat memory: ${history.length} messages for session ${sessionId}`);

        // Step 4: Return the response
        res.json({
            success: true,
            response,
            sources: urls,
            categories,
            model
        });

    } catch (error) {
        console.error('❌ Chat endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process your request',
            message: error.message
        });
    }
});

/**
 * GET /api/models
 * Returns available AI models
 */
router.get('/models', (req, res) => {
    res.json({
        models: getAvailableModels(),
        default: 'cloudflare'
    });
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'KLH AI Assistant',
        timestamp: new Date().toISOString(),
        geminiConfigured: !!process.env.GEMINI_API_KEY
    });
});

/**
 * GET /api/suggestions
 * Returns suggested questions for users
 */
router.get('/suggestions', (req, res) => {
    res.json({
        suggestions: [
            "What are the B.Tech CSE fees?",
            "How do I apply for admission?",
            "What courses are offered at KLH?",
            "Tell me about placements at KLH",
            "What is the hostel fee?",
            "What are the MBA program details?",
            "Where is KLH campus located?",
            "What scholarships are available?"
        ]
    });
});

/**
 * POST /api/chat/stream
 * Streaming chat endpoint - uses Server-Sent Events for progressive response
 */
router.post('/chat/stream', async (req, res) => {
    try {
        const { message, model = 'cloudflare', sessionId = 'default', mode = 'fast' } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Please provide a message'
            });
        }

        const userQuery = message.trim();
        console.log(`\n🌊 Streaming Chat: "${userQuery}"`);
        console.log(`🤖 Model: ${model}, Mode: ${mode}, Session: ${sessionId}`);

        // Get or create conversation history
        if (!chatMemory.has(sessionId)) {
            chatMemory.set(sessionId, { history: [], lastActive: Date.now() });
        }
        const session = chatMemory.get(sessionId);
        session.lastActive = Date.now();
        const history = session.history;

        // Build conversation context
        let historyContext = '';
        if (history.length > 0) {
            historyContext = '\n\nCONVERSATION HISTORY:\n';
            for (const msg of history) {
                const role = msg.role === 'user' ? 'Student' : 'Assistant';
                historyContext += `${role}: ${msg.content}\n`;
            }
        }

        // Get context (scraping or web search)
        let scrapedContent = null;
        let searchResults = null;

        if (mode === 'thinking') {
            console.log('🤔 Thinking mode: Using web search...');
            searchResults = await callTavilySearch(userQuery);
        } else {
            const result = findRelevantUrls(userQuery);
            const urls = result.urls;
            console.log(`🔍 Fast mode: Scraping ${urls.length} URLs`);

            try {
                const pages = await fetchMultiplePages(urls);
                if (pages.length > 0) {
                    scrapedContent = parseMultiplePages(pages);
                }
            } catch (e) {
                console.error('⚠️ Scraping failed:', e.message);
            }
        }

        // Build the prompt
        let prompt;
        const systemPrompt = `You are KLH Assistant for KL University. Be helpful, concise, and format responses with markdown for readability.
        ${historyContext}
        Current time: ${new Date().toISOString()}`;

        if (searchResults) {
            prompt = `${systemPrompt}
            
            Web search results:
            ${searchResults.context}
            ${searchResults.answer ? `Summary: ${searchResults.answer}` : ''}
            
            Student's question: "${userQuery}"
            
            Answer the question using the web search context.`;
        } else {
            prompt = `${systemPrompt}
            
            University data:
            ${scrapedContent || "Use your knowledge about KLH University."}
            
            Student's question: "${userQuery}"
            
            Answer accurately based on the provided data.`;
        }

        // Set up SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        // Only Gemini supports streaming currently
        if (model === 'cloudflare' && false) {
            let fullResponse = '';

            try {
                fullResponse = await callGeminiAPIStream(prompt, (chunk) => {
                    // Send each chunk as SSE event
                    res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
                });

                // Send completion signal
                res.write(`data: ${JSON.stringify({ done: true })}\n\n`);

                // Save to memory
                history.push({ role: 'user', content: userQuery });
                history.push({ role: 'assistant', content: fullResponse });
                while (history.length > MAX_HISTORY) {
                    history.shift();
                }
                console.log(`✅ Stream complete, ${fullResponse.length} chars`);

            } catch (streamError) {
                console.error('❌ Streaming error:', streamError.message);
                res.write(`data: ${JSON.stringify({ error: streamError.message })}\n\n`);
            }
        } else {
            // For non-Gemini models, use regular response and send in chunks
            console.log(`⚠️ Model ${model} doesn't support streaming, using chunked simulation`);

            try {
                const response = await generateResponse(userQuery, scrapedContent, model, searchResults, false, history);
                const answer = typeof response === 'object' ? response.answer : response;

                // Simulate streaming by sending chunks
                const words = answer.split(' ');
                let chunkSize = 5; // Send 5 words at a time
                for (let i = 0; i < words.length; i += chunkSize) {
                    const chunk = words.slice(i, i + chunkSize).join(' ') + ' ';
                    res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
                    await new Promise(r => setTimeout(r, 50)); // Small delay
                }

                res.write(`data: ${JSON.stringify({ done: true })}\n\n`);

                // Save to memory
                history.push({ role: 'user', content: userQuery });
                history.push({ role: 'assistant', content: answer });
                while (history.length > MAX_HISTORY) {
                    history.shift();
                }

            } catch (e) {
                res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
            }
        }

        res.end();

    } catch (error) {
        console.error('❌ Streaming endpoint error:', error);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});

module.exports = router;
