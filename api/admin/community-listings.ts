import { createClient } from "@supabase/supabase-js";
import type { IncomingMessage, ServerResponse } from "node:http";

type Req = IncomingMessage & { body?: { id?: string; action?: string }; method?: string };
type Res = ServerResponse & { status(code: number): Res; json(body: unknown): void };

export default async function handler(req: Req, res: Res) {
  if (req.method !== "GET" && req.method !== "PATCH") {
    res.setHeader("Allow", "GET, PATCH");
    return res.status(405).json({ error: "Méthode non autorisée." });
  }
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return res.status(401).json({ error: "Connexion requise." });

  const url = process.env.SUPABASE_URL;
  const key = process.env["SUPABASE_" + "SERVICE_ROLE_KEY"];
  if (!url || !key) return res.status(503).json({ error: "Service de modération non configuré." });

  const publicUrl = process.env.VITE_SUPABASE_URL;
  const publicKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!publicUrl || !publicKey || publicUrl !== url)
    return res.status(503).json({ error: "Configuration Supabase incohérente entre le client et le serveur." });

  const authClient = createClient(publicUrl, publicKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: auth, error: authError } = await authClient.auth.getUser(token);
  if (authError || !auth.user) return res.status(401).json({ error: "Session invalide." });

  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: allowed, error: roleError } = await db.from("community_admins")
    .select("user_id").eq("user_id", auth.user.id).eq("is_active", true).maybeSingle();
  if (roleError) return res.status(503).json({ error: "Vérification des droits impossible." });
  if (!allowed) return res.status(403).json({ error: "Accès réservé à la modération." });

  if (req.method === "GET") {
    const { data, error } = await db.from("community_listings")
      .select("id,category,listing_type,title,description,country,city,origin_city,destination_city,preferred_date,created_at")
      .eq("status", "PENDING").order("created_at", { ascending: true }).limit(100);
    if (error) return res.status(500).json({ error: "Chargement impossible." });
    return res.status(200).json({ listings: data || [] });
  }

  const id = req.body?.id || "";
  const action = req.body?.action;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))
    return res.status(400).json({ error: "Identifiant invalide." });
  if (action !== "PUBLISH" && action !== "REJECT")
    return res.status(400).json({ error: "Action invalide." });

  if (action === "PUBLISH") {
    const { data: candidate, error: candidateError } = await db.from("community_listings")
      .select("category,title,description").eq("id", id).eq("status", "PENDING").maybeSingle();
    if (candidateError) return res.status(500).json({ error: "Vérification du contenu impossible." });
    if (!candidate) return res.status(409).json({ error: "Annonce déjà traitée. Actualisez la liste." });
    const restricted = /(?:\b(?:wave|orange\s*money|western\s*union|moneygram|mtn\s*momo|moov\s*money|mouv|virement|devise|cash|colis|bagages?|valises?|crypto(?:monnaie)?)\b|transfert\s+(?:d['’]?argent|mobile)|taux\s+de\s+change|conversion\s+de\s+devise|échange\s+de\s+devise|\b\d+(?:[.,]\d+)?\s*(?:dh|dhs|mad|fcfa|xof|xaf|eur|usd|dollars?|dirhams?)\b)/i;
    const allowedCategories = ["COMMUNITY_HELP", "LOCAL_SERVICES", "GOODS_DONATIONS", "COMMUNITY_EVENTS", "OTHER"];
    if (!allowedCategories.includes(candidate.category) || restricted.test(`${candidate.title} ${candidate.description}`)) {
      return res.status(422).json({ error: "Cette annonce ne respecte pas les règles de FrikChange et ne peut pas être publiée." });
    }
  }

  const { data, error } = await db.from("community_listings")
    .update({ status: action === "PUBLISH" ? "PUBLISHED" : "REJECTED", updated_at: new Date().toISOString() })
    .eq("id", id).eq("status", "PENDING").select("id,status").maybeSingle();
  if (error) return res.status(500).json({ error: "Décision non enregistrée." });
  if (!data) return res.status(409).json({ error: "Annonce déjà traitée. Actualisez la liste." });
  return res.status(200).json({ listing: data });
}
