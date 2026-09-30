import { GoogleGenAI } from "@google/genai";

const FRIKBOT_SYSTEM_INSTRUCTION = `Tu es "FrikBot", l'assistant d'assistance et de support 24/7 de la plateforme FrikChange.

POSITIONNEMENT LÉGAL STRICT DE FRIKCHANGE :
- FrikChange est un PRESTATAIRE TECHNIQUE de mise en relation et un réseau d'entraide communautaire Maroc ⇄ Afrique pour la publication de petites annonces de contact et de services de transport solidaire GP.
- FrikChange N'EST PAS une banque, NI un établissement financier, NI un bureau de change.
- FrikChange NE MANIPULE AUCUN FONDS, n'effectue aucune transaction financière et ne perçoit aucune commission sur les accords entre utilisateurs.
- Les frais Chariow couvrent EXCLUSIVEMENT le service technique de déblocage et d'accès aux coordonnées de contact direct (WhatsApp) de l'annonceur.
- Les membres conviennent librement et sous leur propre et unique responsabilité des modalités de leurs accords de gré à gré, idéalement lors d'une rencontre en main propre dans un lieu public sécurisé.

TES DIRECTIVES STRICTES ET RÈGLES DE SÉCURITÉ :
1. RÈGLE D'OR SÉCURITÉ ANTI-FRAUDE :
   - ⚠️ NE JAMAIS VERSER D'ACOMPTE À DISTANCE. Aucun paiement préalable par virement, Wave, Orange Money ou mandat avant d'avoir rencontré physiquement l'interlocuteur dans un lieu public sécurisé.
   - 🤝 RENCONTRE EN MAIN PROPRE RECOMMANDÉE : Les membres doivent se rencontrer en plein jour dans un espace public surveillé et fréquenté.
   - 📍 LIEUX RECOMMANDÉS (Module Google Maps intégré) :
     * Grands centres commerciaux sécurisés avec agents et caméras (Morocco Mall, Marina Shopping à Casablanca, Arribat Center à Rabat, Carré Eden à Marrakech).
     * Gares ONCF (Casa-Voyageurs, Rabat-Agdal, etc.) et pôles de transport officiels.
     * Halls d'agences ouvertes ou galeries marchandes animées.
   - ⚠️ Toujours vérifier calmement sur place la conformité des accords convenus.

2. FONCTIONNEMENT DES TRANCHES & DÉBLOCAGE TECHNIQUE CHARIOW :
   - La consultation des annonces est 100% libre et gratuite.
   - Pour contacter directement un annonceur vérifié (coordonnées WhatsApp), un déblocage technique sécurisé via Chariow est requis.
   - Ce montant forfaitaire couvre le maintien technique de la plateforme, la modération active et le support 24/7.
   - FrikChange ne prend aucune commission sur les accords conclus directement entre membres.

3. DÉPÔT DE PETITES ANNONCES & SERVICES GP :
   - Le dépôt d'annonce est rapide et gratuit (Contact local ou Service de transport GP solidaire).
   - Les montants indiqués sur l'annonce sont des valeurs indicatives de référence de gré à gré.
   - Chaque annonce est validée par notre équipe avant affichage sur le catalogue.

4. STYLE :
   - Ton bienveillant, clair, professionnel, structuré avec listes à puces et émojis adaptés.`;

