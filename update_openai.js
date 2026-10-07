const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'hp', 'Desktop', 'CHATKLUNI', 'public', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// Replace main model selector occurrence
content = content.replace(
    '<img src="icons/openai.png" class="provider-img frenix-logo" alt="OpenAI">\n                                                    Open AI',
    '<img src="icons/openai-v3.png" class="provider-img openai-logo-large" alt="OpenAI">\n                                                    OpenAI'
);

// Replace fixed input area occurrence
content = content.replace(
    '<img src="icons/openai.png" class="provider-img frenix-logo" alt="OpenAI">\n                                                Open AI',
    '<img src="icons/openai-v3.png" class="provider-img openai-logo-large" alt="OpenAI">\n                                                OpenAI'
);

// If the above didn't match (due to line ending differences), try a more robust regex
if (content.includes('icons/openai.png')) {
    content = content.replace(/icons\/openai\.png/g, 'icons/openai-v3.png');
    content = content.replace(/frenix-logo/g, 'openai-logo-large');
    content = content.replace(/Open AI/g, 'OpenAI');
}

fs.writeFileSync(filePath, content);
console.log('Replacement complete.');
