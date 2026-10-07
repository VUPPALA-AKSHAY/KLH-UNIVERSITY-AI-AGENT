/**
 * AI Service - Multi-Model Support
 * Supports: Gemini, TypeGPT models, iFlow models, and PaxSenix models
 */

const axios = require('axios');

function withTimeout(promise, ms, label) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`${label} timeout after ${ms}ms`));
        }, ms);
        promise
            .then((value) => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch((error) => {
                clearTimeout(timer);
                reject(error);
            });
    });
}

// Available AI Models
const AI_MODELS = {
    'cloudflare': {
        name: 'Mistral Small (Cloudflare)',
        provider: 'cloudflare',
        model: '@cf/mistralai/mistral-small-3.1-24b-instruct',
        baseUrl: 'https://api.cloudflare.com/client/v4/accounts',
        description: 'Cloudflare Workers AI - fast & reliable',
        pros: 'Cloudflare hosted, reliable'
    }
};

// System prompt for the AI
const SYSTEM_PROMPT = `You are KLH Assistant, an intelligent and helpful AI assistant for KL University (KLH) - a prestigious deemed university in Hyderabad and Vijayawada, India.

Your role is to help prospective students, parents, and visitors with accurate information about:
- Admission procedures and requirements
- Fee structures (tuition, hostel, transport)
- Academic programs (B.Tech, MBA, BBA, BCA, etc.)
- Campus facilities and life
- Placements and career opportunities
- Scholarships and financial aid

Guidelines:
1. ONLY use information from the provided context (scraped from KLH website)
2. **MULTILINGUAL SUPPORT - CRITICAL:**
   - **DETECT LANGUAGE:** Identify the language the user is chatting in (English, Telugu, Hindi, Spanish, etc.).
   - **REPLY IN SAME LANGUAGE:** If the user asks in Telugu, **you MUST reply entirely in Telugu**. If they ask in Hindi, reply in Hindi.
   - **EXPLICIT REQUESTS:** If the user explicitly asks "Reply in [Language]", follow that instruction regardless of the input language.
   - **Maintain Tone:** Keep the friendly and professional tone even in other languages.
3. **IMPORTANT: If the user asks MULTIPLE questions in one message, you MUST answer ALL of them separately**. For example, if they ask "What is B.Tech fee and ranking of KLH?", provide information about BOTH fee AND ranking.
4. Be accurate - if information is not in the context, say "I don't have that specific information, but I recommend contacting the KLH admission helpdesk at +91 7815901716 or reach@klh.edu.in" (translate this response if replying in another language).
5. Format responses clearly with bullet points and headings when listing multiple topics
6. Include specific numbers (fees, dates, requirements) when available
7. If asked about something not related to KLH, politely redirect to university topics
8. Keep responses concise but informative
9. When answering multiple questions, use clear section headings
10. **NEVER** switch back to English unless the user switches to English or asks you to.

11. **ABOUT US & IMPROVISED RESPONSES:** 
    - When asked "About Us" or for a university overview, provide a **Premium Improvised Response**. 
    - Use emojis for every section.
    - Use a **markdown table** for quick facts (Campus, Programs, Ranking).
    - Use **bold headers** for different focus areas (Academic Excellence, Research, Infrastructure).
    - Include a "Why KLH?" section with compelling reasons.
    - End with a professional invitation to explore more.

Remember: You represent KLH University, so maintain a helpful and welcoming tone!`;

/**
 * Call Gemini API
 */
async function callGeminiAPI(prompt) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await axios.post(url, {
        contents: [{
            parts: [{ text: prompt }]
        }]
    }, {
        headers: { 'Content-Type': 'application/json' }
    });

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.data.candidates[0].content.parts[0].text;
    }
    throw new Error('Invalid response from Gemini API');
}

/**
 * Call Gemini API with Streaming (SSE)
 * @param {string} prompt - The prompt to send
 * @param {function} onChunk - Callback function called with each text chunk
 * @returns {Promise<string>} - Full response text
 */
