const express = require('express');
const router = express.Router();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const axios = require('axios');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY
});

// Voice conversation memory (stores last 10 messages per session)
const voiceMemory = new Map();
const MAX_HISTORY = 10; // Keep last 10 messages
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Clean up old sessions periodically
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, data] of voiceMemory.entries()) {
        if (now - data.lastActive > SESSION_TIMEOUT) {
            voiceMemory.delete(sessionId);
            console.log(`🧹 Cleaned up voice session: ${sessionId}`);
        }
    }
}, 5 * 60 * 1000); // Check every 5 minutes

// Voice-optimized system prompt (Telugu, expressive, conversational)
const VOICE_SYSTEM_PROMPT = `You are Riya (రియా), a super friendly AI assistant from KL University (KLH). You ALWAYS respond in TELUGU language only. Your name is Riya and you should refer to yourself as Riya when needed.

స్టైల్:
- మీరు ఒక స్నేహపూర్వక, వెచ్చని, సహజమైన స్వరంలో మాట్లాడాలి
- చాలా క్యాజువల్ గా, ఫ్రెండ్లీగా ఉండండి - like talking to a close friend!
- Use natural Telugu fillers like "అరే", "హా", "అవును", "చెప్పు", "ఓహో!"
- Be CONCISE: aim for 50-80 words max
- NO MARKDOWN (no **, *, bullets, tables)
- Speak in clear, natural paragraphs

EXPRESSIONS (use these naturally for emotion):
- [laughs] or [chuckles] - హాస్యం లేదా స్నేహపూర్వక క్షణాలకు
- [sighs] - సానుభూతి లేదా సవాళ్లను వివరించేటప్పుడు
- [gasps] - ఉత్సాహం లేదా ఆశ్చర్యానికి
- Use these sparingly and naturally, not every response

TONE:
- Talk like a caring friend, not a formal assistant
- Show genuine interest and enthusiasm
- Use warm expressions like "అరే బాగుంది!", "సూపర్!", "చాలా బాగా అడిగావ్!"

You help students with info about KLH University (Hyderabad/Vijayawada):
- Admissions, fees, programs
- Placements, campus life
- Scholarships

IMPORTANT: If user speaks in English or Hindi, understand them but ALWAYS respond in TELUGU only.
If unsure about something, suggest contacting admission helpdesk.`;

/**
 * POST /api/voice/quick-chat
 * Fast voice chat endpoint - skips web scraping for immediate response
 */
