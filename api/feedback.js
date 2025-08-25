module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const entry = (req.body && req.body.entry) ? req.body.entry : null;
    if (!entry) return res.status(400).json({ error: 'Missing entry' });

    const clip = (s, n=4000) => (s || '').slice(0, n);
    const prompt = `
You are a tough, concise product/tech strategist.
Summarize, critique, and extend the user's note with:
- 1-line distillation
- 2–3 sharp critiques (assumptions, metrics, comparables)
- Actionable next step (1)
- Related global angle or company to watch (1)
Keep the response language same as entry.lang: ${entry.lang}.

ENTRY:
date: ${entry.date}
lang: ${entry.lang}
category: ${entry.category}
industry: ${entry.industry}
one-liner: ${clip(entry.one, 300)}
read: ${clip(entry.read)}
idea: ${clip(entry.idea)}
flow: ${clip(entry.flow)}
rich (html stripped): ${clip((entry.rich || '').replace(/<[^>]+>/g,' '), 1500)}
tags: ${(entry.tags || []).join(', ')}
    `.trim();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY missing' });

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      })
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(500).json({ error: 'OpenAI error', detail: text });
    }

    const data = await r.json();
    const content = data.choices?.[0]?.message?.content || '(no content)';
    return res.status(200).json({ feedback: content });
  } catch (e) {
    return res.status(500).json({ error: e.message || String(e) });
  }
};