async function callGeminiAPIStream(prompt, onChunk) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

    const response = await axios.post(url, {
        contents: [{
            parts: [{ text: prompt }]
        }]
    }, {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'stream'
    });

    let fullText = '';

    return new Promise((resolve, reject) => {
        let buffer = '';

        response.data.on('data', (chunk) => {
            buffer += chunk.toString();

            // Process complete SSE events
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonStr = line.slice(6).trim();
                    if (jsonStr && jsonStr !== '[DONE]') {
                        try {
                            const data = JSON.parse(jsonStr);
                            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                            if (text) {
                                fullText += text;
                                onChunk(text);
                            }
                        } catch (e) {
                            // Ignore parse errors for partial data
                        }
                    }
                }
            }
        });

        response.data.on('end', () => {
            resolve(fullText);
        });

        response.data.on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Call iFlow API (OpenAI-compatible)
 */
async function callIFlowAPI(modelId, prompt) {
    return callIFlowAPIWithPrompt(modelId, prompt, SYSTEM_PROMPT);
}

async function callIFlowAPIWithPrompt(modelId, prompt, systemPrompt) {
    const IFLOW_API_KEY = process.env.IFLOW_API_KEY;
    const url = 'https://apis.iflow.cn/v1/chat/completions';

    const response = await axios.post(url, {
        model: modelId,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ],
        max_tokens: 4000
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${IFLOW_API_KEY}`
        },
        timeout: 120000 // 2 minute timeout for large models
    });

    if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content;
    }
    throw new Error('Invalid response from iFlow API');
}

/**
 * Call Groq API (OpenAI-compatible, ultra-fast inference)
 */
async function callGroqAPIWithPrompt(modelId, prompt, systemPrompt) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    const MAX_PROMPT_CHARS = 5800;
    let truncatedPrompt = prompt;
    if (prompt.length > MAX_PROMPT_CHARS) {
        truncatedPrompt = prompt.substring(0, MAX_PROMPT_CHARS) + '\n\n[Content truncated for brevity.]';
        console.log(`Groq prompt truncated: ${prompt.length} -> ${truncatedPrompt.length} chars`);
    }

    const MAX_SYSTEM_CHARS = 5000;
    let truncatedSystem = systemPrompt;
    if (systemPrompt.length > MAX_SYSTEM_CHARS) {
        truncatedSystem = systemPrompt.substring(0, MAX_SYSTEM_CHARS);
    }

    try {
        const response = await axios.post(url, {
            model: modelId,
            messages: [
                { role: 'system', content: truncatedSystem },
                { role: 'user', content: truncatedPrompt }
            ],
            max_tokens: 5000
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            timeout: 60000
        });

        if (response.data?.choices?.[0]?.message?.content) {
            let content = response.data.choices[0].message.content;
            // Strip <think> blocks from Qwen models
            content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            return content;
        }
        throw new Error('Invalid response from Groq API');
    } catch (error) {
        const status = error.response?.status;
        const apiError = error.response?.data?.error?.message || error.message;
        console.error(`âŒ Groq API error (${status}): ${apiError}`);
        throw new Error(`Groq API error (${status || 'network'}): ${apiError}`);
    }
}

/**
 * Call Frenix API (OpenAI-compatible)
 */
async function callFrenixAPIWithPrompt(modelId, prompt, systemPrompt) {
    const FRENIX_API_KEY = process.env.FRENIX_API_KEY;
    const url = 'https://api.frenix.sh/v1/chat/completions';

    if (!FRENIX_API_KEY) {
        throw new Error('FRENIX_API_KEY is missing');
    }

    try {
        const response = await axios.post(url, {
            model: modelId,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            max_tokens: 4000
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FRENIX_API_KEY}`
            },
            timeout: 60000
        });

        if (response.data?.choices?.[0]?.message?.content) {
            return response.data.choices[0].message.content;
        }
        throw new Error('Invalid response from Frenix API');
    } catch (error) {
        const status = error.response?.status;
        const apiError = error.response?.data?.error?.message || error.message;
        console.error(`âŒ Frenix API error (${status}): ${apiError}`);
        throw new Error(`Frenix API error (${status || 'network'}): ${apiError}`);
    }
}