function getRuleEngineReply(message) {
  const q = (message || "").toLowerCase();
  if (q.includes("chariow") || q.includes("tranche") || q.includes("prix") || q.includes("débloc") || q.includes("payer")) {
    return "💡 **Fonctionnement du déblocage technique Chariow :**\n\n• La consultation du catalogue d'annonces est **100% gratuite**.\n• Les frais réglés sur Chariow couvrent exclusivement le service technique de déblocage et d'accès aux coordonnées de contact direct (numéro WhatsApp) de l'annonceur.\n• **FrikChange ne perçoit aucune commission** sur les accords entre utilisateurs : les membres conviennent librement de leurs modalités de gré à gré.";
  }
  if (q.includes("arnaque") || q.includes("sécur") || q.includes("acompte") || q.includes("lieu") || q.includes("danger") || q.includes("faux")) {
    return "🛡️ **Consignes de Sécurité & Rencontre FrikChange :**\n\n1. ⚠️ **Règle absolue : NE JAMAIS VERSER D'ACOMPTE À DISTANCE.** Refusez tout paiement préalable avant la rencontre physique.\n2. 🤝 **Rencontre en main propre :** Privilégiez toujours une rencontre en face-à-face en plein jour.\n3. 📍 **Lieux publics sécurisés recommandés :** Utilisez notre module Google Maps pour choisir un centre commercial surveillé (Morocco Mall, Arribat Center), une gare ONCF ou une galerie marchande à forte affluence.\n4. Vérifiez calmement les accords convenus sur place en toute sérénité.";
  }
  if (q.includes("publi") || q.includes("dépos") || q.includes("annon")) {
    return "📝 **Déposer une petite annonce :**\n\n• C'est simple et gratuit !\n• Cliquez sur le bouton vert **« Déposer une annonce »** en haut de page.\n• Renseignez votre proposition ou demande, vos montants indicatifs de référence, votre ville/quartier et votre WhatsApp.\n• L'annonce est vérifiée par notre équipe de modération avant publication.";
  }
  if (q.includes("banque") || q.includes("change") || q.includes("statut") || q.includes("fonds") || q.includes("légal")) {
    return "⚖️ **Cadre Légal & Prestataire Technique :**\n\nFrikChange est uniquement un prestataire technique de mise en relation et un réseau communautaire d'entraide. Nous ne manipulons aucun fonds, ne sommes ni une banque ni un bureau de change, et n'intervenons dans aucune transaction financière entre utilisateurs.";
  }
  if (q.includes("taux") || q.includes("cours") || q.includes("combien") || q.includes("mad") || q.includes("eur") || q.includes("fcfa")) {
    return "📊 **Indicateurs Économiques Informatifs :**\n\nConsultez notre bandeau informatif en haut de page. Il affiche des repères indicatifs issus de sources publiques (1 EUR ≈ 10.74 MAD, 1 USD ≈ 10.08 MAD, 1 MAD ≈ 61 FCFA). Les membres fixent librement leurs montants de référence de gré à gré.";
  }
  return "Bonjour ! Je suis **FrikBot**, votre assistant support 24/7 FrikChange.\n\nJe peux vous renseigner sur :\n• Le fonctionnement du déblocage technique des contacts via Chariow\n• Les conseils de sécurité et la recommandation de lieux publics sécurisés Maps\n• Le dépôt de petites annonces et services GP solidaire\n• Le cadre légal de prestataire technique de mise en relation.\n\nComment puis-je vous aider ?";
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

  const { message, conversationHistory = [] } = req.body || {};
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message requis." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      success: true,
      reply: getRuleEngineReply(message),
      model: "frikbot-safety-engine"
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });

    const formattedContents = [];
    if (Array.isArray(conversationHistory)) {
      conversationHistory.slice(-6).forEach(item => {
        if (item.role === "user" || item.role === "model") {
          formattedContents.push({
            role: item.role,
            parts: [{ text: String(item.text || item.content || "") }]
          });
        }
      });
    }

    formattedContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    let replyText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: formattedContents,
        config: {
          systemInstruction: FRIKBOT_SYSTEM_INSTRUCTION,
          temperature: 0.7,
          topP: 0.95
        }
      });
      replyText = response.text || "";
    } catch (modelErr) {
      // Tentative alternative avec gemini-3.8-flash
      try {
        const response2 = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: formattedContents,
          config: {
            systemInstruction: FRIKBOT_SYSTEM_INSTRUCTION,
            temperature: 0.7
          }
        });
        replyText = response2.text || "";
      } catch (err2) {
        console.info("[FrikBot Model Notice] Passage au moteur de sécurité FrikBot :", err2.message || "Bascule directe");
      }
    }

    if (!replyText) {
      replyText = getRuleEngineReply(message);
    }

    return res.status(200).json({
      success: true,
      reply: replyText,
      model: replyText ? "gemini-assisted" : "frikbot-safety-engine"
    });
  } catch (err) {
    console.info("[FrikBot Notice] Réponse automatique sécurisée délivrée");
    return res.status(200).json({
      success: true,
      reply: getRuleEngineReply(message),
      model: "frikbot-safety-engine-fallback"
    });
  }
}
