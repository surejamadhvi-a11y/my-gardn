import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

// Explicitly load .env from the project root regardless of where node is called from
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌  ANTHROPIC_API_KEY not found — check your .env file');
  process.exit(1);
}
console.log('✅  API key loaded');

const app = express();
const ai  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '20mb' }));

app.post('/api/advisor', async (req, res) => {
  const { messages, plants, model } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  let systemPrompt;
  if (plants && plants.length > 0) {
    const plantList = plants.map(p => `${p.name} (${p.growthStage})`).join(', ');
    systemPrompt = `You are a plant care assistant in the My Gardn app. The user is currently growing: ${plantList}. Give advice specific to their actual plants when relevant.`;
  } else {
    systemPrompt = 'You are a helpful plant care assistant in the My Gardn app. Give practical, friendly advice about plant care, gardening, and growing.';
  }

  try {
    const response = await ai.messages.create({
      model:      model || 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system:     systemPrompt,
      messages,
    });
    res.json(response);
  } catch (err) {
    const status = err.status || 500;
    console.error(`Anthropic error [${status}]:`, err.message);
    if (err.error) console.error('Error body:', JSON.stringify(err.error, null, 2));
    res.status(status).json({ error: err.message, status, details: err.error });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
