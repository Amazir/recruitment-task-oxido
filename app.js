import fs from 'fs';
import { OpenAI } from 'openai';
import { OPENAI_API_KEY, INPUT_FILE_PATH, OPENAI_MODEL } from './config.js';

// OpenAI API object creation with configuration
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

function saveArticlePreviewToFile(outputPath, articleContent) {
    const fullPreviewContent = fs.readFileSync("./szablon.html", 'utf8').replace(
        '<body>',
        `<body>\n${articleContent}\n`
    );

    fs.writeFileSync(outputPath, fullPreviewContent, 'utf8');
    console.log(`Article preview saved to ${outputPath}`);
}

// Function to sending prompt and getting respond from OpenAI API
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
          - Include <img> tags with src="image_placeholder.jpg" and descriptive alt attributes for image prompts in places in website that you think is great for photo but with a little suggestion: 
          put at least one photo in one paragraph, then put in alt attribute prompt that can be used to generate photo like that. Under the photos you should put short description note with explanation
          what is on the photo in same language the input file is.
          - Add captions under images using <figcaption>.
          - Do not include any <html>, <head>, or <body> tags.`
                },
                {
                    role: 'user',
                    content: articleContent,
                }
            ],
            max_tokens: 1500,
            temperature: 0.5,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error communicating with OpenAI API:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Main function
async function main() {
    console.log('Reading article...');
    const articleContent = fs.readFileSync(INPUT_FILE_PATH, 'utf8');

    console.log('Processing article with OpenAI...');
    const htmlContent = await processArticleWithOpenAI(articleContent);

    console.log('Saving full article preview...');
    saveArticlePreviewToFile('./output/podglad.html', htmlContent);
}


main();