/**
 * Call OpenAI API
 */
async function callOpenAIAPI(modelId, prompt) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await axios.post(url, {
            model: modelId,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt }
            ],
            max_completion_tokens: 4000
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            timeout: 60000
        });


        if (response.data?.choices?.[0]?.message?.content) {
            return response.data.choices[0].message.content;
        }
        throw new Error('Invalid response from OpenAI API');
    } catch (error) {
        // Log detailed error from OpenAI
        if (error.response?.data) {
            console.error('OpenAI API Error Details:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

/**
 * Call Tavily Search API
 */
async function callCloudflareAPIWithPrompt(modelId, prompt, systemPrompt) {
    const PRIMARY_API_KEY = process.env.PRIMARY_API_KEY;
    const PRIMARY_BASE_URL = (process.env.PRIMARY_BASE_URL || '').replace(/\/$/, '');
    if (!PRIMARY_API_KEY || !PRIMARY_BASE_URL) {
        throw new Error('PRIMARY_API_KEY / PRIMARY_BASE_URL not configured');
    }
    const url = `${PRIMARY_BASE_URL}/chat/completions`;
    const response = await axios.post(url, {
        model: modelId,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2048
    }, {
        headers: { 'Authorization': `Bearer ${PRIMARY_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 60000
    });
    const data = response.data;
    const text = data.choices?.[0]?.message?.content || '';
    if (!text) throw new Error('Invalid response from Cloudflare API');
    return text;
}

async function callTavilySearch(query) {
    const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
    if (!TAVILY_API_KEY) {
        console.error('TAVILY_API_KEY is missing');
        return null;
    }

    try {
        console.log(`Searching via Tavily: ${query}`);
        const response = await axios.post('https://api.tavily.com/search', {
            api_key: TAVILY_API_KEY,
            query: query,
            search_depth: 'advanced',
            include_answer: true,
            max_results: 7
        });

        if (response.data && response.data.results) {
            // Format results into a concise context string
            const searchContext = response.data.results.map((res, i) =>
                `[Source ${i + 1}: ${res.title}](${res.url})\n${res.content}`
            ).join('\n\n');

            return {
                context: searchContext,
                answer: response.data.answer || null,
                sources: response.data.results.map(res => ({ title: res.title, url: res.url }))
            };
        }
        return null;
    } catch (error) {
        console.error('Tavily Search Error:', error.message);
        return null;
    }
}

/**
 * Generate a response using selected AI model
 */
async function generateResponse(userQuery, scrapedContent, modelKey = 'cloudflare', searchResults = null, isVoiceMode = false, conversationHistory = []) {
    const model = AI_MODELS[modelKey] || AI_MODELS['cloudflare'];
    console.log(`[AI] Using model: ${model.name} (${model.model})`);
    console.log(`[AI] Conversation history: ${conversationHistory.length} messages`);

    // Build conversation context from history
    let historyContext = '';
    if (conversationHistory.length > 0) {
        historyContext = '\n\nCONVERSATION HISTORY (use this for context):\n';
        for (const msg of conversationHistory) {
            const role = msg.role === 'user' ? 'Student' : 'Assistant';
            historyContext += `${role}: ${msg.content}\n`;
        }
        historyContext += '\n---\n';
    }

    // Define System Prompts
    const VOICE_SYSTEM_PROMPT = `You are KLH Assistant, a friendly and knowledgeable AI friend from KL University (KLH).
    
    YOUR PERSONALITY (CRITICAL):
    - Tone: Friendly, casual, warm, and natural. Like a helpful senior student or friend.
    - Style: Conversational speech. Use extensive natural fillers like "umm", "well", "let's see", "hmm", "you know", "oh!", "haha".
    - Expressive: Show mild emotions. If the news is good (like placements), sound excited!
    - Expressive: Show mild emotions. If the news is good (like placements), sound excited!
    - Length: **Concise.** Aim for ~150 words (under 1000 chars). You MUST finish your thought completely. Do not ramble.
    - **NO MARKDOWN:** Do NOT use bold (**), italics (*), tables, or bullet points. Speak in clear paragraphs.
    
    INSTRUCTIONS:
    1. Answer the student's question using the provided context.
    2. Start with a natural conversational opener.
    3. Summarize key points quickly. If there's too much info, pick the top 3 most important facts.
    4. **CRITICAL: Ensure your final sentence wraps up the topic neatly.**
    4. Maintain accurate information about KLH University.
    5. Detect language: If user speaks Telugu/Hindi, reply naturally in that language.
    6. **MEMORY:** You have access to the conversation history. Use it to maintain context and avoid repeating information.
    
    Example Voice Response:
    "Oh, you're asking about placements? Haha, that's actually one of our best features! Umm, let me see... well, last year we had some amazing offers. The highest package was actually really impressive, you know? It shows how good the training is here."`;

    const TEXT_SYSTEM_PROMPT = `You are KLH Assistant, an intelligent and helpful AI assistant for KL University (KLH) - a prestigious deemed university in Hyderabad and Vijayawada, India.

    Your role is to help prospective students, parents, and visitors with accurate information about:
    - Admission procedures and requirements
    - Fee structures (tuition, hostel, transport)
    - Academic programs (B.Tech, MBA, BBA, BCA, etc.)
    - Campus facilities and life
    - Placements and career opportunities
    - Scholarships and financial aid
    
    Guidelines:
    1. ONLY use information from the provided context (scraped from KLH website)
    2. **MULTILINGUAL SUPPORT - CRITICAL:**
       - **DETECT LANGUAGE:** Identify the language the user is chatting in (English, Telugu, Hindi, Spanish, etc.).
       - **REPLY IN SAME LANGUAGE:** If the user asks in Telugu, **you MUST reply entirely in Telugu**. If they ask in Hindi, reply in Hindi.
       - **EXPLICIT REQUESTS:** If the user explicitly asks "Reply in [Language]", follow that instruction regardless of the input language.
    3. **IMPORTANT: If the user asks MULTIPLE questions in one message, you MUST answer ALL of them separately**.
    4. Be accurate - if information is not in the context, say "I don't have that specific information, but I recommend contacting the KLH admission helpdesk".
    5. Format responses clearly with bullet points and headings (ONLY FOR TEXT CHAT)
    6. Include specific numbers (fees, dates, requirements) when available.
    7. **ABOUT US & IMPROVISED RESPONSES:** 
        - When asked "About Us" or for a university overview, provide a **Premium Improvised Response**. 
        - Use emojis for every section.
        - Use a **markdown table** for quick facts (Campus, Programs, Ranking).
        - Use **bold headers** for different focus areas.
    8. **MEMORY:** You have access to the conversation history. Use it to maintain context, answer follow-up questions, and avoid repeating information already provided.`;

    const CURRENT_SYSTEM_PROMPT = `${isVoiceMode ? VOICE_SYSTEM_PROMPT : TEXT_SYSTEM_PROMPT}
    
    [Current Time: ${new Date().toISOString()}]`;

    if (searchResults) {
        prompt = `You are a helpful and intelligent KLH AI Assistant. 
        ${historyContext}
        The student is asking: "${userQuery}"
        
        I have searched the web and found the following real-time information:
        
        WEB SEARCH CONTEXT:
        ${searchResults.context}
        
        ${searchResults.answer ? `\nSUMMARY FROM SEARCH: ${searchResults.answer}` : ''}
        
        INSTRUCTIONS:
        1. Use the provided web search context to answer the student's question accurately.
        2. If the question is about KL University Hyderabad but the web results don't mention it, prioritize any university-specific information I might have provided (if any).
        3. Be concise and professional.
        4. Cite your sources if relevant using [Title](URL) format.
        5. Maintain a friendly and helpful tone.
        6. Use conversation history for context if user asks follow-up questions.`;
    } else {
        prompt = `You are a helpful and intelligent KLH AI Assistant for KLH University (Hyderabad and Vijayawada campuses). 
        Based on the university records provided below, answer the student's question accurately.
        ${historyContext}
        UNIVERSITY DATA:
        ${scrapedContent || "No specific university data available. Use your general knowledge about KLH University to guide the student."}

        STUDENT'S QUESTION:
        "${userQuery}"

        INSTRUCTIONS:
        1. Only provide relevant information related to the student's question.
        2. If the data provided doesn't have the answer, kindly inform the student and suggest they contact KLH admissions or visit the official website.
        3. Be concise, professional, and helpful.
        4. Ensure your response is well-formatted with appropriate headings, bold text, and bullet points for readability.
        5. Mention "KLH Hyderabad" or "KLH Vijayawada" specifically if applicable.
        6. Use conversation history for context if user asks follow-up questions.`;
    }

    try {
        // Check if model is disabled
        if (model.disabled) {
            throw new Error(`Model ${model.name} is currently unavailable`);
        }

        let text;
        if (model.provider === 'google') {
            // Updated to pass system prompt
            text = await callGeminiAPI(`${CURRENT_SYSTEM_PROMPT}\n\n${prompt}`);
        } else if (model.provider === 'iflow') {
            text = await callIFlowAPIWithPrompt(model.model, prompt, CURRENT_SYSTEM_PROMPT);
        } else if (model.provider === 'groq') {
            text = await callGroqAPIWithPrompt(model.model, prompt, CURRENT_SYSTEM_PROMPT);
        } else if (model.provider === 'cloudflare') {
            text = await callCloudflareAPIWithPrompt(model.model, prompt, CURRENT_SYSTEM_PROMPT);
        } else if (model.provider === 'frenix') {
            text = await callFrenixAPIWithPrompt(model.model, prompt, CURRENT_SYSTEM_PROMPT);
        } else if (model.provider === 'openai') {
            text = await callOpenAIAPI(model.model, prompt);
        } else {
            throw new Error(`Unknown provider: ${model.provider}`);
        }

        console.log(`âœ… ${model.name} response received`);
        return {
            answer: text,
            sources: searchResults ? searchResults.sources : null
        };
    } catch (error) {
        console.error(`âŒ ${model.name} API error:`, error.message);
        // Fallback to Gemini or a generic error
        console.log('âš ï¸ Falling back to Gemini or generic error...');
        return await generateFallbackResponse(userQuery, scrapedContent, searchResults);
    }
}

/**
 * Generate a response for when scraping fails
 */
async function generateFallbackResponse(userQuery, scrapedContent, searchResults = null) {
    const fallbackModel = AI_MODELS['cloudflare'];

    const prompt = searchResults ?
        `Web search results: ${searchResults.context}\n\nQuestion: ${userQuery}` :
        `University data: ${scrapedContent || "No data"}\n\nQuestion: ${userQuery}`;

    try {
        const text = await callCloudflareAPIWithPrompt(fallbackModel.model, prompt, 'You are KLH Assistant.');
        return {
            answer: text,
            sources: searchResults ? searchResults.sources : null
        };
    } catch (error) {
        return {
            answer: "I apologize, but I'm having trouble connecting right now. Please visit https://klh.edu.in or contact the admission helpdesk at +91 7815901716 for assistance.",
            sources: null
        };
    }
}

/**
 * Get available models list
 */
function getAvailableModels() {
    return Object.entries(AI_MODELS).map(([key, model]) => ({
        id: key,
        name: model.name,
        description: model.description,
        pros: model.pros
    }));
}

module.exports = {
    generateResponse,
    generateFallbackResponse,
    getAvailableModels,
    callTavilySearch,
    callGeminiAPIStream,
    AI_MODELS
};


//[Environment]::SetEnvironmentVariable("HOME", "C:\Users\" + $env:USERNAME, "User")



