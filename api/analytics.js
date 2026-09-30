import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const ANALYTICS_FILE = path.join(DATA_DIR, "analytics_events.json");

// Structure en mémoire
let analyticsData = {
  summary: {
    page_views: 0,
    publish_clicks: 0,
    publish_submits: 0,
    unlock_clicks: 0,
    unlock_modal_opens: 0,
    unlock_chariow_clicks: 0
  },
  events: []
};

function loadAnalytics() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(ANALYTICS_FILE)) {
      const content = fs.readFileSync(ANALYTICS_FILE, "utf-8");
      analyticsData = JSON.parse(content || "{}");
      if (!analyticsData.summary) {
        analyticsData.summary = {
          page_views: 0,
          publish_clicks: 0,
          publish_submits: 0,
          unlock_clicks: 0,
          unlock_modal_opens: 0,
          unlock_chariow_clicks: 0
        };
      }
      if (!Array.isArray(analyticsData.events)) {
        analyticsData.events = [];
      }
    }
  } catch (err) {
    console.error("[Analytics] Error reading store:", err.message);
  }
  return analyticsData;
}

function saveAnalytics() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    // Conserver au maximum 500 derniers événements récents (anonymes)
    if (analyticsData.events.length > 500) {
      analyticsData.events = analyticsData.events.slice(-500);
    }
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analyticsData, null, 2), "utf-8");
  } catch (err) {
    console.error("[Analytics] Error writing store:", err.message);
  }
}

