import os

file_path = r'c:\Users\hp\Desktop\CHATKLUNI\public\index.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace main model selector occurrence
content = content.replace(
    '<img src="icons/openai.png" class="provider-img frenix-logo" alt="OpenAI">\n                                                    Open AI',
    '<img src="icons/openai-v3.png" class="provider-img openai-logo-large" alt="OpenAI">\n                                                    OpenAI'
)

# Replace fixed input area occurrence
content = content.replace(
    '<img src="icons/openai.png" class="provider-img frenix-logo" alt="OpenAI">\n                                                Open AI',
    '<img src="icons/openai-v3.png" class="provider-img openai-logo-large" alt="OpenAI">\n                                                OpenAI'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
