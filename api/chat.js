// api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, products } = req.body;
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: 'DeepSeek API key not configured on server.' });
  }

  const systemPrompt = `You are an AI assistant for ElectroHub, an electronics marketplace in Kenya. 
You have access to the current product list: ${JSON.stringify(products)}.
Help users find products, give recommendations, answer questions about electronics, and assist with shopping.
Keep responses friendly, concise, and use Kenyan Shillings (KES).`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I couldn't process that request.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('DeepSeek API error:', error);
    return res.status(500).json({ reply: 'The assistant is temporarily unavailable.' });
  }
}
