const express = require('express');
const cors = require('cors');

// ESM-compatible node-fetch shim for CommonJS
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) =>
    fetch(...args)
  );


const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;
const OLLAMA_URL = 'http://127.0.0.1:11434/api/chat';

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

app.post('/score-mission', async (req, res) => {
  try {
    const {
      missionText,
      reflection,
      currentXp,
      streak,
      tier,
    } = req.body || {};
    // If user clearly didn't do it, keep XP low.
// This is a hard rule so we don't reward "no" answers.
if (
  !reflection ||
  reflection.trim().length === 0 ||
  /^(no|nope|nah)$/i.test(reflection.trim()) ||
  /didn.?t do/i.test(reflection) ||
  /nothing/i.test(reflection)
) {
  return res.json({
    xp: 10,
    note: "Thanks for being honest. Notice this moment and let's try a small rep next time.",
  });
}

    if (!missionText) {
      return res.status(400).json({ error: 'missionText is required' });
    }

const systemPrompt = `
You are Riff, a calm Swell coach.

You read:
- the mission text
- a short reflection of what they actually did

Assign XP from 10 to 60 based ONLY on effort and specificity.

Rules:
- 10-14: they did not do it, or it's clearly "no", "nothing", or stalling.
- 15-25: tiny or vague effort, not very specific.
- 26-40: clear, concrete real action that matches the mission.
- 41-50: strong follow-through with impact or thoughtfulness.
- 51-60: high-friction, vulnerable, or very meaningful behavior.

Stretch missions can lean slightly higher, easy missions slightly lower,
but never give more than 20 XP if they admit they did nothing.

Return ONLY valid JSON:
{ "xp": number, "note": "one short kind sentence" }
`.trim();


    const userPrompt = `
Mission: "${missionText}"
Tier: "${tier || 'unknown'}"
Reflection: "${reflection || ''}"
Current XP: ${currentXp || 0}
Streak: ${streak || 0}
`.trim();

    const ollamaRes = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1', // ensure `ollama pull llama3.1`
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!ollamaRes.ok) {
      const text = await ollamaRes.text();
      console.error('Ollama error:', text);
      return res.status(500).json({ error: 'model request failed' });
    }

    const data = await ollamaRes.json();

    let parsed = {};
    try {
      parsed = JSON.parse(data.message.content);
    } catch (e) {
      console.error('JSON parse error:', e, data.message?.content);
    }

    let xp = typeof parsed.xp === 'number' ? parsed.xp : 20;
    let note =
      typeof parsed.note === 'string'
        ? parsed.note
        : 'Nice rep. Keep going.';

    if (tier === 'stretch') xp += 4;
    if (tier === 'core') xp += 2;
    xp = clamp(xp, 10, 60);

    return res.json({ xp, note });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Scoring server running on :${PORT}`);
});

