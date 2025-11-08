// Simple test file to verify basic functionality without OpenAI
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Basic server is running' });
});

// Test FAQ endpoint without OpenAI
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    console.log(`Message received: "${message}" from ${sessionId}`);

    // Basic response without OpenAI
    const responses = [
      "I can help you find products! Try asking about specific items by name or category.",
      "I can assist with orders! Please provide your order ID for tracking.",
      "I'm here to help with shipping questions! Where would you like to ship your order?",
      "I can help with returns and payments! What do you need assistance with?"
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const answer = `${randomResponse} (Test mode - no OpenAI API)`;

    res.json({
      answer,
      sources: [],
      clarification: []
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test FAQ upload endpoint
app.post('/api/faq/upload', (req, res) => {
  try {
    console.log('FAQ upload request received');

    // Simple test response
    res.json({
      ok: true,
      sourceId: `test-${Date.now()}`,
      chunks: 5
    });
  } catch (error) {
    console.error('FAQ upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Test database setup endpoint
app.post('/api/setup/test-connection', (req, res) => {
  try {
    console.log('Database test request received');

    // Simple test response
    res.json({
      ok: true,
      message: 'Database connection test passed (test mode)'
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: 'Connection test failed' });
  }
});

app.post('/api/setup/save', (req, res) => {
  try {
    console.log('Database save request received');

    res.json({
      ok: true,
      message: 'Configuration saved (test mode)'
    });
  } catch (error) {
    console.error('Database save error:', error);
    res.status(500).json({ error: 'Save failed' });
  }
});

const PORT = 4002;
app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log('📊 Available endpoints:');
  console.log('   GET  /health - Health check');
  console.log('   POST /api/chat - Chat functionality');
  console.log('   POST /api/faq/upload - File upload');
  console.log('   POST /api/setup/test-connection - Database test');
  console.log('   POST /api/setup/save - Database save');
});