const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8"
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    if (request.method !== "POST") return json({ error: "Use POST." }, 405);
    if (!env.GEMINI_API_KEY) return json({ error: "Server Gemini API key is not configured." }, 500);

    try {
      const body = await request.json();
      const imageBase64 = body.imageBase64;
      const mimeType = body.mimeType;
      if (typeof imageBase64 !== "string" || imageBase64.length < 100 || imageBase64.length > 8_000_000) {
        return json({ error: "Missing or oversized image." }, 400);
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) return json({ error: "Unsupported image type." }, 400);

      const model = env.GEMINI_MODEL || "gemini-3.8-flash";
      const prompt = `You are assisting an animal-rescue volunteer by reviewing one photo of a dog. This is NOT a veterinary diagnosis. Do not claim to detect internal injuries, pain, fever, or limping unless directly visible in the image. Only describe visual evidence. If the photo does not clearly show an injury, return uncertain rather than assuming the dog is healthy. Never recommend delaying veterinary care when severe injury is plausible. Return JSON only with these fields: status (one of possible_visible_injury, no_obvious_injury_visible, uncertain), urgency (one of emergency_vet_now, urgent_vet_today, routine_vet_advice, cannot_determine), observations (array of short strings describing visible evidence only), limitations (array of short strings), disclaimer (short reminder that a vet must verify). If you see severe bleeding, an open wound, a protruding bone, or a major trauma sign, recommend emergency veterinary attention. The photo may not show the full animal.`;

      const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: imageBase64 } }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
        })
      });
      const upstreamData = await upstream.json();
      if (!upstream.ok) {
        const detail = upstreamData?.error?.message || `Gemini API returned ${upstream.status}`;
        return json({ error: detail }, upstream.status >= 500 ? 502 : upstream.status);
      }
      const text = upstreamData?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
      if (!text) return json({ error: "Gemini returned no assessment. Try a clearer photo." }, 502);
      let assessment;
      try { assessment = JSON.parse(text); }
      catch { return json({ error: "Gemini response was not valid JSON. Please retry." }, 502); }
      return json({ assessment });
    } catch (error) {
      return json({ error: error?.message || "Request failed." }, 400);
    }
  }
};

function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: corsHeaders });
}
