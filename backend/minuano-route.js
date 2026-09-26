/* Minuano IA — rota do servidor
 * POST /api/minuano  (exige login)  body: { system, messages:[{role:"user"|"assistant", content}] }
 * Resposta no formato { content: [{ type: "text", text }] }.
 *
 * Variaveis de ambiente (Render):
 *   GEMINI_API_KEY   chave gratuita do Google AI Studio (obrigatoria)
 *   MINUANO_MODEL    opcional (padrao: gemini-flash-latest)
 * A chave nunca vai para o navegador.
 */
const FALLBACK_MODELS = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-flash-lite-latest", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
const MAX_MESSAGES = 40;
const MAX_CHARS = 300000;

module.exports = function minuanoRoute(app, { authMiddleware, rateLimit }) {
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitas perguntas seguidas ao Minuano. Aguarde um minuto." }
  });

  app.get("/api/minuano/status", authMiddleware, (req, res) => {
    res.json({ enabled: Boolean(process.env.GEMINI_API_KEY) });
  });

  app.post("/api/minuano", limiter, authMiddleware, async (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(503).json({ error: "Minuano IA nao configurado (GEMINI_API_KEY)." });

    const { system, messages } = req.body || {};
    const valid = typeof system === "string"
      && Array.isArray(messages) && messages.length > 0 && messages.length <= MAX_MESSAGES
      && messages.every((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string");
    if (!valid) return res.status(400).json({ error: "Pedido invalido." });
    const size = system.length + messages.reduce((s, m) => s + m.content.length, 0);
    if (size > MAX_CHARS) return res.status(413).json({ error: "Pergunta grande demais." });

    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      generationConfig: { maxOutputTokens: 4096, temperature: 0.4 }
    });
    const models = [...new Set([process.env.MINUANO_MODEL, ...FALLBACK_MODELS].filter(Boolean))];
    let lastError = "Falha ao consultar a IA.";
    let lastStatus = 502;

    for (const model of models) {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
            method: "POST",
            headers: { "content-type": "application/json", "x-goog-api-key": key },
            body,
            signal: AbortSignal.timeout(45000)
          });
          const data = await r.json().catch(() => ({}));
          if (r.ok) {
            const text = (data.candidates?.[0]?.content?.parts || []).filter((p) => !p.thought).map((p) => p.text || "").join("").trim();
            if (text) return res.json({ content: [{ type: "text", text }], model });
            lastError = "Resposta vazia da IA.";
            break;
          }
          lastError = data?.error?.message || `HTTP ${r.status}`;
          lastStatus = r.status;
          if (r.status === 400 || r.status === 401 || r.status === 403) {
            console.error("Minuano IA:", lastError);
            return res.status(502).json({ error: "Chave da IA invalida ou sem permissao." });
          }
          if (r.status === 404) break;
        } catch (err) {
          lastError = err.name === "TimeoutError" ? "A IA demorou para responder." : err.message;
        }
        if (attempt === 0) await new Promise((ok) => setTimeout(ok, 1200));
      }
    }
    console.error("Minuano IA:", lastError);
    res.status(lastStatus === 429 ? 429 : 503).json({ error: lastError });
  });
};
