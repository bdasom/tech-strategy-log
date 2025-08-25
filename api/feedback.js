// (선택) 명시적으로 Node 런타임 사용
export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // --- Body parse (직접 파싱: 프레임워크 없이도 안전) ---
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const bodyText = Buffer.concat(chunks).toString('utf8') || '{}';
    let entry;
    try { entry = JSON.parse(bodyText).entry; } catch { entry = null; }
    if (!entry) return res.status(400).json({ error: 'Missing entry' });

    // --- Env 체크 로그 ---
    const hasEnv = !!process.env.OPENAI_API_KEY;
    console.log('OPENAI_API_KEY present:', hasEnv);

    if (!hasEnv) {
      return res.status(500).json({ error: 'OPENAI_API_KEY missing' });
    }

    // --- OpenAI 호출 ---
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

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      })
    });

    if (!r.ok) {
      const text = await r.text();
      console.error('OpenAI error:', r.status, text);
      return res.status(500).json({ error: 'OpenAI error', detail: text });
    }

    const data = await r.json();
    const content = data.choices?.[0]?.message?.content || '(no content)';
    return res.status(200).json({ feedback: content });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || String(e) });
  }
}
