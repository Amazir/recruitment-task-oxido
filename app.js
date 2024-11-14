import fs from 'fs/promises';
import path from 'path';
import { OpenAI } from 'openai';
import { OPENAI_API_KEY, INPUT_FILE_PATH, OPENAI_MODEL } from './config.js';

// OpenAI API object creation with configuration
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Function for communication with OpenAI
async function processArticleWithOpenAI(articleContent) {
    try {
        const response = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: `You are an AI that converts plain text articles into well-structured HTML content.
                    The HTML should:
                    - Use appropriate tags like <h1>, <h2>, <p>, <ul>, <li>, <img>, and <figcaption>.
                    - Include <img> tags with src="image_placeholder.jpg" and descriptive alt attributes for image prompts.
                    - Add captions under images using <figcaption>.
                    - Do not include any <html>, <head>, or <body> tags.`,
                },
                {
                    role: 'user',
                    content: articleContent,
                }
            ],
            max_tokens: 1500,
            temperature: 0.5,
        });

        if (response?.choices?.[0]?.message?.content) {
            return response.choices[0].message.content;
        } else {
            throw new Error('No response content from OpenAI API');
        }
    } catch (error) {
        console.error('Error communicating with OpenAI API:', error.response?.data || error.message);
        throw error;
    }
}

// Function for generating preview from template and injecting into it body data from OpenAI
async function generateFullPreview(templatePath, articleContent) {
    const template = await fs.readFile(templatePath, 'utf8');
    return template.replace('<body>', `<body>\n${articleContent}\n`);
}

// Function to saving article into file
async function saveToFile(outputPath, content) {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, content, 'utf8');
    console.log(`Article preview saved to ${outputPath}`);
}

// Main  function
(async () => {
    try {
        console.log('Reading article...');
        const articleContent = await fs.readFile(INPUT_FILE_PATH, 'utf8');

        console.log('Processing article with OpenAI...');
        const htmlContent = await processArticleWithOpenAI(articleContent);

        console.log('Generating raw article file...');
        await saveToFile('./output/article.html', htmlContent);

        console.log('Generating full preview...');
        const fullPreview = await generateFullPreview('./szablon.html', htmlContent);

        console.log('Saving full article preview...');
        await saveToFile('./output/podglad.html', fullPreview);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();
