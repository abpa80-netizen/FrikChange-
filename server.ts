import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import exchangeRatesHandler from "./api/exchange-rates.js";
import supportChatHandler from "./api/support-chat.js";
import adminGenerateMarketingHandler from "./api/admin-generate-marketing.js";
import adminPublishAnnouncementHandler from "./api/admin-publish-announcement.js";
import analyticsHandler from "./api/analytics.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Proxy endpoints for serverless compatibility
app.all("/api/exchange-rates", async (req, res) => {
  try {
    await exchangeRatesHandler(req, res);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.all("/api/support-chat", async (req, res) => {
  try {
    await supportChatHandler(req, res);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.all("/api/admin-generate-marketing", async (req, res) => {
  try {
    await adminGenerateMarketingHandler(req, res);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.all("/api/admin-publish-announcement", async (req, res) => {
  try {
    await adminPublishAnnouncementHandler(req, res);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.all("/api/analytics", async (req, res) => {
  try {
    await analyticsHandler(req, res);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint pour les lieux publics sécurisés par ville (Google Maps Data)
app.get("/api/secure-locations", (req, res) => {
  const city = (req.query.city as string)?.toLowerCase() || "casablanca";

  const locationsData: Record<string, Array<{
    id: string;
    name: string;
    type: "bank" | "mall" | "station" | "police";
    typeName: string;
    address: string;
    district: string;
    lat: number;
    lng: number;
    securityLevel: string;
    tips: string;
  }>> = {
    casablanca: [
      {
        id: "casa-mall-1",
        name: "Morocco Mall",
        type: "mall",
        typeName: "Centre Commercial Haut Niveau",
        address: "Angle Boulevard Sidi Abderrahmane, Bd de l'Océan Atlantique, Casablanca",
        district: "Ain Diab",
        lat: 33.5768,
        lng: -7.7058,
        securityLevel: "Très Élevé (Vigiles 24/7, Caméras, Détecteurs)",
        tips: "Point de rencontre recommandé près de l'Aquarium ou dans l'aire de restauration centrale."
      },
      {
        id: "casa-bank-1",
        name: "Attijariwafa Bank - Siège Bd Moulay Youssef",
        type: "bank",
        typeName: "Agence Bancaire Sécurisée",
        address: "2 Boulevard Moulay Youssef, Casablanca",
        district: "Gauthier",
        lat: 33.5936,
        lng: -7.6256,
        securityLevel: "Sécurité Bancaire (Vigiles armés, Hall sous vidéosurveillance)",
        tips: "Lieu public surveillé idéal pour convenir des modalités et conclure votre rencontre en sécurité."
      },
      {
        id: "casa-station-1",
        name: "Gare ONCF Casa-Voyageurs",
        type: "station",
        typeName: "Gare Ferroviaire Majeure",
        address: "Boulevard Ba Hmad, Belvédère, Casablanca",
        district: "Belvédère / Roches Noires",
        lat: 33.5898,
        lng: -7.5895,
        securityLevel: "Élevé (Police ferroviaire, Contrôle bagages, Caméras)",
        tips: "Rendez-vous dans le hall des départs ou près des cafés de la gare."
      },
      {
        id: "casa-mall-2",
        name: "Marina Shopping Center",
        type: "mall",
        typeName: "Centre Commercial Sécurisé",
        address: "Boulevard des Almohades, Marina de Casablanca",
        district: "Centre-Ville / Port",
        lat: 33.6062,
        lng: -7.6201,
        securityLevel: "Très Élevé (Agents de sécurité, Accès filtré)",
        tips: "Proche de la gare Casa-Port, cafés avec terrasses sécurisées."
      },
      {
        id: "casa-bank-2",
        name: "Banque Populaire (BCP) - Bd d'Anfa",
        type: "bank",
        typeName: "Succursale Bancaire",
        address: "Boulevard d'Anfa angle Rue Taha Hussein, Casablanca",
        district: "Maârif / Racine",
        lat: 33.5872,
        lng: -7.6364,
        securityLevel: "Sécurité Bancaire Haute",
        tips: "Espace sécurisé et éclairé pour une rencontre sereine entre membres."
      }
    ],
    rabat: [
      {
        id: "rabat-mall-1",
        name: "Arribat Center",
        type: "mall",
        typeName: "Centre Commercial Moderne",
        address: "Avenue des Nations Unies, Agdal, Rabat",
        district: "Agdal",
        lat: 33.9996,
        lng: -6.8504,
        securityLevel: "Très Élevé (Agents de sécurité, Parking surveillé)",
        tips: "Lieu privilégié pour les rendez-vous en journée dans un espace surveillé."
      },
      {
        id: "rabat-station-1",
        name: "Gare ONCF Rabat-Agdal",
        type: "station",
        typeName: "Gare LGV Al Boraq",
        address: "Avenue Haj Ahmed Cherkaoui, Rabat",
        district: "Agdal",
        lat: 33.9984,
        lng: -6.8569,
        securityLevel: "Sécurité Maximale (Contrôles continus, Caméras)",
        tips: "Hall moderne très lumineux avec postes de police à l'entrée."
      },
      {
        id: "rabat-bank-1",
        name: "CIH Bank - Agence Principale Agdal",
        type: "bank",
        typeName: "Agence Bancaire",
        address: "Avenue Fal Ould Oumeir, Agdal, Rabat",
        district: "Agdal",
        lat: 34.0041,
        lng: -6.8485,
        securityLevel: "Sécurité Bancaire (Vigiles, Caméras)",
        tips: "Rue très animée et commerçante à forte affluence."
      }
    ],
    marrakech: [
      {
        id: "mar-mall-1",
        name: "Carré Eden Shopping Center",
        type: "mall",
        typeName: "Centre Commercial Urbain",
        address: "Avenue Mohammed V, Guéliz, Marrakech",
        district: "Guéliz",
        lat: 31.6346,
        lng: -8.0125,
        securityLevel: "Très Élevé (Sécurité privée, Caméras HD)",
        tips: "En plein cœur de Guéliz, cafés et espace de repos sécurisés."
      },
      {
        id: "mar-station-1",
        name: "Gare de Marrakech ONCF",
        type: "station",
        typeName: "Gare Centrale",
        address: "Avenue Hassan II, Marrakech",
        district: "Hivernage / Guéliz",
        lat: 31.6298,
        lng: -8.0189,
        securityLevel: "Élevé (Forces de l'ordre, Vidéoprotection)",
        tips: "Hall prestigieux et climatisé avec présence permanente de policiers touristiques."
      }
    ],
    tanger: [
      {
        id: "tan-mall-1",
        name: "Tanger City Mall",
        type: "mall",
        typeName: "Centre Commercial & Gare",
        address: "Boulevard Mohamed VI, Baie de Tanger",
        district: "Malabata",
        lat: 35.7725,
        lng: -5.7905,
        securityLevel: "Très Élevé (Contrôles, Caméras, Liaison Gare TGV)",
        tips: "Adjacent à la gare Tanger Ville Al Boraq, sécurité irréprochable."
      }
    ]
  };

  const results = locationsData[city] || locationsData.casablanca;
  res.json({
    city,
    total: results.length,
    locations: results,
    advisory: "Pour votre sécurité, exigez toujours un lieu public surveillé et refusez tout acompte à distance."
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FrikChange Server] Démarré sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
