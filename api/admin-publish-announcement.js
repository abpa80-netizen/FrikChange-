import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const DATA_DIR = path.resolve(process.cwd(), "data");
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, "official_announcements.json");

// Cache en mémoire pour haute performance
let memoryAnnouncements = [];

function loadLocalAnnouncements() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(ANNOUNCEMENTS_FILE)) {
      const content = fs.readFileSync(ANNOUNCEMENTS_FILE, "utf-8");
      memoryAnnouncements = JSON.parse(content || "[]");
    }
  } catch (err) {
    console.error("[Announcements] Error reading local store:", err.message);
  }
  return memoryAnnouncements;
}

function saveLocalAnnouncements(list) {
  memoryAnnouncements = list;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("[Announcements] Error writing local store:", err.message);
  }
}

// Initialiser le cache
loadLocalAnnouncements();

// Initialiser Supabase client si configuré
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key && url !== "https://your-project.supabase.co") {
    try {
      return createClient(url, key);
    } catch (e) {
      console.warn("[Announcements] Supabase client init warning:", e.message);
    }
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const supabase = getSupabaseClient();

  // GET : Récupérer toutes les annonces officielles pour la page publique et l'admin
  if (req.method === "GET") {
    let announcements = loadLocalAnnouncements();

    // Si Supabase est connecté, tenter de synchroniser
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          // Fusionner avec les données locales
          announcements = data.map(item => ({
            id: item.id || `ann-${Date.now()}`,
            title: item.title,
            textFr: item.text_fr || item.textFr || item.content,
            textDarija: item.text_darija || item.textDarija,
            fullText: item.full_text || item.fullText || item.content,
            imageUrl: item.image_url || item.imageUrl,
            badge: "Annonce Officielle",
            isOfficial: true,
            priority: item.priority || 1,
            author: item.author || "Équipe FrikChange",
            createdAt: item.created_at || item.createdAt || new Date().toISOString(),
            status: item.status || "active"
          }));
        }
      } catch (sbErr) {
        console.warn("[Announcements] Supabase fetch fallback to local store:", sbErr.message);
      }
    }

    // Filtrer les annonces actives et trier par priorité
    const activeAnnouncements = announcements
      .filter(a => a.status !== "archived")
      .sort((a, b) => (b.priority || 1) - (a.priority || 1) || new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      total: activeAnnouncements.length,
      announcements: activeAnnouncements,
      storage: supabase ? "supabase+local" : "local-persistent"
    });
  }

  // POST : Publier une nouvelle annonce officielle depuis le Studio Marketing
  if (req.method === "POST") {
    const {
      title,
      textFr,
      textDarija,
      fullText,
      imageUrl,
      category = "officiel",
      author = "Direction FrikChange",
      priority = 10
    } = req.body || {};

    if (!title && !textFr) {
      return res.status(400).json({ error: "Le titre et le texte de l'annonce sont requis." });
    }

    const newAnnouncement = {
      id: `official-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title || "Annonce Officielle FrikChange",
      textFr: textFr || "",
      textDarija: textDarija || "",
      fullText: fullText || textFr || "",
      imageUrl: imageUrl || "",
      badge: "Annonce Officielle",
      isOfficial: true,
      category,
      priority: Number(priority) || 10,
      author,
      createdAt: new Date().toISOString(),
      status: "active"
    };

    // 1. Sauvegarde dans Supabase si disponible
    let savedInSupabase = false;
    if (supabase) {
      try {
        const { error } = await supabase.from("announcements").insert([
          {
            id: newAnnouncement.id,
            title: newAnnouncement.title,
            text_fr: newAnnouncement.textFr,
            text_darija: newAnnouncement.textDarija,
            full_text: newAnnouncement.fullText,
            image_url: newAnnouncement.imageUrl,
            badge: "Annonce Officielle",
            is_official: true,
            priority: newAnnouncement.priority,
            author: newAnnouncement.author,
            status: "active",
            created_at: newAnnouncement.createdAt
          }
        ]);
        if (!error) savedInSupabase = true;
      } catch (sbErr) {
        console.warn("[Announcements] Supabase insert warning:", sbErr.message);
      }
    }

    // 2. Sauvegarde locale persistance garantie
    const current = loadLocalAnnouncements();
    // Mettre l'annonce en tête
    current.unshift(newAnnouncement);
    saveLocalAnnouncements(current);

    return res.status(201).json({
      success: true,
      message: "Annonce officielle publiée avec succès en tête du fil d'actualité !",
      announcement: newAnnouncement,
      savedInSupabase
    });
  }

  // DELETE : Supprimer ou dépublier une annonce
  if (req.method === "DELETE") {
    const { id } = req.body || req.query || {};
    if (!id) {
      return res.status(400).json({ error: "L'identifiant de l'annonce est requis." });
    }

    // Supabase
    if (supabase) {
      try {
        await supabase.from("announcements").delete().eq("id", id);
      } catch (sbErr) {
        console.warn("[Announcements] Supabase delete error:", sbErr.message);
      }
    }

    // Local
    const current = loadLocalAnnouncements();
    const updated = current.filter(a => a.id !== id);
    saveLocalAnnouncements(updated);

    return res.status(200).json({
      success: true,
      message: "Annonce supprimée avec succès.",
      remaining: updated.length
    });
  }

  return res.status(405).json({ error: "Méthode non autorisée." });
}
