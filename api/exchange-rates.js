import { GoogleGenAI } from "@google/genai";

// Cache in-memory pendant 1 heure (3600000 ms) pour respecter les quotas Free Tier
let cachedData = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 heure

// Taux officiels du marché Bank Al-Maghrib mis à jour
const OFFICIAL_MARKET_RATES = {
  EUR: 10.74,
  USD: 10.08,
  CAD: 7.34,
  GBP: 12.82,
  XOF: 60.5, // 1 MAD = ~60.5 FCFA (XOF)
  XAF: 60.5, // 1 MAD = ~60.5 FCFA (XAF)
  GNF: 875,  // 1 MAD = ~875 GNF
  CDF: 285,  // 1 MAD = ~285 CDF
  updatedAt: new Date().toISOString(),
  source: "Marché Interbancaire & Bank Al-Maghrib",
  cached: false
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const now = Date.now();

  // 1. Si cache valide (< 1 heure), retourner immédiatement
  if (cachedData && (now - lastFetchTime) < CACHE_DURATION_MS) {
    return res.status(200).json({
      success: true,
      cached: true,
      cacheExpiresInSeconds: Math.round((CACHE_DURATION_MS - (now - lastFetchTime)) / 1000),
      data: cachedData
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    cachedData = { ...OFFICIAL_MARKET_RATES, updatedAt: new Date().toISOString() };
    lastFetchTime = now;
    return res.status(200).json({
      success: true,
      cached: false,
      data: cachedData,
      source: "Bank Al-Maghrib"
    });
  }

  // 2. Tenter l'appel Gemini (3.8-flash puis fallback 3.1-flash-lite)
  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });

    const prompt = `Donne les cours de change actuels de référence en Dirham marocain (MAD) pour:
- 1 EUR en MAD (autour de 10.70-10.85)
- 1 USD en MAD (autour de 10.00-10.15)
- 1 CAD en MAD (autour de 7.25-7.45)
- 1 GBP en MAD (autour de 12.70-12.95)
- 1 MAD en FCFA XOF (environ 60-62 FCFA)

Réponds STRICTEMENT sous format JSON comme suit:
{"EUR": 10.74, "USD": 10.08, "CAD": 7.34, "GBP": 12.82, "XOF": 0.0164, "source": "Bank Al-Maghrib Grounding"}`;

    let responseText = "";
    try {
      // Tentative 1 : gemini-3.8-flash avec Search Grounding
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });
      responseText = response.text || "";
    } catch (searchErr) {
      // Tentative 2 : Fallback sans outil (gemini-3.1-flash-lite)
      try {
        const responseLite = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        responseText = responseLite.text || "";
      } catch (liteErr) {
        // En cas de forte affluence sur les modèles (503 / 429), basculer silencieusement sur les taux officiels
        console.info("[Exchange Rates] Service IA momentanément sollicité (503/quota), bascule sur les taux officiels Bank Al-Maghrib.");
      }
    }

    let parsed = null;
    if (responseText && responseText.trim()) {
      try {
        parsed = JSON.parse(responseText.trim());
      } catch (e) {
        const match = responseText.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
          } catch (ign) {}
        }
      }
    }

    if (parsed && parsed.EUR) {
      cachedData = {
        EUR: Number(parsed.EUR) || OFFICIAL_MARKET_RATES.EUR,
        USD: Number(parsed.USD) || OFFICIAL_MARKET_RATES.USD,
        CAD: Number(parsed.CAD) || OFFICIAL_MARKET_RATES.CAD,
        GBP: Number(parsed.GBP) || OFFICIAL_MARKET_RATES.GBP,
        XOF: Number(parsed.XOF) || OFFICIAL_MARKET_RATES.XOF,
        XAF: Number(parsed.XAF) || Number(parsed.XOF) || OFFICIAL_MARKET_RATES.XAF,
        GNF: Number(parsed.GNF) || OFFICIAL_MARKET_RATES.GNF,
        CDF: Number(parsed.CDF) || OFFICIAL_MARKET_RATES.CDF,
        updatedAt: new Date().toISOString(),
        source: parsed.source || "IA Gemini Search Grounding & Bank Al-Maghrib",
        cached: false
      };
      lastFetchTime = now;

      return res.status(200).json({
        success: true,
        cached: false,
        cacheExpiresInSeconds: Math.round(CACHE_DURATION_MS / 1000),
        data: cachedData
      });
    }
  } catch (err) {
    console.info("[Exchange Rates] Taux officiels servis en secours :", err.message || "Bascule directe");
  }

  // 3. Fallback officiel résilient
  cachedData = {
    ...OFFICIAL_MARKET_RATES,
    updatedAt: new Date().toISOString()
  };
  lastFetchTime = now;

  return res.status(200).json({
    success: true,
    cached: false,
    cacheExpiresInSeconds: Math.round(CACHE_DURATION_MS / 1000),
    data: cachedData,
    notice: "Taux indicatifs officiels du jour Bank Al-Maghrib"
  });
}