router.post('/quick-chat', async (req, res) => {
    try {
        const { message, model = 'cloudflare', sessionId = 'default' } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log(`🎤 Quick voice chat(${model})[${sessionId}]: "${message.substring(0, 50)}..."`);

        // Get or create conversation history for this session
        if (!voiceMemory.has(sessionId)) {
            voiceMemory.set(sessionId, { history: [], lastActive: Date.now() });
        }
        const session = voiceMemory.get(sessionId);
        session.lastActive = Date.now();
        const history = session.history;

        let answer = null;
        const systemPrompt = VOICE_SYSTEM_PROMPT + '\n\nRemember: You have memory of this conversation. Use context from previous messages when relevant. ALWAYS respond in TELUGU only, even if user speaks English or Hindi.';

        // Route to selected model
        if (model === 'cloudflare') {
            try {
                const PRIMARY_API_KEY = process.env.PRIMARY_API_KEY;
                const PRIMARY_BASE_URL = (process.env.PRIMARY_BASE_URL || '').replace(/\/$/, '');
                const response = await axios.post(`${PRIMARY_BASE_URL}/chat/completions`, {
                    model: '@cf/mistralai/mistral-small-3.1-24b-instruct',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...history,
                        { role: 'user', content: message }
                    ],
                    max_tokens: 300,
                    temperature: 0.7
                }, {
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${PRIMARY_API_KEY}` },
                    timeout: 20000
                });
                if (response.data?.choices?.[0]?.message?.content) {
                    answer = response.data.choices[0].message.content;
                    console.log(`[CF] response (${answer.length} chars)`);
                }
            } catch (cfError) {
                console.log(`[CF] failed: ${cfError.message}`);
            }
        } else if (model === 'gemini') {
            // Try Gemini Flash
            try {
                const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

                // Build Gemini contents with history
                const contents = [];

                // Add conversation history
                for (const msg of history) {
                    contents.push({
                        role: msg.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: msg.content }]
                    });
                }

                // Add current message
                contents.push({
                    parts: [{ text: history.length === 0 ? `${systemPrompt}\n\nUser Question: ${message}` : message }]
                });

                const response = await axios.post(url, {
                    contents: contents,
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    generationConfig: {
                        maxOutputTokens: 256,
                        temperature: 0.7
                    }
                }, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000
                });

                if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                    answer = response.data.candidates[0].content.parts[0].text;
                    console.log(`✅ Gemini response (${answer.length} chars)`);
                }
            } catch (geminiError) {
                console.log(`⚠️ Gemini failed (${geminiError.response?.status || geminiError.message})`);
            }
        } else {
            // Use iFlow API for DeepSeek and Qwen models
            try {
                const IFLOW_API_KEY = process.env.IFLOW_API_KEY;
                const modelMap = {
                    'deepseek-v3': 'deepseek-v3',
                    'qwen3-235b': 'Qwen3-235B-A22B-Instruct'
                };
                const iflowModel = modelMap[model] || 'deepseek-v3';

                const response = await axios.post('https://apis.iflow.cn/v1/chat/completions', {
                    model: iflowModel,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...history, // Include conversation history
                        { role: 'user', content: message }
                    ],
                    max_tokens: 300
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${IFLOW_API_KEY}`
                    },
                    timeout: 20000
                });

                if (response.data?.choices?.[0]?.message?.content) {
                    answer = response.data.choices[0].message.content;
                    console.log(`✅ ${model} response (${answer.length} chars)`);
                }
            } catch (iflowError) {
                console.log(`⚠️ ${model} failed: ${iflowError.message}`);
            }
        }

        // Fallback to iFlow API if Gemini fails (rate limit, etc.)
        if (!answer) {
            try {
                const IFLOW_API_KEY = process.env.IFLOW_API_KEY;
                const response = await axios.post('https://apis.iflow.cn/v1/chat/completions', {
                    model: 'deepseek-v3',
                    messages: [
                        { role: 'system', content: VOICE_SYSTEM_PROMPT + '\n\nIMPORTANT: Always respond in ENGLISH unless the user specifically asks in another language.' },
                        ...history, // Include conversation history
                        { role: 'user', content: message }
                    ],
                    max_tokens: 300
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${IFLOW_API_KEY}`
                    },
                    timeout: 15000
                });

                if (response.data?.choices?.[0]?.message?.content) {
                    answer = response.data.choices[0].message.content;
                    console.log(`✅ DeepSeek fallback response (${answer.length} chars)`);
                }
            } catch (iflowError) {
                console.log(`⚠️ iFlow also failed: ${iflowError.message}`);
            }
        }

        if (answer) {
            // Clean the response - remove <think> tags and other non-speakable content
            let cleanAnswer = answer
                .replace(/<think>[\s\S]*?<\/think>/gi, '')  // Remove <think>...</think> blocks
                .replace(/<[^>]+>/g, '')  // Remove any remaining HTML/XML tags
                .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold markdown
                .replace(/\*([^*]+)\*/g, '$1')  // Remove italic markdown
                .replace(/#{1,6}\s/g, '')  // Remove headers
                .replace(/```[\s\S]*?```/g, '')  // Remove code blocks
                .replace(/`([^`]+)`/g, '$1')  // Remove inline code
                .replace(/\n{3,}/g, '\n\n')  // Reduce multiple newlines
                .trim();

            console.log(`📝 Cleaned response (${cleanAnswer.length} chars)`);

            // Save to conversation history
            history.push({ role: 'user', content: message });
            history.push({ role: 'assistant', content: cleanAnswer });

            // Keep only last MAX_HISTORY messages
            while (history.length > MAX_HISTORY) {
                history.shift();
            }
            console.log(`💾 Voice memory: ${history.length} messages for session ${sessionId}`);

            return res.json({
                success: true,
                response: cleanAnswer
            });
        }

        throw new Error('All AI APIs failed');
    } catch (error) {
        console.error('❌ Quick chat error:', error.message);
        res.json({
            success: true, // Return success so frontend can speak the error message
            response: "I'm having a bit of trouble connecting right now. Could you please try asking again in a moment?"
        });
    }
});

/**
 * POST /api/voice/speak
 * Converts text to speech using ElevenLabs API
 */
router.post('/speak', async (req, res) => {
    try {
        const { text, voiceId } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        if (!ELEVENLABS_API_KEY) {
            return res.status(500).json({ error: 'ElevenLabs API key not configured' });
        }

        // Use requested voice ID or fallback to env/default
        const targetVoiceId = voiceId || ELEVENLABS_VOICE_ID;

        console.log(`🔊 Converting to speech (${targetVoiceId}):`, text.substring(0, 50) + '...');

        // Use ElevenLabs SDK for text-to-speech (STREAMING)
        const audioStream = await elevenlabs.textToSpeech.convert(
            targetVoiceId,
            {
                text: text,
                modelId: 'eleven_v3', // Eleven v3 (alpha) - Most expressive
                outputFormat: 'mp3_44100_128'
            }
        );

        console.log('✅ Generating speech...');

        // Use buffered response for reliability (streaming was cutting off)
        const chunks = [];
        for await (const chunk of audioStream) {
            chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);

        console.log(`🔉 Audio buffer size: ${audioBuffer.length} bytes`);

        if (audioBuffer.length === 0) {
            throw new Error('Empty audio buffer received from ElevenLabs');
        }

        // Set headers for audio response
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length
        });

        res.send(audioBuffer);

        console.log('✅ Audio sent successfully');

    } catch (error) {
        console.error('❌ ElevenLabs TTS Error:', error.message);
        res.status(500).json({
            error: 'Failed to generate speech',
            details: error.message
        });
    }
});

/**
 * GET /api/voice/voices
 * Get list of available voices
 */
router.get('/voices', async (req, res) => {
    try {
        const voices = await elevenlabs.voices.getAll();
        res.json(voices);
    } catch (error) {
        console.error('❌ Error fetching voices:', error.message);
        res.status(500).json({ error: 'Failed to fetch voices', details: error.message });
    }
});

module.exports = router;
