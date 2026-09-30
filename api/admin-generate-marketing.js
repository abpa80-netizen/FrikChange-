import { GoogleGenAI } from "@google/genai";

function generateStudioBannerSvg({ headline, subhead, topic, badgeText = "FrikChange Officiel" }) {
  const safeHeadline = String(headline || "Réseau Communautaire Maroc ⇄ Afrique").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeSubhead = String(subhead || "Mise en relation directe & Petites annonces de confiance").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeBadge = String(badgeText).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#022c22" />
      <stop offset="50%" stop-color="#064e3b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="emerald-glow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#059669" stop-opacity="0.2" />
    </linearGradient>
    <radialGradient id="glow-center" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#022c22" stop-opacity="0" />
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.5" />
    </filter>
    <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Arrière-plan stylisé -->
  <rect width="1080" height="1080" fill="url(#bg-grad)" />
  <circle cx="540" cy="380" r="500" fill="url(#glow-center)" />

  <!-- Motifs géométriques modernes en filigrane -->
  <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="1.5" fill="none">
    <circle cx="540" cy="540" r="420" />
    <circle cx="540" cy="540" r="340" stroke-dasharray="8 8" />
    <circle cx="540" cy="540" r="260" />
    <line x1="120" y1="120" x2="960" y2="960" />
    <line x1="960" y1="120" x2="120" y2="960" />
  </g>

  <!-- Cadre intérieur élégant avec bordure or & émeraude -->
  <rect x="40" y="40" width="1000" height="1000" rx="36" fill="none" stroke="url(#gold-grad)" stroke-width="3" stroke-opacity="0.6" filter="url(#shadow)" />
  <rect x="52" y="52" width="976" height="976" rx="28" fill="none" stroke="#10b981" stroke-width="1" stroke-opacity="0.2" />

  <!-- HEADER : Logo FrikChange & Badge Officiel -->
  <g transform="translate(80, 90)">
    <!-- Icône Logo -->
    <rect x="0" y="0" width="70" height="70" rx="20" fill="url(#gold-grad)" filter="url(#shadow)" />
    <text x="35" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#022c22" text-anchor="middle">F</text>
    
    <!-- Nom de marque -->
    <text x="90" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="900" fill="#ffffff" letter-spacing="1">
      FRIK<tspan fill="#34d399">CHANGE</tspan>
    </text>
    <text x="90" y="62" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#94a3b8" letter-spacing="3">
      COMMUNAUTÉ MAROC ⇄ AFRIQUE
    </text>

    <!-- Badge Officiel Doré à droite -->
    <g transform="translate(680, 10)">
      <rect x="0" y="0" width="240" height="50" rx="25" fill="#0f172a" stroke="url(#gold-grad)" stroke-width="2" />
      <circle cx="28" cy="25" r="8" fill="#fbbf24" />
      <text x="130" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="#fef08a" text-anchor="middle" letter-spacing="1">
        ${safeBadge.toUpperCase()}
      </text>
    </g>
  </g>

  <!-- CENTRE : Illustration vectorielle thématique -->
  <g transform="translate(540, 390)">
    <!-- Sphère rayonnante centrale -->
    <circle cx="0" cy="0" r="140" fill="#047857" fill-opacity="0.3" stroke="url(#gold-grad)" stroke-width="4" filter="url(#shadow)" />
    <circle cx="0" cy="0" r="115" fill="#065f46" stroke="#34d399" stroke-width="1.5" stroke-dasharray="6 6" />
    
    <!-- Éléments symboliques Maroc ⇄ Afrique -->
    <!-- Mains / Partenariat / Échange direct -->
    <path d="M -50 -10 C -50 -40 -20 -60 0 -60 C 20 -60 50 -40 50 -10 C 50 20 20 50 0 50 C -20 50 -50 20 -50 -10 Z" fill="url(#gold-grad)" />
    <!-- Drapeaux & badges flottants -->
    <circle cx="-160" cy="-60" r="38" fill="#0f172a" stroke="#10b981" stroke-width="2" filter="url(#shadow)" />
    <text x="-160" y="-50" font-size="28" text-anchor="middle">🇲🇦</text>

    <circle cx="160" cy="-60" r="38" fill="#0f172a" stroke="#fbbf24" stroke-width="2" filter="url(#shadow)" />
    <text x="160" y="-50" font-size="28" text-anchor="middle">🌍</text>

    <circle cx="0" cy="150" r="36" fill="#0f172a" stroke="#34d399" stroke-width="2" filter="url(#shadow)" />
    <text x="0" y="160" font-size="26" text-anchor="middle">✈️</text>

    <!-- Flèches d'interconnexion -->
    <path d="M -110 -60 Q 0 -110 110 -60" fill="none" stroke="url(#gold-grad)" stroke-width="4" stroke-dasharray="8 6" />
    <path d="M 110 -40 Q 90 100 45 135" fill="none" stroke="#34d399" stroke-width="3" stroke-dasharray="6 6" />
    <path d="M -45 135 Q -90 100 -110 -40" fill="none" stroke="#34d399" stroke-width="3" stroke-dasharray="6 6" />
  </g>

  <!-- CONTENU : Titre & Accroche AIDA -->
  <g transform="translate(540, 680)">
    <!-- Pill thématique -->
    <rect x="-180" y="-45" width="360" height="42" rx="21" fill="url(#emerald-glow)" stroke="#34d399" stroke-width="1.5" />
    <text x="0" y="-18" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="900" fill="#a7f3d0" text-anchor="middle" letter-spacing="2">
      PLATEFORME SÉCURISÉE 100% DIRECTE
    </text>

    <!-- Titre principal en gras percutant -->
    <text x="0" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle" filter="url(#shadow)">
      ${safeHeadline}
    </text>

    <!-- Sous-titre explicatif -->
    <text x="0" y="95" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="500" fill="#cbd5e1" text-anchor="middle">
      ${safeSubhead}
    </text>
  </g>

  <!-- FOOTER DU VISUEL : Puces de réassurance & Appel à l'action -->
  <g transform="translate(80, 890)">
    <!-- Bandeau fond réassurance -->
    <rect x="0" y="0" width="920" height="110" rx="24" fill="#091815" stroke="#1e293b" stroke-width="2" />
    
    <!-- 3 Puces de confiance -->
    <g transform="translate(40, 35)">
      <circle cx="15" cy="18" r="14" fill="#047857" />
      <text x="15" y="24" font-size="14" fill="#ffffff" text-anchor="middle">✓</text>
      <text x="40" y="16" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#ffffff">0% Commission</text>
      <text x="40" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94a3b8">Accord 100% de gré à gré</text>
    </g>

    <g transform="translate(340, 35)">
      <circle cx="15" cy="18" r="14" fill="#b45309" />
      <text x="15" y="24" font-size="14" fill="#ffffff" text-anchor="middle">🛡️</text>
      <text x="40" y="16" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#ffffff">Main Propre</text>
      <text x="40" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94a3b8">Lieux publics surveillés Maps</text>
    </g>

    <g transform="translate(640, 35)">
      <circle cx="15" cy="18" r="14" fill="#047857" />
      <text x="15" y="24" font-size="14" fill="#ffffff" text-anchor="middle">⚡</text>
      <text x="40" y="16" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#ffffff">Direct WhatsApp</text>
      <text x="40" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94a3b8">Accès contact instantané</text>
    </g>
  </g>

  <!-- URL en bas au centre -->
  <text x="540" y="1035" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#fbbf24" text-anchor="middle" letter-spacing="3">
    WWW.FRIKCHANGE.COM
  </text>
</svg>`;

  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
  }

  const { topic = "mise_en_relation", customNotes = "", targetAudience = "Maroc et diaspora subsaharienne" } = req.body || {};

  const apiKey = process.env.GEMINI_API_KEY;

  let topicLabel = "Mise en relation directe Maroc ⇄ Afrique";
  let promptSubject = "le service technique de mise en relation directe entre particuliers et l'entraide communautaire pour les petites annonces et le transport GP solidaire";

  if (topic === "voyageur_gp") {
    topicLabel = "Voyageurs GP & Fret Solidaire";
    promptSubject = "le service de voyageurs GP solidaires pour transporter plis, colis urgents et documents entre le Maroc et les capitales d'Afrique subsaharienne";
  } else if (topic === "securite_mains_propres") {
    topicLabel = "Sécurité & Rendez-vous Maps Sécurisés";
    promptSubject = "les consignes de sécurité anti-fraude, le refus catégorique d'acompte à distance et le choix de lieux de rencontre publics surveillés (agences bancaires, centres commerciaux Morocco Mall / Arribat Center)";
  } else if (topic === "deblocage_chariow") {
    topicLabel = "Déblocage Technique WhatsApp & Tranches";
    promptSubject = "le fonctionnement du déblocage direct et instantané des coordonnées WhatsApp d'un annonceur via les micro-frais Chariow, sans aucune commission sur vos accords";
  }

  const fallbackCopy = {
    headline: "Mise en relation directe Maroc ⇄ Afrique sans intermédiaire",
    subhead: "Petites annonces de confiance & Transport GP solidaire",
    aida: {
      attention: "🚨 Besoin de trouver un contact de confiance entre le Maroc et l'Afrique subsaharienne ? / باغي دير كونطاكت موثوق بين المغرب وإفريقيا بلا وسيط ؟",
      interest: "✨ FrikChange est le réseau d'entraide communautaire qui vous connecte directement avec des membres vérifiés pour vos petites annonces et services GP solidaires.",
      desire: "🛡️ Zéro intermédiaire, zéro commission sur vos accords ! Rencontrez-vous en main propre dans des lieux publics sécurisés ou profitez de nos voyageurs GP réguliers.",
      action: "📲 Rejoignez le réseau FrikChange dès maintenant et consultez les annonces du jour : www.frikchange.com"
    },
    textFr: `🚨 **MAROC ⇄ AFRIQUE : LE RÉSEAU COMMUNAUTAIRE DIRECT & SÉCURISÉ**\n\nVous recherchez un contact fiable pour une petite annonce ou un service de transport GP solidaire entre Casablanca, Rabat, Marrakech et Dakar, Abidjan ou Bamako ?\n\n✨ **Pourquoi choisir FrikChange ?**\n• 🤝 **Mise en relation 100% directe** : Débloquez le contact WhatsApp vérifié de l'annonceur en 1 clic.\n• 🛡️ **Zéro commission sur vos accords** : Vous convenez librement de vos modalités de gré à gré.\n• 📍 **Sécurité maximale** : Suggestions de lieux publics surveillés (Morocco Mall, gares ONCF, agences bancaires) pour vos rencontres en toute sérénité.\n• ✈️ **Voyageurs GP réguliers** pour vos plis et colis urgents.\n\n📲 **Passez à l'action dès aujourd'hui :** Consultez les propositions ou déposez votre annonce gratuitement sur **www.frikchange.com** !`,
    textDarija: `🚨 **المغرب ⇄ إفريقيا : شبكة التواصل المباشر والأمان 100%**\n\nمحتاج تلقى شخص موثوق فالمغرب، السنغال، كوت ديفوار ولا مالي ؟\n\n✨ **مع FrikChange كولشي ساهل ومضمون :**\n• 🤝 تواصل مباشر عبر واتساب مع المعلن بضغطة زر.\n• 🛡️ بدون أي عمولة على الاتفاق ديالكم، التفاهم حر وبيناتكم.\n• 📍 لقاءات فضاءات عامة ومراقبة (موروكو مول، محطات القطار، وكالات بنكية) باش تكون مرتاح.\n• ✈️ مسافرين GP لنقل الأمانات والطرود المستعجلة.\n\n📲 **دخل دابا واكتشف الإعلانات الجديدة :** www.frikchange.com`
  };

  let generatedText = fallbackCopy;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });

      const systemPrompt = `Tu es un expert en marketing digital pour FrikChange.
FrikChange est une plateforme technique et un réseau d'entraide communautaire Maroc ⇄ Afrique pour petites annonces et transport GP solidaire (PRESTATAIRE TECHNIQUE, NI BANQUE NI BUREAU DE CHANGE, 0 COMMISSION, RENCONTRE EN MAIN PROPRE RECOMMANDÉE).

Tu dois générer un post promotionnel percutant selon la méthode AIDA :
- A (Attention) : Accroche irrésistible avec émojis
- I (Intérêt) : Explication claire de la valeur apportée par FrikChange
- D (Désir) : Avantages majeurs (sécurité lieux publics Maps, direct WhatsApp, 0 commission, voyageur GP solidaire)
- A (Action) : Appel à l'action clair invitant à visiter le site

Fournis le résultat en DEUX versions :
1. En FRANÇAIS (dynamique, chaleureux, professionnel)
2. En DARIJA MAROCAINE écrite en caractères arabes (très engageante et naturelle pour les réseaux sociaux)

Réponds UNIQUEMENT au format JSON strict respectant cette structure :
{
  "headline": "Titre court et percutant (max 8 mots)",
  "subhead": "Sous-titre explicatif (max 12 mots)",
  "aida": {
    "attention": "Texte court accroche",
    "interest": "Texte explication intérêt",
    "desire": "Texte désir et avantages",
    "action": "Texte appel à l'action"
  },
  "textFr": "Texte complet formaté en Français avec émojis et puces pour WhatsApp / Facebook / LinkedIn",
  "textDarija": "Texte complet en Darija marocaine en caractères arabes pour WhatsApp / Facebook / Instagram"
}`;

      const userPrompt = `Rédige un post marketing AIDA sur le thème : "${promptSubject}".
Public cible : ${targetAudience}.
Notes complémentaires : ${customNotes || "Mettre en avant la simplicité, la sécurité et la communauté solidaire."}`;

      const textResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.8
        }
      });

      if (textResponse.text) {
        try {
          const parsed = JSON.parse(textResponse.text);
          if (parsed.headline && parsed.textFr) {
            generatedText = parsed;
          }
        } catch (jsonErr) {
          console.warn("[Admin Marketing] JSON parse warning, using raw text", jsonErr);
        }
      }
    } catch (apiErr) {
      console.warn("[Admin Marketing] Gemini text generation fallback:", apiErr.message);
    }
  }

  // Génération du visuel publicitaire haute qualité 1080x1080
  let imageUrl = "";
  let visualType = "studio-custom-1080";

  // Tentative Imagen 3 si environnement compatible
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });

      // Tentative Imagen 3 via generateImages
      const imagenRes = await ai.models.generateImages({
        model: "imagen-3.0-generate-002",
        prompt: `A professional advertising social media banner 1080x1080 for FrikChange African-Moroccan community solidarity network. Elegant emerald green (#059669), deep slate blue and metallic gold luxury accents. Clean 3D abstract shapes, connection paths, Moroccan star motif, community handshakes, highly detailed, photorealistic 8k commercial quality banner without text.`,
        config: {
          numberOfImages: 1,
          aspectRatio: "1:1"
        }
      });

      if (imagenRes.generatedImages && imagenRes.generatedImages[0]?.image?.imageBytes) {
        imageUrl = `data:image/jpeg;base64,${imagenRes.generatedImages[0].image.imageBytes}`;
        visualType = "imagen-3.0-generate-002";
      }
    } catch (imgErr) {
      // Imagen 3 requires Enterprise Vertex AI or paid tier; our Studio SVG canvas produces the exact 1080x1080 branded banner
      visualType = "frikchange-studio-vector";
    }
  }

  if (!imageUrl) {
    imageUrl = generateStudioBannerSvg({
      headline: generatedText.headline || "Réseau Communautaire Maroc ⇄ Afrique",
      subhead: generatedText.subhead || "Petites annonces de confiance & Direct WhatsApp",
      topic: topicLabel,
      badgeText: "Annonce Officielle FrikChange"
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      topic,
      topicLabel,
      headline: generatedText.headline,
      subhead: generatedText.subhead,
      aida: generatedText.aida,
      textFr: generatedText.textFr,
      textDarija: generatedText.textDarija,
      fullText: `${generatedText.textFr}\n\n━━━━━━━━━━━━━━━━━━━━━━\n🇲🇦 النسخة بالدارجة المغربية :\n\n${generatedText.textDarija}`,
      imageUrl,
      visualType,
      createdAt: new Date().toISOString()
    }
  });
}
