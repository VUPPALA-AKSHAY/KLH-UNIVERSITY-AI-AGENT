// Quick API test script
require('dotenv').config();
const axios = require('axios');

async function testGemini() {
    console.log('Testing Gemini API...');
    const key = process.env.GEMINI_API_KEY;
    console.log('Key:', key?.substring(0, 10) + '...');

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
            { contents: [{ parts: [{ text: 'Say hello' }] }] },
            { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
        );
        console.log('✅ Gemini OK:', response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 50));
    } catch (error) {
        console.log('❌ Gemini Error:', error.response?.status, error.response?.data?.error?.message || error.message);
    }
}

async function testIFlow() {
    console.log('\nTesting iFlow API...');
    const key = process.env.IFLOW_API_KEY;
    console.log('Key:', key?.substring(0, 10) + '...');

    try {
        const response = await axios.post(
            'https://apis.iflow.cn/v1/chat/completions',
            { model: 'deepseek-v3', messages: [{ role: 'user', content: 'Hi' }], max_tokens: 50 },
            { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` }, timeout: 15000 }
        );
        console.log('✅ iFlow OK:', response.data?.choices?.[0]?.message?.content?.substring(0, 50));
    } catch (error) {
        console.log('❌ iFlow Error:', error.response?.status, error.response?.data?.error?.message || error.message);
    }
}

(async () => {
    await testGemini();
    await testIFlow();
    console.log('\nDone!');
})();
