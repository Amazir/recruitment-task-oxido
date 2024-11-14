const fs = require('fs');
import OpenAI from 'openai';

// TODO: plik ze stałymi json

const openai = new OpenAI({
    apiKey: 'my api key',
});

const data = fs.readFileSync('article.txt', 'utf8');

console.log(data);