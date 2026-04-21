// AI Verification using OpenRouter (Gemini Flash)
// Analyzes image + text to verify authenticity of community-reported issues.

async function verifyProblemWithAI(title, description, imageBase64) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  // ─── Fallback: No API key configured ───────────────────────────────────────
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'mocked_key_for_now') {
    console.log('[AI] No OpenRouter key — using simulated verification.');
    return {
      score:    Math.floor(Math.random() * 20) + 80,
      verified: true,
      reason:   'Simulated: Image appears authentic. No duplicates found.',
      isUnique: true
    };
  }

  try {
    // Build message content — image is optional
    const content = [];

    // Always include text prompt
    content.push({
      type: 'text',
      text: `You are an AI verification assistant for a community problem-reporting platform.

Analyze the following problem report:
- Title: "${title}"
- Description: "${description}"

${imageBase64 ? 'Also analyze the attached image.' : 'No image was provided for this report.'}

Respond ONLY with a raw JSON object (no markdown, no code fences) with exactly these keys:
{
  "verified": <boolean — is this a genuine real-world issue?>,
  "score": <integer 0-100 — confidence that this is authentic>,
  "reason": <string — one sentence explaining your decision>,
  "isUnique": <boolean — does this appear to be a unique/new issue?>
}`
    });

    // Add image if provided
    if (imageBase64) {
      const imageUrl = imageBase64.startsWith('data:')
        ? imageBase64
        : `data:image/jpeg;base64,${imageBase64}`;
      content.push({
        type: 'image_url',
        image_url: { url: imageUrl }
      });
    }

    const payload = {
      model: 'google/gemini-flash-1.5',
      messages: [{ role: 'user', content }],
      response_format: { type: 'json_object' }
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AWAAZ Community Platform'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[AI] OpenRouter API error:', data);
      throw new Error(`OpenRouter returned ${response.status}: ${JSON.stringify(data.error || data)}`);
    }

    if (!data.choices?.[0]?.message?.content) {
      console.error('[AI] Unexpected response shape:', data);
      throw new Error('Invalid response from OpenRouter');
    }

    let raw = data.choices[0].message.content.trim();

    // Strip markdown code fences if AI wraps JSON in them
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    const result = JSON.parse(raw);

    console.log(`[AI] Verification complete — Score: ${result.score}, Verified: ${result.verified}`);
    return result;

  } catch (error) {
    console.error('[AI] Verification error:', error.message);
    // Graceful fallback — always let the problem through with a warning
    return {
      score:    60,
      verified: true,
      reason:   'AI verification unavailable. Submitted for manual review.',
      isUnique: true
    };
  }
}

module.exports = { verifyProblemWithAI };
