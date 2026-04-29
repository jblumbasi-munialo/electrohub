// api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, products } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: 'Groq API key not configured on server.' });
  }

  const systemPrompt = `You are a helpful assistant for ElectroHub, an electronics shop in Kenya.
Rules:
- Answer in **50 words or fewer** total.
- Never exceed 50 words, even if the user asks for more.
- Use Kenyan Shillings (KES).
- Always recommend from this exact product list: ${JSON.stringify(products)}.
- Be concise, friendly, and direct. Give only the best match and its price.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 80,           // enough for ~50 words
        temperature: 0.7
      })
    });

    const data = await response.json();
    console.log('Groq API response:', JSON.stringify(data, null, 2));

    if (data.error) {
      return res.status(200).json({ reply: `API error: ${data.error.message || JSON.stringify(data.error)}` });
    }

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      return res.status(200).json({ reply: 'Sorry, no response from the assistant.' });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Groq API call failed:', error);
    return res.status(500).json({ reply: 'The assistant is temporarily unavailable.' });
  }
}