loadAnalytics();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET : Obtenir les statistiques du tunnel de conversion (sans données personnelles)
  if (req.method === "GET") {
    const data = loadAnalytics();
    const s = data.summary;

    // Calcul des taux de conversion des entonnoirs
    // Tunnel 1 : Publication d'annonce (Clic bouton -> Soumission validée)
    const publishRate = s.publish_clicks > 0
      ? Math.round((s.publish_submits / s.publish_clicks) * 1000) / 10
      : 0;

    // Tunnel 2 : Déblocage WhatsApp (Clic carte -> Modal ouverte -> Clic Chariow)
    const unlockModalRate = s.unlock_clicks > 0
      ? Math.round((s.unlock_modal_opens / s.unlock_clicks) * 1000) / 10
      : 0;
    const unlockPayRate = s.unlock_modal_opens > 0
      ? Math.round((s.unlock_chariow_clicks / s.unlock_modal_opens) * 1000) / 10
      : 0;
    const unlockOverallRate = s.unlock_clicks > 0
      ? Math.round((s.unlock_chariow_clicks / s.unlock_clicks) * 1000) / 10
      : 0;

    return res.status(200).json({
      success: true,
      summary: s,
      funnels: {
        publication: {
          step1_clicks: s.publish_clicks,
          step2_submits: s.publish_submits,
          conversion_rate: publishRate
        },
        unlock: {
          step1_clicks: s.unlock_clicks,
          step2_modal_opens: s.unlock_modal_opens,
          step3_chariow_pay_clicks: s.unlock_chariow_clicks,
          modal_open_rate: unlockModalRate,
          pay_rate_from_modal: unlockPayRate,
          overall_conversion_rate: unlockOverallRate
        }
      },
      recentEvents: data.events.slice(-50).reverse()
    });
  }

  // POST : Enregistrer un événement anonyme de conversion ou actions de gestion
  if (req.method === "POST") {
    const body = req.body || {};

    // Action d'initialisation de données de démonstration réalistes
    if (body.action === "seed_demo") {
      analyticsData = {
        summary: {
          page_views: 184,
          publish_clicks: 46,
          publish_submits: 34,
          unlock_clicks: 82,
          unlock_modal_opens: 61,
          unlock_chariow_clicks: 25
        },
        events: [
          { id: `evt-demo-1`, eventName: "page_view", source: "home", device: "mobile", timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
          { id: `evt-demo-2`, eventName: "publish_click", source: "header_btn", device: "desktop", timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString() },
          { id: `evt-demo-3`, eventName: "publish_submit", source: "modal_form", device: "desktop", timestamp: new Date(Date.now() - 3600000 * 3.3).toISOString() },
          { id: `evt-demo-4`, eventName: "unlock_click", source: "card", device: "mobile", annonceRef: "ANN-101", timestamp: new Date(Date.now() - 3600000 * 3).toISOString() },
          { id: `evt-demo-5`, eventName: "unlock_modal_open", source: "modal", device: "mobile", annonceRef: "ANN-101", timestamp: new Date(Date.now() - 3600000 * 2.9).toISOString() },
          { id: `evt-demo-6`, eventName: "unlock_chariow_click", source: "modal_pay_btn", device: "mobile", annonceRef: "ANN-101", timestamp: new Date(Date.now() - 3600000 * 2.8).toISOString() },
          { id: `evt-demo-7`, eventName: "unlock_click", source: "catalogue", device: "desktop", annonceRef: "ANN-104", timestamp: new Date(Date.now() - 3600000 * 2.1).toISOString() },
          { id: `evt-demo-8`, eventName: "unlock_modal_open", source: "modal", device: "desktop", annonceRef: "ANN-104", timestamp: new Date(Date.now() - 3600000 * 2.0).toISOString() },
          { id: `evt-demo-9`, eventName: "publish_click", source: "hero_btn", device: "mobile", timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString() },
          { id: `evt-demo-10`, eventName: "publish_submit", source: "modal_form", device: "mobile", timestamp: new Date(Date.now() - 3600000 * 1.3).toISOString() },
          { id: `evt-demo-11`, eventName: "unlock_click", source: "card", device: "mobile", annonceRef: "ANN-108", timestamp: new Date(Date.now() - 3600000 * 0.8).toISOString() },
          { id: `evt-demo-12`, eventName: "unlock_modal_open", source: "modal", device: "mobile", annonceRef: "ANN-108", timestamp: new Date(Date.now() - 3600000 * 0.7).toISOString() },
          { id: `evt-demo-13`, eventName: "unlock_chariow_click", source: "modal_pay_btn", device: "mobile", annonceRef: "ANN-108", timestamp: new Date(Date.now() - 3600000 * 0.6).toISOString() },
          { id: `evt-demo-14`, eventName: "page_view", source: "catalogue", device: "mobile", timestamp: new Date().toISOString() }
        ]
      };
      saveAnalytics();
      return res.status(200).json({ success: true, message: "Données de démonstration initialisées avec succès." });
    }

    // Action de réinitialisation à zéro
    if (body.action === "reset") {
      analyticsData = {
        summary: {
          page_views: 0,
          publish_clicks: 0,
          publish_submits: 0,
          unlock_clicks: 0,
          unlock_modal_opens: 0,
          unlock_chariow_clicks: 0
        },
        events: []
      };
      saveAnalytics();
      return res.status(200).json({ success: true, message: "Statistiques réinitialisées." });
    }

    const {
      eventName, // 'publish_click' | 'publish_submit' | 'unlock_click' | 'unlock_modal_open' | 'unlock_chariow_click' | 'page_view'
      source = "unknown", // 'header' | 'hero' | 'card' | 'bottom' | 'modal'
      device = "desktop", // 'mobile' | 'tablet' | 'desktop'
      annonceId = null
    } = body;

    if (!eventName) {
      return res.status(400).json({ error: "eventName requis." });
    }

    // Incrémentation des compteurs aggrégés
    const s = analyticsData.summary;
    if (eventName === "page_view") s.page_views = (s.page_views || 0) + 1;
    else if (eventName === "publish_click") s.publish_clicks = (s.publish_clicks || 0) + 1;
    else if (eventName === "publish_submit") s.publish_submits = (s.publish_submits || 0) + 1;
    else if (eventName === "unlock_click") s.unlock_clicks = (s.unlock_clicks || 0) + 1;
    else if (eventName === "unlock_modal_open") s.unlock_modal_opens = (s.unlock_modal_opens || 0) + 1;
    else if (eventName === "unlock_chariow_click") s.unlock_chariow_clicks = (s.unlock_chariow_clicks || 0) + 1;

    // Enregistrement de l'événement STRICTEMENT ANONYMISÉ
    const anonymousEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventName,
      source: String(source).substring(0, 30),
      device: String(device).substring(0, 20),
      annonceRef: annonceId ? String(annonceId).substring(0, 20) : null,
      timestamp: new Date().toISOString()
    };

    analyticsData.events.push(anonymousEvent);
    saveAnalytics();

    return res.status(200).json({
      success: true,
      tracked: eventName
    });
  }

  return res.status(405).json({ error: "Méthode non autorisée." });
}
