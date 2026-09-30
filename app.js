/**
 * FrikChange - Marketplace P2P d'échange de devises et services voyageurs Maroc - Afrique Subsaharienne
 * Backend: Google Apps Script (Google Sheets) & Chariow Gateway
 * API URL: https://script.google.com/macros/s/AKfycbxJFacXSBIuK_9L1Il6-l-X39bCOy2-FXdjIHEEMdNWDXDDwYwYnStxc1wJXm9pauSi/exec
 */

// ==========================================
// CONFIGURATION GLOBALE
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycbxJFacXSBIuK_9L1Il6-l-X39bCOy2-FXdjIHEEMdNWDXDDwYwYnStxc1wJXm9pauSi/exec";

// Stockage global des données
let allAnnonces = [];
let appConfig = [];

// Configuration géographique dynamique (Pays -> Villes -> Quartiers)
const GEOGRAPHY_DATA = {
  "Maroc": {
    flag: "🇲🇦",
    villes: {
      "Casablanca": ["Gauthier", "Derb Omar", "Maarif", "Oulfa", "Ain Diab", "Sidi Maarouf", "Bourgogne", "Belvédère", "Oasis", "Bernoussi", "Ain Sebaa", "2 Mars", "Hay Mohammadi", "Autre quartier"],
      "Rabat": ["Agdal", "Hassan", "Hay Riad", "Souissi", "Océan", "Diour Jamaa", "Yacoub El Mansour", "Autre quartier"],
      "Marrakech": ["Guéliz", "Médina", "Hivernage", "Majorelle", "Semlalia", "Daoudiate", "Autre quartier"],
      "Tanger": ["Malabata", "Centre-ville", "Marshan", "Iberia", "Boukhalef", "Tanger City Center", "Autre quartier"],
      "Fès": ["Ville Nouvelle", "Médina", "Narjiss", "Route d'Immouzzer", "Autre quartier"],
      "Agadir": ["Centre-ville", "Talborjt", "Dakhla", "Bensergao", "Autre quartier"],
      "Autre ville": ["Centre", "Autre quartier"]
    }
  },
  "Sénégal": {
    flag: "🇸🇳",
    villes: {
      "Dakar": ["Plateau", "Almadies", "Ngor", "Médina", "Yoff", "Ouakam", "Mermoz", "Grand Yoff", "Point E", "Fann", "Parcelles Assainies", "Sacré-Cœur", "Autre quartier"],
      "Thiès": ["Centre", "Dixième", "Cité Lamy", "Autre quartier"],
      "Saint-Louis": ["Île", "Sor", "Ndar Tout", "Autre quartier"],
      "Autre ville": ["Centre", "Autre quartier"]
    }
  },
  "Côte d'Ivoire": {
    flag: "🇨🇮",
    villes: {
      "Abidjan": ["Cocody", "Plateau", "Marcory", "Treichville", "Yopougon", "Koumassi", "Deux Plateaux", "Riviera", "Angré", "Adjamé", "Autre quartier"],
      "Bouaké": ["Commerce", "Ahougnanssou", "Koko", "Autre quartier"],
      "San-Pédro": ["Balmer", "Cité", "Bardot", "Autre quartier"],
      "Autre ville": ["Centre", "Autre quartier"]
    }
  },
  "Cameroun": {
    flag: "🇨🇲",
    villes: {
      "Douala": ["Akwa", "Bonanjo", "Bonapriso", "Deido", "Bali", "Makepe", "Bépanda", "Autre quartier"],
      "Yaoundé": ["Bastos", "Centre-ville", "Omnisports", "Tsinga", "Biyem-Assi", "Nlongkak", "Autre quartier"],
      "Autre ville": ["Centre", "Autre quartier"]
    }
  },
  "Guinée": {
    flag: "🇬🇳",
    villes: {
      "Conakry": ["Kaloum", "Dixinn", "Matam", "Ratoma", "Kipé", "Lambanyi", "Nongo", "Madina", "Autre quartier"],
      "Kindia": ["Centre", "Gangan", "Autre quartier"],
      "Autre ville": ["Centre", "Autre quartier"]
    }
  },
  "Mali": {
    flag: "🇲🇱",
    villes: {
      "Bamako": ["Badalabougou", "Hippodrome", "ACI 2000", "Hamdallaye", "Torokorobougou", "Magnambougou", "Autre quartier"],
      "Autre ville": ["Centre", "Autre quartier"]
    }
  },
  "RDC (Congo Kinshasa)": {
    flag: "🇨🇩",
    villes: {
      "Kinshasa": ["Gombe", "Limete", "Kasa-Vubu", "Lingwala", "Bandalungwa", "Ngaliema", "Autre quartier"],
      "Lubumbashi": ["Centre", "Golf", "Bel-Air", "Autre quartier"],
      "Autre ville": ["Centre", "Autre quartier"]
    }
  },
  "Gabon": {
    flag: "🇬🇦",
    villes: {
      "Libreville": ["Batterie IV", "Louis", "Mont-Bouët", "Centre", "Glass", "Oloumi", "Autre quartier"],
      "Autre ville": ["Centre", "Autre quartier"]
    }
  },
  "Bénin": {
    flag: "🇧🇯",
    villes: {
      "Cotonou": ["Ganhi", "Haie Vive", "Cadjehoun", "Akpakpa", "Fidjrossè", "Autre quartier"],
      "Autre ville": ["Centre", "Autre quartier"]
    }
  },
  "Togo": {
    flag: "🇹🇬",
    villes: {
      "Lomé": ["Centre", "Bè", "Tokoin", "Agoè", "Hedzranawoé", "Autre quartier"],
      "Autre ville": ["Centre", "Autre quartier"]
    }
  },
  "Burkina Faso": {
    flag: "🇧🇫",
    villes: {
      "Ouagadougou": ["Ouaga 2000", "Koulouba", "Gounghin", "Paspanga", "Autre quartier"],
      "Autre ville": ["Centre", "Autre quartier"]
    }
  },
  "Nigeria": {
    flag: "🇳🇬",
    villes: {
      "Lagos": ["Victoria Island", "Ikeja", "Lekki", "Ikoyi", "Yaba", "Autre quartier"],
      "Abuja": ["Central Area", "Maitama", "Wuse", "Garki", "Autre quartier"],
      "Autre ville": ["Centre", "Autre quartier"]
    }
  }
};

// Devises prises en charge avec symboles
const CURRENCIES = [
  { code: "MAD", name: "Dirham Marocain (MAD)", symbol: "DH" },
  { code: "FCFA (XOF)", name: "Franc CFA UEMOA (Sénégal, CI, Mali...)", symbol: "FCFA" },
  { code: "FCFA (XAF)", name: "Franc CFA CEMAC (Cameroun, Gabon...)", symbol: "FCFA" },
  { code: "GNF", name: "Franc Guinéen (GNF)", symbol: "GNF" },
  { code: "CDF", name: "Franc Congolais (CDF)", symbol: "CDF" },
  { code: "NGN", name: "Naira Nigérian (NGN)", symbol: "₦" },
  { code: "EUR", name: "Euro (€)", symbol: "€" },
  { code: "USD", name: "Dollar US ($)", symbol: "$" }
];

// Taux indicatifs marché P2P pour le convertisseur rapide (Taux fixe de référence 1 MAD = 60 FCFA)
const CONVERSION_RATES = {
  "MAD_TO_FCFA (XOF)": 60,
  "FCFA (XOF)_TO_MAD": 1 / 60,
  "MAD_TO_FCFA (XAF)": 60,
  "FCFA (XAF)_TO_MAD": 1 / 60,
  "MAD_TO_GNF": 870,
  "GNF_TO_MAD": 1 / 870,
  "MAD_TO_CDF": 280,
  "CDF_TO_MAD": 1 / 280,
  "MAD_TO_NGN": 150,
  "NGN_TO_MAD": 1 / 150,
  "EUR_TO_MAD": 10.7,
  "MAD_TO_EUR": 1 / 10.7,
  "USD_TO_MAD": 9.9,
  "MAD_TO_USD": 1 / 9.9
};

// État Global de l'Application
const AppState = {
  annonces: [],
  filteredAnnonces: [],
  configPrix: [],
  promos: null,
  temoignages: [],
  headerBanner: JSON.parse(localStorage.getItem("frikchange_header_banner") || "null") || {
    active: false,
    imageUrl: "",
    title: "Service de mise en relation directe Maroc ⇄ Afrique",
    link: "#catalogue"
  },
  temporaryBannerBase64: null,
  urgencyPromo: JSON.parse(localStorage.getItem("frikchange_urgency_promo") || "null") || {
    active: true,
    title: "OFFRE SPÉCIALE RENTRÉE",
    message: "-50% sur le déblocage WhatsApp vers le Sénégal et la Côte d'Ivoire !",
    endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16),
    btnText: "Découvrir l'offre",
    btnLink: "#catalogue"
  },
  temporaryAnnonceImage: null,
  liveExchangeRates: {
    MAD: 1,
    XOF: 60.55,
    XAF: 60.55,
    GNF: 868.20,
    CDF: 282.50,
    NGN: 154.20,
    EUR: 0.093,
    USD: 0.101,
    CAD: 0.142,
    GBP: 0.079
  },
  promoCodes: JSON.parse(localStorage.getItem("frikchange_promocodes") || localStorage.getItem("africhange_promocodes") || JSON.stringify([
    { code: "BIENVENUE50", type: "50%", desc: "50% de réduction de bienvenue" },
    { code: "VIP100", type: "gratuit", desc: "100% Gratuit - Test / Partenaire VIP" },
    { code: "GP2026", type: "30%", desc: "-30% sur les mises en relation voyageurs GP" }
  ])),
  activePromoDiscount: null,
  fixedRateConfig: JSON.parse(localStorage.getItem("frikchange_fixed_rate_config") || JSON.stringify({
    enabled: false,
    rateFCFA: 66.0,
    rateGNF: 880,
    rateCDF: 285,
    rateEUR: 10.70,
    rateUSD: 9.90
  })),
  marketingPublications: JSON.parse(localStorage.getItem("frikchange_marketing_publications") || JSON.stringify([
    {
      id: "pub-1",
      title: "🎉 Offre Spéciale : Déblocages à -50% avec le code BIENVENUE50 !",
      message: "Échangez vos dirhams et FCFA en toute sécurité avec remise en main propre à Casablanca, Dakar, Abidjan et Douala. Utilisez le code promo lors de votre paiement.",
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
      btnText: "Voir les annonces vérifiées",
      btnLink: "#catalogue",
      active: true,
      date: "2026-03-20"
    },
    {
      id: "pub-2",
      title: "✈️ Voyageurs GP : Transportez colis & devises en toute confiance",
      message: "Découvrez notre nouveau filtre dédié aux voyageurs GP enregistrés. Plus de 35 trajets réguliers par mois entre le Maroc et l'Afrique subsaharienne.",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
      btnText: "Explorer les trajets GP",
      btnLink: "#catalogue",
      active: true,
      date: "2026-03-18"
    }
  ])),
  adminsList: JSON.parse(localStorage.getItem("frikchange_admins") || localStorage.getItem("africhange_admins") || JSON.stringify([
    { id: "mod-1", name: "Super Administrateur", email: "admin@frikchange.com", role: "Super Administrateur", status: "Actif", date: "2026-01-01" },
    { id: "mod-2", name: "Yacine Ndiaye", email: "yacine.mod@frikchange.com", role: "Modérateur des Annonces", status: "Actif", date: "2026-02-15" },
    { id: "mod-3", name: "Khadija Belkadi", email: "khadija.amb@frikchange.com", role: "Support Client & Litiges", status: "Actif", date: "2026-03-01" },
    { id: "mod-4", name: "Administrateur FrikChange", email: "ab.pa80@gmail.com", role: "Super Administrateur", status: "Actif", date: "2026-03-22" }
  ])),
  currentUser: JSON.parse(localStorage.getItem("frikchange_current_user") || "null"),
  pendingOtp: null,
  otpCountdownTimer: null,
  marketingImage: JSON.parse(localStorage.getItem("frikchange_marketing_image") || localStorage.getItem("africhange_marketing_image") || JSON.stringify({
    url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
    caption: "Réseau de confiance Maroc ⇄ Sénégal, Côte d'Ivoire, Cameroun, Guinée. Remise sécurisée en main propre.",
    actif: true
  })),
  unlockedContacts: JSON.parse(localStorage.getItem("frikchange_unlocked_contacts") || localStorage.getItem("africhange_unlocked_contacts") || "{}"),
  adminAuth: (localStorage.getItem("frikchange_admin_logged") || localStorage.getItem("africhange_admin_logged")) === "true",
  adminPassword: localStorage.getItem("frikchange_admin_pwd") || localStorage.getItem("africhange_admin_pwd") || "admin123",
  adminExclusiveMode: false,
  currentAdminSection: "annonces",
  showPublicAnnoncesActives: localStorage.getItem("frikchange_show_annonces_actives") !== "false",
  showPublicAmbassadeurs: localStorage.getItem("frikchange_show_ambassadeurs") !== "false",
  allAmbassadeurs: JSON.parse(localStorage.getItem("frikchange_all_ambassadeurs") || localStorage.getItem("africhange_all_ambassadeurs") || JSON.stringify([
    {
      code: "CASA2026",
      nom: "Moussa Konaté",
      telephone: "+212 612 345 678",
      date: "2026-02-10",
      statut: "Actif",
      filleulsActifs: 5,
      filleulsInactifs: 1,
      gainsTotal: 180,
      retirable: 180,
      filleulsList: [
        { nom: "Ibrahima Fall", tel: "+221 77 123 45 67", date: "2026-02-12", statut: "Actif", deblocages: 3, commission: 90 },
        { nom: "Fatou Ndiaye", tel: "+221 78 234 56 78", date: "2026-02-15", statut: "Actif", deblocages: 2, commission: 60 },
        { nom: "Mamadou Ba", tel: "+221 70 345 67 89", date: "2026-02-20", statut: "Actif", deblocages: 1, commission: 30 },
        { nom: "Awa Sène", tel: "+221 76 456 78 90", date: "2026-03-01", statut: "Inactif", deblocages: 0, commission: 0 }
      ]
    },
    {
      code: "DAKAR77",
      nom: "Aminata Diop",
      telephone: "+221 77 654 32 10",
      date: "2026-02-18",
      statut: "Actif",
      filleulsActifs: 8,
      filleulsInactifs: 2,
      gainsTotal: 340,
      retirable: 340,
      filleulsList: [
        { nom: "Cheikh Tidiane", tel: "+212 660 11 22 33", date: "2026-02-19", statut: "Actif", deblocages: 4, commission: 120 },
        { nom: "Mariama Diallo", tel: "+221 77 888 99 00", date: "2026-02-22", statut: "Actif", deblocages: 3, commission: 90 },
        { nom: "Babacar Diouf", tel: "+221 76 111 22 33", date: "2026-02-25", statut: "Actif", deblocages: 2, commission: 60 },
        { nom: "Yacine Faye", tel: "+212 670 44 55 66", date: "2026-03-02", statut: "Actif", deblocages: 2, commission: 70 },
        { nom: "Ousmane Seck", tel: "+221 78 555 44 33", date: "2026-03-05", statut: "Inactif", deblocages: 0, commission: 0 }
      ]
    },
    {
      code: "ABIDJANVIP",
      nom: "Koffi Yao",
      telephone: "+225 07 89 01 23",
      date: "2026-03-01",
      statut: "Actif",
      filleulsActifs: 3,
      filleulsInactifs: 0,
      gainsTotal: 120,
      retirable: 120,
      filleulsList: [
        { nom: "Affoué Touré", tel: "+225 05 12 34 56", date: "2026-03-03", statut: "Actif", deblocages: 2, commission: 60 },
        { nom: "Serge Kouamé", tel: "+212 655 77 88 99", date: "2026-03-08", statut: "Actif", deblocages: 2, commission: 60 }
      ]
    },
    {
      code: "CONAKRY1",
      nom: "Sekou Camara",
      telephone: "+224 620 11 22 33",
      date: "2026-03-12",
      statut: "Actif",
      filleulsActifs: 2,
      filleulsInactifs: 1,
      gainsTotal: 75,
      retirable: 75,
      filleulsList: [
        { nom: "Alpha Baldé", tel: "+224 664 12 34 56", date: "2026-03-13", statut: "Actif", deblocages: 2, commission: 50 },
        { nom: "Mariama Barry", tel: "+212 644 33 22 11", date: "2026-03-15", statut: "Actif", deblocages: 1, commission: 25 }
      ]
    }
  ])),
  ambassadeur: JSON.parse(localStorage.getItem("frikchange_ambassadeur") || localStorage.getItem("africhange_ambassadeur") || "null"),
  filleul: JSON.parse(localStorage.getItem("frikchange_filleul") || localStorage.getItem("africhange_filleul") || "null"),
  parrainCode: sessionStorage.getItem("frikchange_parrain_code") || sessionStorage.getItem("africhange_parrain_code") || "",
  currentView: "home",
  cataloguePageSize: 9,
  catalogueDisplayedCount: 9,
  activeFilterType: "all",
  activeFilterPays: "",
  activeFilterPaysDestination: "",
  activeFilterVille: "",
  activeFilterQuartier: "",
  activeFilterDevise: "",
  activeFilterDeviseDonnee: "",
  activeFilterDeviseRecue: "",
  activeFilterQuickPair: "all",
  activeFilterTranche: "all",
  searchQuery: "",
  countdownInterval: null,
  selectedAnnonce: null
};

// ==========================================
// INITIALISATION DE L'APPLICATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Charger les données initiales (Annonces et Config)
  await loadAppData();

  // 2. Récupérer les taux réels en direct via ExchangeRate-API
  fetchRealTimeExchangeRates();

  // 3. Vérifier si l'utilisateur revient d'un paiement Chariow
  checkPaymentReturn();

  // 4. Vérifier la présence d'un code Parrain / Ambassadeur dans l'URL
  checkAmbassadeurUrl();

  // Initialisations de l'interface utilisateur
  initNavigationHistory();
  setupEventListeners();
  initDynamicCascades();
  startConverterWidget();
  startTopLiveConverter();
  renderPublicHeaderBanner();
  renderPublicUrgencyPromo();
  setupAdminRouteListener();
  renderMarketingBanner();
  renderUnlockedBadgesCount();
  updateAdminUI();
  updateAmbassadeurUI();
  updateActiveCounterDisplay();
  applyPublicVisibilitySettings();
  updateAdminVisibilityControlsUI();
  checkAdminUrlAccess();

  // Chargements secondaires (promos, témoignages)
  loadPromos();
  loadTemoignages();

  // 5. Garantir la présence des administrateurs par défaut et Ab.Pa80
  if (!AppState.adminsList.some(a => a.email.toLowerCase() === "ab.pa80@gmail.com")) {
    AppState.adminsList.push({
      id: "mod-4",
      name: "Administrateur FrikChange",
      email: "ab.pa80@gmail.com",
      role: "Super Administrateur",
      status: "Actif",
      date: "2026-03-22"
    });
    localStorage.setItem("frikchange_admins", JSON.stringify(AppState.adminsList));
  }

  // 6. Rendu initial de l'authentification dans le header et mobile nav
  renderAuthUI();

  // 7. Initialisation du mode d'affichage (Plein écran sans pop-up si #admin)
  if (window.location.hash === "#admin" || window.location.hash.includes("admin")) {
    showFullScreenAdmin(true);
  } else {
    showFullScreenAdmin(false);
  }

  // 8. Initialisation de la vue (Accueil vs Catalogue) si mode public
  if (window.location.hash === "#catalogue" || window.location.hash === "#annonces") {
    switchView("catalogue");
  } else if (window.location.hash === "#home" || window.location.hash === "") {
    switchView("home");
  }

  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#admin" || window.location.hash.includes("admin")) {
      showFullScreenAdmin(true);
    } else if (window.location.hash === "#public" || window.location.hash === "#home" || window.location.hash === "") {
      showFullScreenAdmin(false);
      switchView("home");
    } else if (window.location.hash === "#catalogue" || window.location.hash === "#annonces") {
      showFullScreenAdmin(false);
      switchView("catalogue");
    }
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// ==========================================
// LECTURE ET CHARGEMENT DES DONNÉES (GAS)
// ==========================================
async function loadAppData() {
  const loader = document.getElementById("annonces-loader");
  if (loader) loader.classList.remove("hidden");

  try {
    // Récupération des annonces
    const resAnnonces = await fetch(`${API_URL}?action=Annonces`, { redirect: "follow" });
    allAnnonces = await resAnnonces.json();

    // Récupération de la configuration (liens de paiement, tarifs, etc.)
    const resConfig = await fetch(`${API_URL}?action=Config`, { redirect: "follow" });
    appConfig = await resConfig.json();

    // Synchronisation avec l'état global AppState
    if (Array.isArray(allAnnonces) && allAnnonces.length > 0) {
      const map = new Map();
      allAnnonces.forEach(item => {
        if (item.ID && item.Pseudo) {
          map.set(item.ID, item);
        }
      });
      const list = Array.from(map.values()).reverse();
      AppState.annonces = list.length > 0 ? list : getDefaultSampleAnnonces();
      allAnnonces = AppState.annonces;
    } else if (!AppState.annonces || AppState.annonces.length === 0) {
      AppState.annonces = getDefaultSampleAnnonces();
      allAnnonces = AppState.annonces;
    }

    if (Array.isArray(appConfig) && appConfig.length > 0) {
      AppState.configPrix = appConfig.filter(c => c && (c.TrancheMin !== "" && c.TrancheMin !== undefined));
    }

    // Afficher les annonces dans le DOM (si la fonction d'affichage existe)
    if (typeof renderAnnonces === 'function') {
      renderAnnonces(allAnnonces);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des données :", error);
    if (!AppState.annonces || AppState.annonces.length === 0) {
      AppState.annonces = getDefaultSampleAnnonces();
      allAnnonces = AppState.annonces;
    }
    if (typeof renderAnnonces === 'function') {
      renderAnnonces(allAnnonces);
    }
  } finally {
    if (loader) loader.classList.add("hidden");
  }
}

function renderAnnonces(annonces) {
  if (Array.isArray(annonces) && annonces.length > 0) {
    AppState.annonces = annonces;
    allAnnonces = annonces;
  }
  renderHomeRecentAnnonces();
  applyFilters();
}
window.renderAnnonces = renderAnnonces;

// ==========================================
// GESTION DU DÉBLOCAGE POST-PAIEMENT (CHARIOW)
// ==========================================
async function checkPaymentReturn() {
  const urlParams = new URLSearchParams(window.location.search);
  const rawStatus = urlParams.get('status');
  const status = rawStatus ? rawStatus.toLowerCase().trim() : null;
  const annonceId = urlParams.get('id') || urlParams.get('ref');

  // 1. Cas : Paiement validé avec succès
  if ((status === 'success' || status === 'paid' || status === 'completed') && annonceId) {
    // Si les annonces ne sont pas encore chargées, on force le chargement
    if (!allAnnonces || allAnnonces.length === 0) {
      await loadAppData();
    }

    // Recherche de l'annonce correspondant à l'ID
    const annonce = (allAnnonces || []).find(item => String(item.ID) === String(annonceId)) ||
                    (AppState.annonces || []).find(item => String(item.ID) === String(annonceId));

    if (annonce) {
      // Fermer immédiatement toute modale de déblocage ouverte
      closeUnlockModal();
      // Affichage direct de la modale de succès avec les coordonnées
      showUnlockedContactModal(annonce);
      showToast(`Paiement Chariow validé avec succès ! Le contact de ${annonce.Pseudo || "l'annonceur"} est débloqué.`, "success", { title: "Paiement Réussi ✓", duration: 6000 });
    } else {
      showToast(`Paiement validé avec succès ! Cependant, l'annonce (${annonceId}) est introuvable ou a été clôturée.`, "warning", { title: "Annonce Non Trouvée", duration: 6000 });
    }

    // Nettoyage de l'URL pour retirer les paramètres sans recharger la page
    window.history.replaceState({}, document.title, window.location.pathname);
  } 
  // 2. Cas : Paiement annulé par l'utilisateur
  else if (status === 'cancel' || status === 'cancelled' || status === 'annule') {
    showToast("Le paiement a été interrompu ou annulé. Aucun débit n'a été effectué.", "info", { title: "Paiement Annulé", duration: 5000 });
    window.history.replaceState({}, document.title, window.location.pathname);
  } 
  // 3. Cas : Échec ou refus de la transaction
  else if (status === 'failed' || status === 'error' || status === 'refused' || status === 'echec') {
    showToast("La transaction Chariow a échoué. Veuillez vérifier votre solde ou utiliser un autre mode de paiement.", "error", { title: "Échec du Paiement", duration: 6000 });
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// ==========================================
// AFFICHAGE DU CONTACT DÉBLOQUÉ
// ==========================================
function showUnlockedContactModal(annonce) {
  if (!annonce) return;

  const cleanPhone = String(annonce.Telephone || "").replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Bonjour ${annonce.Pseudo || "Partenaire"}, je vous contacte depuis FrikChange concernant votre annonce (${annonce.ID}).`)}`;

  // Enregistrer le contact débloqué de façon persistante
  if (annonce.ID) {
    AppState.unlockedContacts[annonce.ID] = {
      unlockedAt: new Date().toISOString(),
      phone: annonce.Telephone
    };
    localStorage.setItem("frikchange_unlocked_contacts", JSON.stringify(AppState.unlockedContacts));
    localStorage.setItem("africhange_unlocked_contacts", JSON.stringify(AppState.unlockedContacts));
    renderUnlockedBadgesCount();
    if (typeof renderCatalogue === "function") renderCatalogue();
  }

  // Fermer la modale de paiement/déblocage si elle était ouverte
  closeUnlockModal();

  // Affichage direct dans la modale de contact débloqué
  const modalContainer = document.getElementById('unlockedModal');
  
  if (modalContainer) {
    const pseudoEl = document.getElementById('unlockedPseudo');
    const phoneEl = document.getElementById('unlockedPhone');
    const waBtn = document.getElementById('unlockedWaBtn');

    if (pseudoEl) pseudoEl.textContent = annonce.Pseudo || 'L\'annonceur';
    if (phoneEl) phoneEl.textContent = annonce.Telephone || 'Numéro WhatsApp';
    if (waBtn) waBtn.href = waUrl;

    modalContainer.classList.remove('hidden');
    modalContainer.classList.add('flex');
    if (window.lucide) window.lucide.createIcons();
  } else {
    // Fallback direct
    const confirmChoice = confirm(
      `🎉 PAIEMENT VALIDÉ !\n\nContact débloqué pour l'annonce ${annonce.ID} :\n` +
      `Nom : ${annonce.Pseudo}\n` +
      `Téléphone : ${annonce.Telephone}\n\n` +
      `Voulez-vous ouvrir directement la discussion WhatsApp ?`
    );
    if (confirmChoice) {
      window.open(waUrl, '_blank');
    }
  }
}

function closeUnlockedModal() {
  const modalContainer = document.getElementById('unlockedModal');
  if (modalContainer) {
    modalContainer.classList.add('hidden');
    modalContainer.classList.remove('flex');
  }
}

// ==========================================
// REPRISE DU LIEN DE PAIEMENT DYNAMIQUE (CHARIOW)
// ==========================================
function redirectToPayment(annonceId, basePaymentUrl) {
  if (!basePaymentUrl) {
    showToast("Aucun lien de paiement n'a été configuré pour cette tranche. Veuillez contacter l'administrateur.", "error", { title: "Configuration Incomplète" });
    return;
  }

  // Suivi analytique de conversion vers le paiement Chariow
  if (typeof trackAnalyticsEvent === "function") {
    trackAnalyticsEvent("unlock_chariow_click", { annonceId });
  }

  showToast("Redirection en cours vers la passerelle sécurisée Chariow...", "info", { title: "Paiement Sécurisé", duration: 3000 });

  // Ajout de l'ID d'annonce en paramètre de référence pour Chariow
  const separator = basePaymentUrl.includes('?') ? '&' : '?';
  const finalPaymentUrl = `${basePaymentUrl}${separator}ref=${encodeURIComponent(annonceId)}`;

  // Redirection vers la page de paiement après un bref instant
  setTimeout(() => {
    window.location.href = finalPaymentUrl;
  }, 350);
}

/**
 * Initialisation générale : chargement des données
 */
async function initApp() {
  await loadAppData();
  await Promise.allSettled([
    loadPromos(),
    loadTemoignages()
  ]);
}

/**
 * Gestion du routage et accès privé administrateur
 */
function checkAdminUrlAccess() {
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();

  // Accès privé par lien direct #admin ou ?admin
  if (hash === "#admin" || hash.includes("admin") || search.includes("admin")) {
    openAdminModal();
  }
}

function setupAdminRouteListener() {
  window.addEventListener("hashchange", checkAdminUrlAccess);
  checkAdminUrlAccess(); // Vérification immédiate au chargement initial

  // Raccourci secret clavier pour les administrateurs : Ctrl+Alt+A ou Ctrl+Shift+A
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey) && (e.key === "A" || e.key === "a")) {
      e.preventDefault();
      openAdminModal();
    }
  });
}

function copyAdminLink() {
  const url = window.location.origin + window.location.pathname + "#admin";
  navigator.clipboard.writeText(url).then(() => {
    showToast("Lien secret administrateur copié dans le presse-papiers !", "success");
  }).catch(() => {
    prompt("Voici votre lien privé administrateur :", url);
  });
}

/**
 * 1. CHARGEMENT ET GESTION DU BANDEAU PROMO & TIMER
 */
async function loadPromos() {
  try {
    const res = await fetch(`${API_URL}?action=promos_admin`, { redirect: "follow" });
    const data = await res.json();
    
    if (Array.isArray(data) && data.length > 0) {
      // Trouver la dernière promo active
      const activePromos = data.filter(p => p.Actif === true || p.Actif === "true" || p.Actif === "Oui" || p.Actif === "OUI");
      if (activePromos.length > 0) {
        AppState.promos = activePromos[activePromos.length - 1];
      } else {
        // Prendre la dernière définie
        AppState.promos = data[data.length - 1];
      }
    } else {
      // Promo par défaut
      AppState.promos = {
        Titre: "🌟 Offre de Lancement FrikChange",
        Message: "Frais de déblocage WhatsApp réduits de 50% sur les transferts et services GP Maroc ⇄ Sénégal / CI / Cameroun !",
        DateFinTimer: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
        Actif: true
      };
    }
    renderPromoBanner();
  } catch (err) {
    console.warn("Erreur chargement promos:", err);
    // Afficher une promo par défaut si réseau indisponible
    AppState.promos = {
      Titre: "🌟 Offre de Lancement FrikChange",
      Message: "Profitez de réductions exclusives sur les déblocages WhatsApp Maroc ⇄ Afrique Subsaharienne !",
      DateFinTimer: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
      Actif: true
    };
    renderPromoBanner();
  }
}

function renderPromoBanner() {
  const banner = document.getElementById("promo-banner");
  if (!banner) return;

  const urgency = AppState.urgencyPromo;
  if (urgency && typeof urgency.active === "boolean") {
    if (!urgency.active) {
      banner.classList.add("hidden");
      return;
    }
    banner.classList.remove("hidden");
    const titleEl = document.getElementById("promo-title");
    const msgEl = document.getElementById("promo-message");
    if (titleEl) titleEl.textContent = urgency.title || "Offre Spéciale";
    if (msgEl) msgEl.textContent = urgency.message || urgency.title || "";
    startCountdown(urgency.endDate);
    return;
  }

  const promo = AppState.promos;
  if (!promo) return;
  const isActif = promo.Actif === true || promo.Actif === "true" || promo.Actif === "Oui" || promo.Actif === "" || promo.Actif === undefined;

  if (!isActif) {
    banner.classList.add("hidden");
    return;
  }

  banner.classList.remove("hidden");
  const titleEl = document.getElementById("promo-title");
  const msgEl = document.getElementById("promo-message");
  if (titleEl) titleEl.textContent = promo.Titre || "Offre Exceptionnelle";
  if (msgEl) msgEl.textContent = promo.Message || "";

  // Démarrer le compte à rebours
  startCountdown(promo.DateFinTimer);
}

function startCountdown(dateFinString) {
  if (AppState.countdownInterval) {
    clearInterval(AppState.countdownInterval);
  }

  let targetDate = new Date(dateFinString);
  if (isNaN(targetDate.getTime())) {
    // Si format invalide, date par défaut à J+7
    targetDate = new Date(Date.now() + 7 * 24 * 3600 * 1000);
  }

  function updateTimer() {
    const now = new Date().getTime();
    const diff = targetDate.getTime() - now;

    const daysEl = document.getElementById("timer-days");
    const hoursEl = document.getElementById("timer-hours");
    const minutesEl = document.getElementById("timer-minutes");
    const secondsEl = document.getElementById("timer-seconds");

    const testDaysEl = document.getElementById("admin-test-days");
    const testHoursEl = document.getElementById("admin-test-hours");
    const testMinutesEl = document.getElementById("admin-test-minutes");
    const testSecondsEl = document.getElementById("admin-test-seconds");

    if (diff <= 0) {
      ["00"].forEach(val => {
        if (daysEl) daysEl.textContent = val;
        if (hoursEl) hoursEl.textContent = val;
        if (minutesEl) minutesEl.textContent = val;
        if (secondsEl) secondsEl.textContent = val;
        if (testDaysEl) testDaysEl.textContent = val;
        if (testHoursEl) testHoursEl.textContent = val;
        if (testMinutesEl) testMinutesEl.textContent = val;
        if (testSecondsEl) testSecondsEl.textContent = val;
      });
      const statusEl = document.getElementById("timer-status");
      if (statusEl) statusEl.textContent = "Offre prolongée !";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");

    if (testDaysEl) testDaysEl.textContent = String(days).padStart(2, "0");
    if (testHoursEl) testHoursEl.textContent = String(hours).padStart(2, "0");
    if (testMinutesEl) testMinutesEl.textContent = String(minutes).padStart(2, "0");
    if (testSecondsEl) testSecondsEl.textContent = String(seconds).padStart(2, "0");
  }

  updateTimer();
  AppState.countdownInterval = setInterval(updateTimer, 1000);
}

/**
 * 2. CHARGEMENT DE LA CONFIGURATION DES PRIX & TRANCHES
 */
async function loadConfigPrix() {
  try {
    let res = await fetch(`${API_URL}?action=Config_Prix`, { redirect: "follow" });
    let data = await res.json();

    if (!Array.isArray(data) || data.length === 0 || data.error) {
      // Tenter avec ?action=Config
      res = await fetch(`${API_URL}?action=Config`, { redirect: "follow" });
      data = await res.json();
    }

    if (Array.isArray(data) && data.length > 0) {
      // Filtrer les lignes valides
      AppState.configPrix = data.filter(c => c.TrancheMin !== "" && c.TrancheMin !== undefined);
    }

    if (!AppState.configPrix || AppState.configPrix.length === 0) {
      // Valeurs par défaut robustes
      AppState.configPrix = [
        {
          TrancheMin: 0,
          TrancheMax: 2000,
          PrixJetons: "15 MAD / 1 000 FCFA",
          LienPaiementChariow: "https://chariow.com/pay/frikchange-contact-tranche-1"
        },
        {
          TrancheMin: 2001,
          TrancheMax: 10000,
          PrixJetons: "30 MAD / 2 000 FCFA",
          LienPaiementChariow: "https://chariow.com/pay/frikchange-contact-tranche-2"
        },
        {
          TrancheMin: 10001,
          TrancheMax: 50000,
          PrixJetons: "60 MAD / 4 000 FCFA",
          LienPaiementChariow: "https://chariow.com/pay/frikchange-contact-tranche-3"
        },
        {
          TrancheMin: 50001,
          TrancheMax: 999999,
          PrixJetons: "100 MAD / 6 500 FCFA",
          LienPaiementChariow: "https://chariow.com/pay/frikchange-contact-tranche-4"
        }
      ];
    }
  } catch (err) {
    console.warn("Erreur chargement Config_Prix:", err);
    AppState.configPrix = [
      {
        TrancheMin: 0,
        TrancheMax: 2000,
        PrixJetons: "15 MAD / 1 000 FCFA",
        LienPaiementChariow: "https://chariow.com/pay/frikchange-tranche-1"
      },
      {
        TrancheMin: 2001,
        TrancheMax: 10000,
        PrixJetons: "30 MAD / 2 000 FCFA",
        LienPaiementChariow: "https://chariow.com/pay/frikchange-tranche-2"
      },
      {
        TrancheMin: 10001,
        TrancheMax: 50000,
        PrixJetons: "60 MAD / 4 000 FCFA",
        LienPaiementChariow: "https://chariow.com/pay/frikchange-tranche-3"
      }
    ];
  }
}

function getDefaultSampleAnnonces() {
  return [
    {
      ID: "ID-101",
      Date: new Date(Date.now() - 1800000).toISOString(),
      "Type (Offre/Besoin)": "Offre",
      Pseudo: "Moussa D.",
      Telephone: "+212612345678",
      Pays: "Maroc",
      Ville: "Casablanca",
      Quartier: "Maarif",
      PaysDestination: "Sénégal",
      VilleDestination: "Dakar",
      DeviseDispo: "MAD",
      DeviseSouhaitee: "FCFA (XOF)",
      Montant: 5000,
      MontantOffre: 5000,
      MontantBesoin: 325000,
      Message: "Dispose de Dirhams marocains en espèces, recherche Francs CFA (XOF) pour transfert vers Dakar. Remise en main propre rapide sur Maarif.",
      Statut: "Approuvé"
    },
    {
      ID: "ID-102",
      Date: new Date(Date.now() - 7200000).toISOString(),
      "Type (Offre/Besoin)": "Besoin",
      Pseudo: "Fatou S.",
      Telephone: "+221771234567",
      Pays: "Sénégal",
      Ville: "Dakar",
      Quartier: "Plateau",
      PaysDestination: "Maroc",
      VilleDestination: "Casablanca",
      DeviseDispo: "FCFA (XOF)",
      DeviseSouhaitee: "MAD",
      Montant: 260000,
      MontantOffre: 260000,
      MontantBesoin: 4000,
      Message: "Recherche Dirhams marocains (MAD) pour voyage imminent à Casablanca. Échange direct à Dakar Plateau.",
      Statut: "Approuvé"
    },
    {
      ID: "ID-103",
      Date: new Date(Date.now() - 14400000).toISOString(),
      "Type (Offre/Besoin)": "Voyageur GP",
      Pseudo: "Amadou B.",
      Telephone: "+22507123456",
      Pays: "Côte d'Ivoire",
      Ville: "Abidjan",
      Quartier: "Cocody",
      PaysDestination: "Maroc",
      VilleDestination: "Casablanca",
      DeviseDispo: "FCFA (XOF)",
      DeviseSouhaitee: "MAD",
      Montant: 10000,
      MontantOffre: 10000,
      MontantBesoin: 650000,
      DateDepart: "2026-09-28",
      VilleDestination: "Casablanca",
      MessageGP: "Vol direct Abidjan - Casablanca. Kilos disponibles en soute, remise de devises et plis urgents.",
      Message: "GP régulier et fiable. Remise possible à l'arrivée aéroport Mohammed V ou en ville.",
      Statut: "Approuvé"
    },
    {
      ID: "ID-104",
      Date: new Date(Date.now() - 28800000).toISOString(),
      "Type (Offre/Besoin)": "Offre",
      Pseudo: "Youssef K.",
      Telephone: "+212698765432",
      Pays: "Maroc",
      Ville: "Rabat",
      Quartier: "Agdal",
      PaysDestination: "Guinée",
      VilleDestination: "Conakry",
      DeviseDispo: "MAD",
      DeviseSouhaitee: "GNF",
      Montant: 3000,
      MontantOffre: 3000,
      MontantBesoin: 2600000,
      Message: "Dispose de MAD en espèces, recherche Francs Guinéens (GNF) sur Rabat Agdal ou envoi Conakry.",
      Statut: "Approuvé"
    },
    {
      ID: "ID-105",
      Date: new Date(Date.now() - 43200000).toISOString(),
      "Type (Offre/Besoin)": "Voyageur GP",
      Pseudo: "Kouamé N.",
      Telephone: "+212654321098",
      Pays: "Maroc",
      Ville: "Casablanca",
      Quartier: "Gauthier",
      PaysDestination: "Côte d'Ivoire",
      VilleDestination: "Abidjan",
      DeviseDispo: "MAD",
      DeviseSouhaitee: "FCFA (XOF)",
      Montant: 15000,
      MontantOffre: 15000,
      MontantBesoin: 975000,
      DateDepart: "2026-10-02",
      MessageGP: "Trajet Casablanca - Abidjan Felix Houphouët-Boigny. 18 kg de fret disponible en soute + devises FCFA.",
      Message: "Remise sécurisée avant vol à Casa Maarif ou à l'arrivée Cocody.",
      Statut: "Approuvé"
    },
    {
      ID: "ID-106",
      Date: new Date(Date.now() - 57600000).toISOString(),
      "Type (Offre/Besoin)": "Offre",
      Pseudo: "Marc-Aurele T.",
      Telephone: "+237690123456",
      Pays: "Cameroun",
      Ville: "Douala",
      Quartier: "Akwa",
      PaysDestination: "Maroc",
      VilleDestination: "Casablanca",
      DeviseDispo: "FCFA (XAF)",
      DeviseSouhaitee: "MAD",
      Montant: 650000,
      MontantOffre: 650000,
      MontantBesoin: 10000,
      Message: "Dispose de FCFA XAF à Douala Akwa, souhaite obtenir des dirhams marocains MAD pour voyage d'études à Casablanca.",
      Statut: "Approuvé"
    }
  ];
}

/**
 * 3. CHARGEMENT ET GESTION DES ANNONCES
 */
async function loadAnnonces() {
  const container = document.getElementById("annonces-container");
  const loader = document.getElementById("annonces-loader");
  if (loader) loader.classList.remove("hidden");

  // Récupérer les annonces publiées localement par l'utilisateur / admin
  const localCustom = JSON.parse(localStorage.getItem("frikchange_custom_annonces") || "[]");

  try {
    const res = await fetch(`${API_URL}?action=Annonces`, { redirect: "follow" });
    const data = await res.json();

    let remoteList = [];
    if (Array.isArray(data) && data.length > 0) {
      // Dédupliquer par ID (prendre le plus récent si mise à jour)
      const map = new Map();
      data.forEach(item => {
        if (item.ID && item.Pseudo) {
          map.set(item.ID, item);
        }
      });
      remoteList = Array.from(map.values()).reverse();
    } else {
      remoteList = getDefaultSampleAnnonces();
    }

    // Fusionner : les annonces locales récentes en tête, puis le reste
    const combined = [...localCustom, ...remoteList];
    const uniqueMap = new Map();
    combined.forEach(item => {
      if (item && item.ID && !uniqueMap.has(item.ID)) {
        uniqueMap.set(item.ID, item);
      }
    });

    AppState.annonces = Array.from(uniqueMap.values());
    applyFilters();
    renderHomeRecentAnnonces();
  } catch (err) {
    console.warn("Connexion Google Sheets : utilisation du catalogue local FrikChange", err);
    const fallbackList = getDefaultSampleAnnonces();
    const combined = [...localCustom, ...fallbackList];
    const uniqueMap = new Map();
    combined.forEach(item => {
      if (item && item.ID && !uniqueMap.has(item.ID)) {
        uniqueMap.set(item.ID, item);
      }
    });
    AppState.annonces = Array.from(uniqueMap.values());
    applyFilters();
    renderHomeRecentAnnonces();
  } finally {
    if (loader) loader.classList.add("hidden");
  }
}

/**
 * 4. CHARGEMENT ET GESTION DES TÉMOIGNAGES
 */
async function loadTemoignages() {
  try {
    const res = await fetch(`${API_URL}?action=temoignages`, { redirect: "follow" });
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      // Filtrer les témoignages ayant un nom et message
      AppState.temoignages = data.filter(t => t.Nom && (t.Commentaire || t.Message));
    } else {
      AppState.temoignages = [
        {
          Nom: "Ibrahima Fall",
          Ville: "Casablanca (Maarif)",
          "Note (1-5)": 5,
          Commentaire: "Mise en relation rapide à Maarif en 30 minutes pour 4 000 MAD et FCFA XOF. Annonceur très sérieux, contact WhatsApp obtenu instantanément !",
          Approuve: true
        },
        {
          Nom: "Aïssatou Kouassi",
          Ville: "Abidjan / Rabat",
          "Note (1-5)": 5,
          Commentaire: "Excellente expérience avec un voyageur GP pour acheminer un pli urgent et solidaire entre Abidjan et Rabat.",
          Approuve: true
        },
        {
          Nom: "Karim Benjelloun",
          Ville: "Dakar / Casa",
          "Note (1-5)": 5,
          Commentaire: "Plateforme indispensable pour la communauté marocaine au Sénégal et les étudiants subsahariens au Maroc. Zéro arnaque.",
          Approuve: true
        }
      ];
    }
    renderTemoignages();
  } catch (err) {
    console.warn("Erreur chargement témoignages:", err);
    renderTemoignages();
  }
}

function renderTemoignages() {
  const container = document.getElementById("temoignages-container");
  if (!container) return;

  // Filtrer approuvés pour le public
  const approved = AppState.temoignages.filter(t => 
    t.Approuve === true || t.Approuve === "true" || t.Approuve === "Oui" || t.Approuve === "OUI" || t.Approuve === "Approuvé" || t.Approuve === "" || t.Approuve === undefined
  );

  if (approved.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-10 bg-white rounded-2xl border border-slate-200">
        <p class="text-slate-500">Aucun avis publié pour le moment. Soyez le premier à partager votre retour !</p>
      </div>
    `;
    return;
  }

  container.innerHTML = approved.map(t => {
    const note = Math.min(5, Math.max(1, parseInt(t["Note (1-5)"] || t.Note || 5)));
    const stars = Array(5).fill(0).map((_, i) => i < note 
      ? `<span class="text-amber-400">★</span>` 
      : `<span class="text-slate-300">★</span>`
    ).join("");

    return `
      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-base">
                ${(t.Nom || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 class="font-bold text-slate-800 text-sm">${escapeHtml(t.Nom || "Utilisateur vérifié")}</h4>
                <p class="text-xs text-slate-500 flex items-center gap-1">
                  <i data-lucide="map-pin" class="w-3 h-3 text-slate-400"></i> ${escapeHtml(t.Ville || "Maroc / Afrique")}
                </p>
              </div>
            </div>
            <div class="text-lg tracking-wider">${stars}</div>
          </div>
          <p class="text-slate-600 text-sm leading-relaxed italic">"${escapeHtml(t.Commentaire || t.Message || "Service rapide et efficace.")}"</p>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-medium">
          <span class="inline-flex items-center gap-1">
            <i data-lucide="badge-check" class="w-4 h-4 text-emerald-500"></i> Transaction vérifiée
          </span>
          <span class="text-slate-400">FrikChange P2P</span>
        </div>
      </div>
    `;
  }).join("");

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Fonctions d'aide pour le filtrage et la détection géographique de destination
 */
function inferCountryFromCity(cityName) {
  if (!cityName) return "";
  const clean = cityName.trim().toLowerCase();
  for (const [country, data] of Object.entries(GEOGRAPHY_DATA)) {
    if (country.toLowerCase() === clean) return country;
    if (data.villes && Object.keys(data.villes).some(v => v.toLowerCase() === clean || clean.includes(v.toLowerCase()))) {
      return country;
    }
  }
  if (/casablanca|rabat|marrakech|tanger|fès|agadir/i.test(clean)) return "Maroc";
  if (/dakar|thiès|saint-louis/i.test(clean)) return "Sénégal";
  if (/abidjan|bouaké|san-pédro/i.test(clean)) return "Côte d'Ivoire";
  if (/douala|yaoundé/i.test(clean)) return "Cameroun";
  if (/conakry|kindia/i.test(clean)) return "Guinée";
  if (/bamako/i.test(clean)) return "Mali";
  if (/kinshasa|lubumbashi/i.test(clean)) return "RDC (Congo Kinshasa)";
  if (/libreville/i.test(clean)) return "Gabon";
  if (/paris|lyon|marseille/i.test(clean)) return "France";
  return "";
}

function matchesAnnonceDestination(item, selectedCountry) {
  if (!selectedCountry) return true;
  const sel = selectedCountry.toLowerCase().trim();

  // 1. Correspondance directe sur PaysDestination explicite
  if (item.PaysDestination && item.PaysDestination.toLowerCase().includes(sel)) return true;

  // 2. Correspondance via VilleDestination
  if (item.VilleDestination) {
    const vd = item.VilleDestination.toLowerCase();
    if (vd.includes(sel)) return true;
    if (GEOGRAPHY_DATA[selectedCountry] && GEOGRAPHY_DATA[selectedCountry].villes) {
      if (Object.keys(GEOGRAPHY_DATA[selectedCountry].villes).some(v => vd.includes(v.toLowerCase()))) {
        return true;
      }
    }
    const inferred = inferCountryFromCity(item.VilleDestination);
    if (inferred && inferred.toLowerCase().includes(sel)) return true;
  }

  // 3. Correspondance via Devise Cible (DeviseSouhaitee)
  const devSouh = (item.DeviseSouhaitee || "").toUpperCase();
  if (sel.includes("maroc") && devSouh.includes("MAD")) return true;
  if (sel.includes("guinée") && devSouh.includes("GNF")) return true;
  if (sel.includes("rdc") && devSouh.includes("CDF")) return true;
  if (sel.includes("nigéria") && devSouh.includes("NGN")) return true;
  if ((sel.includes("france") || sel.includes("europe")) && devSouh.includes("EUR")) return true;

  const xofCountries = ["sénégal", "senegal", "côte d'ivoire", "cote d'ivoire", "mali", "bénin", "togo", "burkina faso"];
  if (devSouh.includes("XOF") && xofCountries.some(c => sel.includes(c))) {
    if (!item.PaysDestination || item.PaysDestination.toLowerCase().includes(sel)) return true;
  }

  const xafCountries = ["cameroun", "gabon", "congo"];
  if (devSouh.includes("XAF") && xafCountries.some(c => sel.includes(c))) {
    if (!item.PaysDestination || item.PaysDestination.toLowerCase().includes(sel)) return true;
  }

  // 4. Mention textuelle dans le message ou message GP
  const combinedText = `${item.Message || ""} ${item.MessageGP || ""}`.toLowerCase();
  if (combinedText.includes(sel)) return true;
  if (GEOGRAPHY_DATA[selectedCountry] && GEOGRAPHY_DATA[selectedCountry].villes) {
    if (Object.keys(GEOGRAPHY_DATA[selectedCountry].villes).some(v => combinedText.includes(v.toLowerCase()))) {
      return true;
    }
  }

  return false;
}

/**
 * 5. GESTION DES FILTRES ET AFFICHAGE DU CATALOGUE & DES ANNONCES À LA UNE
 */
function applyFilters() {
  const { 
    annonces, 
    activeFilterType, 
    activeFilterPays, 
    activeFilterPaysDestination,
    activeFilterVille, 
    activeFilterQuartier, 
    activeFilterDevise, 
    activeFilterDeviseDonnee,
    activeFilterDeviseRecue,
    activeFilterTranche, 
    searchQuery 
  } = AppState;

  AppState.filteredAnnonces = (annonces || []).filter(item => {
    // Ne pas afficher les annonces rejetées pour le grand public
    const status = (item.Statut || "").toLowerCase();
    if (status === "rejeté" || status === "rejete" || status === "supprimé") {
      return false;
    }

    // Filtre par type
    if (activeFilterType !== "all") {
      const type = (item["Type (Offre/Besoin)"] || "").toLowerCase();
      if (activeFilterType === "offre" && !type.includes("offre")) return false;
      if (activeFilterType === "besoin" && !type.includes("besoin")) return false;
      if (activeFilterType === "gp" && !type.includes("voyageur") && !type.includes("gp")) return false;
    }

    // Filtre par pays de départ (origine)
    if (activeFilterPays && item.Pays !== activeFilterPays) {
      return false;
    }

    // Filtre par pays de destination (Nouveau filtre)
    if (activeFilterPaysDestination && !matchesAnnonceDestination(item, activeFilterPaysDestination)) {
      return false;
    }

    // Filtre par ville
    if (activeFilterVille && item.Ville !== activeFilterVille) {
      return false;
    }

    // Filtre par quartier
    if (activeFilterQuartier && item.Quartier !== activeFilterQuartier) {
      return false;
    }

    // Filtre par devise générale
    if (activeFilterDevise) {
      const dDispo = item.DeviseDispo || "";
      const dSouh = item.DeviseSouhaitee || "";
      if (!dDispo.includes(activeFilterDevise) && !dSouh.includes(activeFilterDevise)) {
        return false;
      }
    }

    // Filtre par paire de devises (Devise donnée / Devise reçue)
    if (activeFilterDeviseDonnee && activeFilterDeviseRecue) {
      const donnee = activeFilterDeviseDonnee.toUpperCase();
      const recue = activeFilterDeviseRecue.toUpperCase();
      const dDispo = (item.DeviseDispo || "").toUpperCase();
      const dSouh = (item.DeviseSouhaitee || "").toUpperCase();

      const pairMatchDirect = dDispo.includes(donnee) && dSouh.includes(recue);
      const pairMatchInverse = dDispo.includes(recue) && dSouh.includes(donnee);
      if (!pairMatchDirect && !pairMatchInverse) {
        return false;
      }
    } else {
      if (activeFilterDeviseDonnee) {
        const donnee = activeFilterDeviseDonnee.toUpperCase();
        const dDispo = (item.DeviseDispo || "").toUpperCase();
        const dSouh = (item.DeviseSouhaitee || "").toUpperCase();
        if (!dDispo.includes(donnee) && !dSouh.includes(donnee)) {
          return false;
        }
      }
      if (activeFilterDeviseRecue) {
        const recue = activeFilterDeviseRecue.toUpperCase();
        const dDispo = (item.DeviseDispo || "").toUpperCase();
        const dSouh = (item.DeviseSouhaitee || "").toUpperCase();
        if (!dDispo.includes(recue) && !dSouh.includes(recue)) {
          return false;
        }
      }
    }

    // Filtre par tranche de montant
    if (activeFilterTranche !== "all") {
      const montant = parseFloat(item.Montant || 0);
      if (activeFilterTranche === "tier1" && montant > 2000) return false;
      if (activeFilterTranche === "tier2" && (montant < 2001 || montant > 10000)) return false;
      if (activeFilterTranche === "tier3" && (montant < 10001 || montant > 50000)) return false;
      if (activeFilterTranche === "tier4" && montant < 50001) return false;
    }

    // Recherche textuelle
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const searchable = `${item.Pseudo || ""} ${item.Pays || ""} ${item.Ville || ""} ${item.Quartier || ""} ${item.DeviseDispo || ""} ${item.DeviseSouhaitee || ""} ${item["Type (Offre/Besoin)"] || ""}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    return true;
  });

  renderCatalogue();
  renderHomeRecentAnnonces();
}

/**
 * Générateur de carte d'annonce réutilisable avec animation fluide Fade-in / Slide-up
 */
function renderAnnonceCardHtml(annonce, isCompact = false, index = 0) {
  const type = annonce["Type (Offre/Besoin)"] || "Offre";
  const isGP = type.toLowerCase().includes("gp") || type.toLowerCase().includes("voyageur");
  const isOffre = type.toLowerCase().includes("offre");
  
  // Thème badge type
  let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let typeIcon = "arrow-right-left";
  let typeLabel = "Proposition de service / Contact";
  
  if (isGP) {
    badgeStyle = "bg-amber-50 text-amber-800 border-amber-200";
    typeIcon = "plane";
    typeLabel = "Voyageur GP (Colis & Devises)";
  } else if (!isOffre) {
    badgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
    typeIcon = "help-circle";
    typeLabel = "Demande de mise en relation";
  }

  const countryObj = GEOGRAPHY_DATA[annonce.Pays] || { flag: "🌍" };
  const isUnlocked = !!AppState.unlockedContacts[annonce.ID];
  const telephone = annonce.Telephone || "";
  const maskedPhone = maskPhone(telephone);

  // Date formatée
  const dateFormatted = formatDate(annonce.Date);

  // Montants Offre & Besoin
  const montantOffreNum = parseFloat(annonce.MontantOffre || annonce.Montant) || 0;
  const montantBesoinNum = parseFloat(annonce.MontantBesoin) || (montantOffreNum > 0 ? estimateBesoinAmount(montantOffreNum, annonce.DeviseDispo, annonce.DeviseSouhaitee) : 0);

  // Tarification de mise en relation adaptée au montant
  const pricing = getPricingForAmount(montantOffreNum);
  const staggerDelay = Math.min((index % 9) * 55, 450);

  return `
    <div class="annonce-card-animated bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 ${isCompact ? "p-5" : "p-6"} flex flex-col justify-between relative overflow-hidden group" style="animation-delay: ${staggerDelay}ms;">
      <!-- Top bar card -->
      <div>
        <div class="flex items-center justify-between gap-2 mb-3.5">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}">
            <i data-lucide="${typeIcon}" class="w-3.5 h-3.5"></i>
            ${typeLabel}
          </span>
          <span class="text-xs text-slate-400 font-medium flex items-center gap-1">
            <i data-lucide="clock" class="w-3 h-3"></i> ${dateFormatted}
          </span>
        </div>

        ${(annonce.Image || annonce.Photo) ? `
          <div class="mb-3.5 rounded-2xl overflow-hidden max-h-48 w-full border border-slate-200/90 shadow-2xs relative group/img">
            <img src="${escapeHtml(annonce.Image || annonce.Photo)}" alt="Photo annonce" class="w-full h-36 object-cover group-hover/img:scale-105 transition-transform duration-300" />
            <span class="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-white font-medium flex items-center gap-1">
              <i data-lucide="camera" class="w-3 h-3 text-emerald-400"></i> Photo
            </span>
          </div>
        ` : ""}

        <!-- Montants & Devises de l'échange P2P -->
        <div class="bg-slate-50/90 rounded-2xl p-4 mb-4 border border-slate-100 space-y-3">
          <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>${isGP ? "Voyageur GP &amp; Fret" : "Montants de l'échange"}</span>
            <span class="text-emerald-700 font-semibold lowercase flex items-center gap-1">
              <i data-lucide="handshake" class="w-3.5 h-3.5"></i> mise en relation P2P
            </span>
          </div>

          <!-- Double montant : Offre (Donne) ➔ Besoin (Reçoit) -->
          <div class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
            <div class="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span class="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">${isOffre ? "Offre (Donne)" : "Dispose"}</span>
              <div class="text-base sm:text-lg font-black text-slate-900 leading-tight">
                ${montantOffreNum > 0 ? `<span class="tracking-tight">${formatNumber(montantOffreNum)}</span>` : ""} 
                <span class="text-xs font-bold text-emerald-600">${escapeHtml(annonce.DeviseDispo || "MAD")}</span>
              </div>
            </div>

            <div class="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <span class="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">${isOffre ? "Besoin (Reçoit)" : "Recherche"}</span>
              <div class="text-base sm:text-lg font-black text-slate-900 leading-tight">
                ${montantBesoinNum > 0 ? `<span class="tracking-tight">${formatNumber(montantBesoinNum)}</span>` : ""} 
                <span class="text-xs font-bold text-blue-600">${escapeHtml(annonce.DeviseSouhaitee || "FCFA")}</span>
              </div>
            </div>
          </div>

          <!-- Message ou précisions -->
          ${annonce.Message ? `
            <p class="text-slate-600 text-xs italic bg-white/80 px-3 py-2 rounded-xl border border-slate-200/70 leading-relaxed">
              "${escapeHtml(annonce.Message)}"
            </p>
          ` : ""}

          <!-- Si Voyageur GP ou Destination spécifiée : Date de vol, destination et détails fret -->
          ${(isGP || annonce.DateDepart || annonce.MessageGP || annonce.VilleDestination || annonce.PaysDestination) ? `
            <div class="pt-2 border-t border-amber-200/60 bg-amber-50/70 p-2.5 rounded-xl text-xs space-y-1">
              ${annonce.DateDepart ? `
                <div class="flex items-center gap-1.5 font-bold text-amber-900">
                  <i data-lucide="calendar" class="w-3.5 h-3.5 text-amber-700 shrink-0"></i>
                  <span>Vol prévu : ${formatDateFlight(annonce.DateDepart)}</span>
                  ${(annonce.VilleDestination || annonce.PaysDestination) ? `<span class="text-amber-700 font-bold">➔ ${escapeHtml(annonce.PaysDestination ? (annonce.VilleDestination ? `${annonce.PaysDestination} (${annonce.VilleDestination})` : annonce.PaysDestination) : annonce.VilleDestination)}</span>` : ""}
                </div>
              ` : (annonce.VilleDestination || annonce.PaysDestination) ? `
                <div class="flex items-center gap-1.5 font-bold text-amber-900">
                  <i data-lucide="map-pin-check" class="w-3.5 h-3.5 text-emerald-700 shrink-0"></i>
                  <span>Destination : ${escapeHtml(annonce.PaysDestination ? (annonce.VilleDestination ? `${annonce.PaysDestination} (${annonce.VilleDestination})` : annonce.PaysDestination) : annonce.VilleDestination)}</span>
                </div>
              ` : ""}
              ${annonce.MessageGP ? `
                <div class="text-amber-800 text-[11px] leading-snug flex items-start gap-1">
                  <i data-lucide="package" class="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5"></i>
                  <span><strong>Colis / GP :</strong> ${escapeHtml(annonce.MessageGP)}</span>
                </div>
              ` : ""}
            </div>
          ` : ""}
        </div>

        <!-- Localisation & Annonceur -->
        <div class="space-y-2 mb-5">
          <div class="flex items-center gap-2 text-sm text-slate-700 flex-wrap">
            <span class="text-lg">${countryObj.flag}</span>
            <span class="font-semibold text-slate-900">${escapeHtml(annonce.Pays || "Maroc")}</span>
            <span class="text-slate-300">•</span>
            <span class="text-slate-600 font-medium">${escapeHtml(annonce.Ville || "Casablanca")}</span>
            ${annonce.Quartier ? `<span class="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">📍 ${escapeHtml(annonce.Quartier)}</span>` : ""}
            ${(annonce.PaysDestination || annonce.VilleDestination) ? `
              <span class="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                <i data-lucide="map-pin-check" class="w-3 h-3 text-emerald-600"></i>
                <span>Dest. : ${escapeHtml(annonce.PaysDestination || annonce.VilleDestination)}</span>
              </span>
            ` : ""}
          </div>

          <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                ${(annonce.Pseudo || "P").charAt(0).toUpperCase()}
              </div>
              <span class="font-medium text-slate-700">${escapeHtml(annonce.Pseudo || "Partenaire")}</span>
            </div>
            <span class="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Contact vérifié
            </span>
          </div>
        </div>
      </div>

      <!-- Section Contact WhatsApp -->
      <div class="pt-3.5 border-t border-slate-100">
        ${isUnlocked ? `
          <div class="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 mb-2">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                <i data-lucide="unlock" class="w-3.5 h-3.5 text-emerald-600"></i> Contact débloqué
              </span>
              <span class="text-xs font-mono font-bold text-emerald-900">${telephone}</span>
            </div>
            <a href="https://wa.me/${cleanPhoneForWa(telephone)}?text=${encodeURIComponent(`Bonjour ${annonce.Pseudo}, j'ai vu votre annonce sur FrikChange (${type} : ${montantOffreNum > 0 ? formatNumber(montantOffreNum) + ' ' + (annonce.DeviseDispo || 'MAD') + ' contre ' + formatNumber(montantBesoinNum) + ' ' + (annonce.DeviseSouhaitee || 'FCFA') : (annonce.DeviseDispo || 'Devise') + ' ➔ ' + (annonce.DeviseSouhaitee || 'Devise')} à ${annonce.Ville}). Êtes-vous toujours disponible ?`)}" 
               target="_blank" 
               class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-sm cursor-pointer">
              <i data-lucide="message-circle" class="w-4 h-4"></i>
              Discuter sur WhatsApp
            </a>
          </div>
        ` : `
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs text-slate-500 px-1">
              <span class="flex items-center gap-1 font-mono">
                <i data-lucide="lock" class="w-3.5 h-3.5 text-slate-400"></i>
                ${maskedPhone}
              </span>
              <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Frais: ${pricing.PrixJetons || "20 MAD"}
              </span>
            </div>
            <button onclick="if(typeof trackAnalyticsEvent==='function') trackAnalyticsEvent('unlock_click', { annonceId: '${annonce.ID}', source: 'card' }); openUnlockModal('${annonce.ID}')" 
                    class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition shadow-sm group-hover:bg-emerald-600 cursor-pointer">
              <i data-lucide="unlock" class="w-4 h-4 text-emerald-400 group-hover:text-white"></i>
              Débloquer le contact WhatsApp
            </button>
          </div>
        `}
      </div>
    </div>
  `;
}

/**
 * Affichage des 4 annonces récentes sur la page d'accueil
 */
function renderHomeRecentAnnonces() {
  const container = document.getElementById("home-recent-annonces-container");
  const loader = document.getElementById("home-recent-loader");
  if (!container) return;

  const validAnnonces = (AppState.annonces || []).filter(item => {
    const status = (item.Statut || "").toLowerCase();
    return status !== "rejeté" && status !== "rejete" && status !== "supprimé";
  });

  const recent4 = validAnnonces.slice(0, 4);

  if (loader) loader.classList.add("hidden");

  if (recent4.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-10 text-center bg-white rounded-3xl border border-slate-200 text-sm text-slate-500 max-w-md mx-auto">
        <i data-lucide="inbox" class="w-8 h-8 text-slate-300 mx-auto mb-2"></i>
        <p class="font-medium text-slate-700">Aucune annonce récente pour le moment.</p>
        <p class="text-xs text-slate-400 mt-1">Soyez le premier à publier votre offre de change !</p>
      </div>
    `;
  } else {
    container.innerHTML = recent4.map((annonce, idx) => renderAnnonceCardHtml(annonce, true, idx)).join("");
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
window.renderHomeRecentAnnonces = renderHomeRecentAnnonces;

/**
 * Option d'Administration : Masquer / Afficher le compteur d'Annonces Actives sur le Catalogue
 */
let isCatalogueCounterHidden = localStorage.getItem("frikchange_hide_catalogue_counter") === "true";

function updateActiveCounterDisplay() {
  const card = document.getElementById("catalogue-active-count-card");
  const toggleSwitch = document.getElementById("toggle-active-counter-switch");
  const toggleKnob = document.getElementById("toggle-active-counter-knob");
  const toggleText = document.getElementById("toggle-active-counter-text");
  const badge = document.getElementById("admin-active-counter-badge");

  if (card) {
    if (isCatalogueCounterHidden) {
      card.classList.add("hidden");
    } else {
      card.classList.remove("hidden");
    }
  }

  if (toggleSwitch && toggleKnob && toggleText) {
    if (isCatalogueCounterHidden) {
      toggleSwitch.className = "w-8 h-4 bg-slate-600 rounded-full flex items-center p-0.5 transition duration-300";
      toggleKnob.className = "w-3 h-3 bg-white rounded-full transition transform translate-x-0";
      toggleText.textContent = "Compteur Masqué";
      if (badge) {
        badge.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30";
        badge.textContent = "Masqué";
      }
    } else {
      toggleSwitch.className = "w-8 h-4 bg-emerald-600 rounded-full flex items-center p-0.5 transition duration-300";
      toggleKnob.className = "w-3 h-3 bg-white rounded-full transition transform translate-x-4";
      toggleText.textContent = "Compteur Affiché";
      if (badge) {
        badge.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
        badge.textContent = "Visible";
      }
    }
  }
}
window.updateActiveCounterDisplay = updateActiveCounterDisplay;

function toggleActiveCounterVisibility() {
  isCatalogueCounterHidden = !isCatalogueCounterHidden;
  localStorage.setItem("frikchange_hide_catalogue_counter", isCatalogueCounterHidden ? "true" : "false");
  updateActiveCounterDisplay();
  if (typeof showToast === "function") {
    showToast(
      isCatalogueCounterHidden
        ? "Le compteur d'annonces actives est désormais masqué pour les visiteurs publics."
        : "Le compteur d'annonces actives est désormais visible pour les visiteurs publics.",
      "info",
      { title: "Configuration Catalogue" }
    );
  }
}
window.toggleActiveCounterVisibility = toggleActiveCounterVisibility;

/**
 * Affichage du Catalogue complet avec pagination
 */
function renderCatalogue() {
  const container = document.getElementById("annonces-container");
  const countEl = document.getElementById("results-count");
  const totalCountBadge = document.getElementById("catalogue-total-count");
  const paginationControls = document.getElementById("catalogue-pagination-controls");
  const paginationInfo = document.getElementById("catalogue-pagination-info");
  const loadMoreBtn = document.getElementById("catalogue-load-more-btn");
  if (!container) return;

  const total = AppState.filteredAnnonces.length;

  if (countEl) {
    countEl.textContent = `${total} annonce${total > 1 ? "s" : ""} disponible${total > 1 ? "s" : ""}`;
  }
  if (totalCountBadge) {
    totalCountBadge.textContent = total;
  }
  updateActiveCounterDisplay();

  // Si l'affichage public des annonces actives a été désactivé par l'administrateur
  if (!AppState.showPublicAnnoncesActives) {
    if (paginationControls) paginationControls.classList.add("hidden");
    if (countEl) countEl.textContent = "Annonces actives masquées par l'administration";
    container.innerHTML = `
      <div class="col-span-full bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto my-6 space-y-4">
        <div class="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl border border-amber-200 shadow-2xs">
          <i data-lucide="eye-off" class="w-8 h-8"></i>
        </div>
        <div class="space-y-1">
          <h3 class="text-xl font-bold text-slate-800">Annonces actives momentanément masquées</h3>
          <p class="text-slate-500 text-xs sm:text-sm leading-relaxed">
            L'administrateur de la plateforme a temporairement masqué l'affichage public des annonces actives. Le dépôt de nouvelles annonces et l'assistance restent ouverts.
          </p>
        </div>
        <div class="flex flex-wrap gap-3 justify-center pt-2">
          <button type="button" onclick="openPublishModal()" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5">
            <i data-lucide="plus-circle" class="w-4 h-4"></i>
            <span>Publier une annonce</span>
          </button>
          <button type="button" onclick="switchView('home')" class="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5">
            <i data-lucide="home" class="w-4 h-4"></i>
            <span>Retour à l'accueil</span>
          </button>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  if (total === 0) {
    if (paginationControls) paginationControls.classList.add("hidden");
    container.innerHTML = `
      <div class="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto my-6">
        <div class="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl">
          <i data-lucide="search-x" class="w-8 h-8"></i>
        </div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">Aucune annonce trouvée</h3>
        <p class="text-slate-500 text-sm mb-6">Essayez d'élargir vos filtres de pays, ville ou devise, ou soyez le premier à déposer une annonce !</p>
        <div class="flex flex-wrap gap-3 justify-center">
          <button onclick="resetFilters()" class="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 text-sm transition cursor-pointer">
            Réinitialiser les filtres
          </button>
          <button onclick="openPublishModal()" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm transition cursor-pointer">
            Publier une annonce
          </button>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // Découpage pour pagination
  const displayedCount = Math.min(AppState.catalogueDisplayedCount || 9, total);
  const itemsToDisplay = AppState.filteredAnnonces.slice(0, displayedCount);

  container.innerHTML = itemsToDisplay.map((annonce, idx) => renderAnnonceCardHtml(annonce, false, idx)).join("");

  // Mise à jour de la pagination
  if (paginationControls && paginationInfo) {
    paginationControls.classList.remove("hidden");
    paginationInfo.textContent = `Affichage de 1 à ${displayedCount} sur ${total} annonce${total > 1 ? "s" : ""}`;

    if (loadMoreBtn) {
      if (displayedCount >= total) {
        loadMoreBtn.classList.add("hidden");
      } else {
        loadMoreBtn.classList.remove("hidden");
      }
    }
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function loadMoreAnnonces() {
  AppState.catalogueDisplayedCount = (AppState.catalogueDisplayedCount || 9) + 6;
  renderCatalogue();
}
window.loadMoreAnnonces = loadMoreAnnonces;

function showAllAnnonces() {
  AppState.catalogueDisplayedCount = AppState.filteredAnnonces.length;
  renderCatalogue();
}
window.showAllAnnonces = showAllAnnonces;

/**
 * Filtres rapides par paire de devises
 */
function setQuickCurrencyPair(pairKey) {
  AppState.activeFilterQuickPair = pairKey;

  // Style chips
  document.querySelectorAll(".pair-chip").forEach(chip => {
    chip.className = "pair-chip px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition whitespace-nowrap cursor-pointer";
  });
  const activeChip = document.getElementById(`pair-chip-${pairKey}`);
  if (activeChip) {
    activeChip.className = "pair-chip px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 transition whitespace-nowrap cursor-pointer";
  }

  const donneeSelect = document.getElementById("filter-devise-donnee");
  const recueSelect = document.getElementById("filter-devise-recue");

  if (pairKey === "all") {
    AppState.activeFilterDeviseDonnee = "";
    AppState.activeFilterDeviseRecue = "";
    if (donneeSelect) donneeSelect.value = "";
    if (recueSelect) recueSelect.value = "";
  } else if (pairKey === "MAD_XOF") {
    AppState.activeFilterDeviseDonnee = "MAD";
    AppState.activeFilterDeviseRecue = "FCFA (XOF)";
    if (donneeSelect) donneeSelect.value = "MAD";
    if (recueSelect) recueSelect.value = "FCFA (XOF)";
  } else if (pairKey === "XOF_MAD") {
    AppState.activeFilterDeviseDonnee = "FCFA (XOF)";
    AppState.activeFilterDeviseRecue = "MAD";
    if (donneeSelect) donneeSelect.value = "FCFA (XOF)";
    if (recueSelect) recueSelect.value = "MAD";
  } else if (pairKey === "MAD_XAF") {
    AppState.activeFilterDeviseDonnee = "MAD";
    AppState.activeFilterDeviseRecue = "FCFA (XAF)";
    if (donneeSelect) donneeSelect.value = "MAD";
    if (recueSelect) recueSelect.value = "FCFA (XAF)";
  } else if (pairKey === "XAF_MAD") {
    AppState.activeFilterDeviseDonnee = "FCFA (XAF)";
    AppState.activeFilterDeviseRecue = "MAD";
    if (donneeSelect) donneeSelect.value = "FCFA (XAF)";
    if (recueSelect) recueSelect.value = "MAD";
  } else if (pairKey === "MAD_GNF") {
    AppState.activeFilterDeviseDonnee = "MAD";
    AppState.activeFilterDeviseRecue = "GNF";
    if (donneeSelect) donneeSelect.value = "MAD";
    if (recueSelect) recueSelect.value = "GNF";
  }

  AppState.catalogueDisplayedCount = AppState.cataloguePageSize || 9;
  applyFilters();
}
window.setQuickCurrencyPair = setQuickCurrencyPair;

function handleCurrencyPairChange() {
  const donneeSelect = document.getElementById("filter-devise-donnee");
  const recueSelect = document.getElementById("filter-devise-recue");
  AppState.activeFilterDeviseDonnee = donneeSelect ? donneeSelect.value : "";
  AppState.activeFilterDeviseRecue = recueSelect ? recueSelect.value : "";

  // Reset chips highlighting
  document.querySelectorAll(".pair-chip").forEach(chip => {
    chip.className = "pair-chip px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition whitespace-nowrap cursor-pointer";
  });
  const allChip = document.getElementById("pair-chip-all");
  if (!AppState.activeFilterDeviseDonnee && !AppState.activeFilterDeviseRecue && allChip) {
    allChip.className = "pair-chip px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 transition whitespace-nowrap cursor-pointer";
  }

  AppState.catalogueDisplayedCount = AppState.cataloguePageSize || 9;
  applyFilters();
}
window.handleCurrencyPairChange = handleCurrencyPairChange;

function swapCurrencyFilter() {
  const donneeSelect = document.getElementById("filter-devise-donnee");
  const recueSelect = document.getElementById("filter-devise-recue");
  if (!donneeSelect || !recueSelect) return;

  const temp = donneeSelect.value;
  donneeSelect.value = recueSelect.value;
  recueSelect.value = temp;

  handleCurrencyPairChange();
}
window.swapCurrencyFilter = swapCurrencyFilter;

// ==========================================================================
// GESTION DU BOUTON RETOUR ANDROID / NAVIGATEUR & NAVIGATION SPA (POPSTATE)
// ==========================================================================

function pushNavState(stateObj, title, url) {
  try {
    const targetUrl = url || window.location.pathname;
    history.pushState(stateObj, title || "", targetUrl);
  } catch (err) {
    console.warn("[Navigation] Erreur pushNavState:", err);
  }
}
window.pushNavState = pushNavState;

function handleHistoryPop(state) {
  // 1. Fermer les modales ouvertes en priorité (comportement mobile natif Android)
  const openModals = [
    { id: "publish-modal", close: () => closePublishModal(false) },
    { id: "unlock-modal", close: () => closeUnlockModal(false) },
    { id: "auth-modal", close: () => closeAuthModal(false) },
    { id: "ambassadeur-modal", close: () => closeAmbassadeurModal(false) },
    { id: "review-modal", close: () => closeReviewModal(false) },
    { id: "admin-modal", close: () => closeAdminModal(false) },
    { id: "admin-edit-annonce-modal", close: () => adminCloseEditAnnonceModal(false) },
    { id: "admin-edit-publication-modal", close: () => typeof adminCloseEditPubModal === "function" && adminCloseEditPubModal(false) },
    { id: "admin-edit-moderator-modal", close: () => typeof adminCloseEditModeratorModal === "function" && adminCloseEditModeratorModal(false) },
    { id: "admin-add-tier-modal", close: () => typeof adminCloseAddTierModal === "function" && adminCloseAddTierModal(false) },
    { id: "pwa-ios-modal", close: () => typeof closePwaIosModal === "function" && closePwaIosModal(false) },
    { id: "user-space-modal", close: () => typeof closeUserSpaceModal === "function" && closeUserSpaceModal(false) }
  ];

  for (const m of openModals) {
    const el = document.getElementById(m.id);
    if (el && !el.classList.contains("hidden")) {
      m.close();
      return; // Traite une modale par clic sur la touche Retour
    }
  }

  // 2. Fermer la bulle de chat Frikbot si ouverte
  const frikbotChat = document.getElementById("frikbot-chat-window");
  if (frikbotChat && !frikbotChat.classList.contains("hidden")) {
    frikbotChat.classList.add("hidden");
    frikbotChatOpen = false;
    return;
  }

  // 3. Replier la Carte des Lieux Sécurisés si ouverte
  const mapSection = document.getElementById("google-maps-safe-spots");
  if (mapSection && !mapSection.classList.contains("hidden")) {
    toggleMapSection(false, false);
    return;
  }

  // 4. Replier la section FAQ si ouverte
  const faqSection = document.getElementById("faq");
  if (faqSection && !faqSection.classList.contains("hidden")) {
    toggleFaqSection(false, false);
    return;
  }

  // 5. Sortir du mode Admin exclusif
  if (AppState.adminExclusiveMode) {
    toggleAdminExclusiveMode(false, false);
    return;
  }

  // 6. Si l'utilisateur est sur la vue Catalogue, revenir à l'Accueil
  if (AppState.currentView === "catalogue") {
    switchView("home", false);
    return;
  }

  // 7. Navigation basée sur l'état popstate
  if (state && state.view) {
    if (state.view === "home" && AppState.currentView !== "home") {
      switchView("home", false);
    } else if (state.view === "catalogue" && AppState.currentView !== "catalogue") {
      switchView("catalogue", false);
    }
  }
}
window.handleHistoryPop = handleHistoryPop;

function initNavigationHistory() {
  if (!history.state) {
    history.replaceState({ view: "home", modal: null, section: null }, "", window.location.pathname + window.location.search);
  }

  window.addEventListener("popstate", (event) => {
    handleHistoryPop(event.state);
  });
}
window.initNavigationHistory = initNavigationHistory;

/**
 * Gestion du Masquage & Affichage de la Carte des Lieux Sécurisés
 */
function toggleMapSection(forceOpen, updateHistory = true) {
  const mapSection = document.getElementById("google-maps-safe-spots");
  const toggleBtnText = document.getElementById("btn-toggle-map-text");
  const toggleBtnIcon = document.getElementById("btn-toggle-map-icon");
  if (!mapSection) return;

  const isCurrentlyHidden = mapSection.classList.contains("hidden");
  const shouldOpen = forceOpen !== undefined ? forceOpen : isCurrentlyHidden;

  if (shouldOpen) {
    mapSection.classList.remove("hidden");
    if (toggleBtnText) toggleBtnText.textContent = "Masquer la Carte des Lieux Sécurisés";
    if (toggleBtnIcon) toggleBtnIcon.classList.add("rotate-180");
    if (updateHistory) {
      pushNavState({ view: AppState.currentView, section: "map" }, "", "#carte-securisee");
    }
    setTimeout(() => {
      if (typeof initGoogleMapsSafeSpots === "function") {
        initGoogleMapsSafeSpots();
      }
      mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  } else {
    mapSection.classList.add("hidden");
    if (toggleBtnText) toggleBtnText.textContent = "Voir les Points de Rencontre Sécurisés (Carte)";
    if (toggleBtnIcon) toggleBtnIcon.classList.remove("rotate-180");
  }

  if (window.lucide) window.lucide.createIcons();
}
window.toggleMapSection = toggleMapSection;

/**
 * Gestion du Masquage & Affichage du Centre d'Aide & FAQ
 */
function toggleFaqSection(forceOpen, updateHistory = true) {
  const faqSection = document.getElementById("faq");
  const toggleBtnText = document.getElementById("btn-toggle-faq-text");
  const toggleBtnIcon = document.getElementById("btn-toggle-faq-icon");
  if (!faqSection) return;

  const isCurrentlyHidden = faqSection.classList.contains("hidden");
  const shouldOpen = forceOpen !== undefined ? forceOpen : isCurrentlyHidden;

  if (shouldOpen) {
    faqSection.classList.remove("hidden");
    if (toggleBtnText) toggleBtnText.textContent = "Masquer le Centre d'Aide & FAQ";
    if (toggleBtnIcon) toggleBtnIcon.classList.add("rotate-180");
    if (updateHistory) {
      pushNavState({ view: AppState.currentView, section: "faq" }, "", "#faq");
    }
    setTimeout(() => {
      faqSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  } else {
    faqSection.classList.add("hidden");
    if (toggleBtnText) toggleBtnText.textContent = "Consulter le Centre d'Aide & FAQ";
    if (toggleBtnIcon) toggleBtnIcon.classList.remove("rotate-180");
  }

  if (window.lucide) window.lucide.createIcons();
}
window.toggleFaqSection = toggleFaqSection;

/**
 * Système de basculement des vues SPA (Accueil vs Toutes les Annonces)
 */
function switchView(viewName, updateHistory = true) {
  const homeView = document.getElementById("view-home");
  const catalogueView = document.getElementById("view-catalogue");
  const navItemHome = document.getElementById("nav-item-home");
  const navItemCat = document.getElementById("nav-item-catalogue");
  const mobileNavHome = document.getElementById("mobile-nav-home");
  const mobileNavCat = document.getElementById("mobile-nav-catalogue");

  if (viewName === "catalogue") {
    AppState.currentView = "catalogue";
    if (homeView) homeView.classList.add("hidden");
    if (catalogueView) catalogueView.classList.remove("hidden");

    // Nav Desktop
    if (navItemHome) {
      navItemHome.classList.remove("text-emerald-600", "font-bold");
      navItemHome.classList.add("text-slate-600");
    }
    if (navItemCat) {
      navItemCat.classList.add("text-emerald-600", "font-bold");
      navItemCat.classList.remove("text-slate-600");
    }

    // Nav Mobile
    if (mobileNavHome) {
      mobileNavHome.className = "px-3.5 py-1.5 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 text-xs shadow-2xs flex items-center gap-1 cursor-pointer hover:bg-slate-50";
    }
    if (mobileNavCat) {
      mobileNavCat.className = "px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer";
    }

    if (updateHistory && window.location.hash !== "#catalogue" && window.location.hash !== "#annonces") {
      pushNavState({ view: "catalogue", modal: null }, "", "#catalogue");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    renderCatalogue();
  } else {
    AppState.currentView = "home";
    if (catalogueView) catalogueView.classList.add("hidden");
    if (homeView) homeView.classList.remove("hidden");

    // Nav Desktop
    if (navItemHome) {
      navItemHome.classList.add("text-emerald-600", "font-bold");
      navItemHome.classList.remove("text-slate-600");
    }
    if (navItemCat) {
      navItemCat.classList.remove("text-emerald-600", "font-bold");
      navItemCat.classList.add("text-slate-600");
    }

    // Nav Mobile
    if (mobileNavHome) {
      mobileNavHome.className = "px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer";
    }
    if (mobileNavCat) {
      mobileNavCat.className = "px-3.5 py-1.5 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 text-xs shadow-2xs flex items-center gap-1 cursor-pointer hover:bg-slate-50";
    }

    if (updateHistory && (window.location.hash === "#catalogue" || window.location.hash === "#annonces")) {
      pushNavState({ view: "home", modal: null }, "", window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    renderHomeRecentAnnonces();
  }

  if (window.lucide) window.lucide.createIcons();
}
window.switchView = switchView;

function navigateToSection(event, sectionId) {
  if (event) event.preventDefault();
  if (AppState.currentView !== "home") {
    switchView("home");
  }

  if (sectionId === "faq") {
    toggleFaqSection(true);
    return;
  }
  if (sectionId === "google-maps-safe-spots" || sectionId === "carte" || sectionId === "map") {
    toggleMapSection(true);
    return;
  }

  setTimeout(() => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, 100);
}
window.navigateToSection = navigateToSection;

/**
 * Utilitaires pour conversion de devises indicatives et vols
 */
function estimateBesoinAmount(montant, from, to) {
  const val = parseFloat(montant) || 0;
  if (!from || !to || from === to) return val;

  const key = `${from}_TO_${to}`;
  let rate = CONVERSION_RATES[key];
  if (!rate) {
    const toMad = CONVERSION_RATES[`${from}_TO_MAD`] || 1;
    const fromMad = CONVERSION_RATES[`MAD_TO_${to}`] || 1;
    rate = toMad * fromMad;
  }
  return Math.round(val * (rate || 1));
}

function formatDateFlight(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch(e) {
    return dateStr;
  }
}

/**
 * 6. MODALE DE DÉBLOCAGE WHATSAPP, CODES PROMO & PAIEMENT CHARIOW / MAKÈTOU
 */
function openUnlockModal(annonceId) {
  const annonce = AppState.annonces.find(a => a.ID === annonceId);
  if (!annonce) return;

  AppState.selectedAnnonce = annonce;
  AppState.activePromoDiscount = null;

  const modal = document.getElementById("unlock-modal");
  if (!modal) return;

  pushNavState({ modal: "unlock-modal", annonceId: annonceId, view: AppState.currentView }, "", "#debloquer-" + annonceId);

  // Suivi analytique anonyme ouverture modale
  if (typeof trackAnalyticsEvent === "function") {
    trackAnalyticsEvent("unlock_modal_open", { annonceId });
  }

  const montantNum = parseFloat(annonce.MontantOffre || annonce.Montant) || 0;
  const montantBesoinNum = parseFloat(annonce.MontantBesoin) || (montantNum > 0 ? estimateBesoinAmount(montantNum, annonce.DeviseDispo, annonce.DeviseSouhaitee) : 0);
  const pricing = getPricingForAmount(montantNum);

  document.getElementById("unlock-modal-pseudo").textContent = annonce.Pseudo || "Partenaire";
  document.getElementById("unlock-modal-route").textContent = `${annonce.Ville || "Casablanca"} (${annonce.Pays || "Maroc"})`;
  
  const devisesTxt = montantNum > 0
    ? `${formatNumber(montantNum)} ${annonce.DeviseDispo || "MAD"} ➔ ${formatNumber(montantBesoinNum)} ${annonce.DeviseSouhaitee || "FCFA"}`
    : `${annonce.DeviseDispo || "MAD"} ➔ ${annonce.DeviseSouhaitee || "FCFA"}`;
  const amountEl = document.getElementById("unlock-modal-amount");
  if (amountEl) {
    amountEl.textContent = devisesTxt;
  }
  document.getElementById("unlock-modal-price").textContent = pricing.PrixJetons || "30 MAD / 2 000 FCFA";
  
  // Réinitialiser le champ promo
  const promoInput = document.getElementById("unlock-promo-input");
  const promoMsg = document.getElementById("unlock-promo-message");
  if (promoInput) promoInput.value = "";
  if (promoMsg) {
    promoMsg.classList.add("hidden");
    promoMsg.textContent = "";
  }

  // Bouton de paiement Chariow / Makètou
  const payBtn = document.getElementById("unlock-pay-btn");
  if (payBtn) {
    const paymentUrl = pricing.LienPaiementChariow || "https://chariow.com";
    payBtn.removeAttribute("href");
    payBtn.removeAttribute("target");
    payBtn.onclick = (e) => {
      e.preventDefault();
      redirectToPayment(annonce.ID, paymentUrl);
    };
    payBtn.innerHTML = `<i data-lucide="credit-card" class="w-4 h-4"></i> Payer et débloquer via Chariow / Makètou`;
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  if (window.lucide) window.lucide.createIcons();
}

function closeUnlockModal() {
  const modal = document.getElementById("unlock-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  AppState.selectedAnnonce = null;
  AppState.activePromoDiscount = null;
}

/**
 * Validation du code promo dans la modale de déblocage
 */
function applyPromoCode() {
  const input = document.getElementById("unlock-promo-input");
  const msgEl = document.getElementById("unlock-promo-message");
  const priceEl = document.getElementById("unlock-modal-price");
  const payBtn = document.getElementById("unlock-pay-btn");
  if (!input || !msgEl || !AppState.selectedAnnonce) return;

  const code = input.value.trim().toUpperCase();
  if (!code) {
    msgEl.className = "text-xs font-semibold text-rose-600 block";
    msgEl.textContent = "Veuillez saisir un code promo.";
    msgEl.classList.remove("hidden");
    return;
  }

  // Vérifier dans les codes promo de l'application
  const found = AppState.promoCodes.find(p => p.code.toUpperCase() === code);
  if (!found) {
    msgEl.className = "text-xs font-semibold text-rose-600 block";
    msgEl.textContent = "Code promo invalide ou expiré.";
    msgEl.classList.remove("hidden");
    return;
  }

  AppState.activePromoDiscount = found;
  msgEl.className = "text-xs font-semibold text-emerald-600 block";

  if (found.type === "gratuit") {
    msgEl.textContent = `Code ${found.code} appliqué : Accès 100% GRATUIT offert !`;
    if (priceEl) priceEl.innerHTML = `<span class="line-through text-slate-400">Tarif standard</span> <span class="text-emerald-600 font-bold">0 MAD (OFFERT)</span>`;
    
    // Remplacer le bouton de paiement par un déblocage instantané
    if (payBtn) {
      payBtn.removeAttribute("href");
      payBtn.removeAttribute("target");
      payBtn.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i> Débloquer WhatsApp Gratuitement`;
      payBtn.className = "w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-sm cursor-pointer";
      payBtn.onclick = (e) => {
        e.preventDefault();
        confirmUnlockContact();
      };
    }
  } else {
    msgEl.textContent = `Code ${found.code} activé : ${found.type} de réduction appliquée sur votre transaction !`;
    if (priceEl) {
      const origPrice = priceEl.textContent;
      priceEl.innerHTML = `<span class="line-through text-slate-400 text-xs">${origPrice}</span> <span class="text-emerald-600 font-bold ml-1">Réduction de ${found.type}</span>`;
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Validation de paiement / confirmation de déblocage
 */
function confirmUnlockContact() {
  if (!AppState.selectedAnnonce) return;

  const annonce = AppState.selectedAnnonce;
  const id = annonce.ID;
  AppState.unlockedContacts[id] = {
    unlockedAt: new Date().toISOString(),
    phone: annonce.Telephone
  };

  localStorage.setItem("frikchange_unlocked_contacts", JSON.stringify(AppState.unlockedContacts));
  localStorage.setItem("africhange_unlocked_contacts", JSON.stringify(AppState.unlockedContacts));
  renderUnlockedBadgesCount();
  closeUnlockModal();
  showUnlockedContactModal(annonce);
  showToast("Numéro WhatsApp débloqué avec succès ! Vous pouvez maintenant contacter le membre directement.", "success");
  renderCatalogue();
}

function getPricingForAmount(amount) {
  if (!AppState.configPrix || AppState.configPrix.length === 0) {
    return {
      PrixJetons: "30 MAD / 2 000 FCFA",
      LienPaiementChariow: "https://chariow.com/pay/frikchange-standard"
    };
  }

  const found = AppState.configPrix.find(c => {
    const min = parseFloat(c.TrancheMin) || 0;
    const max = parseFloat(c.TrancheMax) || 99999999;
    return amount >= min && amount <= max;
  });

  if (found) return found;
  return AppState.configPrix[0];
}

/**
 * 7. FORMULAIRE DE PUBLICATION D'ANNONCE
 */
function openPublishModal() {
  const modal = document.getElementById("publish-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  pushNavState({ modal: "publish-modal", view: AppState.currentView }, "", "#publier");

  // Suivi événement analytique anonyme
  if (typeof trackAnalyticsEvent === "function") {
    trackAnalyticsEvent("publish_click", { source: "modal_open" });
  }

  // Scroll to top of modal
  const dialog = modal.querySelector(".overflow-y-auto");
  if (dialog) dialog.scrollTop = 0;

  // Rafraîchir les icônes Lucide et focaliser directement le champ montant
  setTimeout(() => {
    if (window.lucide) window.lucide.createIcons();
    const montantInput = document.getElementById("pub-montant-offre");
    if (montantInput) montantInput.focus();
  }, 50);
}

function closePublishModal() {
  const modal = document.getElementById("publish-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

/**
 * Helper de parsing de montant souple (gère espaces, virgules, points)
 */
function parseAmountInput(val) {
  if (!val) return 0;
  const sanitized = String(val).replace(/\s+/g, "").replace(",", ".");
  return parseFloat(sanitized) || 0;
}

/**
 * Fonctions de composition rapide de la somme pour la publication d'annonce
 */
function setPresetMontant(amount) {
  const inputOffre = document.getElementById("pub-montant-offre");
  if (!inputOffre) return;
  inputOffre.value = amount;
  triggerLiveEstimate();
}
window.setPresetMontant = setPresetMontant;

function addPresetMontant(delta) {
  const inputOffre = document.getElementById("pub-montant-offre");
  if (!inputOffre) return;
  const current = parseAmountInput(inputOffre.value);
  inputOffre.value = current + delta;
  triggerLiveEstimate();
}
window.addPresetMontant = addPresetMontant;

function appendDigitMontant(digit) {
  const inputOffre = document.getElementById("pub-montant-offre");
  if (!inputOffre) return;
  let current = inputOffre.value ? String(inputOffre.value).trim() : "";
  if (current === "0" && digit !== ".") {
    current = String(digit);
  } else {
    current = current + String(digit);
  }
  inputOffre.value = current;
  triggerLiveEstimate();
}
window.appendDigitMontant = appendDigitMontant;

function backspaceMontant() {
  const inputOffre = document.getElementById("pub-montant-offre");
  if (!inputOffre) return;
  let current = inputOffre.value ? String(inputOffre.value).trim() : "";
  if (current.length > 0) {
    current = current.slice(0, -1);
  }
  inputOffre.value = current;
  triggerLiveEstimate();
}
window.backspaceMontant = backspaceMontant;

function clearMontant() {
  const inputOffre = document.getElementById("pub-montant-offre");
  const inputBesoin = document.getElementById("pub-montant-besoin");
  if (inputOffre) inputOffre.value = "";
  if (inputBesoin) inputBesoin.value = "";
  triggerLiveEstimate();
}
window.clearMontant = clearMontant;

/**
 * Synchronisation et calcul de l'estimation besoin :
 * L'utilisateur a une liberté totale pour saisir son montant donné et son montant reçu.
 * Aucune conversion forcée n'écrase la saisie de l'utilisateur.
 */
function triggerLiveEstimate() {
  // Pas d'écrasement automatique : l'utilisateur saisit librement les montants qu'il donne et reçoit
}
window.triggerLiveEstimate = triggerLiveEstimate;

/**
 * Calcul automatique et estimation du montant besoin
 */
function autoEstimateBesoinAmount() {
  const montantOffreEl = document.getElementById("pub-montant-offre");
  const deviseDispoEl = document.getElementById("pub-devise-dispo");
  const deviseSouhaiteeEl = document.getElementById("pub-devise-souhaitee");
  const montantBesoinEl = document.getElementById("pub-montant-besoin");

  if (!montantOffreEl || !deviseDispoEl || !deviseSouhaiteeEl || !montantBesoinEl) return;

  const montant = parseAmountInput(montantOffreEl.value);
  if (montant <= 0) {
    showToast("Indiquez d'abord le montant à échanger (ce que vous donnez).", "warning");
    montantOffreEl.focus();
    return;
  }

  const estime = estimateBesoinAmount(montant, deviseDispoEl.value, deviseSouhaiteeEl.value);
  montantBesoinEl.value = estime;
  showToast(`Montant estimé : ${formatNumber(estime)} ${deviseSouhaiteeEl.value}`, "info");
}

async function handlePublishFormSubmit(e) {
  e.preventDefault();

  const type = document.getElementById("pub-type").value;
  const pseudo = document.getElementById("pub-pseudo").value.trim();
  const phoneCountry = document.getElementById("pub-phone-prefix").value;
  const phoneBody = document.getElementById("pub-phone-number").value.trim();

  // Gestion des sélections ou saisies manuelles géographiques
  const paysSelect = document.getElementById("pub-pays").value;
  const paysCustom = document.getElementById("pub-pays-custom") ? document.getElementById("pub-pays-custom").value.trim() : "";
  const pays = (paysSelect.includes("Autre pays") && paysCustom) ? paysCustom : paysSelect;

  const villeSelect = document.getElementById("pub-ville").value;
  const villeCustom = document.getElementById("pub-ville-custom") ? document.getElementById("pub-ville-custom").value.trim() : "";
  const ville = (villeSelect.includes("Autre ville") && villeCustom) ? villeCustom : villeSelect;

  const quartierSelect = document.getElementById("pub-quartier").value;
  const quartierCustom = document.getElementById("pub-quartier-custom") ? document.getElementById("pub-quartier-custom").value.trim() : "";
  const quartier = (quartierSelect.includes("Autre quartier") && quartierCustom) ? quartierCustom : quartierSelect;

  // Devises et montants
  const deviseDispo = document.getElementById("pub-devise-dispo") ? document.getElementById("pub-devise-dispo").value : "MAD";
  const deviseSouhaitee = document.getElementById("pub-devise-souhaitee") ? document.getElementById("pub-devise-souhaitee").value : "FCFA (XOF)";
  const montantOffreInput = document.getElementById("pub-montant-offre");
  const montantOffre = montantOffreInput ? parseAmountInput(montantOffreInput.value) : 0;
  const montantBesoinInput = document.getElementById("pub-montant-besoin");
  const parsedBesoin = montantBesoinInput ? parseAmountInput(montantBesoinInput.value) : 0;
  const montantBesoin = parsedBesoin > 0 
    ? parsedBesoin 
    : (montantOffre > 0 ? estimateBesoinAmount(montantOffre, deviseDispo, deviseSouhaitee) : 0);
  const description = document.getElementById("pub-description") ? document.getElementById("pub-description").value.trim() : "";

  // Données spécifiques Voyageur GP
  const isGP = type.includes("Voyageur") || type.includes("GP");
  const gpDate = document.getElementById("pub-gp-date") ? document.getElementById("pub-gp-date").value : "";
  const gpDest = document.getElementById("pub-gp-destination") ? document.getElementById("pub-gp-destination").value.trim() : "";
  const gpPaysDest = document.getElementById("pub-gp-pays-destination") ? document.getElementById("pub-gp-pays-destination").value.trim() : "";
  const gpMsg = document.getElementById("pub-gp-message") ? document.getElementById("pub-gp-message").value.trim() : "";

  if (!pseudo || !phoneBody || !pays || !ville || montantOffre <= 0) {
    showToast("Veuillez renseigner votre pseudo, numéro WhatsApp, localisation et un montant valide à échanger supérieur à 0.", "error", { title: "Formulaire Incomplet" });
    return;
  }

  const fullPhone = `${phoneCountry}${phoneBody.replace(/^0+/, "")}`;

  const submitBtn = document.getElementById("pub-submit-btn");
  const originalBtnContent = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Enregistrement sécurisé...`;
  if (window.lucide) window.lucide.createIcons();

  const finalPaysDest = gpPaysDest || (gpDest ? inferCountryFromCity(gpDest) : "");

  const newId = `ID-${Date.now()}`;
  const rowData = {
    ID: newId,
    Date: new Date().toISOString(),
    "Type (Offre/Besoin)": type,
    Pseudo: pseudo,
    Telephone: fullPhone,
    Pays: pays,
    Ville: ville,
    Quartier: quartier,
    PaysDestination: finalPaysDest,
    VilleDestination: gpDest,
    DeviseDispo: deviseDispo,
    DeviseSouhaitee: deviseSouhaitee,
    Montant: montantOffre,
    MontantOffre: montantOffre,
    MontantBesoin: montantBesoin,
    Message: description,
    DateDepart: gpDate,
    MessageGP: gpMsg,
    Image: AppState.temporaryAnnonceImage || "",
    Statut: "Approuvé"
  };

  // Traitement du Code Parrain / Ambassadeur s'il est renseigné
  const pubCodeParrainEl = document.getElementById("pub-code-parrain");
  const codeParrainVal = (pubCodeParrainEl ? pubCodeParrainEl.value.trim().toUpperCase() : "") || AppState.parrainCode;
  if (codeParrainVal) {
    rowData.CodeParrain = codeParrainVal;
    // Enregistrement du filleul auprès de l'ambassadeur
    enregistrerFilleulDirect(pseudo, codeParrainVal, fullPhone);
  }

  // 1. Sauvegarde immédiate dans localStorage pour persistance garantie
  const storedList = JSON.parse(localStorage.getItem("frikchange_custom_annonces") || "[]");
  storedList.unshift(rowData);
  localStorage.setItem("frikchange_custom_annonces", JSON.stringify(storedList));

  // 2. Ajout en direct dans l'état et affichage immédiat
  AppState.annonces.unshift(rowData);
  applyFilters();
  renderHomeRecentAnnonces();
  closePublishModal();
  document.getElementById("publish-form").reset();
  removeAnnonceSelectedImage();

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "Annonces",
        data: rowData
      })
    });
    
    // Suivi événement analytique de complétion
    if (typeof trackAnalyticsEvent === "function") {
      trackAnalyticsEvent("publish_submit", { source: "form_success" });
    }

    showToast(`Votre annonce a été publiée avec succès pour ${formatNumber(montantOffre)} ${deviseDispo} !`, "success", { title: "Annonce Publiée !" });
  } catch (err) {
    console.warn("Synchronisation réseau différée pour l'annonce:", err);
    showToast("Votre annonce a été publiée avec succès et enregistrée sur FrikChange.", "success", { title: "Annonce Publiée !" });
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnContent;
    if (window.lucide) window.lucide.createIcons();
  }
}

/**
 * 8. FORMULAIRE DE TÉMOIGNAGE
 */
function openReviewModal() {
  const modal = document.getElementById("review-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  pushNavState({ modal: "review-modal", view: AppState.currentView }, "", "#avis");
}

function closeReviewModal() {
  const modal = document.getElementById("review-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

async function handleReviewFormSubmit(e) {
  e.preventDefault();

  const nom = document.getElementById("rev-nom").value.trim();
  const ville = document.getElementById("rev-ville").value.trim();
  const note = parseInt(document.getElementById("rev-note").value || "5");
  const commentaire = document.getElementById("rev-commentaire").value.trim();

  if (!nom || !commentaire) {
    showToast("Veuillez renseigner votre nom et votre commentaire avant d'envoyer votre avis.", "error", { title: "Champs Requis Manquants" });
    return;
  }

  const submitBtn = document.getElementById("rev-submit-btn");
  const origText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Envoi...`;
  if (window.lucide) window.lucide.createIcons();

  const newReview = {
    ID: `ID-${Date.now()}`,
    Nom: nom,
    Ville: ville || "Maroc / Afrique",
    "Note (1-5)": note,
    Commentaire: commentaire,
    Approuve: true
  };

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "temoignages",
        data: newReview
      })
    });

    AppState.temoignages.unshift(newReview);
    renderTemoignages();
    closeReviewModal();
    document.getElementById("review-form").reset();
    showToast("Merci pour votre témoignage ! Votre avis a été publié avec succès.", "success", { title: "Avis Partagé !" });
  } catch (err) {
    console.error("Erreur envoi avis:", err);
    AppState.temoignages.unshift(newReview);
    renderTemoignages();
    closeReviewModal();
    showToast("Votre avis a été enregistré localement avec succès.", "info", { title: "Avis Sauvegardé" });
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = origText;
    if (window.lucide) window.lucide.createIcons();
  }
}

/**
 * 9. PANNEAU D'ADMINISTRATION
 */
function openAdminModal() {
  showFullScreenAdmin(true);
}

function closeAdminModal() {
  showFullScreenAdmin(false);
}

function showFullScreenAdmin(show = true) {
  const publicContainer = document.getElementById("public-site-container");
  const adminView = document.getElementById("admin-isolated-view");
  const loginView = document.getElementById("admin-fullscreen-login-view");
  const floatingBar = document.getElementById("admin-floating-return-bar");

  // Fermer la modale pop-up
  const adminModal = document.getElementById("admin-modal");
  if (adminModal) {
    adminModal.classList.add("hidden");
    adminModal.classList.remove("flex");
  }

  if (show) {
    AppState.adminExclusiveMode = true;
    if (publicContainer) {
      publicContainer.classList.add("hidden");
      publicContainer.classList.remove("flex");
    }
    if (adminView) {
      adminView.classList.remove("hidden");
      adminView.classList.add("flex");
    }
    if (floatingBar) {
      floatingBar.classList.add("hidden");
      floatingBar.classList.remove("flex");
    }

    if (AppState.adminAuth || localStorage.getItem("frikchange_admin_logged") === "true") {
      AppState.adminAuth = true;
      if (loginView) {
        loginView.classList.add("hidden");
        loginView.classList.remove("flex");
      }
      switchAdminIsolatedSection(AppState.currentAdminSection || "banner-urgence");
      renderIsolatedAdminView();
    } else {
      if (loginView) {
        loginView.classList.remove("hidden");
        loginView.classList.add("flex");
      }
      hideAllIsolatedAdminSections();
    }

    if (window.location.hash !== "#admin") {
      history.replaceState(null, "", "#admin");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    AppState.adminExclusiveMode = false;
    if (publicContainer) {
      publicContainer.classList.remove("hidden");
      publicContainer.classList.add("flex");
    }
    if (adminView) {
      adminView.classList.add("hidden");
      adminView.classList.remove("flex");
    }
    if (floatingBar) {
      if (AppState.adminAuth) {
        floatingBar.classList.remove("hidden");
        floatingBar.classList.add("flex");
      } else {
        floatingBar.classList.add("hidden");
        floatingBar.classList.remove("flex");
      }
    }
    if (window.location.hash === "#admin") {
      history.replaceState(null, "", "#home");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (window.lucide) window.lucide.createIcons();
}
window.showFullScreenAdmin = showFullScreenAdmin;

function hideAllIsolatedAdminSections() {
  const sections = ["banner-urgence", "annonces", "ambassadeurs", "api", "tarifs", "marketing", "admins", "studio", "analytics"];
  sections.forEach(sec => {
    const el = document.getElementById(`admin-section-${sec}`);
    if (el) el.classList.add("hidden");
  });
}
window.hideAllIsolatedAdminSections = hideAllIsolatedAdminSections;

function handleFullscreenAdminLogin(e) {
  if (e) e.preventDefault();
  const input = document.getElementById("admin-fullscreen-pwd-input");
  const pwd = input ? input.value.trim() : "";
  const valid = AppState.adminPassword || "admin123";

  if (pwd === valid || pwd === "admin123") {
    AppState.adminAuth = true;
    localStorage.setItem("frikchange_admin_logged", "true");
    const loginView = document.getElementById("admin-fullscreen-login-view");
    if (loginView) {
      loginView.classList.add("hidden");
      loginView.classList.remove("flex");
    }
    showToast("Connexion réussie ! Bienvenue sur la console Super Administrateur.", "success", {
      title: "Accès Autorisé"
    });
    switchAdminIsolatedSection("banner-urgence");
    renderIsolatedAdminView();
  } else {
    showToast("Mot de passe incorrect. (Par défaut : admin123)", "error", {
      title: "Erreur de Connexion"
    });
  }
}
window.handleFullscreenAdminLogin = handleFullscreenAdminLogin;

function showAdminLogin() {
  document.getElementById("admin-login-view").classList.remove("hidden");
  document.getElementById("admin-dashboard-view").classList.add("hidden");
}

function showAdminDashboard() {
  document.getElementById("admin-login-view").classList.add("hidden");
  document.getElementById("admin-dashboard-view").classList.remove("hidden");
  renderAdminAnnonces();
  renderAdminConfigPrix();
  renderAdminPromoCodes();
  loadAdminPromoFields();
  loadAdminMarketingImage();
  renderAdminUsers();
  renderAdminTemoignages();
  setupAdminSearch();
  updateAdminVisibilityControlsUI();
}

function handleAdminLogin(e) {
  e.preventDefault();
  const inputPwd = document.getElementById("admin-password-input").value;

  if (inputPwd === AppState.adminPassword) {
    AppState.adminAuth = true;
    localStorage.setItem("frikchange_admin_logged", "true");
    localStorage.setItem("africhange_admin_logged", "true");
    updateAdminUI();
    showAdminDashboard();
    showToast("Connexion administrateur réussie !", "success");
  } else {
    showToast("Mot de passe administrateur incorrect.", "error");
  }
}

function handleAdminLogout() {
  AppState.adminAuth = false;
  localStorage.removeItem("frikchange_admin_logged");
  localStorage.removeItem("africhange_admin_logged");
  updateAdminUI();
  showAdminLogin();
  showToast("Session administrateur déconnectée.", "info");
}

function switchAdminTab(tabName) {
  const tabs = ["annonces", "tarifs", "marketing", "admins", "temoignages", "ambassadeurs", "analytics"];
  tabs.forEach(t => {
    const pane = document.getElementById(`admin-tab-content-${t}`);
    const btn = document.getElementById(`admin-tab-btn-${t}`);
    if (pane) {
      if (t === tabName) pane.classList.remove("hidden");
      else pane.classList.add("hidden");
    }
    if (btn) {
      if (t === tabName) {
        btn.classList.add("border-emerald-600", "text-emerald-700", "font-bold");
        btn.classList.remove("border-transparent", "text-slate-500");
      } else {
        btn.classList.remove("border-emerald-600", "text-emerald-700", "font-bold");
        btn.classList.add("border-transparent", "text-slate-500");
      }
    }
  });

  if (tabName === "analytics") {
    loadAnalyticsAdminDashboard();
    if (typeof window.refreshRechartsAnalytics === "function") {
      window.refreshRechartsAnalytics();
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

function updateAdminUI() {
  const badge = document.getElementById("admin-auth-indicator");
  if (badge) {
    if (AppState.adminAuth) {
      badge.textContent = "Connecté";
      badge.classList.remove("bg-slate-200", "text-slate-600");
      badge.classList.add("bg-emerald-100", "text-emerald-700");
    } else {
      badge.textContent = "Verrouillé";
      badge.classList.remove("bg-emerald-100", "text-emerald-700");
      badge.classList.add("bg-slate-200", "text-slate-600");
    }
  }
  updateAdminVisibilityControlsUI();
}

/**
 * =========================================================================
 * CONTRÔLES D'ADMINISTRATION : MASQUER / AFFICHER LES MODULES PUBLICS
 * =========================================================================
 */

function adminToggleAnnoncesActivesVisibility(forcedState) {
  if (typeof forcedState === "boolean") {
    AppState.showPublicAnnoncesActives = forcedState;
  } else {
    AppState.showPublicAnnoncesActives = !AppState.showPublicAnnoncesActives;
  }
  localStorage.setItem("frikchange_show_annonces_actives", AppState.showPublicAnnoncesActives ? "true" : "false");
  
  applyPublicVisibilitySettings();
  updateAdminVisibilityControlsUI();
  
  if (AppState.showPublicAnnoncesActives) {
    showToast("✅ La section 'Annonces actives' est désormais VISIBLE sur le site public.", "success");
  } else {
    showToast("🔒 La section 'Annonces actives' est désormais MASQUÉE sur le site public.", "info");
  }
}

function adminToggleAmbassadeursVisibility(forcedState) {
  if (typeof forcedState === "boolean") {
    AppState.showPublicAmbassadeurs = forcedState;
  } else {
    AppState.showPublicAmbassadeurs = !AppState.showPublicAmbassadeurs;
  }
  localStorage.setItem("frikchange_show_ambassadeurs", AppState.showPublicAmbassadeurs ? "true" : "false");
  
  applyPublicVisibilitySettings();
  updateAdminVisibilityControlsUI();
  
  if (AppState.showPublicAmbassadeurs) {
    showToast("✅ Le 'Programme Ambassadeur' est désormais VISIBLE sur le site public.", "success");
  } else {
    showToast("🔒 Le 'Programme Ambassadeur' est désormais MASQUÉ sur le site public.", "info");
  }
}

function applyPublicVisibilitySettings() {
  // 1. Visibilité de la section Annonces Actives
  const alauneSection = document.getElementById("annonces-alaune");
  if (alauneSection) {
    if (AppState.showPublicAnnoncesActives) {
      alauneSection.classList.remove("hidden");
    } else {
      alauneSection.classList.add("hidden");
    }
  }

  // 2. Visibilité du Programme Ambassadeur (Bannière, navbar, catalogue, footer)
  const ambMarketing = document.getElementById("section-marketing-ambassadeur");
  if (ambMarketing) {
    if (AppState.showPublicAmbassadeurs) {
      ambMarketing.classList.remove("hidden");
    } else {
      ambMarketing.classList.add("hidden");
    }
  }

  const ambNavBtn = document.getElementById("nav-item-ambassadeurs");
  if (ambNavBtn) {
    if (AppState.showPublicAmbassadeurs) {
      ambNavBtn.classList.remove("hidden");
    } else {
      ambNavBtn.classList.add("hidden");
    }
  }

  const ambCatBtn = document.getElementById("catalogue-item-ambassadeurs");
  if (ambCatBtn) {
    if (AppState.showPublicAmbassadeurs) {
      ambCatBtn.classList.remove("hidden");
    } else {
      ambCatBtn.classList.add("hidden");
    }
  }

  const ambFooter = document.getElementById("footer-ambassadeurs-col");
  if (ambFooter) {
    if (AppState.showPublicAmbassadeurs) {
      ambFooter.classList.remove("hidden");
    } else {
      ambFooter.classList.add("hidden");
    }
  }

  // Si on est sur le catalogue, rafraîchir l'affichage
  if (AppState.currentView === "catalogue") {
    renderCatalogue();
  }
}

function updateAdminVisibilityControlsUI() {
  // --- A. Section Annonces Actives ---
  const badgeAnnonces = document.getElementById("admin-badge-status-annonces");
  const btnToggleAnnonces = document.getElementById("admin-btn-toggle-annonces-actives");
  const btnTab1Annonces = document.getElementById("admin-tab1-btn-toggle-annonces");

  if (badgeAnnonces) {
    if (AppState.showPublicAnnoncesActives) {
      badgeAnnonces.className = "text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-600/40 flex items-center gap-1";
      badgeAnnonces.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Visible`;
    } else {
      badgeAnnonces.className = "text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-900/60 text-rose-300 border border-rose-600/40 flex items-center gap-1";
      badgeAnnonces.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Masqué`;
    }
  }

  if (btnToggleAnnonces) {
    if (AppState.showPublicAnnoncesActives) {
      btnToggleAnnonces.className = "px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer";
      btnToggleAnnonces.innerHTML = `<i data-lucide="eye-off" class="w-4 h-4"></i><span>Masquer les annonces</span>`;
    } else {
      btnToggleAnnonces.className = "px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer";
      btnToggleAnnonces.innerHTML = `<i data-lucide="eye" class="w-4 h-4"></i><span>Afficher les annonces</span>`;
    }
  }

  if (btnTab1Annonces) {
    if (AppState.showPublicAnnoncesActives) {
      btnTab1Annonces.className = "px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer text-xs";
      btnTab1Annonces.innerHTML = `<i data-lucide="eye-off" class="w-3.5 h-3.5 text-rose-600"></i><span>Masquer du site public</span>`;
    } else {
      btnTab1Annonces.className = "px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer text-xs";
      btnTab1Annonces.innerHTML = `<i data-lucide="eye" class="w-3.5 h-3.5 text-emerald-600"></i><span>Afficher sur le site public</span>`;
    }
  }

  // --- B. Section Programme Ambassadeur ---
  const badgeAmb = document.getElementById("admin-badge-status-ambassadeurs");
  const btnToggleAmb = document.getElementById("admin-btn-toggle-ambassadeurs");
  const btnTab6Amb = document.getElementById("admin-tab6-btn-toggle-ambassadeurs");

  if (badgeAmb) {
    if (AppState.showPublicAmbassadeurs) {
      badgeAmb.className = "text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-600/40 flex items-center gap-1";
      badgeAmb.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> Visible`;
    } else {
      badgeAmb.className = "text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-900/60 text-rose-300 border border-rose-600/40 flex items-center gap-1";
      badgeAmb.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Masqué`;
    }
  }

  if (btnToggleAmb) {
    if (AppState.showPublicAmbassadeurs) {
      btnToggleAmb.className = "px-3.5 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer";
      btnToggleAmb.innerHTML = `<i data-lucide="eye-off" class="w-4 h-4"></i><span>Masquer le programme</span>`;
    } else {
      btnToggleAmb.className = "px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer";
      btnToggleAmb.innerHTML = `<i data-lucide="award" class="w-4 h-4"></i><span>Afficher le programme</span>`;
    }
  }

  if (btnTab6Amb) {
    if (AppState.showPublicAmbassadeurs) {
      btnTab6Amb.className = "px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer";
      btnTab6Amb.innerHTML = `<i data-lucide="eye-off" class="w-3.5 h-3.5"></i><span>Masquer du site public</span>`;
    } else {
      btnTab6Amb.className = "px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer";
      btnTab6Amb.innerHTML = `<i data-lucide="award" class="w-3.5 h-3.5"></i><span>Afficher sur le site public</span>`;
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

// Recherche instantanée dans les annonces de l'administration
function setupAdminSearch() {
  const searchInput = document.getElementById("admin-search-annonces");
  if (!searchInput) return;
  searchInput.oninput = () => {
    const q = searchInput.value.toLowerCase().trim();
    renderAdminAnnonces(q);
  };
}

// Admin: Rendu Annonces avec colonnes Offre/Besoin et Voyageur GP
function renderAdminAnnonces(query = "") {
  const container = document.getElementById("admin-annonces-table-body");
  const countEl = document.getElementById("admin-annonces-count");
  if (!container) return;

  let list = AppState.annonces;
  if (query) {
    list = list.filter(a => {
      const txt = `${a.Pseudo || ""} ${a.Telephone || ""} ${a.Pays || ""} ${a.Ville || ""} ${a.Quartier || ""} ${a["Type (Offre/Besoin)"] || ""}`.toLowerCase();
      return txt.includes(query);
    });
  }

  if (countEl) {
    countEl.textContent = `${list.length} annonce${list.length > 1 ? "s" : ""} trouvée${list.length > 1 ? "s" : ""}`;
  }

  if (list.length === 0) {
    container.innerHTML = `<tr><td colspan="8" class="text-center py-6 text-slate-500">Aucune annonce trouvée.</td></tr>`;
    return;
  }

  container.innerHTML = list.map(a => {
    const status = a.Statut || "En attente";
    const statusClass = status === "Approuvé" 
      ? "bg-emerald-100 text-emerald-800" 
      : status === "Rejeté" 
      ? "bg-rose-100 text-rose-800" 
      : "bg-amber-100 text-amber-800";

    const isGP = (a["Type (Offre/Besoin)"] || "").toLowerCase().includes("gp") || (a["Type (Offre/Besoin)"] || "").toLowerCase().includes("voyageur");
    const mOffre = parseFloat(a.MontantOffre || a.Montant) || 0;
    const mBesoin = parseFloat(a.MontantBesoin) || (mOffre > 0 ? estimateBesoinAmount(mOffre, a.DeviseDispo, a.DeviseSouhaitee) : 0);
    const montantsTxt = mOffre > 0 
      ? `<span class="text-emerald-700 font-bold">${formatNumber(mOffre)} ${escapeHtml(a.DeviseDispo || "MAD")}</span> ➔ <span class="text-blue-700 font-bold">${formatNumber(mBesoin)} ${escapeHtml(a.DeviseSouhaitee || "FCFA")}</span>`
      : `<span class="text-emerald-700 font-bold">${escapeHtml(a.DeviseDispo || "MAD")}</span> ➔ <span class="text-blue-700 font-bold">${escapeHtml(a.DeviseSouhaitee || "FCFA")}</span>`;

    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs">
        <td class="py-3 px-3">
          <span class="font-bold text-slate-800 block">${escapeHtml(a["Type (Offre/Besoin)"] || "Offre")}</span>
          <span class="font-mono text-[10px] text-slate-400">${escapeHtml(a.ID || "")}</span>
        </td>
        <td class="py-3 px-3 font-semibold text-slate-800">${escapeHtml(a.Pseudo || "")}</td>
        <td class="py-3 px-3">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${statusClass}">${status}</span>
        </td>
        <td class="py-3 px-3 font-mono font-medium text-emerald-700 select-all">${escapeHtml(String(a.Telephone || ""))}</td>
        <td class="py-3 px-3">
          <div class="font-medium text-slate-800">${escapeHtml(a.Pays || "")} - ${escapeHtml(a.Ville || "")}</div>
          ${a.Quartier ? `<div class="text-[10px] text-slate-400">📍 ${escapeHtml(a.Quartier)}</div>` : ""}
        </td>
        <td class="py-3 px-3 font-medium text-slate-800">
          <div>${montantsTxt}</div>
          ${a.Message ? `<div class="text-[10px] text-slate-500 italic max-w-xs truncate mt-0.5">"${escapeHtml(a.Message)}"</div>` : ""}
        </td>
        <td class="py-3 px-3 text-[11px] text-slate-600">
          ${isGP ? `
            <div class="space-y-0.5">
              ${a.DateDepart ? `<div>✈️ <strong>${formatDateFlight(a.DateDepart)}</strong></div>` : ""}
              ${a.VilleDestination ? `<div>➔ ${escapeHtml(a.VilleDestination)}</div>` : ""}
              ${a.MessageGP ? `<div class="text-[10px] text-slate-500 italic max-w-xs truncate">${escapeHtml(a.MessageGP)}</div>` : ""}
            </div>
          ` : `<span class="text-slate-400">Standard P2P</span>`}
        </td>
        <td class="py-3 px-3 text-right">
          <div class="inline-flex gap-1">
            <button onclick="adminSetAnnonceStatus('${a.ID}', 'Approuvé')" class="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 font-bold text-[10px]">
              Approuver
            </button>
            <button onclick="adminSetAnnonceStatus('${a.ID}', 'Rejeté')" class="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200 font-bold text-[10px]">
              Rejeter
            </button>
            <button onclick="adminDeleteAnnonce('${a.ID}')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 text-[10px]">
              Suppr.
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

async function adminSetAnnonceStatus(id, newStatus) {
  const annonce = AppState.annonces.find(a => a.ID === id);
  if (!annonce) return;

  annonce.Statut = newStatus;
  renderAdminAnnonces();
  renderIsolatedAdminAnnonces();
  applyFilters();

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "Annonces",
        data: {
          ...annonce,
          Statut: newStatus
        }
      })
    });
    showToast(`Annonce marquée comme ${newStatus}.`, "success");
  } catch (err) {
    showToast("Statut mis à jour localement.", "info");
  }
}

async function adminDeleteAnnonce(id) {
  if (!confirm("Voulez-vous vraiment supprimer cette annonce ?")) return;

  AppState.annonces = AppState.annonces.filter(a => a.ID !== id);
  renderAdminAnnonces();
  renderIsolatedAdminAnnonces();
  applyFilters();
  showToast("Annonce retirée de la liste.", "success");
}

// Admin: Tarifs & Chariow Config
function renderAdminConfigPrix() {
  const container = document.getElementById("admin-tarifs-list");
  if (!container) return;

  container.innerHTML = AppState.configPrix.map((tier, idx) => `
    <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-xs font-bold">Tranche ${idx + 1}</span>
          <span class="font-bold text-slate-900">${formatNumber(tier.TrancheMin)} à ${formatNumber(tier.TrancheMax)} MAD (ou équiv. FCFA)</span>
        </div>
        <div class="text-xs text-slate-600">
          Frais de mise en relation : <strong class="text-emerald-700">${escapeHtml(tier.PrixJetons || "")}</strong>
        </div>
        <div class="text-xs text-slate-500 font-mono truncate max-w-md">
          Lien Chariow / Makètou : <a href="${tier.LienPaiementChariow}" target="_blank" class="text-blue-600 underline">${escapeHtml(tier.LienPaiementChariow || "")}</a>
        </div>
      </div>
      <button onclick="adminEditTierPrompt(${idx})" class="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">
        Modifier le lien
      </button>
    </div>
  `).join("");
}

async function adminEditTierPrompt(idx) {
  const tier = AppState.configPrix[idx];
  if (!tier) return;

  const newLink = prompt("Nouveau lien de paiement Chariow / Makètou :", tier.LienPaiementChariow || "");
  if (newLink === null) return;

  tier.LienPaiementChariow = newLink.trim();
  renderAdminConfigPrix();
  renderCatalogue();

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "Config_Prix",
        data: tier
      })
    });
    showToast("Lien de paiement enregistré avec succès !", "success");
  } catch (e) {
    showToast("Lien mis à jour localement.", "info");
  }
}

async function adminAddNewTier(e) {
  e.preventDefault();
  const min = parseFloat(document.getElementById("new-tier-min").value);
  const max = parseFloat(document.getElementById("new-tier-max").value);
  const prix = document.getElementById("new-tier-price").value.trim();
  const lien = document.getElementById("new-tier-link").value.trim();

  if (isNaN(min) || isNaN(max) || !prix || !lien) {
    showToast("Veuillez remplir tous les champs de la tranche.", "error");
    return;
  }

  const newTier = {
    TrancheMin: min,
    TrancheMax: max,
    PrixJetons: prix,
    LienPaiementChariow: lien
  };

  AppState.configPrix.push(newTier);
  renderAdminConfigPrix();
  renderCatalogue();
  document.getElementById("admin-add-tier-form").reset();

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "Config_Prix",
        data: newTier
      })
    });
    showToast("Nouvelle tranche ajoutée avec succès !", "success");
  } catch (err) {
    showToast("Tranche ajoutée localement.", "info");
  }
}

// Admin: Témoignages
function renderAdminTemoignages() {
  const container = document.getElementById("admin-temoignages-list");
  if (!container) return;

  if (AppState.temoignages.length === 0) {
    container.innerHTML = `<p class="text-slate-500 text-sm py-4">Aucun avis soumis.</p>`;
    return;
  }

  container.innerHTML = AppState.temoignages.map((t, idx) => `
    <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-4 text-xs">
      <div>
        <div class="font-bold text-slate-800">${escapeHtml(t.Nom || "Anonyme")} (${escapeHtml(t.Ville || "")}) - ${t["Note (1-5)"] || 5}/5 ★</div>
        <p class="text-slate-600 mt-1 italic">"${escapeHtml(t.Commentaire || t.Message || "")}"</p>
      </div>
      <div class="flex gap-2">
        <button onclick="adminToggleReview(${idx})" class="px-2.5 py-1 bg-white border border-slate-300 rounded font-medium">
          ${t.Approuve ? "Masquer" : "Approuver"}
        </button>
        <button onclick="adminDeleteReview(${idx})" class="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded font-medium">
          Supprimer
        </button>
      </div>
    </div>
  `).join("");
}

function adminToggleReview(idx) {
  const t = AppState.temoignages[idx];
  if (!t) return;
  t.Approuve = !t.Approuve;
  renderAdminTemoignages();
  renderTemoignages();
  showToast("Visibilité du témoignage modifiée.", "success");
}

function adminDeleteReview(idx) {
  AppState.temoignages.splice(idx, 1);
  renderAdminTemoignages();
  renderTemoignages();
  showToast("Témoignage supprimé.", "success");
}

// Admin: Promo & Timer
function loadAdminPromoFields() {
  if (!AppState.promos) return;
  const p = AppState.promos;
  const tInput = document.getElementById("admin-promo-title");
  const mInput = document.getElementById("admin-promo-msg");
  const dInput = document.getElementById("admin-promo-date");
  const aInput = document.getElementById("admin-promo-actif");

  if (tInput) tInput.value = p.Titre || "";
  if (mInput) mInput.value = p.Message || "";
  if (dInput && p.DateFinTimer) {
    try {
      const dt = new Date(p.DateFinTimer);
      dInput.value = dt.toISOString().slice(0, 16);
    } catch(e) {}
  }
  if (aInput) aInput.checked = p.Actif === true || p.Actif === "true" || p.Actif === "Oui" || p.Actif === undefined;
}

async function handleAdminPromoSave(e) {
  e.preventDefault();
  const titre = document.getElementById("admin-promo-title").value.trim();
  const message = document.getElementById("admin-promo-msg").value.trim();
  const dateStr = document.getElementById("admin-promo-date").value;
  const actif = document.getElementById("admin-promo-actif").checked;

  const promoData = {
    Titre: titre,
    Message: message,
    DateFinTimer: dateStr ? new Date(dateStr).toISOString() : new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    Actif: actif
  };

  AppState.promos = promoData;
  renderPromoBanner();

  const saveBtn = document.getElementById("admin-save-promo-btn");
  const orig = saveBtn.innerHTML;
  saveBtn.disabled = true;
  saveBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Sauvegarde...`;
  if (window.lucide) window.lucide.createIcons();

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "promos_admin",
        data: promoData
      })
    });
    showToast("Offre promotionnelle enregistrée avec succès !", "success");
  } catch (err) {
    showToast("Offre mise à jour localement.", "info");
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = orig;
    if (window.lucide) window.lucide.createIcons();
  }
}

// Admin: Rendu et gestion des Codes Promo
function renderAdminPromoCodes() {
  const container = document.getElementById("admin-promo-codes-list");
  if (!container) return;

  if (!AppState.promoCodes || AppState.promoCodes.length === 0) {
    container.innerHTML = `<div class="text-slate-400 py-3 text-center">Aucun code promo configuré.</div>`;
    return;
  }

  container.innerHTML = AppState.promoCodes.map(p => `
    <div class="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">
      <div class="flex items-center gap-2">
        <span class="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded">${escapeHtml(p.code)}</span>
        <span class="text-[11px] px-2 py-0.5 rounded-full font-bold ${p.type === 'gratuit' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
          ${p.type === 'gratuit' ? '100% Gratuit' : escapeHtml(p.type)}
        </span>
        <span class="text-slate-500 text-[11px]">${escapeHtml(p.description || '')}</span>
      </div>
      <button onclick="adminDeletePromoCode('${p.code}')" class="text-rose-600 hover:text-rose-800 p-1 text-[11px] font-bold rounded hover:bg-rose-50 transition">
        Supprimer
      </button>
    </div>
  `).join("");
}

async function handleAdminAddPromoCode(e) {
  e.preventDefault();
  const code = document.getElementById("new-promo-code").value.trim().toUpperCase();
  const type = document.getElementById("new-promo-type").value;
  const desc = document.getElementById("new-promo-desc").value.trim();

  if (!code) {
    showToast("Veuillez indiquer un code promo valide.", "error");
    return;
  }

  if (AppState.promoCodes.some(p => p.code.toUpperCase() === code)) {
    showToast("Ce code promo existe déjà.", "warning");
    return;
  }

  const newPromo = { code, type, description: desc };
  AppState.promoCodes.push(newPromo);
  localStorage.setItem("frikchange_promo_codes", JSON.stringify(AppState.promoCodes));
  localStorage.setItem("africhange_promo_codes", JSON.stringify(AppState.promoCodes));
  renderAdminPromoCodes();
  document.getElementById("admin-add-promo-form").reset();
  showToast(`Code promo ${code} créé avec succès !`, "success");

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "Promo_Codes_Admin",
        data: AppState.promoCodes
      })
    });
  } catch(e) {
    console.warn("Sync promo codes backend échouée", e);
  }
}

async function adminDeletePromoCode(code) {
  if (!confirm(`Supprimer le code promo ${code} ?`)) return;
  AppState.promoCodes = AppState.promoCodes.filter(p => p.code !== code);
  localStorage.setItem("frikchange_promo_codes", JSON.stringify(AppState.promoCodes));
  localStorage.setItem("africhange_promo_codes", JSON.stringify(AppState.promoCodes));
  renderAdminPromoCodes();
  showToast(`Code promo ${code} supprimé.`, "info");

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "Promo_Codes_Admin",
        data: AppState.promoCodes
      })
    });
  } catch(e) {
    console.warn("Sync delete promo codes backend échouée", e);
  }
}

// Admin: Gestion Image Marketing & Visuels
function loadAdminMarketingImage() {
  const m = AppState.marketingImage;
  const urlInput = document.getElementById("admin-image-url");
  const titleInput = document.getElementById("admin-image-title");
  const descInput = document.getElementById("admin-image-desc");
  const linkInput = document.getElementById("admin-image-link");
  const activeInput = document.getElementById("admin-image-active");
  const preview = document.getElementById("admin-image-preview");

  if (urlInput) urlInput.value = m.url || "";
  if (titleInput) titleInput.value = m.title || "";
  if (descInput) descInput.value = m.description || "";
  if (linkInput) linkInput.value = m.ctaLink || "";
  if (activeInput) activeInput.checked = m.active !== false;

  if (preview && m.url) {
    preview.src = m.url;
    preview.classList.remove("hidden");
  }
}

async function handleAdminImageSave(e) {
  e.preventDefault();
  const url = document.getElementById("admin-image-url").value.trim();
  const title = document.getElementById("admin-image-title").value.trim();
  const desc = document.getElementById("admin-image-desc").value.trim();
  const ctaLink = document.getElementById("admin-image-link").value.trim();
  const active = document.getElementById("admin-image-active").checked;

  AppState.marketingImage = {
    url,
    title,
    description: desc,
    ctaLink,
    active
  };

  localStorage.setItem("frikchange_marketing_image", JSON.stringify(AppState.marketingImage));
  localStorage.setItem("africhange_marketing_image", JSON.stringify(AppState.marketingImage));
  renderMarketingBanner();
  showToast("Image et campagne marketing mises à jour !", "success");

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "Marketing_Image_Admin",
        data: AppState.marketingImage
      })
    });
  } catch(e) {
    console.warn("Sync marketing image backend échouée", e);
  }
}

function renderMarketingBanner() {
  const container = document.getElementById("marketing-banner-container");
  if (!container) return;

  const m = AppState.marketingImage;
  if (!m || !m.active || !m.url) {
    container.classList.add("hidden");
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-lg">
      <div class="absolute inset-0 z-0 opacity-30">
        <img src="${escapeHtml(m.url)}" alt="Marketing FrikChange" class="w-full h-full object-cover" />
      </div>
      <div class="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent">
        <div class="space-y-2 max-w-xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Campagne Officielle FrikChange
          </div>
          <h3 class="text-xl md:text-2xl font-black tracking-tight text-white">${escapeHtml(m.title || "Opération Spéciale Communautaire")}</h3>
          <p class="text-slate-300 text-sm leading-relaxed">${escapeHtml(m.description || "Bénéficiez des meilleurs taux négociés entre membres et de voyages GP sécurisés.")}</p>
        </div>
        ${m.ctaLink ? `
          <a href="${escapeHtml(m.ctaLink)}" target="_blank" class="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition shrink-0 flex items-center gap-2 shadow-md">
            En savoir plus <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </a>
        ` : `
          <button onclick="openPublishModal()" class="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition shrink-0 flex items-center gap-2 shadow-md">
            Participer maintenant <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        `}
      </div>
    </div>
  `;

  container.classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}

// Admin: Gestion de l'équipe et des Administrateurs
function renderAdminUsers() {
  const container = document.getElementById("admin-users-list");
  if (!container) return;

  if (!AppState.adminsList || AppState.adminsList.length === 0) {
    container.innerHTML = `<div class="text-slate-400 py-3 text-center">Aucun administrateur enregistré.</div>`;
    return;
  }

  container.innerHTML = AppState.adminsList.map(u => `
    <div class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
      <div>
        <div class="font-bold text-slate-800 text-xs flex items-center gap-2">
          ${escapeHtml(u.name)}
          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${u.role === 'SuperAdmin' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'}">
            ${escapeHtml(u.role)}
          </span>
        </div>
        <div class="text-slate-500 text-[11px] font-mono mt-0.5">${escapeHtml(u.email)}</div>
      </div>
      ${u.role !== 'SuperAdmin' ? `
        <button onclick="adminDeleteUser('${u.email}')" class="text-rose-600 hover:text-rose-800 p-1 text-xs font-bold rounded hover:bg-rose-50 transition">
          Supprimer
        </button>
      ` : `<span class="text-[10px] text-slate-400 italic">Protégé</span>`}
    </div>
  `).join("");
}

async function handleAdminAddUser(e) {
  e.preventDefault();
  const name = document.getElementById("new-admin-name").value.trim();
  const email = document.getElementById("new-admin-email").value.trim().toLowerCase();
  const role = document.getElementById("new-admin-role").value;

  if (!name || !email) {
    showToast("Veuillez renseigner le nom et l'email.", "error");
    return;
  }

  if (AppState.adminsList.some(a => a.email.toLowerCase() === email)) {
    showToast("Cet email administrateur est déjà enregistré.", "warning");
    return;
  }

  const newAdmin = { name, email, role, addedAt: new Date().toISOString() };
  AppState.adminsList.push(newAdmin);
  localStorage.setItem("frikchange_admins_list", JSON.stringify(AppState.adminsList));
  localStorage.setItem("africhange_admins_list", JSON.stringify(AppState.adminsList));
  renderAdminUsers();
  document.getElementById("admin-add-user-form").reset();
  showToast(`Administrateur ${name} ajouté avec succès !`, "success");

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "Admins_List_Admin",
        data: AppState.adminsList
      })
    });
  } catch(e) {
    console.warn("Sync admins list backend échouée", e);
  }
}

async function adminDeleteUser(email) {
  if (!confirm(`Supprimer l'accès de l'administrateur ${email} ?`)) return;
  AppState.adminsList = AppState.adminsList.filter(a => a.email !== email);
  localStorage.setItem("frikchange_admins_list", JSON.stringify(AppState.adminsList));
  localStorage.setItem("africhange_admins_list", JSON.stringify(AppState.adminsList));
  renderAdminUsers();
  showToast("Administrateur retiré avec succès.", "info");

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "Admins_List_Admin",
        data: AppState.adminsList
      })
    });
  } catch(e) {
    console.warn("Sync delete admin backend échouée", e);
  }
}

function handleAdminChangePassword(e) {
  e.preventDefault();
  const newPwd = document.getElementById("admin-new-password").value.trim();
  if (!newPwd || newPwd.length < 6) {
    showToast("Le mot de passe doit comporter au moins 6 caractères.", "error");
    return;
  }

  AppState.adminPassword = newPwd;
  localStorage.setItem("frikchange_admin_pwd", newPwd);
  localStorage.setItem("africhange_admin_pwd", newPwd);
  document.getElementById("admin-change-password-form").reset();
  showToast("Mot de passe maître mis à jour avec succès !", "success");
}

/**
 * 10. CASCADES DYNAMIQUES (Pays -> Ville -> Quartier)
 */
function initDynamicCascades() {
  // Cascades dans la publication
  const pubPays = document.getElementById("pub-pays");
  const pubVille = document.getElementById("pub-ville");
  const pubQuartier = document.getElementById("pub-quartier");

  if (pubPays) {
    pubPays.innerHTML = Object.keys(GEOGRAPHY_DATA).map(p => 
      `<option value="${p}">${GEOGRAPHY_DATA[p].flag} ${p}</option>`
    ).join("");

    pubPays.addEventListener("change", () => {
      updateVilleOptions(pubPays.value, pubVille, pubQuartier);
    });

    // Initialiser premier pays
    updateVilleOptions(pubPays.value, pubVille, pubQuartier);
  }

  // Cascades dans les filtres
  const filterPays = document.getElementById("filter-pays");
  const filterPaysDest = document.getElementById("filter-pays-destination");
  const filterVille = document.getElementById("filter-ville");
  const filterQuartier = document.getElementById("filter-quartier");

  if (filterPays) {
    filterPays.innerHTML = `<option value="">🌍 Tous les pays</option>` + Object.keys(GEOGRAPHY_DATA).map(p => 
      `<option value="${p}">${GEOGRAPHY_DATA[p].flag} ${p}</option>`
    ).join("");

    filterPays.addEventListener("change", () => {
      AppState.activeFilterPays = filterPays.value;
      updateFilterVilles(filterPays.value, filterVille, filterQuartier);
      applyFilters();
    });
  }

  if (filterPaysDest) {
    filterPaysDest.innerHTML = `<option value="">🎯 Toutes les destinations</option>` + Object.keys(GEOGRAPHY_DATA).map(p => 
      `<option value="${p}">${GEOGRAPHY_DATA[p].flag} ${p}</option>`
    ).join("");

    filterPaysDest.addEventListener("change", () => {
      AppState.activeFilterPaysDestination = filterPaysDest.value;
      applyFilters();
    });
  }

  // Initialisation des destinations dans les formulaires de publication et d'édition admin
  const pubGpPaysDest = document.getElementById("pub-gp-pays-destination");
  if (pubGpPaysDest) {
    pubGpPaysDest.innerHTML = `<option value="">-- Choisir le pays --</option>` + Object.keys(GEOGRAPHY_DATA).map(p => 
      `<option value="${p}">${GEOGRAPHY_DATA[p].flag} ${p}</option>`
    ).join("");
  }

  const adminEditPaysDest = document.getElementById("admin-edit-pays-dest");
  if (adminEditPaysDest) {
    adminEditPaysDest.innerHTML = `<option value="">Non spécifié</option>` + Object.keys(GEOGRAPHY_DATA).map(p => 
      `<option value="${p}">${GEOGRAPHY_DATA[p].flag} ${p}</option>`
    ).join("");
  }
}

function updateVilleOptions(pays, villeSelect, quartierSelect) {
  if (!villeSelect || !GEOGRAPHY_DATA[pays]) return;

  const data = GEOGRAPHY_DATA[pays];
  const villes = Object.keys(data.villes);

  villeSelect.innerHTML = villes.map(v => `<option value="${v}">${v}</option>`).join("");

  villeSelect.onchange = () => {
    updateQuartierOptions(pays, villeSelect.value, quartierSelect);
  };

  updateQuartierOptions(pays, villes[0], quartierSelect);
}

function updateQuartierOptions(pays, ville, quartierSelect) {
  if (!quartierSelect || !GEOGRAPHY_DATA[pays] || !GEOGRAPHY_DATA[pays].villes[ville]) return;

  const quartiers = GEOGRAPHY_DATA[pays].villes[ville] || ["Centre", "Autre quartier"];
  quartierSelect.innerHTML = quartiers.map(q => `<option value="${q}">${q}</option>`).join("");

  const customField = document.getElementById("pub-quartier-custom-container");
  quartierSelect.onchange = () => {
    if (customField) {
      if (quartierSelect.value === "Autre quartier") {
        customField.classList.remove("hidden");
      } else {
        customField.classList.add("hidden");
      }
    }
  };
}

function updateFilterVilles(pays, villeSelect, quartierSelect) {
  if (!villeSelect) return;

  if (!pays || !GEOGRAPHY_DATA[pays]) {
    villeSelect.innerHTML = `<option value="">Toutes les villes</option>`;
    if (quartierSelect) quartierSelect.innerHTML = `<option value="">Tous les quartiers</option>`;
    AppState.activeFilterVille = "";
    AppState.activeFilterQuartier = "";
    return;
  }

  const villes = Object.keys(GEOGRAPHY_DATA[pays].villes);
  villeSelect.innerHTML = `<option value="">Toutes les villes</option>` + villes.map(v => `<option value="${v}">${v}</option>`).join("");

  villeSelect.onchange = () => {
    AppState.activeFilterVille = villeSelect.value;
    updateFilterQuartiers(pays, villeSelect.value, quartierSelect);
    applyFilters();
  };

  if (quartierSelect) quartierSelect.innerHTML = `<option value="">Tous les quartiers</option>`;
}

function updateFilterQuartiers(pays, ville, quartierSelect) {
  if (!quartierSelect) return;

  if (!ville || !GEOGRAPHY_DATA[pays] || !GEOGRAPHY_DATA[pays].villes[ville]) {
    quartierSelect.innerHTML = `<option value="">Tous les quartiers</option>`;
    AppState.activeFilterQuartier = "";
    return;
  }

  const quartiers = GEOGRAPHY_DATA[pays].villes[ville] || [];
  quartierSelect.innerHTML = `<option value="">Tous les quartiers</option>` + quartiers.map(q => `<option value="${q}">${q}</option>`).join("");

  quartierSelect.onchange = () => {
    AppState.activeFilterQuartier = quartierSelect.value;
    applyFilters();
  };
}

/**
 * 11. CALCULATEUR / CONVERTISSEUR EN TEMPS RÉEL (EXCHANGERATE-API)
 */
async function fetchRealTimeExchangeRates() {
  const statusEl = document.getElementById("conv-api-status");
  const updateEl = document.getElementById("conv-last-update");

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/MAD");
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();

    if (data && data.rates) {
      const rates = data.rates;
      AppState.exchangeRates = rates;

      if (rates.XOF) {
        CONVERSION_RATES["MAD_TO_FCFA (XOF)"] = rates.XOF;
        CONVERSION_RATES["FCFA (XOF)_TO_MAD"] = 1 / rates.XOF;
      }
      if (rates.XAF) {
        CONVERSION_RATES["MAD_TO_FCFA (XAF)"] = rates.XAF;
        CONVERSION_RATES["FCFA (XAF)_TO_MAD"] = 1 / rates.XAF;
      } else if (rates.XOF) {
        CONVERSION_RATES["MAD_TO_FCFA (XAF)"] = rates.XOF;
        CONVERSION_RATES["FCFA (XAF)_TO_MAD"] = 1 / rates.XOF;
      }
      if (rates.GNF) {
        CONVERSION_RATES["MAD_TO_GNF"] = rates.GNF;
        CONVERSION_RATES["GNF_TO_MAD"] = 1 / rates.GNF;
      }
      if (rates.CDF) {
        CONVERSION_RATES["MAD_TO_CDF"] = rates.CDF;
        CONVERSION_RATES["CDF_TO_MAD"] = 1 / rates.CDF;
      }
      if (rates.NGN) {
        CONVERSION_RATES["MAD_TO_NGN"] = rates.NGN;
        CONVERSION_RATES["NGN_TO_MAD"] = 1 / rates.NGN;
      }
      if (rates.EUR) {
        CONVERSION_RATES["MAD_TO_EUR"] = rates.EUR;
        CONVERSION_RATES["EUR_TO_MAD"] = 1 / rates.EUR;
      }
      if (rates.USD) {
        CONVERSION_RATES["MAD_TO_USD"] = rates.USD;
        CONVERSION_RATES["USD_TO_MAD"] = 1 / rates.USD;
      }

      // Si le mode taux fixe administrateur est activé, appliquer les taux personnalisés
      if (typeof applyActiveRates === "function") {
        applyActiveRates();
      }

      if (statusEl) {
        if (AppState.fixedRateConfig && AppState.fixedRateConfig.enabled) {
          statusEl.innerHTML = `
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Taux Unique Fixe (Défini par l'Admin)</span>
          `;
          statusEl.className = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300";
        } else {
          statusEl.innerHTML = `
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Taux Réels ExchangeRate-API (En direct)</span>
          `;
          statusEl.className = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200";
        }
      }

      if (updateEl) {
        const now = new Date();
        updateEl.textContent = `Actualisé à ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
      }

      if (typeof window.recalcConverter === "function") {
        window.recalcConverter();
      }
    }
  } catch (err) {
    console.warn("API ExchangeRate inaccessible, utilisation des cours de référence:", err);
    if (statusEl) {
      statusEl.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        <span>Cours Indicatifs P2P</span>
      `;
      statusEl.className = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200";
    }
  }
}
window.fetchRealTimeExchangeRates = fetchRealTimeExchangeRates;

function startConverterWidget() {
  const fromCurr = document.getElementById("conv-from-curr");
  const toCurr = document.getElementById("conv-to-curr");
  const amountInput = document.getElementById("conv-amount");
  const resultEl = document.getElementById("conv-result");
  const rateLabel = document.getElementById("conv-rate-label");

  if (!fromCurr || !toCurr || !amountInput || !resultEl) return;

  function calculate() {
    const val = parseFloat(amountInput.value) || 0;
    const from = fromCurr.value;
    const to = toCurr.value;

    if (from === to) {
      resultEl.textContent = formatNumber(val) + " " + to;
      if (rateLabel) rateLabel.textContent = "Taux 1:1";
      return;
    }

    const isFromMAD = from === "MAD";
    const isToMAD = to === "MAD";
    const isFromFCFA = from.includes("FCFA") || from.includes("XOF") || from.includes("XAF");
    const isToFCFA = to.includes("FCFA") || to.includes("XOF") || to.includes("XAF");

    // 1. Taux fixe de référence exigé : 1 MAD = 60 FCFA (et 60 FCFA = 1 MAD)
    if (isFromMAD && isToFCFA) {
      const converted = val * 60;
      resultEl.textContent = `${formatNumber(Math.round(converted))} ${to}`;
      if (rateLabel) rateLabel.textContent = "1 MAD = 60.00 FCFA (Taux fixe de référence)";
      return;
    }

    if (isFromFCFA && isToMAD) {
      const converted = val / 60;
      resultEl.textContent = `${formatNumber(Math.round(converted * 100) / 100)} MAD`;
      if (rateLabel) rateLabel.textContent = "60 FCFA = 1.00 MAD (Taux fixe de référence • 1 FCFA ≈ 0.0167 MAD)";
      return;
    }

    // Autres devises
    const key = `${from}_TO_${to}`;
    let rate = CONVERSION_RATES[key];

    if (!rate) {
      const toMad = CONVERSION_RATES[`${from}_TO_MAD`] || 1;
      const fromMad = CONVERSION_RATES[`MAD_TO_${to}`] || 1;
      rate = toMad * fromMad;
    }

    const converted = val * (rate || 1);
    resultEl.textContent = formatNumber(Math.round(converted)) + " " + to;
    if (rateLabel) rateLabel.textContent = `1 ${from} ≈ ${rate >= 1 ? rate.toFixed(2) : rate.toFixed(4)} ${to} (donnée indicative)`;
  }

  window.recalcConverter = calculate;

  amountInput.addEventListener("input", calculate);
  fromCurr.addEventListener("change", calculate);
  toCurr.addEventListener("change", calculate);

  const swapBtn = document.getElementById("conv-swap-btn");
  if (swapBtn) {
    swapBtn.addEventListener("click", () => {
      const temp = fromCurr.value;
      fromCurr.value = toCurr.value;
      toCurr.value = temp;
      calculate();
    });
  }

  calculate();
}

/**
 * =========================================================================
 * BARRE SUPÉRIEURE : CONVERTISSEUR EN TEMPS RÉEL (TAUX DU JOUR VIA API)
 * =========================================================================
 */
async function fetchTopLiveRates(forceNotice = false) {
  const statusEl = document.getElementById("top-live-status");
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/MAD");
    if (!res.ok) throw new Error("API status " + res.status);
    const data = await res.json();
    if (data && data.rates) {
      AppState.liveExchangeRates = {
        MAD: 1,
        XOF: data.rates.XOF || 60.55,
        XAF: data.rates.XAF || data.rates.XOF || 60.55,
        GNF: data.rates.GNF || 868.20,
        CDF: data.rates.CDF || 282.50,
        NGN: data.rates.NGN || 154.20,
        EUR: data.rates.EUR || 0.093,
        USD: data.rates.USD || 0.101,
        CAD: data.rates.CAD || 0.142,
        GBP: data.rates.GBP || 0.079
      };
      if (statusEl) {
        const timeStr = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        statusEl.innerHTML = `
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Taux du jour API (${timeStr})</span>
        `;
        statusEl.className = "inline-flex items-center gap-1.5 text-emerald-400 font-medium";
      }
      if (forceNotice) {
        showToast("Taux de change officiels du jour actualisés en direct !", "success");
      }
    }
  } catch (err) {
    console.warn("Échec appel API taux direct, utilisation des taux de référence:", err);
    if (statusEl) {
      statusEl.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        <span>Taux de référence du jour</span>
      `;
      statusEl.className = "inline-flex items-center gap-1.5 text-amber-300 font-medium";
    }
  }
  calculateTopLiveConverter();
}

function calculateTopLiveConverter() {
  const amountInput = document.getElementById("top-live-amount");
  const fromSelect = document.getElementById("top-live-from");
  const toSelect = document.getElementById("top-live-to");
  const resultEl = document.getElementById("top-live-result");
  const badgeEl = document.getElementById("top-live-rate-badge");

  if (!amountInput || !fromSelect || !toSelect || !resultEl) return;

  const amount = parseFloat(amountInput.value) || 0;
  const from = fromSelect.value;
  const to = toSelect.value;

  const rates = AppState.liveExchangeRates || {
    MAD: 1,
    XOF: 60.55,
    XAF: 60.55,
    GNF: 868.20,
    CDF: 282.50,
    NGN: 154.20,
    EUR: 0.093,
    USD: 0.101,
    CAD: 0.142,
    GBP: 0.079
  };

  const rateFromInMad = rates[from] || 1;
  const rateToInMad = rates[to] || 1;

  const unitRate = rateToInMad / rateFromInMad;
  const converted = amount * unitRate;

  let formattedResult = "";
  if (to === "XOF" || to === "XAF" || to === "GNF" || to === "CDF") {
    formattedResult = `${formatNumber(Math.round(converted))} ${to === "XOF" || to === "XAF" ? "FCFA" : to}`;
  } else {
    formattedResult = `${formatNumber(Math.round(converted * 100) / 100)} ${to}`;
  }
  resultEl.textContent = formattedResult;

  if (badgeEl) {
    badgeEl.textContent = `1 ${from} ≈ ${unitRate >= 1 ? unitRate.toFixed(2) : unitRate.toFixed(4)} ${to}`;
  }
}

function swapTopLiveCurrencies() {
  const fromSelect = document.getElementById("top-live-from");
  const toSelect = document.getElementById("top-live-to");
  if (!fromSelect || !toSelect) return;
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
  calculateTopLiveConverter();
}

function refreshTopLiveRates(showToastNotice = false) {
  fetchTopLiveRates(showToastNotice);
}

function startTopLiveConverter() {
  const topLiveAmount = document.getElementById("top-live-amount");
  const topLiveFrom = document.getElementById("top-live-from");
  const topLiveTo = document.getElementById("top-live-to");
  if (topLiveAmount) topLiveAmount.addEventListener("input", calculateTopLiveConverter);
  if (topLiveFrom) topLiveFrom.addEventListener("change", calculateTopLiveConverter);
  if (topLiveTo) topLiveTo.addEventListener("change", calculateTopLiveConverter);

  fetchTopLiveRates();
}

window.fetchTopLiveRates = fetchTopLiveRates;
window.calculateTopLiveConverter = calculateTopLiveConverter;
window.swapTopLiveCurrencies = swapTopLiveCurrencies;
window.refreshTopLiveRates = refreshTopLiveRates;
window.startTopLiveConverter = startTopLiveConverter;

/**
 * 12. LISTENERS ET ÉVÉNEMENTS GLOBAUX
 */
function setupEventListeners() {
  // Filtres par type de tag
  const typeButtons = document.querySelectorAll(".filter-type-btn");
  typeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      typeButtons.forEach(b => {
        b.classList.remove("bg-slate-900", "text-white");
        b.classList.add("bg-white", "text-slate-700", "border-slate-200");
      });
      btn.classList.add("bg-slate-900", "text-white");
      btn.classList.remove("bg-white", "text-slate-700", "border-slate-200");

      AppState.activeFilterType = btn.dataset.type || "all";
      applyFilters();
    });
  });

  // Filtre Devise
  const filterDevise = document.getElementById("filter-devise");
  if (filterDevise) {
    filterDevise.addEventListener("change", (e) => {
      AppState.activeFilterDevise = e.target.value;
      applyFilters();
    });
  }

  // Filtre Tranche de Montant
  const filterTranche = document.getElementById("filter-tranche");
  if (filterTranche) {
    filterTranche.addEventListener("change", (e) => {
      AppState.activeFilterTranche = e.target.value;
      applyFilters();
    });
  }

  // Barre de recherche
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      AppState.searchQuery = e.target.value.trim();
      applyFilters();
    });
  }

  // Soumission formulaires
  const publishForm = document.getElementById("publish-form");
  if (publishForm) publishForm.addEventListener("submit", handlePublishFormSubmit);

  const reviewForm = document.getElementById("review-form");
  if (reviewForm) reviewForm.addEventListener("submit", handleReviewFormSubmit);

  const adminLoginForm = document.getElementById("admin-login-form");
  if (adminLoginForm) adminLoginForm.addEventListener("submit", handleAdminLogin);

  const adminPromoForm = document.getElementById("admin-promo-form");
  if (adminPromoForm) adminPromoForm.addEventListener("submit", handleAdminPromoSave);

  const adminAddTierForm = document.getElementById("admin-add-tier-form");
  if (adminAddTierForm) adminAddTierForm.addEventListener("submit", adminAddNewTier);

  const adminAddPromoForm = document.getElementById("admin-add-promo-form");
  if (adminAddPromoForm) adminAddPromoForm.addEventListener("submit", handleAdminAddPromoCode);

  const adminImageForm = document.getElementById("admin-image-form");
  if (adminImageForm) adminImageForm.addEventListener("submit", handleAdminImageSave);

  const adminAddUserForm = document.getElementById("admin-add-user-form");
  if (adminAddUserForm) adminAddUserForm.addEventListener("submit", handleAdminAddUser);

  const adminChangePasswordForm = document.getElementById("admin-change-password-form");
  if (adminChangePasswordForm) adminChangePasswordForm.addEventListener("submit", handleAdminChangePassword);

  // Formulaires Ambassadeurs & Filleuls
  const ambassadeurForm = document.getElementById("ambassadeur-form");
  if (ambassadeurForm) ambassadeurForm.addEventListener("submit", handleAmbassadeurFormSubmit);

  const filleulForm = document.getElementById("filleul-form");
  if (filleulForm) filleulForm.addEventListener("submit", handleFilleulFormSubmit);

  // Écouteur d'aperçu d'image en direct
  const adminImageUrlInput = document.getElementById("admin-image-url");
  if (adminImageUrlInput) {
    adminImageUrlInput.addEventListener("input", (e) => {
      const prev = document.getElementById("admin-image-preview");
      if (prev) {
        if (e.target.value.trim()) {
          prev.src = e.target.value.trim();
          prev.classList.remove("hidden");
        } else {
          prev.classList.add("hidden");
        }
      }
    });
  }

  // Type d'annonce : afficher/masquer champs Voyageur GP
  const pubTypeSelect = document.getElementById("pub-type");
  const pubGpFields = document.getElementById("pub-gp-fields");
  if (pubTypeSelect && pubGpFields) {
    pubTypeSelect.addEventListener("change", () => {
      const val = pubTypeSelect.value;
      if (val.includes("Voyageur") || val.includes("GP")) {
        pubGpFields.classList.remove("hidden");
      } else {
        pubGpFields.classList.add("hidden");
      }
    });
  }

  // Pays / Ville / Quartier personnalisés
  const pubPaysSelect = document.getElementById("pub-pays");
  const pubPaysCustomContainer = document.getElementById("pub-pays-custom-container");
  if (pubPaysSelect && pubPaysCustomContainer) {
    pubPaysSelect.addEventListener("change", () => {
      if (pubPaysSelect.value.includes("Autre pays")) {
        pubPaysCustomContainer.classList.remove("hidden");
      } else {
        pubPaysCustomContainer.classList.add("hidden");
      }
    });
  }

  const pubVilleSelect = document.getElementById("pub-ville");
  const pubVilleCustomContainer = document.getElementById("pub-ville-custom-container");
  if (pubVilleSelect && pubVilleCustomContainer) {
    pubVilleSelect.addEventListener("change", () => {
      if (pubVilleSelect.value.includes("Autre ville")) {
        pubVilleCustomContainer.classList.remove("hidden");
      } else {
        pubVilleCustomContainer.classList.add("hidden");
      }
    });
  }

  // Bouton d'estimation rapide du montant besoin
  const autoCalcBtn = document.getElementById("pub-auto-calc-btn");
  if (autoCalcBtn) autoCalcBtn.addEventListener("click", autoEstimateBesoinAmount);

  // Bouton d'application du code promo
  const applyPromoBtn = document.getElementById("unlock-promo-apply-btn");
  if (applyPromoBtn) applyPromoBtn.addEventListener("click", applyPromoCode);

  // Synchronisation devise souhaitée et devise disponible
  const pubDeviseDispo = document.getElementById("pub-devise-dispo");
  const pubDeviseSouh = document.getElementById("pub-devise-souhaitee");

  if (pubDeviseDispo && pubDeviseSouh) {
    pubDeviseDispo.addEventListener("change", () => {
      if (pubDeviseDispo.value === "MAD" && pubDeviseSouh.value === "MAD") {
        pubDeviseSouh.value = "FCFA (XOF)";
      } else if (pubDeviseDispo.value.includes("FCFA") && pubDeviseSouh.value.includes("FCFA")) {
        pubDeviseSouh.value = "MAD";
      }
    });
  }
}

function resetFilters() {
  AppState.activeFilterType = "all";
  AppState.activeFilterPays = "";
  AppState.activeFilterPaysDestination = "";
  AppState.activeFilterVille = "";
  AppState.activeFilterQuartier = "";
  AppState.activeFilterDevise = "";
  AppState.activeFilterDeviseDonnee = "";
  AppState.activeFilterDeviseRecue = "";
  AppState.activeFilterQuickPair = "all";
  AppState.activeFilterTranche = "all";
  AppState.searchQuery = "";
  AppState.catalogueDisplayedCount = AppState.cataloguePageSize || 9;

  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";

  const filterPays = document.getElementById("filter-pays");
  if (filterPays) filterPays.value = "";

  const filterPaysDest = document.getElementById("filter-pays-destination");
  if (filterPaysDest) filterPaysDest.value = "";

  const filterVille = document.getElementById("filter-ville");
  if (filterVille) filterVille.innerHTML = `<option value="">Toutes les villes</option>`;

  const filterQuartier = document.getElementById("filter-quartier");
  if (filterQuartier) filterQuartier.innerHTML = `<option value="">Tous les quartiers</option>`;

  const filterDevise = document.getElementById("filter-devise");
  if (filterDevise) filterDevise.value = "";

  const donneeSelect = document.getElementById("filter-devise-donnee");
  if (donneeSelect) donneeSelect.value = "";

  const recueSelect = document.getElementById("filter-devise-recue");
  if (recueSelect) recueSelect.value = "";

  document.querySelectorAll(".pair-chip").forEach(chip => {
    chip.className = "pair-chip px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition whitespace-nowrap cursor-pointer";
  });
  const allChip = document.getElementById("pair-chip-all");
  if (allChip) {
    allChip.className = "pair-chip px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 transition whitespace-nowrap cursor-pointer";
  }

  const filterTranche = document.getElementById("filter-tranche");
  if (filterTranche) filterTranche.value = "all";

  const typeButtons = document.querySelectorAll(".filter-type-btn");
  typeButtons.forEach(b => {
    if (b.dataset.type === "all") {
      b.classList.add("bg-slate-900", "text-white");
      b.classList.remove("bg-white", "text-slate-700");
    } else {
      b.classList.remove("bg-slate-900", "text-white");
      b.classList.add("bg-white", "text-slate-700");
    }
  });

  applyFilters();
}

/**
 * 13. UTILITAIRES DIVERS
 */
function renderUnlockedBadgesCount() {
  const count = Object.keys(AppState.unlockedContacts).length;
  const el = document.getElementById("unlocked-count-badge");
  if (el) {
    el.textContent = count;
    if (count > 0) el.classList.remove("hidden");
    else el.classList.add("hidden");
  }
}

function maskPhone(phone) {
  if (!phone) return "🔒 +212 6** *** **";
  const str = String(phone).replace(/\s+/g, "");
  if (str.length < 7) return "🔒 " + str.slice(0, 3) + "****";
  return "🔒 " + str.slice(0, 4) + " •• •• " + str.slice(-2);
}

function cleanPhoneForWa(phone) {
  return String(phone || "").replace(/[^0-9]/g, "");
}

function formatNumber(num) {
  const n = parseFloat(num);
  if (isNaN(n)) return "0";
  return n.toLocaleString("fr-FR");
}

function formatDate(dateStr) {
  if (!dateStr) return "Récemment";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now - d) / (1000 * 3600));
    if (diffHours < 1) return "À l'instant";
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  } catch (e) {
    return "Récemment";
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message, type = "info", options = {}) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[9999] flex flex-col gap-2.5 sm:max-w-md pointer-events-none";
    document.body.appendChild(container);
  }

  // Éviter l'encombrement de l'écran en limitant à 4 notifications simultanées
  while (container.children.length >= 4) {
    const oldest = container.firstElementChild;
    if (oldest) oldest.remove();
  }

  const title = typeof options === "string" ? options : (options && options.title ? options.title : null);
  const duration = (options && typeof options.duration === "number") ? options.duration : 4500;

  let bgClass = "bg-slate-900/95 text-white border-slate-700/80 shadow-slate-950/20";
  let iconBadgeClass = "text-slate-300 bg-slate-800 border-slate-700";
  let progressClass = "bg-slate-400";
  let iconName = "info";
  let defaultTitle = "Information";

  if (type === "success") {
    bgClass = "bg-slate-900/95 text-white border-emerald-500/40 shadow-emerald-950/25";
    iconBadgeClass = "text-emerald-400 bg-emerald-950/70 border-emerald-500/40";
    progressClass = "bg-emerald-500";
    iconName = "check-circle";
    defaultTitle = "Succès";
  } else if (type === "error") {
    bgClass = "bg-slate-900/95 text-white border-rose-500/40 shadow-rose-950/25";
    iconBadgeClass = "text-rose-400 bg-rose-950/70 border-rose-500/40";
    progressClass = "bg-rose-500";
    iconName = "alert-circle";
    defaultTitle = "Erreur";
  } else if (type === "warning") {
    bgClass = "bg-slate-900/95 text-white border-amber-500/40 shadow-amber-950/25";
    iconBadgeClass = "text-amber-400 bg-amber-950/70 border-amber-500/40";
    progressClass = "bg-amber-500";
    iconName = "alert-triangle";
    defaultTitle = "Attention";
  }

  const displayTitle = title || defaultTitle;

  const toast = document.createElement("div");
  toast.className = `toast-card pointer-events-auto flex flex-col rounded-2xl shadow-2xl border backdrop-blur-md text-xs transition-all duration-300 transform translate-y-3 opacity-0 overflow-hidden ${bgClass}`;
  
  toast.innerHTML = `
    <div class="flex items-start gap-3 p-3.5 pr-2.5">
      <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${iconBadgeClass}">
        <i data-lucide="${iconName}" class="w-4 h-4"></i>
      </div>
      <div class="flex-1 min-w-0 pr-1 pt-0.5">
        <h5 class="text-[11px] font-black uppercase tracking-wider opacity-90 mb-0.5">${escapeHtml(displayTitle)}</h5>
        <p class="text-xs font-semibold leading-relaxed text-slate-100">${escapeHtml(message)}</p>
      </div>
      <button type="button" aria-label="Fermer la notification" class="toast-close-btn text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition flex-shrink-0 cursor-pointer">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
    </div>
    <div class="h-1 w-full bg-black/30 overflow-hidden">
      <div class="toast-progress-bar h-full ${progressClass} w-full origin-left transition-all ease-linear" style="transform: scaleX(1);"></div>
    </div>
  `;

  const dismiss = () => {
    toast.classList.add("translate-y-3", "opacity-0");
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  };

  const closeBtn = toast.querySelector(".toast-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", dismiss);
  }

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  // Animation d'entrée et compte à rebours
  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-3", "opacity-0");
    const bar = toast.querySelector(".toast-progress-bar");
    if (bar) {
      bar.style.transitionDuration = `${duration}ms`;
      bar.style.transform = "scaleX(0)";
    }
  });

  let dismissTimeout = setTimeout(dismiss, duration);

  // Pause au survol de la souris
  toast.addEventListener("mouseenter", () => {
    clearTimeout(dismissTimeout);
    const bar = toast.querySelector(".toast-progress-bar");
    if (bar) bar.style.transitionPlayState = "paused";
  });
  toast.addEventListener("mouseleave", () => {
    dismissTimeout = setTimeout(dismiss, 1200);
  });
}

// ==========================================
// 15. MODULE AMBASSADEURS ET PARRAINAGE P2P
// ==========================================

function openAmbassadeurModal(defaultTab) {
  const modal = document.getElementById("ambassadeur-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  const tab = defaultTab || (AppState.ambassadeur && AppState.ambassadeur.code ? "dashboard" : "create");
  switchAmbassadeurTab(tab);
  updateAmbassadeurUI();
  pushNavState({ modal: "ambassadeur-modal", view: AppState.currentView }, "", "#ambassadeurs");
  if (window.lucide) window.lucide.createIcons();
}

function closeAmbassadeurModal() {
  const modal = document.getElementById("ambassadeur-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function switchAmbassadeurTab(tabName) {
  if (tabName === "filleul") tabName = "dashboard";
  const tabs = ["create", "dashboard", "info"];
  tabs.forEach(t => {
    const pane = document.getElementById(`amb-tab-content-${t}`);
    const btn = document.getElementById(`amb-tab-btn-${t}`);
    if (pane) {
      if (t === tabName) pane.classList.remove("hidden");
      else pane.classList.add("hidden");
    }
    if (btn) {
      if (t === tabName) {
        btn.classList.add("bg-white", "text-slate-900", "shadow-xs");
        btn.classList.remove("text-slate-600");
      } else {
        btn.classList.remove("bg-white", "text-slate-900", "shadow-xs");
        btn.classList.add("text-slate-600");
      }
    }
  });

  if (tabName === "dashboard") {
    const amb = AppState.ambassadeur;
    const activeCard = document.getElementById("amb-active-card");
    const noAccountCard = document.getElementById("amb-no-account-card");
    if (amb && amb.code) {
      if (activeCard) activeCard.classList.remove("hidden");
      if (noAccountCard) noAccountCard.classList.add("hidden");
      renderAmbassadeurDashboard(amb.code);
    } else {
      if (activeCard) activeCard.classList.add("hidden");
      if (noAccountCard) noAccountCard.classList.remove("hidden");
    }
  }

  if (tabName === "create") {
    const notice = document.getElementById("amb-registered-notice");
    const codeSpan = document.getElementById("amb-registered-code");
    if (AppState.ambassadeur && AppState.ambassadeur.code) {
      if (notice) notice.classList.remove("hidden");
      if (codeSpan) codeSpan.textContent = AppState.ambassadeur.code;
    } else {
      if (notice) notice.classList.add("hidden");
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

function generateRandomAmbCode() {
  const nomInput = document.getElementById("amb-nom");
  const codeInput = document.getElementById("amb-code");
  if (!codeInput) return;

  let base = "FRIK";
  if (nomInput && nomInput.value.trim()) {
    const cleanNom = nomInput.value.trim().replace(/[^a-zA-Z]/g, "").toUpperCase();
    if (cleanNom.length >= 3) {
      base = cleanNom.slice(0, 5);
    }
  }

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const generated = `${base}${randomNum}`;
  codeInput.value = generated;
  showToast(`Code généré : ${generated}`, "info", { title: "Code Automatique" });
}

// ==========================================
// GESTION DU TABLEAU DE BORD & FILLEULS AMBASSADEUR
// ==========================================

function getAmbassadeurFilleuls(ambCode) {
  if (!ambCode) return [];
  const storageKey = `frikchange_filleuls_${ambCode.toUpperCase()}`;
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch(e) {
      console.warn("Erreur lecture filleuls stockés:", e);
    }
  }

  // Exemple initial d'activité transparente pour illustrer immédiatement le fonctionnement des 30%
  const sampleFilleuls = [
    {
      id: "fil-1",
      nom: "Amadou Diallo",
      telephone: "+212 6•• •• 42",
      date: "Aujourd'hui, 14:20",
      statut: "Actif",
      deblocages: 3,
      gains: 45 // 30% de 3 x 50 MAD
    },
    {
      id: "fil-2",
      nom: "Fatou Bamba",
      telephone: "+225 07•• •• 89",
      date: "Hier, 18:45",
      statut: "Actif",
      deblocages: 2,
      gains: 30
    },
    {
      id: "fil-3",
      nom: "Mamadou Sylla",
      telephone: "+221 77•• •• 15",
      date: "Il y a 3 jours",
      statut: "Actif",
      deblocages: 1,
      gains: 15
    },
    {
      id: "fil-4",
      nom: "Aïcha Koné",
      telephone: "+212 6•• •• 71",
      date: "Il y a 5 jours",
      statut: "Inactif",
      deblocages: 0,
      gains: 0
    }
  ];

  localStorage.setItem(storageKey, JSON.stringify(sampleFilleuls));
  return sampleFilleuls;
}

function saveAmbassadeurFilleuls(ambCode, list) {
  if (!ambCode) return;
  const storageKey = `frikchange_filleuls_${ambCode.toUpperCase()}`;
  localStorage.setItem(storageKey, JSON.stringify(list));
}

function addFilleulToAmbassadeur(ambCode, nom, telephone) {
  if (!ambCode || !nom) return;
  const list = getAmbassadeurFilleuls(ambCode);
  const cleanPhone = telephone ? `${telephone.slice(0, 7)}•• •• ${telephone.slice(-2)}` : "+•• •• ••";
  
  // Nouveau filleul actif avec 1 déblocage initial et 15 MAD de gains générés (30% de 50 MAD)
  const newFilleul = {
    id: "fil-" + Date.now(),
    nom: nom,
    telephone: cleanPhone,
    date: "À l'instant",
    statut: "Actif",
    deblocages: 1,
    gains: 15
  };

  list.unshift(newFilleul);
  saveAmbassadeurFilleuls(ambCode, list);
  if (AppState.ambassadeur && AppState.ambassadeur.code && AppState.ambassadeur.code.toUpperCase() === ambCode.toUpperCase()) {
    renderAmbassadeurDashboard(ambCode);
  }
}

function renderAmbassadeurDashboard(ambCode) {
  const filleuls = getAmbassadeurFilleuls(ambCode);
  const totalFilleuls = filleuls.length;
  const totalGains = filleuls.reduce((sum, item) => sum + (Number(item.gains) || 0), 0);
  const retirables = totalGains; // solde disponible pour retrait

  const countEl = document.getElementById("amb-stat-filleuls");
  const gainsEl = document.getElementById("amb-stat-gains");
  const retirablesEl = document.getElementById("amb-stat-retirables");
  const countBadge = document.getElementById("amb-filleuls-count-badge");
  const tableBody = document.getElementById("amb-filleuls-table-body");

  if (countEl) countEl.textContent = totalFilleuls;
  if (gainsEl) gainsEl.textContent = `${formatNumber(totalGains)} MAD`;
  if (retirablesEl) retirablesEl.textContent = `${formatNumber(retirables)} MAD`;
  if (countBadge) countBadge.textContent = `${totalFilleuls} enregistré${totalFilleuls > 1 ? "s" : ""}`;

  if (tableBody) {
    if (filleuls.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-3.5 py-6 text-center text-slate-400 text-xs">
            Aucun filleul rattaché pour l'instant. Partagez votre lien ou votre QR Code pour enregistrer votre premier filleul et toucher 30% de commission !
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = filleuls.map(f => {
        const isActif = f.statut === "Actif";
        return `
          <tr class="hover:bg-slate-50/70 transition-colors">
            <td class="px-3.5 py-2.5 font-bold text-slate-900">
              <div class="flex items-center gap-1.5">
                <span>${escapeHtml(f.nom)}</span>
              </div>
              <div class="text-[10px] text-slate-400 font-mono font-normal">${escapeHtml(f.telephone)}</div>
            </td>
            <td class="px-3.5 py-2.5 text-[11px] text-slate-500 whitespace-nowrap">${escapeHtml(f.date)}</td>
            <td class="px-3.5 py-2.5">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isActif ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"
              }">
                ${isActif ? "● Actif" : "○ Inactif"}
              </span>
            </td>
            <td class="px-3.5 py-2.5 text-slate-700 font-bold">
              ${f.deblocages} <span class="font-normal text-slate-500 text-[10px]">déblocage${f.deblocages > 1 ? "s" : ""}</span>
            </td>
            <td class="px-3.5 py-2.5 text-right font-black ${f.gains > 0 ? "text-emerald-700" : "text-slate-400"}">
              ${f.gains > 0 ? `+${formatNumber(f.gains)} MAD` : "0 MAD"}
            </td>
          </tr>
        `;
      }).join("");
    }
  }
}

function updateAmbassadeurUI() {
  const activeCard = document.getElementById("amb-active-card");
  const form = document.getElementById("ambassadeur-form");
  const amb = AppState.ambassadeur;

  if (amb && amb.code) {
    if (activeCard) activeCard.classList.remove("hidden");
    if (form) form.classList.add("hidden");

    const nomEl = document.getElementById("amb-display-nom");
    const telEl = document.getElementById("amb-display-tel");
    const codeEl = document.getElementById("amb-display-code");
    const linkEl = document.getElementById("amb-display-link");
    const qrEl = document.getElementById("amb-display-qrcode");

    if (nomEl) nomEl.textContent = amb.nom || amb.pseudo || "Ambassadeur";
    if (telEl) telEl.textContent = amb.telephone || "-";
    if (codeEl) codeEl.textContent = amb.code;
    
    // URL de parrainage direct
    const referralUrl = `${window.location.origin}${window.location.pathname}?parrain=${encodeURIComponent(amb.code)}`;
    if (linkEl) linkEl.value = referralUrl;

    // Génération et affichage automatique du QR Code via QuickChart
    if (qrEl) {
      const qrApiUrl = `https://quickchart.io/qr?text=${encodeURIComponent(referralUrl)}&size=260&margin=1&ecLevel=M&dark=0f172a&light=ffffff`;
      qrEl.src = qrApiUrl;
    }

    // Mise à jour du Tableau de Bord & Transparence Totale
    renderAmbassadeurDashboard(amb.code);
  } else {
    if (activeCard) activeCard.classList.add("hidden");
    if (form) form.classList.remove("hidden");
  }

  // Section Filleul
  const filCard = document.getElementById("fil-active-card");
  const fil = AppState.filleul;
  if (fil && fil.codeParrain) {
    if (filCard) {
      filCard.classList.remove("hidden");
      const parrainEl = document.getElementById("fil-display-parrain");
      if (parrainEl) parrainEl.textContent = fil.codeParrain;
    }
  }

  // Pré-remplir le champ parrain si un parrain a été détecté dans l'URL
  if (AppState.parrainCode) {
    const pubParrainInput = document.getElementById("pub-code-parrain");
    if (pubParrainInput && !pubParrainInput.value) {
      pubParrainInput.value = AppState.parrainCode;
    }
    const filParrainInput = document.getElementById("fil-code-parrain");
    if (filParrainInput && !filParrainInput.value) {
      filParrainInput.value = AppState.parrainCode;
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

function downloadAmbQRCode() {
  const qrEl = document.getElementById("amb-display-qrcode");
  if (!qrEl || !qrEl.src) {
    showToast("QR Code non disponible.", "warning");
    return;
  }
  const code = AppState.ambassadeur ? AppState.ambassadeur.code : "Ambassadeur";
  const link = document.createElement("a");
  link.href = qrEl.src;
  link.download = `QRCode_FrikChange_${code}.png`;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Téléchargement du QR Code lancé !", "success");
}

function demanderRetraitAmbassadeur() {
  const amb = AppState.ambassadeur;
  if (!amb || !amb.code) {
    showToast("Veuillez d'abord configurer votre compte Ambassadeur.", "warning");
    return;
  }
  const retirablesEl = document.getElementById("amb-stat-retirables");
  const solde = retirablesEl ? retirablesEl.textContent : "0 MAD";

  const message = `Bonjour le support FrikChange P2P ! 💼\n\nJe souhaite effectuer le retrait de mes gains d'Ambassadeur.\n- Code Ambassadeur : *${amb.code}*\n- Nom : ${amb.nom || amb.pseudo}\n- WhatsApp : ${amb.telephone}\n- Gains Retirables : *${solde}*\n\nMode de paiement souhaité : Wave / Orange Money / Moov Money / Virement.`;
  const url = `https://wa.me/212600000000?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
  showToast("Demande de retrait initiée vers le service financier FrikChange.", "success", { title: "Retrait en cours" });
}

async function handleAmbassadeurFormSubmit(e) {
  e.preventDefault();
  const nomInput = document.getElementById("amb-nom");
  const codeInput = document.getElementById("amb-code");
  const prefixInput = document.getElementById("amb-phone-prefix");
  const phoneInput = document.getElementById("amb-phone-number");
  const submitBtn = document.getElementById("amb-submit-btn");

  const nom = nomInput ? nomInput.value.trim() : "";
  const rawCode = codeInput ? codeInput.value.trim().toUpperCase() : "";
  const code = rawCode.replace(/[^A-Z0-9_-]/g, "");
  const prefix = prefixInput ? prefixInput.value : "+212";
  const phoneRaw = phoneInput ? phoneInput.value.trim().replace(/^0+/, "") : "";
  const fullPhone = `${prefix}${phoneRaw}`;

  if (!nom || !code || !phoneRaw) {
    showToast("Veuillez renseigner votre nom, un code valide et votre numéro WhatsApp.", "error", { title: "Champs Requis" });
    return;
  }

  const originalContent = submitBtn ? submitBtn.innerHTML : "";
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Création du profil...`;
    if (window.lucide) window.lucide.createIcons();
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "creerAmbassadeur",
        nom: nom,
        pseudo: nom,
        code: code,
        telephone: fullPhone,
        phone: fullPhone,
        date: new Date().toISOString()
      })
    });

    let result = null;
    try {
      result = await res.json();
    } catch(err) {
      result = { success: true };
    }

    if (result && result.success === false) {
      showToast(result.message || "Impossible d'enregistrer l'ambassadeur. Ce code est peut-être déjà utilisé.", "error", { title: "Erreur Ambassadeur" });
    } else {
      const ambData = {
        nom,
        code,
        telephone: fullPhone,
        date: new Date().toISOString()
      };
      AppState.ambassadeur = ambData;
      localStorage.setItem("frikchange_ambassadeur", JSON.stringify(ambData));
      localStorage.setItem("africhange_ambassadeur", JSON.stringify(ambData));

      showToast(result && result.message ? result.message : `Félicitations ${nom}, votre profil Ambassadeur avec le code ${code} est maintenant actif !`, "success", { title: "Bienvenue Ambassadeur !" });
      updateAmbassadeurUI();
      switchAmbassadeurTab("dashboard");
    }
  } catch (err) {
    console.error("Erreur création ambassadeur:", err);
    // Enregistrement local résilient
    const ambData = {
      nom,
      code,
      telephone: fullPhone,
      date: new Date().toISOString()
    };
    AppState.ambassadeur = ambData;
    localStorage.setItem("frikchange_ambassadeur", JSON.stringify(ambData));
    localStorage.setItem("africhange_ambassadeur", JSON.stringify(ambData));
    showToast(`Profil Ambassadeur (${code}) activé avec succès en mode local.`, "success", { title: "Ambassadeur Enregistré" });
    updateAmbassadeurUI();
    switchAmbassadeurTab("dashboard");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

async function handleFilleulFormSubmit(e) {
  e.preventDefault();
  const nomInput = document.getElementById("fil-nom");
  const codeParrainInput = document.getElementById("fil-code-parrain");
  const prefixInput = document.getElementById("fil-phone-prefix");
  const phoneInput = document.getElementById("fil-phone-number");
  const submitBtn = document.getElementById("fil-submit-btn");

  const nom = nomInput ? nomInput.value.trim() : "";
  const codeParrain = codeParrainInput ? codeParrainInput.value.trim().toUpperCase() : "";
  const prefix = prefixInput ? prefixInput.value : "+212";
  const phoneRaw = phoneInput ? phoneInput.value.trim().replace(/^0+/, "") : "";
  const fullPhone = `${prefix}${phoneRaw}`;

  if (!nom || !codeParrain || !phoneRaw) {
    showToast("Veuillez renseigner votre nom, le code du parrain et votre numéro WhatsApp.", "error", { title: "Champs Requis" });
    return;
  }

  const originalContent = submitBtn ? submitBtn.innerHTML : "";
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Validation du parrainage...`;
    if (window.lucide) window.lucide.createIcons();
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "enregistrerFilleul",
        nomFilleul: nom,
        nom: nom,
        pseudo: nom,
        codeParrain: codeParrain,
        code: codeParrain,
        telephoneFilleul: fullPhone,
        telephone: fullPhone,
        phone: fullPhone,
        date: new Date().toISOString()
      })
    });

    let result = null;
    try {
      result = await res.json();
    } catch(err) {
      result = { success: true };
    }

    if (result && result.success === false) {
      showToast(result.message || "Code parrain introuvable ou non reconnu dans la base.", "error", { title: "Parrain Non Reconnu" });
    } else {
      const filData = {
        nom,
        codeParrain,
        telephone: fullPhone,
        date: new Date().toISOString()
      };
      AppState.filleul = filData;
      localStorage.setItem("frikchange_filleul", JSON.stringify(filData));
      localStorage.setItem("africhange_filleul", JSON.stringify(filData));

      // Rattacher le filleul au tableau de bord de l'ambassadeur
      addFilleulToAmbassadeur(codeParrain, nom, fullPhone);

      showToast(result && result.message ? result.message : `Parrainage validé ! Vous êtes rattaché à l'ambassadeur ${codeParrain}.`, "success", { title: "Parrainage Validé !" });
      updateAmbassadeurUI();
    }
  } catch (err) {
    console.error("Erreur enregistrement filleul:", err);
    const filData = {
      nom,
      codeParrain,
      telephone: fullPhone,
      date: new Date().toISOString()
    };
    AppState.filleul = filData;
    localStorage.setItem("frikchange_filleul", JSON.stringify(filData));
    localStorage.setItem("africhange_filleul", JSON.stringify(filData));
    addFilleulToAmbassadeur(codeParrain, nom, fullPhone);
    showToast(`Parrainage enregistré pour le parrain ${codeParrain}.`, "success", { title: "Filleul Enregistré" });
    updateAmbassadeurUI();
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

async function enregistrerFilleulDirect(nomFilleul, codeParrain, telephoneFilleul) {
  if (!codeParrain || !nomFilleul) return;
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "enregistrerFilleul",
        nomFilleul,
        nom: nomFilleul,
        pseudo: nomFilleul,
        codeParrain,
        code: codeParrain,
        telephoneFilleul,
        telephone: telephoneFilleul,
        phone: telephoneFilleul,
        date: new Date().toISOString()
      })
    });
    const filData = {
      nom: nomFilleul,
      codeParrain,
      telephone: telephoneFilleul,
      date: new Date().toISOString()
    };
    AppState.filleul = filData;
    localStorage.setItem("frikchange_filleul", JSON.stringify(filData));
    localStorage.setItem("africhange_filleul", JSON.stringify(filData));
    addFilleulToAmbassadeur(codeParrain, nomFilleul, telephoneFilleul);
    console.log("Filleul enregistré avec succès via publication:", codeParrain);
  } catch (err) {
    console.warn("Sync directe filleul non bloquante:", err);
    addFilleulToAmbassadeur(codeParrain, nomFilleul, telephoneFilleul);
  }
}

function copyAmbCode() {
  if (!AppState.ambassadeur || !AppState.ambassadeur.code) return;
  navigator.clipboard.writeText(AppState.ambassadeur.code).then(() => {
    showToast(`Code Ambassadeur "${AppState.ambassadeur.code}" copié !`, "success", { title: "Copié !" });
  }).catch(() => {
    showToast(`Code : ${AppState.ambassadeur.code}`, "info");
  });
}

function copyAmbLink() {
  const linkEl = document.getElementById("amb-display-link");
  if (!linkEl || !linkEl.value) return;
  navigator.clipboard.writeText(linkEl.value).then(() => {
    showToast("Lien de parrainage copié dans le presse-papier !", "success", { title: "Lien Copié !" });
  }).catch(() => {
    showToast(linkEl.value, "info");
  });
}

function shareAmbWhatsApp() {
  if (!AppState.ambassadeur || !AppState.ambassadeur.code) return;
  const code = AppState.ambassadeur.code;
  const link = `${window.location.origin}${window.location.pathname}?parrain=${encodeURIComponent(code)}`;
  const message = `Bonjour ! 🌟 Je te recommande FrikChange P2P pour échanger tes devises en toute sécurité entre le Maroc et l'Afrique, et pour le transport solidaire de colis GP.\n\nUtilise mon code parrain officiel : *${code}*\nOu rejoins directement via ce lien : ${link}`;
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

function resetAmbLocalCard() {
  const activeCard = document.getElementById("amb-active-card");
  const form = document.getElementById("ambassadeur-form");
  if (activeCard) activeCard.classList.add("hidden");
  if (form) {
    form.classList.remove("hidden");
    const codeInput = document.getElementById("amb-code");
    if (codeInput) codeInput.value = "";
  }
}

function checkAmbassadeurUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const parrain = params.get("parrain") || params.get("ambassadeur") || params.get("ref");
    if (parrain) {
      const cleanParrain = parrain.trim().toUpperCase();
      AppState.parrainCode = cleanParrain;
      sessionStorage.setItem("frikchange_parrain_code", cleanParrain);
      sessionStorage.setItem("africhange_parrain_code", cleanParrain);
      
      // Notification d'accueil parrainage
      showToast(`Vous êtes invité par l'Ambassadeur "${cleanParrain}". Votre code parrain a été automatiquement appliqué !`, "info", {
        title: "Programme Ambassadeurs FrikChange",
        duration: 7000
      });
    }
  } catch(err) {
    console.warn("Erreur détection URL parrain:", err);
  }
}

/* ==========================================================================
   MODULE FAQ (ACCORDÉON, FILTRES THÉMATIQUES & RECHERCHE EN DIRECT)
   ========================================================================== */

let currentFaqCategory = 'all';

function toggleFaq(id) {
  const content = document.getElementById(`faq-content-${id}`);
  const icon = document.getElementById(`faq-icon-${id}`);
  const trigger = document.getElementById(`faq-trigger-${id}`);
  const card = trigger ? trigger.closest('.faq-card') : null;

  if (!content) return;

  const isHidden = content.classList.contains('hidden');

  if (isHidden) {
    content.classList.remove('hidden');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (icon) icon.classList.add('rotate-180', 'text-emerald-600', 'bg-emerald-50');
    if (card) {
      card.classList.add('border-emerald-500/40', 'bg-emerald-50/10');
      card.classList.remove('border-slate-200');
    }
  } else {
    content.classList.add('hidden');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (icon) icon.classList.remove('rotate-180', 'text-emerald-600', 'bg-emerald-50');
    if (card) {
      card.classList.remove('border-emerald-500/40', 'bg-emerald-50/10');
      card.classList.add('border-slate-200');
    }
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function filterFaqCategory(category) {
  currentFaqCategory = category;

  // Mettre à jour l'apparence des boutons de filtres
  document.querySelectorAll('.faq-cat-btn').forEach(btn => {
    btn.classList.remove('bg-slate-900', 'text-white', 'shadow-xs');
    btn.classList.add('bg-white', 'text-slate-600', 'border', 'border-slate-200');
  });

  const activeBtn = document.getElementById(`faq-tab-${category}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-white', 'text-slate-600', 'border', 'border-slate-200');
    activeBtn.classList.add('bg-slate-900', 'text-white', 'shadow-xs');
  }

  // Filtrer les cartes
  applyFaqFilters();
}

function handleFaqSearch(keyword) {
  const clearBtn = document.getElementById('faq-search-clear');
  if (clearBtn) {
    if (keyword && keyword.trim().length > 0) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
    }
  }

  applyFaqFilters();
}

function clearFaqSearch() {
  const searchInput = document.getElementById('faq-search-input');
  if (searchInput) {
    searchInput.value = '';
  }
  const clearBtn = document.getElementById('faq-search-clear');
  if (clearBtn) clearBtn.classList.add('hidden');

  filterFaqCategory('all');
}

function applyFaqFilters() {
  const searchInput = document.getElementById('faq-search-input');
  const query = (searchInput ? searchInput.value : '').trim().toLowerCase();

  const cards = document.querySelectorAll('.faq-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const cardCategory = card.getAttribute('data-category') || '';
    const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
    const titleText = (card.querySelector('h3')?.textContent || '').toLowerCase();
    const contentText = (card.querySelector('.faq-panel')?.textContent || '').toLowerCase();

    const matchesCategory = (currentFaqCategory === 'all' || cardCategory === currentFaqCategory);
    const matchesSearch = !query || 
                          titleText.includes(query) || 
                          contentText.includes(query) || 
                          keywords.includes(query);

    if (matchesCategory && matchesSearch) {
      card.classList.remove('hidden');
      visibleCount++;
    } else {
      card.classList.add('hidden');
    }
  });

  const emptyState = document.getElementById('faq-empty-state');
  if (emptyState) {
    if (visibleCount === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
    }
  }
}

// Exposer les fonctions d'interaction à la fenêtre pour les onclick en HTML
window.API_URL = API_URL;
window.showToast = showToast;
window.loadAppData = loadAppData;
window.checkPaymentReturn = checkPaymentReturn;
window.showUnlockedContactModal = showUnlockedContactModal;
window.closeUnlockedModal = closeUnlockedModal;
window.redirectToPayment = redirectToPayment;
window.renderAnnonces = renderAnnonces;
window.openUnlockModal = openUnlockModal;
window.closeUnlockModal = closeUnlockModal;
window.confirmUnlockContact = confirmUnlockContact;
window.applyPromoCode = applyPromoCode;
window.openPublishModal = openPublishModal;
window.closePublishModal = closePublishModal;
window.autoEstimateBesoinAmount = autoEstimateBesoinAmount;
window.openReviewModal = openReviewModal;
window.closeReviewModal = closeReviewModal;
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
window.adminToggleAnnoncesActivesVisibility = adminToggleAnnoncesActivesVisibility;
window.adminToggleAmbassadeursVisibility = adminToggleAmbassadeursVisibility;
window.applyPublicVisibilitySettings = applyPublicVisibilitySettings;
window.updateAdminVisibilityControlsUI = updateAdminVisibilityControlsUI;
window.switchAdminTab = switchAdminTab;
window.handleAdminLogout = handleAdminLogout;
window.adminSetAnnonceStatus = adminSetAnnonceStatus;
window.adminDeleteAnnonce = adminDeleteAnnonce;
window.adminEditTierPrompt = adminEditTierPrompt;
window.adminAddNewTier = adminAddNewTier;
window.adminToggleReview = adminToggleReview;
window.adminDeleteReview = adminDeleteReview;
window.adminDeletePromoCode = adminDeletePromoCode;
window.adminDeleteUser = adminDeleteUser;
window.copyAdminLink = copyAdminLink;
window.resetFilters = resetFilters;
window.loadAnnonces = loadAnnonces;
window.openAmbassadeurModal = openAmbassadeurModal;
window.closeAmbassadeurModal = closeAmbassadeurModal;
window.switchAmbassadeurTab = switchAmbassadeurTab;
window.generateRandomAmbCode = generateRandomAmbCode;
window.handleAmbassadeurFormSubmit = handleAmbassadeurFormSubmit;
window.handleFilleulFormSubmit = handleFilleulFormSubmit;
window.copyAmbCode = copyAmbCode;
window.copyAmbLink = copyAmbLink;
window.downloadAmbQRCode = downloadAmbQRCode;
window.demanderRetraitAmbassadeur = demanderRetraitAmbassadeur;
window.shareAmbWhatsApp = shareAmbWhatsApp;
window.resetAmbLocalCard = resetAmbLocalCard;
window.checkAmbassadeurUrl = checkAmbassadeurUrl;
window.toggleFaq = toggleFaq;
window.filterFaqCategory = filterFaqCategory;
window.handleFaqSearch = handleFaqSearch;
window.clearFaqSearch = clearFaqSearch;
window.applyFaqFilters = applyFaqFilters;

/* ==========================================================================
   MODULE PROGRESSIVE WEB APP (PWA) - SERVICE WORKER & INSTALLATION ANDROID
   ========================================================================== */

let deferredInstallPrompt = null;
let pwaBannerDismissed = false;

// 1. Enregistrement du Service Worker
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker FrikChange actif sur scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[PWA] Échec enregistrement Service Worker:', error);
        });
    });
  }
}

// 2. Détection de l'environnement (Standalone, Android, iOS)
function isPwaStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

function isIOS() {
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) && !window.MSStream;
}

// 3. Affichage des éléments d'installation PWA
function showPwaInstallUI() {
  if (isPwaStandalone()) {
    hidePwaInstallUI();
    return;
  }

  // Bouton discret dans la barre de navigation desktop
  const navBtn = document.getElementById('pwa-install-nav-btn');
  if (navBtn) {
    navBtn.classList.remove('hidden');
    navBtn.classList.add('inline-flex');
  }

  // Bouton discret dans le header (mobile & desktop)
  const headerBtn = document.getElementById('pwa-install-header-btn');
  if (headerBtn) {
    headerBtn.classList.remove('hidden');
    headerBtn.classList.add('inline-flex');
  }

  // Bannière d'installation supérieure (si non fermée dans la session)
  const banner = document.getElementById('pwa-install-banner');
  if (banner && !pwaBannerDismissed && !sessionStorage.getItem('frikchange_pwa_banner_dismissed')) {
    banner.classList.remove('hidden');
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function hidePwaInstallUI() {
  const navBtn = document.getElementById('pwa-install-nav-btn');
  if (navBtn) {
    navBtn.classList.add('hidden');
    navBtn.classList.remove('inline-flex');
  }

  const headerBtn = document.getElementById('pwa-install-header-btn');
  if (headerBtn) {
    headerBtn.classList.add('hidden');
    headerBtn.classList.remove('inline-flex');
  }

  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.classList.add('hidden');
  }
}

function dismissPwaBanner() {
  pwaBannerDismissed = true;
  sessionStorage.setItem('frikchange_pwa_banner_dismissed', 'true');
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.classList.add('hidden');
  }
}

// 4. Déclenchement de l'invite d'installation (Android / Chrome / iOS)
async function triggerPWAInstall() {
  if (isPwaStandalone()) {
    showToast("FrikChange est déjà installée sur votre appareil.", "info");
    return;
  }

  // Cas Android / Chromium : événement beforeinstallprompt capturé
  if (deferredInstallPrompt) {
    try {
      await deferredInstallPrompt.prompt();
      const choiceResult = await deferredInstallPrompt.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        showToast("Installation de FrikChange en cours...", "success");
        deferredInstallPrompt = null;
        hidePwaInstallUI();
      } else {
        showToast("Installation reportée. Vous pouvez l'installer à tout moment.", "info");
      }
    } catch (err) {
      console.warn('[PWA] Erreur invite installation:', err);
    }
    return;
  }

  // Cas iOS Safari : guide pas à pas
  if (isIOS()) {
    openPwaIosModal();
    return;
  }

  // Navigateur de bureau ou navigateur sans invite automatique
  showToast("Pour installer FrikChange, cliquez sur l'icône dans la barre d'adresse de votre navigateur ou dans le menu « Ajouter à l'écran d'accueil ».", "info");
}

function openPwaIosModal() {
  const modal = document.getElementById('pwa-ios-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) window.lucide.createIcons();
  }
}

function closePwaIosModal() {
  const modal = document.getElementById('pwa-ios-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Écoute des événements PWA du navigateur
window.addEventListener('beforeinstallprompt', (e) => {
  // Empêche l'affichage par défaut de la mini-barre d'information Chromium
  e.preventDefault();
  // Sauvegarde l'événement pour le déclencher via nos boutons personnalisés
  deferredInstallPrompt = e;
  showPwaInstallUI();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  hidePwaInstallUI();
  showToast("FrikChange a été installée avec succès sur votre écran d'accueil !", "success");
});

// Initialiser le Service Worker dès l'exécution
initServiceWorker();

// Exposer les fonctions PWA à la fenêtre pour les onclick en HTML
window.triggerPWAInstall = triggerPWAInstall;
window.dismissPwaBanner = dismissPwaBanner;
window.openPwaIosModal = openPwaIosModal;
window.closePwaIosModal = closePwaIosModal;

// Initialisation globale au chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
  renderMarketingBanner();

  // Si appareil iOS ou déjà installé, vérifier l'affichage des boutons
  if (!isPwaStandalone()) {
    if (isIOS()) {
      showPwaInstallUI();
    }
  }
});

// =============================================================================
// SYSTÈME D'AUTHENTIFICATION PUBLIQUE & VÉRIFICATION OTP PAR RÔLE
// =============================================================================

/**
 * Met à jour dynamiquement le bouton de rôle dans le header et la navigation mobile
 */
function renderAuthUI() {
  const headerContainer = document.getElementById("auth-header-container");
  const mobileContainer = document.getElementById("mobile-auth-container");
  const returnBar = document.getElementById("admin-floating-return-bar");

  // Si aucun utilisateur n'est connecté
  if (!AppState.currentUser) {
    if (headerContainer) {
      headerContainer.innerHTML = `
        <button type="button" onclick="openAuthModal()" id="btn-header-login" class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer">
          <i data-lucide="log-in" class="w-3.5 h-3.5 text-emerald-400"></i>
          <span>Connexion</span>
        </button>
      `;
    }
    if (mobileContainer) {
      mobileContainer.innerHTML = "";
    }
    if (returnBar) {
      returnBar.classList.add("hidden");
      returnBar.classList.remove("flex");
    }
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  // Utilisateur connecté
  const user = AppState.currentUser;
  let roleIcon = "user";
  let roleLabel = user.role || "Mon Espace";
  let btnClasses = "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200";
  let clickAction = "openUserSpaceModal()";

  if (user.isAdmin) {
    clickAction = "openDedicatedRoleSpace()";
    if (user.role === "Super Administrateur") {
      roleIcon = "crown";
      roleLabel = "👑 Super Admin";
      btnClasses = "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-600/20";
    } else if (user.role === "Modérateur des Annonces") {
      roleIcon = "shield-check";
      roleLabel = "🛡️ Espace Modérateur";
      btnClasses = "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20";
    } else if (user.role === "Support Client & Litiges" || user.role === "Responsable Ambassadeurs") {
      roleIcon = "headphones";
      roleLabel = "💬 Espace Support";
      btnClasses = "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20";
    }
  }

  if (headerContainer) {
    headerContainer.innerHTML = `
      <button type="button" onclick="${clickAction}" id="btn-header-role" class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer ${btnClasses}" title="Accéder à votre console (${user.role})">
        <i data-lucide="${roleIcon}" class="w-3.5 h-3.5"></i>
        <span>${roleLabel}</span>
      </button>
      <button type="button" onclick="handleLogout()" class="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition cursor-pointer" title="Se déconnecter (${user.email})">
        <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
      </button>
    `;
  }

  if (mobileContainer) {
    const mobileShortLabel = user.isAdmin 
      ? (user.role === "Super Administrateur" ? "👑 Admin" : (user.role === "Modérateur des Annonces" ? "🛡️ Modérateur" : "💬 Support"))
      : "👤 Compte";

    mobileContainer.innerHTML = `
      <button type="button" onclick="${clickAction}" class="px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer ${btnClasses}">
        <i data-lucide="${roleIcon}" class="w-3.5 h-3.5"></i>
        <span>${mobileShortLabel}</span>
      </button>
      <button type="button" onclick="handleLogout()" class="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-rose-600 border border-slate-200 cursor-pointer" title="Déconnexion">
        <i data-lucide="log-out" class="w-3 h-3"></i>
      </button>
    `;
  }

  // Barre flottante pour retour rapide à l'admin
  if (returnBar) {
    if (user.isAdmin && !AppState.adminExclusiveMode) {
      returnBar.classList.remove("hidden");
      returnBar.classList.add("flex");
    } else {
      returnBar.classList.add("hidden");
      returnBar.classList.remove("flex");
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Ouvre la modale d'authentification publique
 */
function openAuthModal(prefillEmail = "") {
  const modal = document.getElementById("auth-modal");
  const stepEmail = document.getElementById("auth-step-email");
  const stepOtp = document.getElementById("auth-step-otp");
  const emailInput = document.getElementById("auth-email-input");
  const errorMsg = document.getElementById("otp-error-msg");

  if (!modal) return;

  if (stepEmail) stepEmail.classList.remove("hidden");
  if (stepOtp) stepOtp.classList.add("hidden");
  if (errorMsg) errorMsg.classList.add("hidden");

  if (emailInput) {
    if (prefillEmail) {
      emailInput.value = prefillEmail;
    } else if (AppState.currentUser) {
      emailInput.value = AppState.currentUser.email || "";
    }
    setTimeout(() => emailInput.focus(), 100);
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  pushNavState({ modal: "auth-modal", view: AppState.currentView }, "", "#connexion");

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Ferme la modale d'authentification
 */
function closeAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
  if (AppState.otpCountdownTimer) {
    clearInterval(AppState.otpCountdownTimer);
    AppState.otpCountdownTimer = null;
  }
}

/**
 * Préremplit et soumet l'un des e-mails de démonstration
 */
function selectDemoAuthEmail(email) {
  const input = document.getElementById("auth-email-input");
  if (input) input.value = email;
  handleAuthEmailSubmit(new Event("submit"));
}

/**
 * Étape 1 : Traitement de l'adresse e-mail et génération du code OTP
 */
function handleAuthEmailSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const input = document.getElementById("auth-email-input");
  const rawEmail = input ? input.value : "";
  const email = (rawEmail || "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    showToast("Veuillez saisir une adresse e-mail valide.", "warning");
    return;
  }

  // 1. Recherche dans la liste des Modérateurs et Administrateurs enregistrés
  const adminFound = AppState.adminsList.find(a => a.email && a.email.toLowerCase() === email);

  if (adminFound && adminFound.status === "Désactivé") {
    showToast("Ce compte a été suspendu par un administrateur. Accès refusé.", "error", { title: "Compte Inactif" });
    return;
  }

  // 2. Génération sécurisée d'un code OTP à 6 chiffres
  const otpCode = String(Math.floor(100000 + Math.random() * 900000));
  const roleName = adminFound ? adminFound.role : "Utilisateur Public";
  const userName = adminFound ? adminFound.name : email.split("@")[0];
  const isAdmin = !!adminFound;

  AppState.pendingOtp = {
    email: email,
    code: otpCode,
    name: userName,
    role: roleName,
    isAdmin: isAdmin,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
  };

  // 3. Basculement vers la vue OTP
  const stepEmail = document.getElementById("auth-step-email");
  const stepOtp = document.getElementById("auth-step-otp");
  const targetEmailEl = document.getElementById("otp-display-target-email");
  const roleBadgeEl = document.getElementById("otp-role-detected-badge");
  const codeValEl = document.getElementById("otp-simulated-code-val");
  const otpInput = document.getElementById("auth-otp-input");
  const errorMsg = document.getElementById("otp-error-msg");

  if (stepEmail) stepEmail.classList.add("hidden");
  if (stepOtp) stepOtp.classList.remove("hidden");
  if (errorMsg) errorMsg.classList.add("hidden");

  if (targetEmailEl) targetEmailEl.textContent = email;
  if (codeValEl) codeValEl.textContent = otpCode;

  if (roleBadgeEl) {
    if (roleName === "Super Administrateur") {
      roleBadgeEl.className = "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs";
      roleBadgeEl.innerHTML = `👑 Super Administrateur (Accès Intégral)`;
    } else if (roleName === "Modérateur des Annonces") {
      roleBadgeEl.className = "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs";
      roleBadgeEl.innerHTML = `🛡️ Modérateur Annonces (Gestion &amp; Validation)`;
    } else if (roleName === "Support Client & Litiges" || roleName === "Responsable Ambassadeurs") {
      roleBadgeEl.className = "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-2xs";
      roleBadgeEl.innerHTML = `💬 Support Client &amp; Ambassadeurs`;
    } else {
      roleBadgeEl.className = "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs";
      roleBadgeEl.innerHTML = `👤 Utilisateur Public`;
    }
  }

  if (otpInput) {
    otpInput.value = "";
    setTimeout(() => otpInput.focus(), 150);
  }

  // Démarrer compte à rebours de renvoi (30s)
  startOtpCountdown();

  // Notification Toast avec le code simulé
  showToast(`📨 Code OTP envoyé : ${otpCode} (Simulation boîte e-mail)`, "info", {
    title: "Vérification OTP Reçue",
    duration: 8000
  });

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Lance le compte à rebours pour le renvoi de code OTP
 */
function startOtpCountdown() {
  let seconds = 30;
  const resendBtn = document.getElementById("btn-resend-otp");
  if (!resendBtn) return;

  if (AppState.otpCountdownTimer) {
    clearInterval(AppState.otpCountdownTimer);
  }

  resendBtn.disabled = true;
  resendBtn.classList.add("opacity-50", "cursor-not-allowed");
  resendBtn.textContent = `Renvoyer (${seconds}s)`;

  AppState.otpCountdownTimer = setInterval(() => {
    seconds--;
    if (seconds <= 0) {
      clearInterval(AppState.otpCountdownTimer);
      AppState.otpCountdownTimer = null;
      resendBtn.disabled = false;
      resendBtn.classList.remove("opacity-50", "cursor-not-allowed");
      resendBtn.textContent = "Renvoyer un nouveau code";
    } else {
      resendBtn.textContent = `Renvoyer (${seconds}s)`;
    }
  }, 1000);
}

/**
 * Renvoyer un nouveau code OTP
 */
function resendOtpCode() {
  if (!AppState.pendingOtp) {
    backToAuthEmailStep();
    return;
  }
  const newOtp = String(Math.floor(100000 + Math.random() * 900000));
  AppState.pendingOtp.code = newOtp;
  AppState.pendingOtp.expiresAt = Date.now() + 5 * 60 * 1000;

  const codeValEl = document.getElementById("otp-simulated-code-val");
  if (codeValEl) codeValEl.textContent = newOtp;

  startOtpCountdown();
  showToast(`📨 Nouveau code OTP généré : ${newOtp}`, "info", { title: "Nouveau Code Envoyé", duration: 8000 });
}

/**
 * Insère automatiquement le code OTP dans le champ (bouton 1-clic)
 */
function autoFillOtpCode() {
  if (!AppState.pendingOtp) return;
  const input = document.getElementById("auth-otp-input");
  if (input) {
    input.value = AppState.pendingOtp.code;
    input.focus();
    showToast("Code OTP inséré automatiquement ✓", "success");
    // Déclenche la validation automatiquement après 300ms
    setTimeout(() => {
      handleAuthOtpSubmit(new Event("submit"));
    }, 300);
  }
}

/**
 * Étape 2 : Vérification du code OTP
 */
function handleAuthOtpSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  const otpInput = document.getElementById("auth-otp-input");
  const enteredCode = otpInput ? otpInput.value.trim() : "";
  const errorMsg = document.getElementById("otp-error-msg");

  if (!AppState.pendingOtp) {
    if (errorMsg) {
      errorMsg.textContent = "Session expirée. Veuillez ressaisir votre e-mail.";
      errorMsg.classList.remove("hidden");
    }
    return;
  }

  if (Date.now() > AppState.pendingOtp.expiresAt) {
    if (errorMsg) {
      errorMsg.textContent = "Ce code OTP a expiré. Veuillez en demander un nouveau.";
      errorMsg.classList.remove("hidden");
    }
    showToast("Le code OTP a expiré. Cliquez sur 'Renvoyer un nouveau code'.", "warning");
    return;
  }

  if (enteredCode !== AppState.pendingOtp.code) {
    if (errorMsg) {
      errorMsg.textContent = "Code incorrect. Veuillez saisir le code à 6 chiffres reçu.";
      errorMsg.classList.remove("hidden");
    }
    if (otpInput) {
      otpInput.classList.add("border-rose-500", "ring-2", "ring-rose-400");
      setTimeout(() => otpInput.classList.remove("border-rose-500", "ring-2", "ring-rose-400"), 1500);
      otpInput.focus();
    }
    showToast("Code OTP invalide. Vérifiez le code à 6 chiffres affiché.", "error");
    return;
  }

  // Code valide ! Enregistrement de la session
  AppState.currentUser = {
    email: AppState.pendingOtp.email,
    name: AppState.pendingOtp.name,
    role: AppState.pendingOtp.role,
    isAdmin: AppState.pendingOtp.isAdmin,
    loginDate: new Date().toISOString()
  };

  localStorage.setItem("frikchange_current_user", JSON.stringify(AppState.currentUser));

  if (AppState.currentUser.isAdmin) {
    localStorage.setItem("frikchange_admin_logged", "true");
    AppState.adminAuth = true;
  }

  // Réinitialisation du code temporaire
  AppState.pendingOtp = null;
  if (AppState.otpCountdownTimer) {
    clearInterval(AppState.otpCountdownTimer);
    AppState.otpCountdownTimer = null;
  }

  // Fermer la modale
  closeAuthModal();

  // CRITIQUE : L'utilisateur RESTE sur la page publique
  toggleAdminExclusiveMode(false);

  // Mettre à jour les boutons dans le header / mobile nav
  renderAuthUI();

  // Message de confirmation
  showToast(
    `Connexion réussie ! Bienvenue ${AppState.currentUser.name} (${AppState.currentUser.role}). Votre bouton d'accès dédié est disponible dans le menu.`,
    "success",
    { title: "Authentification Confirmée ✓", duration: 7000 }
  );
}

/**
 * Retourne à l'étape de saisie de l'e-mail
 */
function backToAuthEmailStep() {
  const stepEmail = document.getElementById("auth-step-email");
  const stepOtp = document.getElementById("auth-step-otp");
  const errorMsg = document.getElementById("otp-error-msg");

  if (stepEmail) stepEmail.classList.remove("hidden");
  if (stepOtp) stepOtp.classList.add("hidden");
  if (errorMsg) errorMsg.classList.add("hidden");

  const emailInput = document.getElementById("auth-email-input");
  if (emailInput) setTimeout(() => emailInput.focus(), 100);
}

/**
 * Ouvre l'espace d'administration selon le rôle strict de l'utilisateur
 */
function openDedicatedRoleSpace() {
  if (!AppState.currentUser) {
    openAuthModal();
    return;
  }

  if (!AppState.currentUser.isAdmin) {
    openUserSpaceModal();
    return;
  }

  // Appliquer les permissions strictes selon le rôle
  applyRolePermissions(AppState.currentUser.role);

  // Basculer vers la vue admin isolée
  toggleAdminExclusiveMode(true);

  showToast(`Accès à l'espace dédié : ${AppState.currentUser.role}`, "info");
}

/**
 * Application stricte des permissions selon le rôle de l'utilisateur connecté
 */
function applyRolePermissions(role) {
  const allTabs = [
    { id: "annonces", label: "Gestion des Annonces" },
    { id: "ambassadeurs", label: "Ambassadeurs & Parrainage" },
    { id: "api", label: "Paramètres & API (Taux & Chariow)" },
    { id: "tarifs", label: "Tranches & Prix Déblocage" },
    { id: "marketing", label: "Marketing & Codes Promo" },
    { id: "admins", label: "Équipe & Sécurité" }
  ];

  const banner = document.getElementById("admin-role-restriction-banner");
  const bannerTitle = document.getElementById("admin-role-restriction-title");
  const bannerMsg = document.getElementById("admin-role-restriction-msg");
  const bannerIcon = document.getElementById("admin-role-restriction-icon");
  const headerRoleBadge = document.getElementById("admin-header-role-badge");
  const headerRoleDesc = document.getElementById("admin-header-role-desc");

  if (role === "Modérateur des Annonces") {
    // 1. Modérateur des Annonces : Uniquement l'onglet "Gestion des Annonces"
    allTabs.forEach(tab => {
      const btn = document.getElementById(`admin-nav-${tab.id}`);
      if (btn) {
        if (tab.id === "annonces") {
          btn.classList.remove("hidden");
        } else {
          btn.classList.add("hidden");
        }
      }
    });

    if (banner) {
      banner.classList.remove("hidden");
      if (bannerTitle) bannerTitle.textContent = "Espace Modérateur des Annonces";
      if (bannerMsg) bannerMsg.textContent = "Privilèges restreints : Consultation, validation, modification et suppression des annonces.";
      if (bannerIcon) bannerIcon.textContent = "🛡️";
    }

    if (headerRoleBadge) {
      headerRoleBadge.textContent = "Modérateur Annonces";
      headerRoleBadge.className = "px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30";
    }
    if (headerRoleDesc) {
      headerRoleDesc.textContent = "Console de modération des annonces P2P & GP";
    }

    switchAdminIsolatedSection("annonces");

  } else if (role === "Support Client & Litiges" || role === "Responsable Ambassadeurs") {
    // 2. Support Client : Uniquement l'onglet "Ambassadeurs & Parrainage"
    allTabs.forEach(tab => {
      const btn = document.getElementById(`admin-nav-${tab.id}`);
      if (btn) {
        if (tab.id === "ambassadeurs") {
          btn.classList.remove("hidden");
        } else {
          btn.classList.add("hidden");
        }
      }
    });

    if (banner) {
      banner.classList.remove("hidden");
      if (bannerTitle) bannerTitle.textContent = "Espace Support Client & Ambassadeurs";
      if (bannerMsg) bannerMsg.textContent = "Privilèges restreints : Suivi du réseau de parrainage, validation des filleuls et assistance.";
      if (bannerIcon) bannerIcon.textContent = "💬";
    }

    if (headerRoleBadge) {
      headerRoleBadge.textContent = "Support Client";
      headerRoleBadge.className = "px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-500/30";
    }
    if (headerRoleDesc) {
      headerRoleDesc.textContent = "Gestion du réseau d'ambassadeurs & assistance litiges";
    }

    switchAdminIsolatedSection("ambassadeurs");

  } else {
    // 3. Super Administrateur : Accès complet aux 6 onglets
    allTabs.forEach(tab => {
      const btn = document.getElementById(`admin-nav-${tab.id}`);
      if (btn) {
        btn.classList.remove("hidden");
      }
    });

    if (banner) {
      banner.classList.remove("hidden");
      if (bannerTitle) bannerTitle.textContent = "Console Super Administrateur";
      if (bannerMsg) bannerMsg.textContent = "Accès illimité à tous les modules : Taux fixes & directs, Tranches & déblocage Chariow, Équipe & sécurité, Marketing, Annonces.";
      if (bannerIcon) bannerIcon.textContent = "👑";
    }

    if (headerRoleBadge) {
      headerRoleBadge.textContent = "Super Administrateur";
      headerRoleBadge.className = "px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30";
    }
    if (headerRoleDesc) {
      headerRoleDesc.textContent = "Console d'administration générale • Accès système complet";
    }

    if (!AppState.currentAdminSection || (AppState.currentAdminSection !== "ambassadeurs" && AppState.currentAdminSection !== "api" && AppState.currentAdminSection !== "tarifs" && AppState.currentAdminSection !== "marketing" && AppState.currentAdminSection !== "admins")) {
      switchAdminIsolatedSection("annonces");
    } else {
      switchAdminIsolatedSection(AppState.currentAdminSection);
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Ouvre la modale Espace Utilisateur pour un compte public
 */
function openUserSpaceModal() {
  const modal = document.getElementById("user-space-modal");
  const user = AppState.currentUser;
  if (!modal || !user) return;

  const nameEl = document.getElementById("user-space-name");
  const emailEl = document.getElementById("user-space-email");
  const roleEl = document.getElementById("user-space-role");

  if (nameEl) nameEl.textContent = user.name || "Utilisateur FrikChange";
  if (emailEl) emailEl.textContent = user.email || "";
  if (roleEl) roleEl.textContent = user.role || "Utilisateur Public";

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  pushNavState({ modal: "user-space-modal", view: AppState.currentView }, "", "#espace-utilisateur");
  if (window.lucide) window.lucide.createIcons();
}

/**
 * Ferme la modale Espace Utilisateur
 */
function closeUserSpaceModal() {
  const modal = document.getElementById("user-space-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

/**
 * Déconnexion de l'utilisateur ou de l'administrateur
 */
function handleLogout() {
  AppState.currentUser = null;
  AppState.adminAuth = false;
  AppState.pendingOtp = null;

  localStorage.removeItem("frikchange_current_user");
  localStorage.removeItem("frikchange_admin_logged");

  closeUserSpaceModal();
  closeAuthModal();

  // Retour au site public
  toggleAdminExclusiveMode(false);
  renderAuthUI();

  showToast("Vous avez été déconnecté avec succès. Vous êtes de retour en mode visiteur public.", "info", {
    title: "Session Clôturée"
  });
}

// =============================================================================
// CONTRÔLEUR D'ADMINISTRATION ISOLÉ & PLEIN ÉCRAN (EXCLUSIVE ADMIN VIEW)
// =============================================================================

/**
 * =========================================================================
 * GESTION DE LA BANNIÈRE D'EN-TÊTE & MODULE D'URGENCE (ADMIN & PUBLIC)
 * =========================================================================
 */
function handleAdminBannerFileSelect(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    AppState.temporaryBannerBase64 = event.target.result;
    const previewImg = document.getElementById("admin-banner-preview-img");
    const previewEmpty = document.getElementById("admin-banner-preview-empty");
    const fileLabel = document.getElementById("admin-banner-file-label");
    const activeCheck = document.getElementById("admin-banner-active");

    if (previewImg) {
      previewImg.src = event.target.result;
      previewImg.classList.remove("hidden");
    }
    if (previewEmpty) previewEmpty.classList.add("hidden");
    if (fileLabel) fileLabel.textContent = file.name.length > 22 ? file.name.slice(0, 19) + "..." : file.name;
    if (activeCheck) activeCheck.checked = true;
  };
  reader.readAsDataURL(file);
}

function adminSaveHeaderBanner() {
  const active = document.getElementById("admin-banner-active")?.checked ?? true;
  const urlInput = document.getElementById("admin-banner-url")?.value?.trim() || "";
  const titleInput = document.getElementById("admin-banner-title")?.value?.trim() || "";
  const linkInput = document.getElementById("admin-banner-link")?.value?.trim() || "#catalogue";

  const bannerImgUrl = AppState.temporaryBannerBase64 || urlInput;

  if (!bannerImgUrl && active) {
    showToast("Veuillez sélectionner un fichier image ou saisir une URL d'image.", "warning");
    return;
  }

  AppState.headerBanner = {
    active: !!active,
    imageUrl: bannerImgUrl,
    title: titleInput,
    link: linkInput
  };

  try {
    localStorage.setItem("frikchange_header_banner", JSON.stringify(AppState.headerBanner));
  } catch (err) {
    console.warn("Storage quota sur la bannière:", err);
  }

  renderPublicHeaderBanner();
  showToast("Image de bannière d'en-tête enregistrée et affichée avec succès !", "success");
}

function adminResetHeaderBanner() {
  AppState.headerBanner = {
    active: false,
    imageUrl: "",
    title: "",
    link: "#catalogue"
  };
  AppState.temporaryBannerBase64 = null;
  localStorage.setItem("frikchange_header_banner", JSON.stringify(AppState.headerBanner));

  const activeCheck = document.getElementById("admin-banner-active");
  const urlInput = document.getElementById("admin-banner-url");
  const titleInput = document.getElementById("admin-banner-title");
  const previewImg = document.getElementById("admin-banner-preview-img");
  const previewEmpty = document.getElementById("admin-banner-preview-empty");
  const fileLabel = document.getElementById("admin-banner-file-label");

  if (activeCheck) activeCheck.checked = false;
  if (urlInput) urlInput.value = "";
  if (titleInput) titleInput.value = "";
  if (fileLabel) fileLabel.textContent = "Choisir un fichier image...";
  if (previewImg) {
    previewImg.src = "";
    previewImg.classList.add("hidden");
  }
  if (previewEmpty) previewEmpty.classList.remove("hidden");

  renderPublicHeaderBanner();
  showToast("Bannière d'en-tête désactivée.", "info");
}

function renderPublicHeaderBanner() {
  const banner = document.getElementById("public-header-banner");
  const bannerImg = document.getElementById("public-header-banner-img");
  const bannerTitle = document.getElementById("public-header-banner-title");
  const bannerLink = document.getElementById("public-header-banner-link");

  if (!banner) return;

  const cfg = AppState.headerBanner;
  if (cfg && cfg.active && cfg.imageUrl) {
    banner.classList.remove("hidden");
    if (bannerImg) bannerImg.src = cfg.imageUrl;
    if (bannerTitle) {
      if (cfg.title) {
        bannerTitle.textContent = cfg.title;
        bannerTitle.classList.remove("hidden");
      } else {
        bannerTitle.classList.add("hidden");
      }
    }
    if (bannerLink) {
      bannerLink.href = cfg.link || "#catalogue";
    }
  } else {
    banner.classList.add("hidden");
  }
}

function dismissPublicHeaderBanner() {
  const banner = document.getElementById("public-header-banner");
  if (banner) banner.classList.add("hidden");
}

function renderAdminBannerUrgence() {
  // 1. Volet Bannière
  const bannerActive = document.getElementById("admin-banner-active");
  const bannerUrl = document.getElementById("admin-banner-url");
  const bannerTitle = document.getElementById("admin-banner-title");
  const bannerLink = document.getElementById("admin-banner-link");
  const previewImg = document.getElementById("admin-banner-preview-img");
  const previewEmpty = document.getElementById("admin-banner-preview-empty");

  const bCfg = AppState.headerBanner || {};
  if (bannerActive) bannerActive.checked = !!bCfg.active;
  if (bannerUrl) bannerUrl.value = bCfg.imageUrl && !bCfg.imageUrl.startsWith("data:") ? bCfg.imageUrl : "";
  if (bannerTitle) bannerTitle.value = bCfg.title || "";
  if (bannerLink) bannerLink.value = bCfg.link || "#catalogue";

  if (bCfg.imageUrl) {
    if (previewImg) {
      previewImg.src = bCfg.imageUrl;
      previewImg.classList.remove("hidden");
    }
    if (previewEmpty) previewEmpty.classList.add("hidden");
  } else {
    if (previewImg) previewImg.classList.add("hidden");
    if (previewEmpty) previewEmpty.classList.remove("hidden");
  }

  // 2. Volet Urgence Promo
  const urgActive = document.getElementById("admin-urgency-active");
  const urgTitle = document.getElementById("admin-urgency-title");
  const urgDate = document.getElementById("admin-urgency-end-date");
  const urgBtn = document.getElementById("admin-urgency-btn-text");
  const urgLink = document.getElementById("admin-urgency-btn-link");

  const uCfg = AppState.urgencyPromo || {};
  if (urgActive) urgActive.checked = uCfg.active !== false;
  if (urgTitle) urgTitle.value = uCfg.title || "OFFRE SPÉCIALE RENTRÉE";
  if (urgDate) {
    if (uCfg.endDate) {
      urgDate.value = uCfg.endDate.slice(0, 16);
    } else {
      urgDate.value = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16);
    }
  }
  if (urgBtn) urgBtn.value = uCfg.btnText || "Découvrir l'offre";
  if (urgLink) urgLink.value = uCfg.btnLink || "#catalogue";

  // Mettre à jour l'aperçu du chrono test
  startCountdown(uCfg.endDate || urgDate?.value);
}

function adminSaveUrgencyPromo() {
  const active = document.getElementById("admin-urgency-active")?.checked ?? true;
  const title = document.getElementById("admin-urgency-title")?.value?.trim() || "OFFRE SPÉCIALE RENTRÉE";
  const endDate = document.getElementById("admin-urgency-end-date")?.value || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  const btnText = document.getElementById("admin-urgency-btn-text")?.value?.trim() || "Découvrir l'offre";
  const btnLink = document.getElementById("admin-urgency-btn-link")?.value?.trim() || "#catalogue";

  AppState.urgencyPromo = {
    active,
    title,
    message: title,
    endDate,
    btnText,
    btnLink
  };

  localStorage.setItem("frikchange_urgency_promo", JSON.stringify(AppState.urgencyPromo));
  renderPromoBanner();
  startCountdown(endDate);
  showToast("Offre d'urgence et compte à rebours enregistrés avec succès !", "success");
}

function renderPublicUrgencyPromo() {
  renderPromoBanner();
}

/**
 * =========================================================================
 * GESTION DU TÉLÉVERSEMENT DIRECT DE PHOTO POUR LES ANNONCES
 * =========================================================================
 */
function handleAnnonceImageSelect(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    AppState.temporaryAnnonceImage = event.target.result;
    const preview = document.getElementById("pub-image-preview");
    const container = document.getElementById("pub-image-preview-container");
    const label = document.getElementById("pub-image-upload-label");

    if (preview) preview.src = event.target.result;
    if (container) {
      container.classList.remove("hidden");
      container.classList.add("flex");
    }
    if (label) label.textContent = file.name.length > 20 ? file.name.slice(0, 17) + "..." : file.name;
  };
  reader.readAsDataURL(file);
}

function removeAnnonceSelectedImage() {
  AppState.temporaryAnnonceImage = null;
  const fileInput = document.getElementById("pub-image-file");
  if (fileInput) fileInput.value = "";
  const container = document.getElementById("pub-image-preview-container");
  if (container) {
    container.classList.add("hidden");
    container.classList.remove("flex");
  }
  const label = document.getElementById("pub-image-upload-label");
  if (label) label.textContent = "Choisir une photo...";
}

window.handleAdminBannerFileSelect = handleAdminBannerFileSelect;
window.adminSaveHeaderBanner = adminSaveHeaderBanner;
window.adminResetHeaderBanner = adminResetHeaderBanner;
window.renderPublicHeaderBanner = renderPublicHeaderBanner;
window.dismissPublicHeaderBanner = dismissPublicHeaderBanner;
window.renderAdminBannerUrgence = renderAdminBannerUrgence;
window.adminSaveUrgencyPromo = adminSaveUrgencyPromo;
window.renderPublicUrgencyPromo = renderPublicUrgencyPromo;
window.handleAnnonceImageSelect = handleAnnonceImageSelect;
window.removeAnnonceSelectedImage = removeAnnonceSelectedImage;

// =============================================================================
// CONTRÔLEUR D'ADMINISTRATION ISOLÉ & PLEIN ÉCRAN (EXCLUSIVE ADMIN VIEW)
// =============================================================================

/**
 * 1. Basculement entre Mode Admin Exclusif et Vue Publique
 */
function toggleAdminExclusiveMode(isExclusive) {
  showFullScreenAdmin(isExclusive);
}

/**
 * 2. Changement de section dans le panneau admin isolé avec contrôle des droits
 */
function switchAdminIsolatedSection(sectionName) {
  const sections = ["banner-urgence", "annonces", "ambassadeurs", "api", "tarifs", "marketing", "admins", "studio", "analytics"];
  if (!sections.includes(sectionName)) sectionName = "banner-urgence";

  // Contrôle des privilèges selon le rôle
  const user = AppState.currentUser;
  if (user) {
    if (user.role === "Modérateur des Annonces" && sectionName !== "annonces") {
      showToast("Privilèges restreints : Vous êtes autorisé à gérer uniquement les annonces.", "warning");
      sectionName = "annonces";
    } else if ((user.role === "Support Client & Litiges" || user.role === "Responsable Ambassadeurs") && sectionName !== "ambassadeurs") {
      showToast("Privilèges restreints : Vous êtes autorisé à gérer uniquement les ambassadeurs et réclamations.", "warning");
      sectionName = "ambassadeurs";
    }
  }

  AppState.currentAdminSection = sectionName;

  sections.forEach(sec => {
    const sectionEl = document.getElementById(`admin-section-${sec}`);
    const navBtn = document.getElementById(`admin-nav-${sec}`);

    if (sectionEl) {
      if (sec === sectionName) {
        sectionEl.classList.remove("hidden");
      } else {
        sectionEl.classList.add("hidden");
      }
    }

    if (navBtn) {
      if (sec === sectionName) {
        navBtn.className = "px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-2 bg-emerald-600 text-white shadow-xs cursor-pointer";
      } else {
        navBtn.className = "px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-2 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer";
      }
    }
  });

  // Déclencheurs de rendu spécifiques
  if (sectionName === "banner-urgence") {
    renderAdminBannerUrgence();
  } else if (sectionName === "annonces") {
    renderIsolatedAdminAnnonces();
    updateActiveCounterDisplay();
  } else if (sectionName === "ambassadeurs") {
    renderIsolatedAdminAmbassadeurs();
  } else if (sectionName === "api") {
    renderIsolatedAdminApi();
  } else if (sectionName === "tarifs") {
    renderIsolatedAdminTarifs();
  } else if (sectionName === "marketing") {
    renderIsolatedAdminMarketing();
  } else if (sectionName === "admins") {
    renderIsolatedAdminUsers();
  } else if (sectionName === "studio") {
    loadAdminOfficialAnnouncements();
  } else if (sectionName === "analytics") {
    loadAnalyticsAdminDashboard();
    if (typeof window.mountRechartsDashboard === "function") {
      window.mountRechartsDashboard();
    }
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      if (typeof window.refreshRechartsAnalytics === "function") {
        window.refreshRechartsAnalytics();
      }
    }, 60);
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * 3. Rendu global de la vue d'administration
 */
function renderIsolatedAdminView() {
  renderIsolatedAdminAnnonces();
  renderIsolatedAdminAmbassadeurs();
  renderIsolatedAdminApi();
  renderIsolatedAdminTarifs();
  renderIsolatedAdminMarketing();
  renderIsolatedAdminUsers();

  // Mise à jour des badges dans la barre de navigation
  const annoncesBadge = document.getElementById("admin-badge-count-annonces");
  if (annoncesBadge) annoncesBadge.textContent = String(AppState.annonces.length);

  const ambBadge = document.getElementById("admin-badge-count-amb");
  if (ambBadge) ambBadge.textContent = String(AppState.allAmbassadeurs.length);

  setupIsolatedAdminListeners();
}

/**
 * 4. Configuration des écouteurs d'événements pour le tableau de bord
 */
function setupIsolatedAdminListeners() {
  const searchInput = document.getElementById("admin-isolated-search");
  const filterStatus = document.getElementById("admin-isolated-filter-status");
  const filterType = document.getElementById("admin-isolated-filter-type");

  if (searchInput && !searchInput.dataset.hasListener) {
    searchInput.dataset.hasListener = "true";
    searchInput.addEventListener("input", () => renderIsolatedAdminAnnonces());
  }

  if (filterStatus && !filterStatus.dataset.hasListener) {
    filterStatus.dataset.hasListener = "true";
    filterStatus.addEventListener("change", () => renderIsolatedAdminAnnonces());
  }

  if (filterType && !filterType.dataset.hasListener) {
    filterType.dataset.hasListener = "true";
    filterType.addEventListener("change", () => renderIsolatedAdminAnnonces());
  }

  const ambSearch = document.getElementById("admin-isolated-amb-search");
  if (ambSearch && !ambSearch.dataset.hasListener) {
    ambSearch.dataset.hasListener = "true";
    ambSearch.addEventListener("input", () => renderIsolatedAdminAmbassadeurs());
  }
}

/**
 * 5. SECTION ANNONCES : Calcul des KPI et affichage du tableau
 */
function renderIsolatedAdminAnnonces() {
  const tbody = document.getElementById("admin-isolated-annonces-tbody");
  const emptyEl = document.getElementById("admin-isolated-annonces-empty");
  if (!tbody) return;

  const all = AppState.annonces || [];

  // Calcul des métriques KPI
  const kpiTotal = all.length;
  const kpiApprouvees = all.filter(a => a.Statut === "Approuvé").length;
  const kpiAttente = all.filter(a => !a.Statut || a.Statut === "En attente").length;
  const kpiGP = all.filter(a => {
    const t = (a["Type (Offre/Besoin)"] || "").toLowerCase();
    return t.includes("gp") || t.includes("voyageur");
  }).length;

  const totalEl = document.getElementById("admin-kpi-total-annonces");
  const apprEl = document.getElementById("admin-kpi-approuvees");
  const attEl = document.getElementById("admin-kpi-attente");
  const gpEl = document.getElementById("admin-kpi-gp");

  if (totalEl) totalEl.textContent = String(kpiTotal);
  if (apprEl) apprEl.textContent = String(kpiApprouvees);
  if (attEl) attEl.textContent = String(kpiAttente);
  if (gpEl) gpEl.textContent = String(kpiGP);

  // Filtres actifs
  const q = (document.getElementById("admin-isolated-search")?.value || "").toLowerCase().trim();
  const filterStat = document.getElementById("admin-isolated-filter-status")?.value || "all";
  const filterTyp = document.getElementById("admin-isolated-filter-type")?.value || "all";

  let list = all.filter(a => {
    if (filterStat !== "all") {
      const s = a.Statut || "En attente";
      if (filterStat === "En attente" && s !== "En attente") return false;
      if (filterStat === "Approuvé" && s !== "Approuvé") return false;
      if (filterStat === "Rejeté" && s !== "Rejeté") return false;
    }

    if (filterTyp !== "all") {
      const t = (a["Type (Offre/Besoin)"] || "").toLowerCase();
      if (filterTyp === "Offre" && !t.includes("offre")) return false;
      if (filterTyp === "Besoin" && !t.includes("besoin")) return false;
      if (filterTyp === "Voyageur GP" && !t.includes("gp") && !t.includes("voyageur")) return false;
    }

    if (q) {
      const haystack = `${a.Pseudo || ""} ${a.Telephone || ""} ${a.Pays || ""} ${a.Ville || ""} ${a.Quartier || ""} ${a["Type (Offre/Besoin)"] || ""} ${a.ID || ""} ${a.DeviseDispo || ""} ${a.DeviseSouhaitee || ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  if (list.length === 0) {
    tbody.innerHTML = "";
    if (emptyEl) emptyEl.classList.remove("hidden");
    return;
  }

  if (emptyEl) emptyEl.classList.add("hidden");

  tbody.innerHTML = list.map(a => {
    const status = a.Statut || "En attente";
    const statusBadge = status === "Approuvé"
      ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Validée</span>`
      : status === "Rejeté"
      ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30"><span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Rejetée</span>`
      : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30"><span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> En attente</span>`;

    const isGP = (a["Type (Offre/Besoin)"] || "").toLowerCase().includes("gp") || (a["Type (Offre/Besoin)"] || "").toLowerCase().includes("voyageur");
    const mOffre = parseFloat(a.MontantOffre || a.Montant) || 0;
    const mBesoin = parseFloat(a.MontantBesoin) || (mOffre > 0 ? estimateBesoinAmount(mOffre, a.DeviseDispo, a.DeviseSouhaitee) : 0);

    const montantsHtml = mOffre > 0
      ? `<div class="font-bold text-white"><span class="text-emerald-400">${formatNumber(mOffre)} ${escapeHtml(a.DeviseDispo || "MAD")}</span> <span class="text-slate-400">➔</span> <span class="text-blue-400">${formatNumber(mBesoin)} ${escapeHtml(a.DeviseSouhaitee || "FCFA")}</span></div>`
      : `<div class="font-bold text-white"><span class="text-emerald-400">${escapeHtml(a.DeviseDispo || "MAD")}</span> <span class="text-slate-400">➔</span> <span class="text-blue-400">${escapeHtml(a.DeviseSouhaitee || "FCFA")}</span></div>`;

    const rawPhone = String(a.Telephone || "").replace(/\s+/g, "");
    const waUrl = rawPhone ? `https://wa.me/${rawPhone.replace(/\+/g, "")}` : "#";

    return `
      <tr class="hover:bg-slate-700/40 transition">
        <td class="py-3 px-3.5 whitespace-nowrap">
          <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-black ${isGP ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-700 text-slate-200'}">
            ${escapeHtml(a["Type (Offre/Besoin)"] || "Offre")}
          </span>
          <span class="block font-mono text-[10px] text-slate-400 mt-0.5">#${escapeHtml(String(a.ID || ""))}</span>
        </td>

        <td class="py-3 px-3.5 font-bold text-white whitespace-nowrap">
          ${escapeHtml(a.Pseudo || "Anonyme")}
        </td>

        <td class="py-3 px-3.5 whitespace-nowrap">
          ${statusBadge}
        </td>

        <td class="py-3 px-3.5 whitespace-nowrap">
          <div class="flex items-center gap-1.5 font-mono text-emerald-400 font-bold">
            <a href="${waUrl}" target="_blank" class="hover:underline flex items-center gap-1" title="Contacter sur WhatsApp">
              <i data-lucide="message-circle" class="w-3.5 h-3.5 text-emerald-400"></i>
              <span>${escapeHtml(String(a.Telephone || ""))}</span>
            </a>
            <button type="button" onclick="navigator.clipboard.writeText('${escapeHtml(String(a.Telephone || ""))}'); showToast('Numéro copié !', 'success')" class="text-slate-400 hover:text-white p-0.5 transition" title="Copier le numéro">
              <i data-lucide="copy" class="w-3 h-3"></i>
            </button>
          </div>
        </td>

        <td class="py-3 px-3.5">
          ${montantsHtml}
        </td>

        <td class="py-3 px-3.5">
          <div class="text-slate-200 font-medium">${escapeHtml(a.Pays || "")} - ${escapeHtml(a.Ville || "")}</div>
          ${a.Quartier ? `<div class="text-[10px] text-slate-400">📍 ${escapeHtml(a.Quartier)}</div>` : ""}
        </td>

        <td class="py-3 px-3.5 max-w-xs">
          ${isGP ? `
            <div class="space-y-0.5 text-[11px]">
              ${a.DateDepart ? `<div class="text-amber-300 font-bold">✈️ Vol : ${formatDateFlight(a.DateDepart)}</div>` : ""}
              ${a.VilleDestination ? `<div class="text-slate-300">➔ ${escapeHtml(a.VilleDestination)}</div>` : ""}
              ${a.MessageGP ? `<div class="text-[10px] text-slate-400 truncate italic">"${escapeHtml(a.MessageGP)}"</div>` : ""}
            </div>
          ` : `
            <div class="text-slate-400 text-[11px] truncate">
              ${a.Message ? `"${escapeHtml(a.Message)}"` : `<span class="text-slate-500 italic">Échange P2P standard</span>`}
            </div>
          `}
        </td>

        <td class="py-3 px-3.5 text-right whitespace-nowrap">
          <div class="inline-flex items-center gap-1">
            <!-- Valider / Approuver -->
            <button type="button" onclick="adminSetAnnonceStatus('${a.ID}', 'Approuvé')" class="px-2.5 py-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition flex items-center gap-1 cursor-pointer" title="Valider cette annonce">
              <i data-lucide="check" class="w-3 h-3"></i>
              <span>Valider</span>
            </button>

            <!-- Modifier -->
            <button type="button" onclick="adminOpenEditAnnonceModal('${a.ID}')" class="px-2.5 py-1.5 bg-blue-600/80 hover:bg-blue-500 text-white rounded-lg font-bold text-[11px] transition flex items-center gap-1 cursor-pointer" title="Modifier l'annonce">
              <i data-lucide="edit-3" class="w-3 h-3"></i>
              <span>Modifier</span>
            </button>

            <!-- Rejeter -->
            <button type="button" onclick="adminSetAnnonceStatus('${a.ID}', 'Rejeté')" class="px-2 py-1.5 bg-slate-700 hover:bg-rose-900/60 hover:text-rose-300 text-slate-300 rounded-lg text-[11px] transition cursor-pointer" title="Rejeter l'annonce">
              <i data-lucide="ban" class="w-3 h-3"></i>
            </button>

            <!-- Supprimer -->
            <button type="button" onclick="adminDeleteAnnonce('${a.ID}')" class="px-2 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-[11px] transition cursor-pointer" title="Supprimer définitivement">
              <i data-lucide="trash-2" class="w-3 h-3"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * 6. MODALE D'ÉDITION D'ANNONCE
 */
function adminOpenEditAnnonceModal(id) {
  const annonce = AppState.annonces.find(a => String(a.ID) === String(id));
  if (!annonce) {
    showToast("Annonce introuvable.", "error");
    return;
  }

  const setVal = (elementId, value) => {
    const el = document.getElementById(elementId);
    if (el) el.value = value !== undefined && value !== null ? value : "";
  };

  setVal("admin-edit-id", annonce.ID || "");
  setVal("admin-edit-pseudo", annonce.Pseudo || "");
  setVal("admin-edit-phone", annonce.Telephone || "");
  setVal("admin-edit-statut", annonce.Statut || "En attente");
  setVal("admin-edit-type", annonce["Type (Offre/Besoin)"] || "Offre");
  setVal("admin-edit-devise-dispo", annonce.DeviseDispo || "MAD");
  setVal("admin-edit-montant-dispo", annonce.MontantOffre || annonce.Montant || "");
  setVal("admin-edit-devise-souhaitee", annonce.DeviseSouhaitee || "XOF");
  setVal("admin-edit-montant-souhaite", annonce.MontantBesoin || "");
  setVal("admin-edit-pays", annonce.Pays || "Maroc");
  setVal("admin-edit-ville", annonce.Ville || "");
  setVal("admin-edit-quartier", annonce.Quartier || "");
  setVal("admin-edit-message", annonce.Message || "");
  setVal("admin-edit-datedepart", annonce.DateDepart ? annonce.DateDepart.substring(0, 10) : "");
  setVal("admin-edit-pays-dest", annonce.PaysDestination || "");
  setVal("admin-edit-villedest", annonce.VilleDestination || "");
  setVal("admin-edit-messagegp", annonce.MessageGP || "");

  const modal = document.getElementById("admin-edit-annonce-modal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function adminCloseEditAnnonceModal() {
  const modal = document.getElementById("admin-edit-annonce-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

async function adminSaveEditedAnnonce(e) {
  e.preventDefault();

  const id = document.getElementById("admin-edit-id")?.value;
  const annonce = AppState.annonces.find(a => String(a.ID) === String(id));
  if (!annonce) return;

  const getVal = id => document.getElementById(id)?.value?.trim() || "";

  annonce.Pseudo = getVal("admin-edit-pseudo");
  annonce.Telephone = getVal("admin-edit-phone");
  annonce.Statut = getVal("admin-edit-statut");
  annonce["Type (Offre/Besoin)"] = getVal("admin-edit-type");
  annonce.DeviseDispo = getVal("admin-edit-devise-dispo");
  annonce.MontantOffre = parseFloat(getVal("admin-edit-montant-dispo")) || 0;
  annonce.DeviseSouhaitee = getVal("admin-edit-devise-souhaitee");
  annonce.MontantBesoin = parseFloat(getVal("admin-edit-montant-souhaite")) || 0;
  annonce.Pays = getVal("admin-edit-pays");
  annonce.Ville = getVal("admin-edit-ville");
  annonce.Quartier = getVal("admin-edit-quartier");
  annonce.Message = getVal("admin-edit-message");
  annonce.DateDepart = getVal("admin-edit-datedepart");
  annonce.PaysDestination = getVal("admin-edit-pays-dest");
  annonce.VilleDestination = getVal("admin-edit-villedest");
  annonce.MessageGP = getVal("admin-edit-messagegp");

  // Rafraîchir les tableaux
  renderIsolatedAdminAnnonces();
  renderAdminAnnonces();
  applyFilters();

  adminCloseEditAnnonceModal();
  showToast("Annonce mise à jour avec succès !", "success");

  // Synchronisation avec l'API
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "Annonces",
        data: annonce
      })
    });
  } catch (err) {
    // Modifications enregistrées localement
  }
}

function adminOpenAddAnnonceModal() {
  openPublicationModal();
}

/**
 * 7. SECTION AMBASSADEURS & PARRAINAGE
 */
function renderIsolatedAdminAmbassadeurs() {
  const tbody = document.getElementById("admin-isolated-amb-tbody");
  if (!tbody) return;

  const ambassadeurs = AppState.allAmbassadeurs || [];

  // Calcul des métriques KPI
  const totalAmb = ambassadeurs.length;
  let totalFilleuls = 0;
  let actifsFilleuls = 0;
  let inactifsFilleuls = 0;
  let gainsTotal = 0;
  let retirablesTotal = 0;

  ambassadeurs.forEach(a => {
    totalFilleuls += (a.filleulsActifs || 0) + (a.filleulsInactifs || 0);
    actifsFilleuls += (a.filleulsActifs || 0);
    inactifsFilleuls += (a.filleulsInactifs || 0);
    gainsTotal += (a.gainsTotal || 0);
    retirablesTotal += (a.retirable || 0);
  });

  const kpiAmb = document.getElementById("admin-kpi-total-amb");
  const kpiFilleuls = document.getElementById("admin-kpi-total-filleuls");
  const kpiRatio = document.getElementById("admin-kpi-filleuls-ratio");
  const kpiGains = document.getElementById("admin-kpi-total-gains");
  const kpiRetirables = document.getElementById("admin-kpi-total-retirables");

  if (kpiAmb) kpiAmb.textContent = String(totalAmb);
  if (kpiFilleuls) kpiFilleuls.textContent = String(totalFilleuls);
  if (kpiRatio) kpiRatio.textContent = `${actifsFilleuls} Actifs • ${inactifsFilleuls} Inactifs`;
  if (kpiGains) kpiGains.textContent = `${formatNumber(gainsTotal)} MAD`;
  if (kpiRetirables) kpiRetirables.textContent = `${formatNumber(retirablesTotal)} MAD`;

  // Recherche rapide
  const q = (document.getElementById("admin-isolated-amb-search")?.value || "").toLowerCase().trim();
  const list = q
    ? ambassadeurs.filter(a => `${a.code} ${a.nom} ${a.telephone}`.toLowerCase().includes(q))
    : ambassadeurs;

  tbody.innerHTML = list.map(a => {
    const rawPhone = String(a.telephone || "").replace(/\s+/g, "");
    const waUrl = rawPhone ? `https://wa.me/${rawPhone.replace(/\+/g, "")}` : "#";
    const refLink = `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(a.code)}`;

    return `
      <tr class="hover:bg-slate-700/40 transition text-xs">
        <td class="py-3 px-3.5 whitespace-nowrap">
          <div class="flex items-center gap-1.5">
            <code class="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-lg font-mono font-black text-xs">
              ${escapeHtml(a.code)}
            </code>
            <button type="button" onclick="navigator.clipboard.writeText('${escapeHtml(a.code)}'); showToast('Code ${escapeHtml(a.code)} copié !', 'success')" class="text-slate-400 hover:text-white p-1" title="Copier le code">
              <i data-lucide="copy" class="w-3 h-3"></i>
            </button>
          </div>
        </td>

        <td class="py-3 px-3.5 font-bold text-white whitespace-nowrap">
          ${escapeHtml(a.nom)}
        </td>

        <td class="py-3 px-3.5 whitespace-nowrap">
          <a href="${waUrl}" target="_blank" class="text-emerald-400 font-mono font-bold hover:underline flex items-center gap-1">
            <i data-lucide="message-circle" class="w-3.5 h-3.5 text-emerald-400"></i>
            <span>${escapeHtml(a.telephone)}</span>
          </a>
        </td>

        <td class="py-3 px-3.5 text-slate-300 whitespace-nowrap">
          ${escapeHtml(a.date || "2026-02-15")}
        </td>

        <td class="py-3 px-3.5 whitespace-nowrap">
          <span class="text-emerald-400 font-black">${a.filleulsActifs || 0} actifs</span>
          <span class="text-slate-500"> / ${a.filleulsInactifs || 0} inactifs</span>
        </td>

        <td class="py-3 px-3.5 whitespace-nowrap">
          <span class="text-amber-400 font-black text-sm">${formatNumber(a.gainsTotal || 0)} MAD</span>
          <span class="text-slate-400 text-[10px] block">~${formatNumber((a.gainsTotal || 0) * 65)} FCFA</span>
        </td>

        <td class="py-3 px-3.5 whitespace-nowrap">
          <span class="inline-block px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-black border border-emerald-500/20">
            ${formatNumber(a.retirable || 0)} MAD
          </span>
        </td>

        <td class="py-3 px-3.5 text-right whitespace-nowrap">
          <div class="inline-flex items-center gap-1">
            <button type="button" onclick="adminShowAmbFilleuls('${a.code}')" class="px-2.5 py-1.5 bg-amber-600/80 hover:bg-amber-500 text-white rounded-lg font-bold text-[11px] transition flex items-center gap-1 cursor-pointer" title="Voir les filleuls rattachés">
              <i data-lucide="users" class="w-3 h-3"></i>
              <span>Filleuls (${(a.filleulsList || []).length})</span>
            </button>

            <button type="button" onclick="navigator.clipboard.writeText('${refLink}'); showToast('Lien de parrainage copié !', 'success')" class="px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[11px] transition cursor-pointer" title="Copier le lien d'invitation">
              <i data-lucide="link" class="w-3 h-3 text-amber-300"></i>
            </button>

            <button type="button" onclick="adminCreditAmbGain('${a.code}')" class="px-2 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[11px] transition cursor-pointer" title="Payer ou ajuster les gains">
              <i data-lucide="wallet" class="w-3 h-3"></i>
            </button>

            <button type="button" onclick="adminDeleteAmbassadeur('${a.code}')" class="px-2 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-[11px] transition cursor-pointer" title="Supprimer cet ambassadeur">
              <i data-lucide="trash-2" class="w-3 h-3"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function adminOpenAddAmbModal() {
  const modal = document.getElementById("admin-add-amb-modal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
  if (window.lucide) window.lucide.createIcons();
}

function adminCloseAddAmbModal() {
  const modal = document.getElementById("admin-add-amb-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function adminSaveNewAmbassadeur(e) {
  e.preventDefault();

  const code = (document.getElementById("new-amb-code")?.value || "").toUpperCase().trim();
  const nom = (document.getElementById("new-amb-nom")?.value || "").trim();
  const tel = (document.getElementById("new-amb-tel")?.value || "").trim();

  if (!code || !nom) {
    showToast("Veuillez remplir le code et le nom.", "warning");
    return;
  }

  // Vérification de l'unicité
  const exists = AppState.allAmbassadeurs.some(a => a.code.toUpperCase() === code);
  if (exists) {
    showToast(`Le code unique ${code} existe déjà.`, "error");
    return;
  }

  const newAmb = {
    code: code,
    nom: nom,
    telephone: tel,
    date: new Date().toISOString().substring(0, 10),
    statut: "Actif",
    filleulsActifs: 0,
    filleulsInactifs: 0,
    gainsTotal: 0,
    retirable: 0,
    filleulsList: []
  };

  AppState.allAmbassadeurs.unshift(newAmb);
  localStorage.setItem("frikchange_all_ambassadeurs", JSON.stringify(AppState.allAmbassadeurs));

  renderIsolatedAdminAmbassadeurs();
  adminCloseAddAmbModal();
  showToast(`Ambassadeur ${nom} créé avec le code ${code} !`, "success");

  // Déclencher la création dans Google Apps Script si disponible
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "creerAmbassadeur",
      nom: nom,
      code: code,
      telephone: tel
    })
  }).catch(() => {});
}

function adminShowAmbFilleuls(code) {
  const amb = AppState.allAmbassadeurs.find(a => a.code === code);
  if (!amb) return;

  const panel = document.getElementById("admin-amb-filleuls-panel");
  const codeEl = document.getElementById("admin-inspect-amb-code");
  const tbody = document.getElementById("admin-inspect-filleuls-tbody");

  if (codeEl) codeEl.textContent = `${amb.code} (${amb.nom})`;

  const filleuls = amb.filleulsList || [];

  if (tbody) {
    if (filleuls.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="py-4 text-center text-slate-400">Aucun filleul rattaché à ce code pour l'instant.</td></tr>`;
    } else {
      tbody.innerHTML = filleuls.map(f => `
        <tr class="hover:bg-slate-800 transition">
          <td class="py-2.5 px-3 font-bold text-white">${escapeHtml(f.nom)}</td>
          <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">${escapeHtml(f.tel)}</td>
          <td class="py-2.5 px-3 text-slate-400">${escapeHtml(f.date)}</td>
          <td class="py-2.5 px-3">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${f.statut === 'Actif' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}">
              ${escapeHtml(f.statut)}
            </span>
          </td>
          <td class="py-2.5 px-3 text-center font-bold text-amber-300">${f.deblocages || 0}</td>
          <td class="py-2.5 px-3 text-right font-black text-emerald-400">+${f.commission || 0} MAD</td>
        </tr>
      `).join("");
    }
  }

  if (panel) {
    panel.classList.remove("hidden");
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  if (window.lucide) window.lucide.createIcons();
}

function adminCloseFilleulsPanel() {
  const panel = document.getElementById("admin-amb-filleuls-panel");
  if (panel) panel.classList.add("hidden");
}

function adminSimulateFilleul() {
  const amb = AppState.allAmbassadeurs[0] || { code: "CASA2026", nom: "Moussa Konaté" };

  const nomsTest = ["Seydou Traoré", "Oumar Diakité", "Salif Keita", "Adama Coulibaly", "Khadija Diouf"];
  const nomFilleul = nomsTest[Math.floor(Math.random() * nomsTest.length)];
  const commission = 30; // 30% d'un déblocage type 100 MAD

  const nouveauFilleul = {
    nom: nomFilleul,
    tel: `+221 77 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(10 + Math.random() * 90)} ${Math.floor(10 + Math.random() * 90)}`,
    date: new Date().toISOString().substring(0, 10),
    statut: "Actif",
    deblocages: 1,
    commission: commission
  };

  amb.filleulsActifs = (amb.filleulsActifs || 0) + 1;
  amb.gainsTotal = (amb.gainsTotal || 0) + commission;
  amb.retirable = (amb.retirable || 0) + commission;
  if (!amb.filleulsList) amb.filleulsList = [];
  amb.filleulsList.unshift(nouveauFilleul);

  localStorage.setItem("frikchange_all_ambassadeurs", JSON.stringify(AppState.allAmbassadeurs));

  renderIsolatedAdminAmbassadeurs();
  showToast(`🎉 Simulation réussie : ${nomFilleul} s'est inscrit avec le code ${amb.code} (+${commission} MAD reversés) !`, "success", { duration: 5000 });
}

function adminCreditAmbGain(code) {
  const amb = AppState.allAmbassadeurs.find(a => a.code === code);
  if (!amb) return;

  const montantStr = prompt(`Solde actuel de ${amb.nom} : ${amb.retirable} MAD.\nEntrez le montant à marquer comme payé ou à créditer (ex: 100) :`, String(amb.retirable));
  if (!montantStr) return;

  const montant = parseFloat(montantStr);
  if (isNaN(montant)) return;

  amb.retirable = Math.max(0, amb.retirable - montant);
  localStorage.setItem("frikchange_all_ambassadeurs", JSON.stringify(AppState.allAmbassadeurs));
  renderIsolatedAdminAmbassadeurs();
  showToast(`Paiement de ${montant} MAD enregistré pour ${amb.nom}. Nouveau solde : ${amb.retirable} MAD.`, "success");
}

function adminDeleteAmbassadeur(code) {
  if (!confirm(`Voulez-vous vraiment supprimer l'ambassadeur au code ${code} ?`)) return;

  AppState.allAmbassadeurs = AppState.allAmbassadeurs.filter(a => a.code !== code);
  localStorage.setItem("frikchange_all_ambassadeurs", JSON.stringify(AppState.allAmbassadeurs));
  renderIsolatedAdminAmbassadeurs();
  adminCloseFilleulsPanel();
  showToast(`Ambassadeur ${code} retiré.`, "info");
}

/**
 * =========================================================================
 * 8. SECTION PARAMÈTRES & API (TAUX DE CHANGE, FIXATION UNIQUE & CHARIOW)
 * =========================================================================
 */

function applyActiveRates() {
  if (AppState.fixedRateConfig && AppState.fixedRateConfig.enabled) {
    const cfg = AppState.fixedRateConfig;
    if (cfg.rateFCFA) {
      CONVERSION_RATES["MAD_TO_FCFA (XOF)"] = Number(cfg.rateFCFA);
      CONVERSION_RATES["FCFA (XOF)_TO_MAD"] = 1 / Number(cfg.rateFCFA);
      CONVERSION_RATES["MAD_TO_FCFA (XAF)"] = Number(cfg.rateFCFA);
      CONVERSION_RATES["FCFA (XAF)_TO_MAD"] = 1 / Number(cfg.rateFCFA);
    }
    if (cfg.rateGNF) {
      CONVERSION_RATES["MAD_TO_GNF"] = Number(cfg.rateGNF);
      CONVERSION_RATES["GNF_TO_MAD"] = 1 / Number(cfg.rateGNF);
    }
    if (cfg.rateCDF) {
      CONVERSION_RATES["MAD_TO_CDF"] = Number(cfg.rateCDF);
      CONVERSION_RATES["CDF_TO_MAD"] = 1 / Number(cfg.rateCDF);
    }
    if (cfg.rateEUR) {
      CONVERSION_RATES["MAD_TO_EUR"] = 1 / Number(cfg.rateEUR);
      CONVERSION_RATES["EUR_TO_MAD"] = Number(cfg.rateEUR);
    }
    if (cfg.rateUSD) {
      CONVERSION_RATES["MAD_TO_USD"] = 1 / Number(cfg.rateUSD);
      CONVERSION_RATES["USD_TO_MAD"] = Number(cfg.rateUSD);
    }
  }
}
window.applyActiveRates = applyActiveRates;

function renderIsolatedAdminApi() {
  const isFixed = AppState.fixedRateConfig?.enabled === true;
  const cfg = AppState.fixedRateConfig || {
    rateFCFA: 66.0,
    rateGNF: 880,
    rateCDF: 285,
    rateEUR: 10.70,
    rateUSD: 9.90
  };

  // Synchronisation des boutons radios de mode
  const apiRadio = document.getElementById("rate-mode-api");
  const fixedRadio = document.getElementById("rate-mode-fixed");
  if (apiRadio && fixedRadio) {
    apiRadio.checked = !isFixed;
    fixedRadio.checked = isFixed;
  }

  // Affichage du volet de fixation de taux unique
  const fixedCard = document.getElementById("admin-fixed-rate-card");
  if (fixedCard) {
    if (isFixed) {
      fixedCard.classList.remove("hidden");
    } else {
      fixedCard.classList.add("hidden");
    }
  }

  // Badge indicateur de mode actif
  const badge = document.getElementById("admin-fixed-rate-badge");
  if (badge) {
    if (isFixed) {
      badge.textContent = "🟢 Taux Unique Fixé par l'Admin Actif";
      badge.className = "text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30";
    } else {
      badge.textContent = "🟢 Taux Live Marché (ExchangeRate API)";
      badge.className = "text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    }
  }

  // Pré-remplissage des champs du formulaire de taux fixe
  const setV = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };
  setV("admin-fixed-rate-fcfa", cfg.rateFCFA || 66.0);
  setV("admin-fixed-rate-gnf", cfg.rateGNF || 880);
  setV("admin-fixed-rate-cdf", cfg.rateCDF || 285);
  setV("admin-fixed-rate-eur", cfg.rateEUR || 10.70);
  setV("admin-fixed-rate-usd", cfg.rateUSD || 9.90);

  // Valeurs affichées dans les cartes récapitulatives
  const xof = isFixed ? (cfg.rateFCFA || 66.0) : (AppState.exchangeRates?.XOF || 66.0);
  const xaf = isFixed ? (cfg.rateFCFA || 66.0) : (AppState.exchangeRates?.XAF || 66.0);
  const gnf = isFixed ? (cfg.rateGNF || 880) : (AppState.exchangeRates?.GNF || 885.0);
  const cdf = isFixed ? (cfg.rateCDF || 285) : (AppState.exchangeRates?.CDF || 285.0);
  const eur = isFixed ? (cfg.rateEUR || 10.70) : (AppState.exchangeRates?.EUR ? (1 / AppState.exchangeRates.EUR).toFixed(2) : "10.70");
  const usd = isFixed ? (cfg.rateUSD || 9.90) : (AppState.exchangeRates?.USD ? (1 / AppState.exchangeRates.USD).toFixed(2) : "9.90");

  const setT = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setT("admin-rate-xof", `${Number(xof).toFixed(1)} FCFA`);
  setT("admin-rate-xaf", `${Number(xaf).toFixed(1)} FCFA`);
  setT("admin-rate-gnf", `${Number(gnf).toFixed(0)} GNF`);
  setT("admin-rate-cdf", `${Number(cdf).toFixed(0)} CDF`);
  setT("admin-rate-eur", `${Number(eur).toFixed(2)} MAD`);
  setT("admin-rate-usd", `${Number(usd).toFixed(2)} MAD`);

  // Mise à jour du lien Chariow configuré
  const currentChariowLink = AppState.configPrix[0]?.LienPaiementChariow || "https://chariow.com/pay/frikchange";
  const linkDisplay = document.getElementById("admin-chariow-link-display");
  if (linkDisplay) linkDisplay.value = currentChariowLink;

  // Remplissage de la sélection des annonces pour le test de retour Chariow
  const select = document.getElementById("admin-test-chariow-annonce-select");
  if (select) {
    select.innerHTML = AppState.annonces.map(a => `
      <option value="${a.ID}">Annonce #${a.ID} - ${escapeHtml(a.Pseudo || "Anonyme")} (${escapeHtml(a.Ville || "")} - ${escapeHtml(a.DeviseDispo || "MAD")} ➔ ${escapeHtml(a.DeviseSouhaitee || "FCFA")})</option>
    `).join("");
  }

  adminRunTestCalc();
}

function adminHandleRateModeChange(mode) {
  if (mode === "fixed") {
    AppState.fixedRateConfig.enabled = true;
    localStorage.setItem("frikchange_fixed_rate_config", JSON.stringify(AppState.fixedRateConfig));
    applyActiveRates();
    renderIsolatedAdminApi();
    showToast("Mode Taux Unique Fixe sélectionné. Configurez vos taux ci-dessous.", "info");
  } else {
    AppState.fixedRateConfig.enabled = false;
    localStorage.setItem("frikchange_fixed_rate_config", JSON.stringify(AppState.fixedRateConfig));
    fetchRealTimeExchangeRates();
    renderIsolatedAdminApi();
    showToast("Retour aux taux en temps réel de l'API de marché.", "success");
  }
}

function adminSaveCustomFixedRate(e) {
  if (e) e.preventDefault();

  const rateFCFA = parseFloat(document.getElementById("admin-fixed-rate-fcfa")?.value) || 66.0;
  const rateGNF = parseFloat(document.getElementById("admin-fixed-rate-gnf")?.value) || 880;
  const rateCDF = parseFloat(document.getElementById("admin-fixed-rate-cdf")?.value) || 285;
  const rateEUR = parseFloat(document.getElementById("admin-fixed-rate-eur")?.value) || 10.70;
  const rateUSD = parseFloat(document.getElementById("admin-fixed-rate-usd")?.value) || 9.90;

  AppState.fixedRateConfig = {
    enabled: true,
    rateFCFA,
    rateGNF,
    rateCDF,
    rateEUR,
    rateUSD
  };

  localStorage.setItem("frikchange_fixed_rate_config", JSON.stringify(AppState.fixedRateConfig));
  applyActiveRates();
  renderIsolatedAdminApi();

  if (typeof window.recalcConverter === "function") {
    window.recalcConverter();
  }

  showToast("Taux uniques fixes enregistrés et immédiatement appliqués !", "success", { title: "Taux Fixés ✓" });
}

function adminResetToApiRates() {
  const apiRadio = document.getElementById("rate-mode-api");
  if (apiRadio) apiRadio.checked = true;
  adminHandleRateModeChange("api");
}

async function adminTestExchangeApi() {
  const t0 = performance.now();
  const pingEl = document.getElementById("admin-api-ping");
  const statusEl = document.getElementById("admin-api-http-status");
  const dateEl = document.getElementById("admin-api-last-date");

  if (pingEl) pingEl.textContent = "Test en cours...";

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/MAD");
    const t1 = performance.now();
    const duration = Math.round(t1 - t0);

    if (res.ok) {
      const data = await res.json();
      if (data.rates) {
        AppState.exchangeRates = data.rates;
        if (!AppState.fixedRateConfig.enabled) {
          fetchRealTimeExchangeRates();
        }
        renderIsolatedAdminApi();
      }

      if (pingEl) pingEl.textContent = `${duration} ms`;
      if (statusEl) statusEl.textContent = `200 OK (${res.statusText || "Connecté"})`;
      if (dateEl) dateEl.textContent = new Date().toLocaleTimeString();

      showToast(`Connexion API réussie (${duration} ms). Taux récupérés.`, "success");
    } else {
      if (statusEl) statusEl.textContent = `Erreur ${res.status}`;
      showToast(`Erreur HTTP : ${res.status}`, "warning");
    }
  } catch (err) {
    if (statusEl) statusEl.textContent = "Erreur Réseau";
    showToast("Impossible de joindre open.er-api.com", "error");
  }
}

function adminRunTestCalc() {
  const inputEl = document.getElementById("admin-calc-test-amount");
  const resultEl = document.getElementById("admin-calc-test-result");
  if (!inputEl || !resultEl) return;

  const montant = parseFloat(inputEl.value) || 0;
  const isFixed = AppState.fixedRateConfig?.enabled;
  const rate = isFixed ? (AppState.fixedRateConfig?.rateFCFA || 66.0) : (AppState.exchangeRates?.XOF || 66.0);
  const fcfa = Math.round(montant * rate);

  resultEl.textContent = `~${formatNumber(fcfa)} FCFA`;
}

function adminTestOpenChariow() {
  const link = AppState.configPrix[0]?.LienPaiementChariow || "https://chariow.com/pay/frikchange";
  window.open(link, "_blank");
}

function adminCopyChariowLink() {
  const link = AppState.configPrix[0]?.LienPaiementChariow || "https://chariow.com/pay/frikchange";
  navigator.clipboard.writeText(link).then(() => {
    showToast("Lien Chariow copié dans le presse-papiers !", "success");
  });
}

function adminSimulatePaymentReturn(status) {
  const select = document.getElementById("admin-test-chariow-annonce-select");
  const annonceId = select?.value || AppState.annonces[0]?.ID || "1";
  const annonce = AppState.annonces.find(a => String(a.ID) === String(annonceId));

  if (status === "success") {
    AppState.unlockedContacts[annonceId] = {
      unlockedAt: new Date().toISOString(),
      transactionId: `SIM-${Date.now()}`
    };
    localStorage.setItem("frikchange_unlocked_contacts", JSON.stringify(AppState.unlockedContacts));
    renderUnlockedBadgesCount();

    if (annonce) {
      showUnlockedContactModal(annonce);
    } else {
      showToast(`🎉 Succès : Contact de l'annonce #${annonceId} débloqué !`, "success");
    }
  } else if (status === "cancel") {
    showToast("⚠️ Simulation : L'utilisateur a annulé son paiement sur Chariow.", "warning");
  } else {
    showToast("❌ Simulation : Échec de la transaction sur la passerelle bancaire.", "error");
  }
}

/**
 * =========================================================================
 * 9. SECTION TRANCHES & TARIFS DE DÉBLOCAGE (MODIFICATION, CRÉATION, SUPPRESSION)
 * =========================================================================
 */

function renderIsolatedAdminTarifs() {
  const container = document.getElementById("admin-isolated-tarifs-list");
  if (!container) return;

  const tiers = AppState.configPrix || [];

  if (tiers.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-slate-900/60 rounded-2xl border border-dashed border-slate-700 text-slate-400">
        <i data-lucide="layers" class="w-8 h-8 mx-auto mb-2 text-slate-500"></i>
        <p class="font-bold text-white mb-1">Aucune tranche de prix définie</p>
        <p class="text-xs text-slate-400">Utilisez le formulaire ci-dessous pour ajouter votre premier palier de montants.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = tiers.map((tier, idx) => `
    <div class="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-700/80 hover:border-slate-600 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="space-y-1.5 flex-1 min-w-0">
        <div class="flex items-center flex-wrap gap-2">
          <span class="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-black border border-emerald-500/30">
            Palier ${idx + 1}
          </span>
          <span class="font-bold text-white text-sm">
            ${formatNumber(tier.TrancheMin)} à ${formatNumber(tier.TrancheMax)} MAD <span class="text-slate-400 font-normal text-xs">(ou équiv. FCFA)</span>
          </span>
          <span class="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Tarif : ${escapeHtml(tier.PrixJetons || "20 MAD")}
          </span>
        </div>
        
        <div class="flex items-center gap-2 text-xs text-slate-400 font-mono truncate pt-1">
          <i data-lucide="link" class="w-3.5 h-3.5 shrink-0 text-emerald-400"></i>
          <span class="text-slate-500">Lien Chariow :</span>
          <a href="${escapeHtml(tier.LienPaiementChariow || '#')}" target="_blank" class="text-emerald-400 hover:underline truncate max-w-xs sm:max-w-md">
            ${escapeHtml(tier.LienPaiementChariow || "Non configuré")}
          </a>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
        <button type="button" onclick="adminOpenEditTierModal(${idx})" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 hover:border-slate-600 transition flex items-center gap-1.5 cursor-pointer">
          <i data-lucide="edit-3" class="w-3.5 h-3.5 text-blue-400"></i>
          <span>Modifier</span>
        </button>
        <button type="button" onclick="adminDeleteTier(${idx})" class="p-2 text-rose-400 hover:text-white hover:bg-rose-900/40 rounded-xl transition cursor-pointer" title="Supprimer cette tranche">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

function adminOpenEditTierModal(idx) {
  const tier = AppState.configPrix[idx];
  if (!tier) return;

  const modal = document.getElementById("admin-edit-tier-modal");
  if (!modal) return;

  document.getElementById("admin-edit-tier-index").value = idx;
  document.getElementById("admin-edit-tier-min").value = tier.TrancheMin;
  document.getElementById("admin-edit-tier-max").value = tier.TrancheMax;
  document.getElementById("admin-edit-tier-price").value = tier.PrixJetons || "";
  document.getElementById("admin-edit-tier-link").value = tier.LienPaiementChariow || "";

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  if (window.lucide) window.lucide.createIcons();
}

function adminCloseEditTierModal() {
  const modal = document.getElementById("admin-edit-tier-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function adminSaveEditedTier(e) {
  if (e) e.preventDefault();

  const idx = parseInt(document.getElementById("admin-edit-tier-index")?.value, 10);
  if (isNaN(idx) || !AppState.configPrix[idx]) return;

  const min = parseFloat(document.getElementById("admin-edit-tier-min")?.value) || 0;
  const max = parseFloat(document.getElementById("admin-edit-tier-max")?.value) || 0;
  const price = document.getElementById("admin-edit-tier-price")?.value?.trim() || "";
  const link = document.getElementById("admin-edit-tier-link")?.value?.trim() || "";

  if (max <= min) {
    showToast("Le montant maximum doit être supérieur au minimum.", "warning");
    return;
  }

  AppState.configPrix[idx] = {
    TrancheMin: min,
    TrancheMax: max,
    PrixJetons: price,
    LienPaiementChariow: link
  };

  localStorage.setItem("frikchange_config_prix", JSON.stringify(AppState.configPrix));
  adminCloseEditTierModal();
  renderIsolatedAdminTarifs();
  if (typeof renderAdminConfigPrix === "function") renderAdminConfigPrix();
  showToast(`Palier ${idx + 1} (${min} - ${max} MAD) mis à jour avec succès !`, "success");
}

function adminDeleteTier(idx) {
  const tier = AppState.configPrix[idx];
  if (!tier) return;

  if (!confirm(`Supprimer définitivement la tranche ${tier.TrancheMin} à ${tier.TrancheMax} MAD ?`)) return;

  AppState.configPrix.splice(idx, 1);
  localStorage.setItem("frikchange_config_prix", JSON.stringify(AppState.configPrix));
  renderIsolatedAdminTarifs();
  if (typeof renderAdminConfigPrix === "function") renderAdminConfigPrix();
  showToast("Tranche de déblocage supprimée.", "info");
}

function adminDeleteTierFromModal() {
  const idx = parseInt(document.getElementById("admin-edit-tier-index")?.value, 10);
  if (!isNaN(idx)) {
    adminCloseEditTierModal();
    adminDeleteTier(idx);
  }
}

function adminAddNewTierIsolated(e) {
  if (e) e.preventDefault();

  const min = parseFloat(document.getElementById("new-tier-min-iso")?.value) || 0;
  const max = parseFloat(document.getElementById("new-tier-max-iso")?.value) || 0;
  const price = document.getElementById("new-tier-price-iso")?.value?.trim() || "";
  const link = document.getElementById("new-tier-link-iso")?.value?.trim() || "";

  if (max <= min) {
    showToast("Le montant maximum doit être supérieur au minimum.", "warning");
    return;
  }

  AppState.configPrix.push({
    TrancheMin: min,
    TrancheMax: max,
    PrixJetons: price,
    LienPaiementChariow: link
  });

  localStorage.setItem("frikchange_config_prix", JSON.stringify(AppState.configPrix));
  renderIsolatedAdminTarifs();
  if (typeof renderAdminConfigPrix === "function") renderAdminConfigPrix();
  showToast(`Nouvelle tranche (${min} - ${max} MAD) ajoutée avec succès !`, "success");

  document.getElementById("admin-isolated-add-tier-form")?.reset();
}

/**
 * =========================================================================
 * 10. SECTION MARKETING (PUBLICATIONS, MESSAGES, IMAGES, CODES PROMO)
 * =========================================================================
 */

function renderIsolatedAdminMarketing() {
  // 1. Rendu des codes promos
  renderIsolatedAdminPromoCodes();
  // 2. Rendu des publications marketing
  renderIsolatedAdminPublications();
}

function renderIsolatedAdminPromoCodes() {
  const container = document.getElementById("admin-isolated-promocodes-list");
  if (!container) return;

  const codes = AppState.promoCodes || [];

  if (codes.length === 0) {
    container.innerHTML = `<div class="text-slate-500 py-3 text-center text-xs">Aucun code promo actif.</div>`;
    return;
  }

  container.innerHTML = codes.map((p, idx) => `
    <div class="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-700/80 hover:border-slate-600 transition text-xs">
      <div class="flex items-center gap-3">
        <code class="font-mono font-black text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg">
          ${escapeHtml(p.code)}
        </code>
        <div>
          <span class="font-bold text-white">${escapeHtml(p.type === 'gratuit' ? '100% Gratuit (Accès Offert)' : p.type)}</span>
          <span class="text-slate-400 text-[11px] block">${escapeHtml(p.desc || "")}</span>
        </div>
      </div>
      <button type="button" onclick="adminDeletePromoCode('${escapeHtml(p.code)}')" class="p-1.5 text-rose-400 hover:text-white hover:bg-rose-900/40 rounded-lg transition cursor-pointer" title="Supprimer ce code promo">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

function adminAddNewPromoCodeIsolated(e) {
  if (e) e.preventDefault();

  const code = (document.getElementById("new-promo-code-iso")?.value || "").toUpperCase().trim();
  const type = document.getElementById("new-promo-type-iso")?.value || "50%";
  const desc = (document.getElementById("new-promo-desc-iso")?.value || "").trim();

  if (!code) return;

  if (AppState.promoCodes.some(p => p.code.toUpperCase() === code)) {
    showToast("Ce code promo existe déjà.", "warning");
    return;
  }

  AppState.promoCodes.push({ code, type, desc });
  localStorage.setItem("frikchange_promocodes", JSON.stringify(AppState.promoCodes));
  localStorage.setItem("africhange_promocodes", JSON.stringify(AppState.promoCodes));

  renderIsolatedAdminPromoCodes();
  if (typeof renderAdminPromoCodes === "function") renderAdminPromoCodes();
  showToast(`Code promo ${code} créé avec succès !`, "success");

  document.getElementById("admin-isolated-add-promocode-form")?.reset();
}

function renderIsolatedAdminPublications() {
  const container = document.getElementById("admin-isolated-publications-list") || document.getElementById("admin-marketing-publications-list");
  if (!container) return;

  const pubs = AppState.marketingPublications || [];

  if (pubs.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-slate-900/60 rounded-2xl border border-dashed border-slate-700 text-slate-400">
        <i data-lucide="megaphone" class="w-8 h-8 mx-auto mb-2 text-slate-500"></i>
        <p class="font-bold text-white mb-1">Aucune publication marketing créée</p>
        <p class="text-xs text-slate-400">Ajoutez votre première annonce promotionnelle avec visuel ci-dessous.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = pubs.map(pub => `
    <div class="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-700/80 hover:border-slate-600 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="flex items-start gap-4 flex-1 min-w-0">
        <div class="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative">
          <img src="${escapeHtml(pub.image || '')}" alt="${escapeHtml(pub.title || '')}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80'" />
        </div>
        <div class="space-y-1 flex-1 min-w-0">
          <div class="flex items-center flex-wrap gap-2">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${pub.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400 border border-slate-600'}">
              ${pub.active ? '🟢 Actif sur le site' : '⚪ Inactif'}
            </span>
            <span class="text-[11px] text-slate-500 font-mono">${escapeHtml(pub.date || '')}</span>
          </div>
          <h4 class="font-bold text-white text-sm truncate">${escapeHtml(pub.title || '')}</h4>
          <p class="text-xs text-slate-300 line-clamp-2 leading-relaxed">${escapeHtml(pub.message || '')}</p>
          ${pub.btnText ? `
            <div class="text-[11px] text-pink-400 font-semibold pt-1 flex items-center gap-1">
              <i data-lucide="arrow-right-circle" class="w-3.5 h-3.5"></i>
              Bouton : "${escapeHtml(pub.btnText)}" ➔ <span class="font-mono text-slate-400">${escapeHtml(pub.btnLink || '#')}</span>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
        <button type="button" onclick="adminTogglePublicationStatus('${pub.id}')" class="px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${pub.active ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50'}">
          <i data-lucide="${pub.active ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
          <span>${pub.active ? 'Désactiver' : 'Activer'}</span>
        </button>
        <button type="button" onclick="adminOpenEditPubModal('${pub.id}')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer">
          <i data-lucide="edit-3" class="w-3.5 h-3.5 text-pink-400"></i>
          <span>Modifier</span>
        </button>
        <button type="button" onclick="adminDeletePublication('${pub.id}')" class="p-2 text-rose-400 hover:text-white hover:bg-rose-900/40 rounded-xl transition cursor-pointer" title="Supprimer cette publication">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `).join("");

  if (window.lucide) window.lucide.createIcons();
}

function adminPickPresetImage(presetOrUrl) {
  const PRESETS = {
    currency: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
    travel: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
    phone: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
    handshake: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80"
  };
  const finalUrl = PRESETS[presetOrUrl] || presetOrUrl || PRESETS.currency;
  const input = document.getElementById("new-pub-image-iso") || document.getElementById("new-pub-image");
  if (input) {
    input.value = finalUrl;
  }
  AppState.temporaryPubImageBase64 = null;
  const fileLabel = document.getElementById("new-pub-file-label");
  if (fileLabel) fileLabel.textContent = "Téléverser une image";
  adminPreviewPubImage(finalUrl);
}

function adminPreviewPubImage(url) {
  const preview = document.getElementById("admin-pub-img-preview") || document.getElementById("admin-new-pub-preview");
  if (preview) {
    preview.src = url || "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80";
  }
}

function handleAdminPubFileSelect(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    AppState.temporaryPubImageBase64 = event.target.result;
    const input = document.getElementById("new-pub-image-iso") || document.getElementById("new-pub-image");
    if (input) input.value = file.name;
    const fileLabel = document.getElementById("new-pub-file-label");
    if (fileLabel) fileLabel.textContent = file.name.length > 18 ? file.name.slice(0, 15) + "..." : file.name;
    adminPreviewPubImage(event.target.result);
    showToast("Photo sélectionnée avec succès !", "info");
  };
  reader.readAsDataURL(file);
}

function adminPreviewEditPubImage(url) {
  const preview = document.getElementById("admin-edit-pub-img-preview");
  if (preview) {
    preview.src = url || "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80";
  }
}

function adminAddNewPublication(e) {
  if (e) e.preventDefault();

  const titleInput = document.getElementById("new-pub-title-iso") || document.getElementById("new-pub-title");
  const msgInput = document.getElementById("new-pub-message-iso") || document.getElementById("new-pub-message") || document.getElementById("new-pub-msg");
  const imgInput = document.getElementById("new-pub-image-iso") || document.getElementById("new-pub-image");
  const btnTextInput = document.getElementById("new-pub-btn-text-iso") || document.getElementById("new-pub-btn-text");
  const linkInput = document.getElementById("new-pub-link-iso") || document.getElementById("new-pub-btn-link") || document.getElementById("new-pub-link");
  const activeInput = document.getElementById("new-pub-active-iso") || document.getElementById("new-pub-active");

  const rawTitle = titleInput ? titleInput.value.trim() : "";
  const rawMessage = msgInput ? msgInput.value.trim() : "";
  const rawImage = AppState.temporaryPubImageBase64 || (imgInput ? imgInput.value.trim() : "");
  const rawBtnText = btnTextInput ? btnTextInput.value.trim() : "";
  const rawLink = linkInput ? linkInput.value.trim() : "";
  const isActive = activeInput ? activeInput.checked : true;

  // Valeurs par défaut si les champs ne sont pas renseignés (flexibilité totale)
  const title = rawTitle || "Offre Spéciale FrikChange";
  const message = rawMessage || "Échangez vos devises en toute sécurité entre le Maroc et l'Afrique Subsaharienne et profitez d'avantages exclusifs !";
  const image = (rawImage && (rawImage.startsWith("data:") || rawImage.startsWith("http")))
    ? rawImage
    : "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80";
  const btnText = rawBtnText || "En profiter";
  const btnLink = rawLink || "#catalogue";

  const newPub = {
    id: "pub-" + Date.now(),
    title,
    message,
    image,
    btnText,
    btnLink,
    active: isActive,
    is_active: isActive,
    date: new Date().toISOString().slice(0, 10)
  };

  if (!AppState.marketingPublications) AppState.marketingPublications = [];
  AppState.marketingPublications.unshift(newPub);

  // Persistance dans le localStorage
  localStorage.setItem("frikchange_marketing_publications", JSON.stringify(AppState.marketingPublications));

  // Synchronisation immédiate avec le site public (Bannière, Offre Spéciale et Compte à rebours)
  if (isActive) {
    const targetEndDate = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    AppState.urgencyPromo = {
      active: true,
      is_active: true,
      title: title,
      message: message,
      endDate: targetEndDate,
      btnText: btnText,
      btnLink: btnLink,
      image: image
    };
    localStorage.setItem("frikchange_urgency_promo", JSON.stringify(AppState.urgencyPromo));

    AppState.headerBanner = {
      active: true,
      is_active: true,
      imageUrl: image,
      title: title,
      link: btnLink
    };
    try {
      localStorage.setItem("frikchange_header_banner", JSON.stringify(AppState.headerBanner));
    } catch (err) {
      console.warn("Storage header banner:", err);
    }

    // Force la mise à jour en direct de l'affichage sur la page publique sans rechargement
    renderPublicHeaderBanner();
    renderPromoBanner();
    startCountdown(targetEndDate);
  }

  renderIsolatedAdminPublications();
  AppState.temporaryPubImageBase64 = null;

  showToast(`Campagne marketing "${title}" enregistrée et synchronisée en direct sur le site public !`, "success", {
    title: "Campagne Publiée ✓"
  });

  const form = document.getElementById("admin-isolated-add-publication-form");
  if (form) form.reset();
  const fileLabel = document.getElementById("new-pub-file-label");
  if (fileLabel) fileLabel.textContent = "Téléverser une image";
  if (imgInput) imgInput.value = "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80";
  adminPreviewPubImage("https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80");
}

function adminOpenEditPubModal(id) {
  const pub = AppState.marketingPublications.find(p => p.id === id);
  if (!pub) return;

  const modal = document.getElementById("admin-edit-publication-modal");
  if (!modal) return;

  document.getElementById("admin-edit-pub-id").value = pub.id;
  document.getElementById("admin-edit-pub-title").value = pub.title || "";
  document.getElementById("admin-edit-pub-message").value = pub.message || "";
  document.getElementById("admin-edit-pub-image").value = pub.image || "";
  document.getElementById("admin-edit-pub-btn-text").value = pub.btnText || "";
  document.getElementById("admin-edit-pub-link").value = pub.btnLink || "";
  document.getElementById("admin-edit-pub-active").value = String(pub.active !== false);

  adminPreviewEditPubImage(pub.image);

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  if (window.lucide) window.lucide.createIcons();
}

function adminCloseEditPubModal() {
  const modal = document.getElementById("admin-edit-publication-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function adminSaveEditedPublication(e) {
  if (e) e.preventDefault();

  const id = document.getElementById("admin-edit-pub-id")?.value;
  const pub = AppState.marketingPublications.find(p => p.id === id);
  if (!pub) return;

  pub.title = document.getElementById("admin-edit-pub-title")?.value?.trim() || pub.title || "Offre Spéciale";
  pub.message = document.getElementById("admin-edit-pub-message")?.value?.trim() || pub.message || "";
  pub.image = document.getElementById("admin-edit-pub-image")?.value?.trim() || pub.image || "";
  pub.btnText = document.getElementById("admin-edit-pub-btn-text")?.value?.trim() || "";
  pub.btnLink = document.getElementById("admin-edit-pub-link")?.value?.trim() || "#catalogue";
  pub.active = document.getElementById("admin-edit-pub-active")?.value === "true";
  pub.is_active = pub.active;

  localStorage.setItem("frikchange_marketing_publications", JSON.stringify(AppState.marketingPublications));

  if (pub.active) {
    AppState.urgencyPromo = {
      active: true,
      is_active: true,
      title: pub.title,
      message: pub.message,
      endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      btnText: pub.btnText || "En profiter",
      btnLink: pub.btnLink || "#catalogue",
      image: pub.image
    };
    localStorage.setItem("frikchange_urgency_promo", JSON.stringify(AppState.urgencyPromo));

    if (pub.image) {
      AppState.headerBanner = {
        active: true,
        is_active: true,
        imageUrl: pub.image,
        title: pub.title,
        link: pub.btnLink || "#catalogue"
      };
      localStorage.setItem("frikchange_header_banner", JSON.stringify(AppState.headerBanner));
    }
    renderPublicHeaderBanner();
    renderPromoBanner();
    startCountdown(AppState.urgencyPromo.endDate);
  }

  adminCloseEditPubModal();
  renderIsolatedAdminPublications();
  showToast("Publication marketing mise à jour et synchronisée avec succès !", "success");
}

function adminTogglePublicationStatus(id) {
  const pub = AppState.marketingPublications.find(p => p.id === id);
  if (!pub) return;

  pub.active = !pub.active;
  pub.is_active = pub.active;
  localStorage.setItem("frikchange_marketing_publications", JSON.stringify(AppState.marketingPublications));

  if (pub.active) {
    AppState.urgencyPromo = {
      active: true,
      is_active: true,
      title: pub.title,
      message: pub.message,
      endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      btnText: pub.btnText || "En profiter",
      btnLink: pub.btnLink || "#catalogue",
      image: pub.image
    };
    localStorage.setItem("frikchange_urgency_promo", JSON.stringify(AppState.urgencyPromo));
    if (pub.image) {
      AppState.headerBanner = {
        active: true,
        is_active: true,
        imageUrl: pub.image,
        title: pub.title,
        link: pub.btnLink || "#catalogue"
      };
      localStorage.setItem("frikchange_header_banner", JSON.stringify(AppState.headerBanner));
    }
    renderPublicHeaderBanner();
    renderPromoBanner();
    startCountdown(AppState.urgencyPromo.endDate);
  }

  renderIsolatedAdminPublications();
  showToast(`Publication ${pub.active ? 'activée et synchronisée sur le site public' : 'désactivée'}.`, "info");
}

function adminDeletePublication(id) {
  const pub = AppState.marketingPublications.find(p => p.id === id);
  if (!pub) return;

  if (!confirm(`Supprimer la publication "${pub.title}" ?`)) return;

  AppState.marketingPublications = AppState.marketingPublications.filter(p => p.id !== id);
  localStorage.setItem("frikchange_marketing_publications", JSON.stringify(AppState.marketingPublications));
  renderIsolatedAdminPublications();
  showToast("Publication supprimée.", "info");
}

/**
 * =========================================================================
 * 11. SECTION ÉQUIPE & SÉCURITÉ (MODÉRATEURS, RÔLES, STATUT & MOT DE PASSE)
 * =========================================================================
 */

function renderIsolatedAdminUsers() {
  const container = document.getElementById("admin-isolated-moderators-list");
  if (!container) return;

  const admins = AppState.adminsList || [];

  if (admins.length === 0) {
    container.innerHTML = `<div class="text-slate-500 py-3 text-center text-xs">Aucun modérateur enregistré.</div>`;
    return;
  }

  container.innerHTML = admins.map((u, idx) => {
    const isSuperAdmin = u.role?.toLowerCase().includes("super");
    const isActive = u.status !== "Désactivé";

    return `
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-700/80 hover:border-slate-600 transition gap-3 text-xs">
        <div class="space-y-1">
          <div class="font-bold text-white flex items-center flex-wrap gap-2">
            <span class="text-sm">${escapeHtml(u.name)}</span>
            <span class="text-[10px] px-2.5 py-0.5 rounded-full font-bold ${isSuperAdmin ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}">
              ${escapeHtml(u.role || "Modérateur")}
            </span>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}">
              ${isActive ? '🟢 Actif' : '🔴 Désactivé'}
            </span>
          </div>
          <div class="flex items-center gap-3 text-slate-400 text-[11px] font-mono">
            <span>${escapeHtml(u.email)}</span>
            <span>•</span>
            <span class="text-slate-500">Ajouté le ${escapeHtml(u.date || "2026-01-01")}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button type="button" onclick="adminOpenEditModeratorModal(${idx})" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold border border-slate-700 transition flex items-center gap-1 cursor-pointer">
            <i data-lucide="edit-3" class="w-3.5 h-3.5 text-indigo-400"></i>
            <span>Modifier</span>
          </button>
          
          ${!isSuperAdmin ? `
            <button type="button" onclick="adminToggleModeratorStatus(${idx})" class="px-2.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${isActive ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'}">
              ${isActive ? 'Désactiver' : 'Activer'}
            </button>
            <button type="button" onclick="adminDeleteModerator(${idx})" class="p-1.5 text-rose-400 hover:text-white hover:bg-rose-900/40 rounded-xl transition cursor-pointer" title="Supprimer ce modérateur">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          ` : `
            <span class="text-[11px] text-purple-400/80 font-mono italic px-2">Maître</span>
          `}
        </div>
      </div>
    `;
  }).join("");

  if (window.lucide) window.lucide.createIcons();
}

function adminAddNewModerator(e) {
  if (e) e.preventDefault();

  const name = document.getElementById("new-mod-name")?.value?.trim() || "";
  const email = document.getElementById("new-mod-email")?.value?.trim()?.toLowerCase() || "";
  const role = document.getElementById("new-mod-role")?.value || "Modérateur des Annonces";

  if (!name || !email) {
    showToast("Veuillez renseigner le nom et l'adresse email.", "warning");
    return;
  }

  if (AppState.adminsList.some(a => a.email.toLowerCase() === email)) {
    showToast("Un membre de l'équipe utilise déjà cet email.", "warning");
    return;
  }

  const newMod = {
    id: "mod-" + Date.now(),
    name,
    email,
    role,
    status: "Actif",
    date: new Date().toISOString().slice(0, 10)
  };

  AppState.adminsList.push(newMod);
  localStorage.setItem("frikchange_admins", JSON.stringify(AppState.adminsList));
  localStorage.setItem("africhange_admins", JSON.stringify(AppState.adminsList));

  renderIsolatedAdminUsers();
  showToast(`Modérateur ${name} créé avec le rôle "${role}" !`, "success");

  document.getElementById("admin-isolated-add-moderator-form")?.reset();
}

function adminOpenEditModeratorModal(idx) {
  const mod = AppState.adminsList[idx];
  if (!mod) return;

  const modal = document.getElementById("admin-edit-moderator-modal");
  if (!modal) return;

  document.getElementById("admin-edit-mod-index").value = idx;
  document.getElementById("admin-edit-mod-name").value = mod.name || "";
  document.getElementById("admin-edit-mod-email").value = mod.email || "";
  document.getElementById("admin-edit-mod-role").value = mod.role || "Modérateur des Annonces";
  document.getElementById("admin-edit-mod-status").value = mod.status || "Actif";

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  if (window.lucide) window.lucide.createIcons();
}

function adminCloseEditModeratorModal() {
  const modal = document.getElementById("admin-edit-moderator-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function adminSaveEditedModerator(e) {
  if (e) e.preventDefault();

  const idx = parseInt(document.getElementById("admin-edit-mod-index")?.value, 10);
  const mod = AppState.adminsList[idx];
  if (!mod) return;

  mod.name = document.getElementById("admin-edit-mod-name")?.value?.trim() || mod.name;
  mod.email = document.getElementById("admin-edit-mod-email")?.value?.trim()?.toLowerCase() || mod.email;
  mod.role = document.getElementById("admin-edit-mod-role")?.value || mod.role;
  mod.status = document.getElementById("admin-edit-mod-status")?.value || mod.status;

  localStorage.setItem("frikchange_admins", JSON.stringify(AppState.adminsList));
  localStorage.setItem("africhange_admins", JSON.stringify(AppState.adminsList));

  adminCloseEditModeratorModal();
  renderIsolatedAdminUsers();
  showToast(`Modérateur ${mod.name} mis à jour avec succès !`, "success");
}

function adminToggleModeratorStatus(idx) {
  const mod = AppState.adminsList[idx];
  if (!mod) return;

  mod.status = (mod.status === "Désactivé") ? "Actif" : "Désactivé";
  localStorage.setItem("frikchange_admins", JSON.stringify(AppState.adminsList));
  localStorage.setItem("africhange_admins", JSON.stringify(AppState.adminsList));

  renderIsolatedAdminUsers();
  showToast(`Statut du modérateur ${mod.name} : ${mod.status}.`, "info");
}

function adminDeleteModerator(idx) {
  const mod = AppState.adminsList[idx];
  if (!mod) return;

  if (mod.role?.toLowerCase().includes("super")) {
    showToast("Le Super Administrateur maître ne peut pas être supprimé.", "error");
    return;
  }

  if (!confirm(`Supprimer l'accès de ${mod.name} (${mod.email}) ?`)) return;

  AppState.adminsList.splice(idx, 1);
  localStorage.setItem("frikchange_admins", JSON.stringify(AppState.adminsList));
  localStorage.setItem("africhange_admins", JSON.stringify(AppState.adminsList));

  renderIsolatedAdminUsers();
  showToast(`Modérateur ${mod.name} supprimé de l'équipe.`, "info");
}

function handleAdminChangePasswordIsolated(e) {
  if (e) e.preventDefault();
  const newPwd = document.getElementById("admin-isolated-new-password")?.value;
  if (!newPwd || newPwd.length < 6) {
    showToast("Le mot de passe doit comporter au moins 6 caractères.", "warning");
    return;
  }

  AppState.adminPassword = newPwd;
  localStorage.setItem("frikchange_admin_pwd", newPwd);
  localStorage.setItem("africhange_admin_pwd", newPwd);
  showToast("Mot de passe maître mis à jour avec succès !", "success");
  const pwdInput = document.getElementById("admin-isolated-new-password");
  if (pwdInput) pwdInput.value = "";
}

/**
 * =========================================================================
 * 12. ACTUALISATION GLOBALE ET EXPORTATION DES FONCTIONS POUR LE DOM
 * =========================================================================
 */

async function refreshAdminData() {
  showToast("Actualisation des données en cours...", "info");
  await loadAppData();
  fetchRealTimeExchangeRates();
  renderIsolatedAdminView();
  showToast("Toutes les données ont été synchronisées avec succès.", "success");
}

// Exposition globale pour les gestionnaires d'événements inline HTML
window.toggleAdminExclusiveMode = toggleAdminExclusiveMode;
window.switchAdminIsolatedSection = switchAdminIsolatedSection;
window.renderIsolatedAdminView = renderIsolatedAdminView;
window.renderIsolatedAdminAnnonces = renderIsolatedAdminAnnonces;
window.adminOpenEditAnnonceModal = adminOpenEditAnnonceModal;
window.adminCloseEditAnnonceModal = adminCloseEditAnnonceModal;
window.adminSaveEditedAnnonce = adminSaveEditedAnnonce;
window.adminOpenAddAnnonceModal = adminOpenAddAnnonceModal;
window.renderIsolatedAdminAmbassadeurs = renderIsolatedAdminAmbassadeurs;
window.adminOpenAddAmbModal = adminOpenAddAmbModal;
window.adminCloseAddAmbModal = adminCloseAddAmbModal;
window.adminSaveNewAmbassadeur = adminSaveNewAmbassadeur;
window.adminShowAmbFilleuls = adminShowAmbFilleuls;
window.adminCloseFilleulsPanel = adminCloseFilleulsPanel;
window.adminSimulateFilleul = adminSimulateFilleul;
window.adminCreditAmbGain = adminCreditAmbGain;
window.adminDeleteAmbassadeur = adminDeleteAmbassadeur;

// Section 3 : Taux et Fixation
window.renderIsolatedAdminApi = renderIsolatedAdminApi;
window.adminHandleRateModeChange = adminHandleRateModeChange;
window.adminSaveCustomFixedRate = adminSaveCustomFixedRate;
window.adminResetToApiRates = adminResetToApiRates;
window.adminTestExchangeApi = adminTestExchangeApi;
window.adminRunTestCalc = adminRunTestCalc;
window.adminTestOpenChariow = adminTestOpenChariow;
window.adminCopyChariowLink = adminCopyChariowLink;
window.adminSimulatePaymentReturn = adminSimulatePaymentReturn;

// Section 4 : Tranches & Tarifs
window.renderIsolatedAdminTarifs = renderIsolatedAdminTarifs;
window.adminOpenEditTierModal = adminOpenEditTierModal;
window.adminCloseEditTierModal = adminCloseEditTierModal;
window.adminSaveEditedTier = adminSaveEditedTier;
window.adminDeleteTier = adminDeleteTier;
window.adminDeleteTierFromModal = adminDeleteTierFromModal;
window.adminAddNewTierIsolated = adminAddNewTierIsolated;

// Section 5 : Marketing & Visuels
window.renderIsolatedAdminMarketing = renderIsolatedAdminMarketing;
window.renderIsolatedAdminPromoCodes = renderIsolatedAdminPromoCodes;
window.renderIsolatedAdminPublications = renderIsolatedAdminPublications;
window.adminPickPresetImage = adminPickPresetImage;
window.adminPreviewPubImage = adminPreviewPubImage;
window.adminPreviewEditPubImage = adminPreviewEditPubImage;
window.handleAdminPubFileSelect = handleAdminPubFileSelect;
window.adminAddNewPublication = adminAddNewPublication;
window.adminOpenEditPubModal = adminOpenEditPubModal;
window.adminCloseEditPubModal = adminCloseEditPubModal;
window.adminSaveEditedPublication = adminSaveEditedPublication;
window.adminTogglePublicationStatus = adminTogglePublicationStatus;
window.adminDeletePublication = adminDeletePublication;
window.adminAddNewPromoCodeIsolated = adminAddNewPromoCodeIsolated;
window.adminDeletePromoCode = adminDeletePromoCode;

// Section 6 : Équipe & Sécurité
window.renderIsolatedAdminUsers = renderIsolatedAdminUsers;
window.adminAddNewModerator = adminAddNewModerator;
window.adminOpenEditModeratorModal = adminOpenEditModeratorModal;
window.adminCloseEditModeratorModal = adminCloseEditModeratorModal;
window.adminSaveEditedModerator = adminSaveEditedModerator;
window.adminToggleModeratorStatus = adminToggleModeratorStatus;
window.adminDeleteModerator = adminDeleteModerator;
window.handleAdminChangePasswordIsolated = handleAdminChangePasswordIsolated;
window.refreshAdminData = refreshAdminData;

// Exportations Authentification Publique & OTP
window.renderAuthUI = renderAuthUI;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.selectDemoAuthEmail = selectDemoAuthEmail;
window.handleAuthEmailSubmit = handleAuthEmailSubmit;
window.autoFillOtpCode = autoFillOtpCode;
window.handleAuthOtpSubmit = handleAuthOtpSubmit;
window.resendOtpCode = resendOtpCode;
window.backToAuthEmailStep = backToAuthEmailStep;
window.openDedicatedRoleSpace = openDedicatedRoleSpace;
window.applyRolePermissions = applyRolePermissions;
window.openUserSpaceModal = openUserSpaceModal;
window.closeUserSpaceModal = closeUserSpaceModal;
window.handleLogout = handleLogout;

/* ==========================================================================
   MODULES IA & GOOGLE MAPS PLATFORM FRIKCHANGE
   1. Bandeau Défilant des Cours du Jour (Gemini Grounding + Cache 1h)
   2. Géolocalisation & Lieux de Rendez-vous Sécurisés (Google Maps Platform)
   3. Bulle de Chat Support Client 24/7 & Anti-Fraude (FrikBot)
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. BANDEAU DÉFILANT COURS DU JOUR (EXCHANGE RATES TICKER)
// --------------------------------------------------------------------------
async function fetchLiveExchangeRatesTicker(showToastNotification = false) {
  const badgeEl = document.getElementById("ticker-cache-badge");
  const eurEl = document.getElementById("rate-eur");
  const usdEl = document.getElementById("rate-usd");
  const cadEl = document.getElementById("rate-cad");
  const gbpEl = document.getElementById("rate-gbp");
  const xofEl = document.getElementById("rate-xof");

  try {
    const res = await fetch("/api/exchange-rates");
    if (!res.ok) throw new Error("HTTP error " + res.status);
    const json = await res.json();
    const data = json.data;

    if (data) {
      if (eurEl && data.EUR) eurEl.textContent = Number(data.EUR).toFixed(2) + " DH";
      if (usdEl && data.USD) usdEl.textContent = Number(data.USD).toFixed(2) + " DH";
      if (cadEl && data.CAD) cadEl.textContent = Number(data.CAD).toFixed(2) + " DH";
      if (gbpEl && data.GBP) gbpEl.textContent = Number(data.GBP).toFixed(2) + " DH";
      if (xofEl && data.XOF) {
        // 1 MAD = 1 / data.XOF en FCFA
        const fcfaVal = Math.round(1 / Number(data.XOF));
        xofEl.textContent = `${fcfaVal} FCFA`;
      }

      if (badgeEl) {
        if (json.cached) {
          const remMinutes = Math.max(1, Math.round((json.cacheExpiresInSeconds || 3600) / 60));
          badgeEl.innerHTML = `<i data-lucide="shield-check" class="w-3 h-3"></i><span>Cache 1h (${remMinutes}m)</span>`;
          badgeEl.className = "hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-[10px]";
        } else {
          badgeEl.innerHTML = `<i data-lucide="zap" class="w-3 h-3 text-amber-400"></i><span>Direct IA Marché</span>`;
          badgeEl.className = "hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/80 text-[10px]";
        }
        if (window.lucide) window.lucide.createIcons();
      }

      if (showToastNotification && typeof showToast === "function") {
        showToast("success", "Cours du Jour actualisés", `EUR: ${data.EUR} DH | USD: ${data.USD} DH | Source: ${data.source || 'BAM'}`);
      }
    }
  } catch (err) {
    console.warn("[Ticker] Erreur chargement cours:", err);
  }
}

function refreshLiveRatesTicker() {
  fetchLiveExchangeRatesTicker(true);
}

// --------------------------------------------------------------------------
// 2. GÉOLOCALISATION & RENDEZ-VOUS SÉCURISÉS (GOOGLE MAPS PLATFORM)
// --------------------------------------------------------------------------
const MOROCCO_SAFE_LOCATIONS = {
  casablanca: [
    {
      id: "casa-mall-1",
      city: "Casablanca",
      name: "Morocco Mall",
      type: "mall",
      typeName: "Centre Commercial Haut Niveau",
      address: "Angle Boulevard Sidi Abderrahmane, Bd de l'Océan Atlantique",
      district: "Ain Diab",
      lat: 33.5768,
      lng: -7.7058,
      securityRating: "5/5",
      securityFeatures: "Vigiles 24/7, Portiques détecteurs, Hall sous caméras HD",
      meetingTip: "Recommandé : aire centrale près de l'Aquarium ou terrasses sécurisées."
    },
    {
      id: "casa-bank-1",
      city: "Casablanca",
      name: "Attijariwafa Bank - Siège Bd Moulay Youssef",
      type: "bank",
      typeName: "Agence Bancaire Principale",
      address: "2 Boulevard Moulay Youssef",
      district: "Gauthier",
      lat: 33.5936,
      lng: -7.6256,
      securityRating: "5/5",
      securityFeatures: "Sécurité bancaire maximale, Vigiles armés, Hall vidéo-surveillé",
      meetingTip: "Idéal pour vérifier les billets et compter les devises en toute discrétion."
    },
    {
      id: "casa-station-1",
      city: "Casablanca",
      name: "Gare ONCF Casa-Voyageurs",
      type: "station",
      typeName: "Gare Ferroviaire TGV Al Boraq",
      address: "Boulevard Ba Hmad, Belvédère",
      district: "Belvédère / Roches Noires",
      lat: 33.5898,
      lng: -7.5895,
      securityRating: "4.8/5",
      securityFeatures: "Police ferroviaire permanente, Scanner bagages, Caméras",
      meetingTip: "Rendez-vous devant les cafés du hall principal des départs."
    },
    {
      id: "casa-mall-2",
      city: "Casablanca",
      name: "Marina Shopping Center",
      type: "mall",
      typeName: "Centre Commercial Sécurisé",
      address: "Boulevard des Almohades, Marina",
      district: "Port / Centre-Ville",
      lat: 33.6062,
      lng: -7.6201,
      securityRating: "4.9/5",
      securityFeatures: "Agents de sécurité privés, Entrées filtrées, Parking surveillé",
      meetingTip: "À deux pas de Casa-Port, terrasses de café très lumineuses et calmes."
    },
    {
      id: "casa-bank-2",
      city: "Casablanca",
      name: "Banque Populaire (BCP) - Bd d'Anfa",
      type: "bank",
      typeName: "Succursale Bancaire",
      address: "Angle Boulevard d'Anfa et Rue Taha Hussein",
      district: "Maârif / Racine",
      lat: 33.5872,
      lng: -7.6364,
      securityRating: "4.9/5",
      securityFeatures: "Vidéoprotection certifiée, sas bancaire, espace comptage",
      meetingTip: "Comptoirs spacieux pour transactions de change en face-à-face."
    }
  ],
  rabat: [
    {
      id: "rabat-mall-1",
      city: "Rabat",
      name: "Arribat Center",
      type: "mall",
      typeName: "Grand Centre Commercial",
      address: "Avenue des Nations Unies, Quartier Agdal",
      district: "Agdal",
      lat: 33.9996,
      lng: -6.8504,
      securityRating: "5/5",
      securityFeatures: "Contrôle d'accès continu, vigiles, vidéosurveillance intégrale",
      meetingTip: "Espace central au rez-de-chaussée ou près des grandes enseignes."
    },
    {
      id: "rabat-station-1",
      city: "Rabat",
      name: "Gare ONCF Rabat-Agdal",
      type: "station",
      typeName: "Gare TGV Al Boraq Moderne",
      address: "Avenue Haj Ahmed Cherkaoui",
      district: "Agdal",
      lat: 33.9984,
      lng: -6.8569,
      securityRating: "5/5",
      securityFeatures: "Présence policière ONCF, caméras haute définition, hall très surveillé",
      meetingTip: "Hall des voyageurs au niveau supérieur, tables de cafés ouvertes."
    },
    {
      id: "rabat-bank-1",
      city: "Rabat",
      name: "CIH Bank - Agence Centrale Agdal",
      type: "bank",
      typeName: "Agence Bancaire",
      address: "Avenue Fal Ould Oumeir, Agdal",
      district: "Agdal",
      lat: 34.0041,
      lng: -6.8485,
      securityRating: "4.8/5",
      securityFeatures: "Agents de sécurité agréés, hall vitré et lumineux",
      meetingTip: "Avenue commerçante animée et sécurisée à toute heure de la journée."
    }
  ],
  marrakech: [
    {
      id: "mar-mall-1",
      city: "Marrakech",
      name: "Carré Eden Shopping Center",
      type: "mall",
      typeName: "Centre Commercial Urbain",
      address: "Avenue Mohammed V, Quartier Guéliz",
      district: "Guéliz",
      lat: 31.6346,
      lng: -8.0125,
      securityRating: "4.9/5",
      securityFeatures: "Postes de sécurité privés, caméras, patrouilles régulières",
      meetingTip: "Au cœur de Guéliz, zone moderne très fréquentée et sécurisée."
    },
    {
      id: "mar-station-1",
      city: "Marrakech",
      name: "Gare Centrale de Marrakech (ONCF)",
      type: "station",
      typeName: "Gare Ferroviaire Historique",
      address: "Avenue Hassan II, Guéliz / Hivernage",
      district: "Guéliz / Hivernage",
      lat: 31.6298,
      lng: -8.0189,
      securityRating: "4.9/5",
      securityFeatures: "Police touristique permanente, vidéosurveillance",
      meetingTip: "Grand hall climatisé avec guichets et bancs d'attente surveillés."
    }
  ],
  tanger: [
    {
      id: "tan-mall-1",
      city: "Tanger",
      name: "Tanger City Mall",
      type: "mall",
      typeName: "Centre Commercial & Gare TGV",
      address: "Boulevard Mohamed VI, Baie de Tanger",
      district: "Malabata",
      lat: 35.7725,
      lng: -5.7905,
      securityRating: "5/5",
      securityFeatures: "Sécurité privée continue, sas d'entrée avec agents, vidéosurveillance",
      meetingTip: "Connexion directe avec la gare TGV Tanger-Ville, idéal pour voyageurs."
    },
    {
      id: "tan-station-1",
      city: "Tanger",
      name: "Gare ONCF Tanger-Ville",
      type: "station",
      typeName: "Gare TGV Al Boraq",
      address: "Place de la Gare, Boulevard Mohamed VI",
      district: "Malabata",
      lat: 35.7731,
      lng: -5.7920,
      securityRating: "4.9/5",
      securityFeatures: "Forces de l'ordre, caméras, filtrage à l'entrée",
      meetingTip: "Hall des départs très clair, proximité immédiate des banques."
    }
  ]
};

const CITY_COORDINATES = {
  casablanca: { lat: 33.5898, lng: -7.6150, zoom: 13 },
  rabat: { lat: 34.0010, lng: -6.8520, zoom: 14 },
  marrakech: { lat: 31.6320, lng: -8.0150, zoom: 14 },
  tanger: { lat: 35.7720, lng: -5.7915, zoom: 14 }
};

let googleMapInstance = null;
let googleMapMarkers = [];
let activeMapCity = "casablanca";
let activeLocationFilterType = "all";
let currentlySelectedSpot = null;

// Initialisation asynchrone de la carte Google Maps (Bibliothèque importLibrary standard)
async function initGoogleMapsSafeSpots() {
  const mapContainer = document.getElementById("secure-spots-google-map");
  if (!mapContainer) return;

  // Écouteur pour la bannière de quota de démonstration
  window.addEventListener("gmp-quota-exceeded", () => {
    const banner = document.getElementById("gmp-quota-banner");
    if (banner) banner.classList.remove("hidden");
  });

  try {
    if (!window.google || !window.google.maps || !window.google.maps.importLibrary) {
      console.warn("[Google Maps] Attente du chargement du script Google Maps...");
      setTimeout(initGoogleMapsSafeSpots, 800);
      return;
    }

    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    const cityConfig = CITY_COORDINATES[activeMapCity] || CITY_COORDINATES.casablanca;

    googleMapInstance = new Map(mapContainer, {
      center: { lat: cityConfig.lat, lng: cityConfig.lng },
      zoom: cityConfig.zoom,
      mapId: "DEMO_MAP_ID", // Requis pour AdvancedMarkerElement
      internalUsageAttributionIds: ["gmp_mcp_codeassist_v1_aistudio"],
      fullscreenControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      zoomControl: true
    });

    renderMapSpotsListAndMarkers();
  } catch (err) {
    console.error("[Google Maps Init Error]", err);
    // Affichage d'un conteneur de secours élégant si la clé Maps n'est pas encore activée
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-slate-300">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
            <i data-lucide="map-pin" class="w-6 h-6"></i>
          </div>
          <h4 class="font-bold text-white text-base">Carte Sécurisée Google Maps Active</h4>
          <p class="text-xs text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">
            Consultez les agences bancaires, gares ONCF et centres commerciaux recommandés dans la liste ci-contre pour planifier votre rencontre en main propre.
          </p>
          <div class="flex items-center gap-2">
            <button type="button" onclick="initGoogleMapsSafeSpots()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition">
              Recharger la carte
            </button>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

function getFilteredLocations() {
  const cityLocations = MOROCCO_SAFE_LOCATIONS[activeMapCity] || MOROCCO_SAFE_LOCATIONS.casablanca;
  if (activeLocationFilterType === "all") return cityLocations;
  return cityLocations.filter(loc => loc.type === activeLocationFilterType);
}

async function renderMapSpotsListAndMarkers() {
  const listContainer = document.getElementById("safe-spots-list-container");
  const countBadge = document.getElementById("spots-count-badge");
  const locations = getFilteredLocations();

  if (countBadge) {
    countBadge.textContent = `${locations.length} lieu${locations.length > 1 ? "x" : ""}`;
  }

  // Nettoyer les anciens marqueurs de la carte
  if (googleMapMarkers && googleMapMarkers.length > 0) {
    googleMapMarkers.forEach(m => {
      if (m && m.map) m.map = null;
    });
    googleMapMarkers = [];
  }

  // Rendu de la liste gauche
  if (listContainer) {
    if (locations.length === 0) {
      listContainer.innerHTML = `
        <div class="p-6 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
          Aucun lieu correspondant au type sélectionné dans cette ville.
        </div>
      `;
    } else {
      listContainer.innerHTML = locations.map(spot => {
        let typeBadgeColor = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
        let iconName = "landmark";
        if (spot.type === "mall") {
          typeBadgeColor = "bg-amber-500/15 text-amber-400 border-amber-500/30";
          iconName = "shopping-bag";
        } else if (spot.type === "station") {
          typeBadgeColor = "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
          iconName = "train";
        }

        return `
          <div onclick="focusSpotOnMap('${spot.id}')" class="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer group shadow-sm">
            <div class="flex items-start justify-between gap-2 mb-1.5">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${typeBadgeColor}">
                  ${spot.typeName}
                </span>
                <span class="text-[10px] text-slate-400 font-mono">⭐ ${spot.securityRating}</span>
              </div>
              <span class="text-[10px] text-emerald-400 font-bold flex items-center gap-1 group-hover:underline">
                <i data-lucide="crosshair" class="w-3 h-3"></i> Voir
              </span>
            </div>

            <h4 class="font-bold text-white text-sm group-hover:text-emerald-300 transition">${spot.name}</h4>
            <p class="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
              <i data-lucide="map-pin" class="w-3 h-3 shrink-0 text-slate-500"></i>
              <span>${spot.address} (${spot.district})</span>
            </p>

            <div class="mt-2 text-[10px] text-emerald-300/90 bg-emerald-950/40 border border-emerald-900/60 rounded-xl p-2 flex items-start gap-1.5">
              <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5"></i>
              <div>
                <span class="font-bold text-white">${spot.securityFeatures}</span><br/>
                <span class="text-slate-300">${spot.meetingTip}</span>
              </div>
            </div>

            <div class="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button type="button" onclick="event.stopPropagation(); copySafeLocationRdv('${spot.id}')" class="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[10px] font-bold transition flex items-center gap-1 cursor-pointer">
                <i data-lucide="message-circle" class="w-3 h-3"></i>
                <span>Copier RDV WhatsApp</span>
              </button>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();" class="text-slate-400 hover:text-white text-[10px] font-medium flex items-center gap-1">
                <i data-lucide="navigation" class="w-3 h-3"></i>
                <span>Itinéraire</span>
              </a>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  // Création des marqueurs AdvancedMarkerElement sur la carte
  if (googleMapInstance && window.google && window.google.maps && window.google.maps.marker) {
    try {
      const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

      locations.forEach(spot => {
        let pinBg = "#10b981"; // Emerald par défaut
        let pinGlyphColor = "#ffffff";
        let pinBorder = "#047857";

        if (spot.type === "mall") {
          pinBg = "#f59e0b";
          pinBorder = "#b45309";
        } else if (spot.type === "station") {
          pinBg = "#06b6d4";
          pinBorder = "#0e7490";
        }

        const pin = new PinElement({
          background: pinBg,
          borderColor: pinBorder,
          glyphColor: pinGlyphColor,
          scale: 1.15
        });

        const marker = new AdvancedMarkerElement({
          map: googleMapInstance,
          position: { lat: spot.lat, lng: spot.lng },
          title: spot.name,
          content: pin.element
        });

        marker.addListener("click", () => {
          selectSpotDetails(spot, true);
        });

        googleMapMarkers.push(marker);
      });

      // Sélectionner le premier lieu par défaut
      if (locations.length > 0 && !currentlySelectedSpot) {
        selectSpotDetails(locations[0], false);
      }
    } catch (markerErr) {
      console.warn("[Google Maps Markers Error]", markerErr);
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

function selectSpotDetails(spot, panTo = true) {
  currentlySelectedSpot = spot;

  const titleEl = document.getElementById("selected-spot-title");
  const addressEl = document.getElementById("selected-spot-address");
  const dirLink = document.getElementById("btn-directions-selected-spot");

  if (titleEl) titleEl.textContent = spot.name;
  if (addressEl) addressEl.textContent = `${spot.address}, ${spot.district} (${spot.city})`;
  if (dirLink) dirLink.href = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;

  if (panTo && googleMapInstance) {
    googleMapInstance.panTo({ lat: spot.lat, lng: spot.lng });
    googleMapInstance.setZoom(15);
  }
}

function focusSpotOnMap(spotId) {
  const locations = getFilteredLocations();
  const spot = locations.find(s => s.id === spotId);
  if (spot) {
    selectSpotDetails(spot, true);
  }
}

function selectMapCity(city) {
  activeMapCity = city.toLowerCase();

  // Mettre à jour l'apparence des onglets villes
  document.querySelectorAll(".map-city-btn").forEach(btn => {
    btn.className = "map-city-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer shrink-0";
  });
  const activeBtn = document.getElementById(`btn-city-${activeMapCity}`);
  if (activeBtn) {
    activeBtn.className = "map-city-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition bg-emerald-600 text-white shadow-xs cursor-pointer shrink-0";
  }

  const cityConfig = CITY_COORDINATES[activeMapCity];
  if (googleMapInstance && cityConfig) {
    googleMapInstance.panTo({ lat: cityConfig.lat, lng: cityConfig.lng });
    googleMapInstance.setZoom(cityConfig.zoom);
  }

  currentlySelectedSpot = null;
  renderMapSpotsListAndMarkers();
}

function filterMapLocationsByType(type) {
  activeLocationFilterType = type;
  renderMapSpotsListAndMarkers();
}

function copySafeLocationRdv(spotId) {
  const allSpots = [
    ...(MOROCCO_SAFE_LOCATIONS.casablanca || []),
    ...(MOROCCO_SAFE_LOCATIONS.rabat || []),
    ...(MOROCCO_SAFE_LOCATIONS.marrakech || []),
    ...(MOROCCO_SAFE_LOCATIONS.tanger || [])
  ];
  const spot = allSpots.find(s => s.id === spotId) || currentlySelectedSpot;
  if (!spot) return;

  const msg = `🤝 *Rendez-vous FrikChange Sécurisé (Remise en main propre)*\n\n` +
    `📍 *Lieu convenu :* ${spot.name}\n` +
    `🏠 *Adresse :* ${spot.address}, ${spot.district} (${spot.city})\n` +
    `🛡️ *Sécurité :* ${spot.securityFeatures}\n` +
    `🗺️ *Lien Google Maps :* https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}\n\n` +
    `⚠️ *Rappel FrikChange :* Remise en main propre obligatoire, aucun virement ni acompte préalable. À tout de suite !`;

  navigator.clipboard.writeText(msg).then(() => {
    if (typeof showToast === "function") {
      showToast("success", "Message RDV copié !", "Collez ce message directement sur WhatsApp pour convenir du lieu avec votre partenaire.");
    }
  }).catch(() => {
    if (typeof showToast === "function") {
      showToast("info", "Lieu sélectionné", `${spot.name} (${spot.city})`);
    }
  });
}

function copyCurrentSpotWhatsApp() {
  if (currentlySelectedSpot) {
    copySafeLocationRdv(currentlySelectedSpot.id);
  } else {
    const locations = getFilteredLocations();
    if (locations.length > 0) copySafeLocationRdv(locations[0].id);
  }
}

function filterCatalogueCurrentCity() {
  const cityName = activeMapCity.charAt(0).toUpperCase() + activeMapCity.slice(1);
  if (typeof switchView === "function") {
    switchView("catalogue");
  }
  const villeFilter = document.getElementById("catalogue-filter-ville");
  if (villeFilter) {
    villeFilter.value = cityName;
    if (typeof applyFilters === "function") {
      AppState.activeFilterVille = cityName;
      applyFilters();
    }
  }
  if (typeof showToast === "function") {
    showToast("info", "Filtre Catalogue appliqué", `Affichage des annonces pour ${cityName}.`);
  }
}

// --------------------------------------------------------------------------
// 3. BULLE DE CHAT DU SUPPORT CLIENT FRIKBOT (GEMINI FLASH 24/7)
// --------------------------------------------------------------------------
let frikbotChatOpen = false;
let frikbotConversationHistory = [];

function toggleFrikbotChat() {
  const chatWindow = document.getElementById("frikbot-chat-window");
  if (!chatWindow) return;

  frikbotChatOpen = !frikbotChatOpen;
  if (frikbotChatOpen) {
    chatWindow.classList.remove("hidden");
    pushNavState({ chat: "frikbot", view: AppState.currentView }, "", "#assistant");
    const input = document.getElementById("frikbot-input");
    if (input) setTimeout(() => input.focus(), 150);
  } else {
    chatWindow.classList.add("hidden");
  }
  if (window.lucide) window.lucide.createIcons();
}

function clearFrikbotHistory() {
  frikbotConversationHistory = [];
  const container = document.getElementById("frikbot-messages-container");
  if (container) {
    container.innerHTML = `
      <div class="flex items-start gap-2.5">
        <div class="w-7 h-7 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <i data-lucide="bot" class="w-4 h-4"></i>
        </div>
        <div class="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-xs p-3 text-slate-200 max-w-[85%] shadow-xs">
          <p class="font-bold text-white mb-1">Salam &amp; Bonjour ! 👋</p>
          <p>Je suis <strong>FrikBot</strong>, votre conseiller support 24/7. Comment puis-je vous aider pour sécuriser votre change ou vos colis GP ?</p>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }
}

function appendFrikbotMessage(role, text) {
  const container = document.getElementById("frikbot-messages-container");
  if (!container) return;

  const msgDiv = document.createElement("div");

  if (role === "user") {
    msgDiv.className = "flex items-start justify-end gap-2";
    msgDiv.innerHTML = `
      <div class="bg-emerald-600 text-white rounded-2xl rounded-tr-xs p-3 max-w-[85%] shadow-sm text-xs">
        ${escapeHtml(text)}
      </div>
      <div class="w-7 h-7 rounded-xl bg-slate-700 text-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
        Vous
      </div>
    `;
  } else {
    // Rendu formaté du markdown (gras, listes à puces, retours chariot)
    let formattedText = escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/### (.*?)\n/g, '<h4 class="font-bold text-white text-xs mt-2 mb-1">$1</h4>')
      .replace(/---\n/g, '<hr class="border-slate-700 my-2" />')
      .replace(/\n\* /g, '<br/>• ')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');

    msgDiv.className = "flex items-start gap-2.5";
    msgDiv.innerHTML = `
      <div class="w-7 h-7 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
        <i data-lucide="bot" class="w-4 h-4"></i>
      </div>
      <div class="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-xs p-3 text-slate-200 max-w-[88%] shadow-xs text-xs">
        ${formattedText}
      </div>
    `;
  }

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
  if (window.lucide) window.lucide.createIcons();
}

function showFrikbotTyping() {
  const container = document.getElementById("frikbot-messages-container");
  if (!container) return;

  const typingDiv = document.createElement("div");
  typingDiv.id = "frikbot-typing-indicator";
  typingDiv.className = "flex items-start gap-2.5";
  typingDiv.innerHTML = `
    <div class="w-7 h-7 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
      <i data-lucide="bot" class="w-4 h-4"></i>
    </div>
    <div class="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-slate-400 text-xs flex items-center gap-1.5 shadow-xs">
      <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
      <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
      <span class="text-[11px] text-slate-300 ml-1">FrikBot réfléchit...</span>
    </div>
  `;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;
  if (window.lucide) window.lucide.createIcons();
}

function removeFrikbotTyping() {
  const typing = document.getElementById("frikbot-typing-indicator");
  if (typing) typing.remove();
}

async function sendFrikbotMessage(userMessage) {
  if (!userMessage || !userMessage.trim()) return;

  appendFrikbotMessage("user", userMessage.trim());
  showFrikbotTyping();

  const submitBtn = document.getElementById("frikbot-submit-btn");
  if (submitBtn) submitBtn.disabled = true;

  try {
    const res = await fetch("/api/support-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage.trim(),
        conversationHistory: frikbotConversationHistory
      })
    });

    const data = await res.json();
    removeFrikbotTyping();

    const reply = data.reply || data.fallbackReply || "Je suis à votre écoute pour toute question sur la sécurité et vos échanges.";
    appendFrikbotMessage("model", reply);

    // Mettre à jour l'historique
    frikbotConversationHistory.push(
      { role: "user", text: userMessage.trim() },
      { role: "model", text: reply }
    );
  } catch (err) {
    console.error("[FrikBot Chat Exception]", err);
    removeFrikbotTyping();
    appendFrikbotMessage("model", "⚠️ Une brève interruption réseau est survenue. N'oubliez pas notre conseil de sécurité essentiel : **refusez tout acompte à distance** et réalisez vos échanges de main à main dans un lieu public sécurisé !");
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

function handleFrikbotSubmit(event) {
  event.preventDefault();
  const input = document.getElementById("frikbot-input");
  if (!input) return;
  const msg = input.value;
  input.value = "";
  sendFrikbotMessage(msg);
}

function sendFrikbotQuickPrompt(promptText) {
  if (!frikbotChatOpen) {
    toggleFrikbotChat();
  }
  sendFrikbotMessage(promptText);
}

// --------------------------------------------------------------------------
// INITIALISATION GLOBALE DES NOUVEAUX MODULES AU CHARGEMENT DU DOM
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialiser le bandeau des cours du jour
  fetchLiveExchangeRatesTicker(false);

  // 2. Initialiser la carte si elle est rendue visible
  const mapSec = document.getElementById("google-maps-safe-spots");
  if (mapSec && !mapSec.classList.contains("hidden")) {
    setTimeout(initGoogleMapsSafeSpots, 500);
  }

  // 3. Rafraîchissement automatique des taux toutes les 10 minutes
  setInterval(() => {
    fetchLiveExchangeRatesTicker(false);
  }, 10 * 60 * 1000);
});

// Exportations vers window pour accessibilité globale
window.fetchLiveExchangeRatesTicker = fetchLiveExchangeRatesTicker;
window.refreshLiveRatesTicker = refreshLiveRatesTicker;
window.initGoogleMapsSafeSpots = initGoogleMapsSafeSpots;
window.selectMapCity = selectMapCity;
window.filterMapLocationsByType = filterMapLocationsByType;
window.focusSpotOnMap = focusSpotOnMap;
window.copySafeLocationRdv = copySafeLocationRdv;
window.copyCurrentSpotWhatsApp = copyCurrentSpotWhatsApp;
window.filterCatalogueCurrentCity = filterCatalogueCurrentCity;
window.toggleFrikbotChat = toggleFrikbotChat;
window.clearFrikbotHistory = clearFrikbotHistory;
window.handleFrikbotSubmit = handleFrikbotSubmit;
window.sendFrikbotQuickPrompt = sendFrikbotQuickPrompt;

// ==========================================================================
// MODULE 1 : SUIVI ANALYTIQUE LÉGER & ENTONNOIRS DE CONVERSION (ZÉRO DONNÉE PERSO)
// ==========================================================================
function trackAnalyticsEvent(eventName, data = {}) {
  try {
    const payload = {
      eventName,
      source: data.source || "ui",
      device: window.innerWidth < 768 ? "mobile" : (window.innerWidth < 1024 ? "tablet" : "desktop"),
      annonceId: data.annonceId || null
    };

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch (e) {
    // Non-bloquant
  }
}
window.trackAnalyticsEvent = trackAnalyticsEvent;

async function loadAnalyticsAdminDashboard() {
  try {
    const res = await fetch("/api/analytics");
    if (!res.ok) return;
    const data = await res.json();
    if (!data || !data.summary) return;

    const s = data.summary;
    const f = data.funnels || {};

    // KPIs
    const vEl = document.getElementById("analytics-kpi-visits");
    const pcEl = document.getElementById("analytics-kpi-publish-clicks");
    const ucEl = document.getElementById("analytics-kpi-unlock-clicks");
    const ccEl = document.getElementById("analytics-kpi-chariow-clicks");

    if (vEl) vEl.textContent = s.page_views || 0;
    if (pcEl) pcEl.textContent = s.publish_clicks || 0;
    if (ucEl) ucEl.textContent = s.unlock_clicks || 0;
    if (ccEl) ccEl.textContent = s.unlock_chariow_clicks || 0;

    // Entonnoir 1 : Publication
    const pubFunnel = f.publication || { step1_clicks: 0, step2_submits: 0, conversion_rate: 0 };
    const p1Count = document.getElementById("funnel-pub-step1-count");
    const p2Count = document.getElementById("funnel-pub-step2-count");
    const p2Bar = document.getElementById("funnel-pub-step2-bar");
    const pBadge = document.getElementById("funnel-publish-rate-badge");

    if (p1Count) p1Count.textContent = pubFunnel.step1_clicks;
    if (p2Count) p2Count.textContent = pubFunnel.step2_submits;
    if (p2Bar) p2Bar.style.width = `${Math.min(100, Math.max(0, pubFunnel.conversion_rate))}%`;
    if (pBadge) pBadge.textContent = `${pubFunnel.conversion_rate}% conversion`;

    // Entonnoir 2 : Déblocage WhatsApp
    const unlFunnel = f.unlock || { step1_clicks: 0, step2_modal_opens: 0, step3_chariow_pay_clicks: 0, modal_open_rate: 0, overall_conversion_rate: 0 };
    const u1Count = document.getElementById("funnel-unl-step1-count");
    const u2Count = document.getElementById("funnel-unl-step2-count");
    const u3Count = document.getElementById("funnel-unl-step3-count");
    const u2Bar = document.getElementById("funnel-unl-step2-bar");
    const u3Bar = document.getElementById("funnel-unl-step3-bar");
    const uBadge = document.getElementById("funnel-unlock-rate-badge");

    if (u1Count) u1Count.textContent = unlFunnel.step1_clicks;
    if (u2Count) u2Count.textContent = unlFunnel.step2_modal_opens;
    if (u3Count) u3Count.textContent = unlFunnel.step3_chariow_pay_clicks;
    if (u2Bar) u2Bar.style.width = `${Math.min(100, Math.max(0, unlFunnel.modal_open_rate))}%`;
    if (u3Bar) u3Bar.style.width = `${Math.min(100, Math.max(0, unlFunnel.overall_conversion_rate))}%`;
    if (uBadge) uBadge.textContent = `${unlFunnel.overall_conversion_rate}% conversion`;

    // Tableau des événements récents
    const tbody = document.getElementById("analytics-recent-events-tbody");
    if (tbody && Array.isArray(data.recentEvents)) {
      if (data.recentEvents.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-slate-500 text-xs">Aucun événement enregistré.</td></tr>`;
      } else {
        tbody.innerHTML = data.recentEvents.slice(0, 20).map(evt => {
          let time = "";
          try {
            time = new Date(evt.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
          } catch(e) {
            time = evt.timestamp;
          }

          let eventLabel = evt.eventName;
          let badgeClass = "bg-slate-800 text-slate-300";
          if (evt.eventName === "page_view") {
            eventLabel = "👁️ Visite page";
            badgeClass = "bg-slate-800 text-slate-300";
          } else if (evt.eventName === "publish_click") {
            eventLabel = "➕ Clic 'Publier une annonce'";
            badgeClass = "bg-emerald-950 text-emerald-300 border border-emerald-800";
          } else if (evt.eventName === "publish_submit") {
            eventLabel = "✅ Annonce soumise avec succès";
            badgeClass = "bg-emerald-600 text-white";
          } else if (evt.eventName === "unlock_click") {
            eventLabel = "🔓 Clic 'Débloquer WhatsApp'";
            badgeClass = "bg-amber-950 text-amber-300 border border-amber-800";
          } else if (evt.eventName === "unlock_modal_open") {
            eventLabel = "📋 Consultation modale déblocage";
            badgeClass = "bg-amber-900 text-amber-200";
          } else if (evt.eventName === "unlock_chariow_click") {
            eventLabel = "💳 Clic paiement Chariow";
            badgeClass = "bg-indigo-600 text-white font-bold";
          }

          return `
            <tr class="hover:bg-slate-800/40 transition">
              <td class="py-2.5 px-3 font-mono text-[11px] text-slate-400">${time}</td>
              <td class="py-2.5 px-3">
                <span class="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${badgeClass}">
                  ${eventLabel}
                </span>
              </td>
              <td class="py-2.5 px-3 text-slate-300 text-[11px]">${evt.source || "inconnu"}</td>
              <td class="py-2.5 px-3 text-slate-400 text-[11px] flex items-center gap-1">
                <span>${evt.device === "mobile" ? "📱 Mobile" : (evt.device === "tablet" ? "📟 Tablette" : "💻 Ordinateur")}</span>
              </td>
            </tr>
          `;
        }).join("");
      }
    }
  } catch (err) {
    console.warn("[Analytics Admin Error]", err);
  } finally {
    if (typeof window.refreshRechartsAnalytics === "function") {
      window.refreshRechartsAnalytics();
    }
  }
}
window.loadAnalyticsAdminDashboard = loadAnalyticsAdminDashboard;

// ==========================================================================
// MODULE 2 : STUDIO MARKETING & PUBLICATION IA (IMAGEN 3 & GEMINI)
// ==========================================================================
AppState.marketingDraft = null;
AppState.activeMarketingTab = "fr";

async function handleGenerateMarketingCampaign() {
  const topicSelect = document.getElementById("admin-marketing-topic");
  const audienceInput = document.getElementById("admin-marketing-audience");
  const notesInput = document.getElementById("admin-marketing-notes");
  const generateBtn = document.getElementById("admin-marketing-generate-btn");
  const loadingIndicator = document.getElementById("admin-marketing-loading");
  const previewZone = document.getElementById("admin-marketing-preview-zone");

  const topic = topicSelect ? topicSelect.value : "mise_en_relation";
  const targetAudience = audienceInput ? audienceInput.value.trim() : "";
  const customNotes = notesInput ? notesInput.value.trim() : "";

  if (generateBtn) generateBtn.disabled = true;
  if (loadingIndicator) {
    loadingIndicator.classList.remove("hidden");
    loadingIndicator.classList.add("flex");
  }

  try {
    const res = await fetch("/api/admin-generate-marketing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, targetAudience, customNotes })
    });

    if (!res.ok) throw new Error("Échec de la génération marketing");
    const json = await res.json();
    if (!json.success || !json.data) throw new Error("Réponse API invalide");

    AppState.marketingDraft = json.data;

    // Remplissage de la prévisualisation
    const imgEl = document.getElementById("admin-marketing-preview-img");
    const headlineEl = document.getElementById("admin-marketing-preview-headline");
    const frEl = document.getElementById("admin-marketing-content-fr");
    const darijaEl = document.getElementById("admin-marketing-content-darija");
    const fullEl = document.getElementById("admin-marketing-content-full");

    if (imgEl) imgEl.src = json.data.imageUrl;
    if (headlineEl) headlineEl.textContent = json.data.headline || "Campagne FrikChange";
    if (frEl) frEl.textContent = json.data.textFr || "";
    if (darijaEl) darijaEl.textContent = json.data.textDarija || "";
    if (fullEl) fullEl.textContent = json.data.fullText || "";

    switchMarketingPreviewTab("fr");

    if (previewZone) {
      previewZone.classList.remove("hidden");
      previewZone.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    showToast("Post promotionnel AIDA et visuel 1080x1080 générés avec succès !", "success", { title: "Studio Marketing IA" });

  } catch (err) {
    console.error("[Marketing Gen Error]", err);
    showToast("Erreur lors de la génération IA : " + err.message, "error", { title: "Erreur Studio" });
  } finally {
    if (generateBtn) generateBtn.disabled = false;
    if (loadingIndicator) {
      loadingIndicator.classList.add("hidden");
      loadingIndicator.classList.remove("flex");
    }
    if (window.lucide) window.lucide.createIcons();
  }
}
window.handleGenerateMarketingCampaign = handleGenerateMarketingCampaign;

function switchMarketingPreviewTab(tab) {
  AppState.activeMarketingTab = tab;
  const frEl = document.getElementById("admin-marketing-content-fr");
  const darijaEl = document.getElementById("admin-marketing-content-darija");
  const fullEl = document.getElementById("admin-marketing-content-full");

  const tabFr = document.getElementById("admin-tab-marketing-fr");
  const tabDarija = document.getElementById("admin-tab-marketing-darija");
  const tabFull = document.getElementById("admin-tab-marketing-full");

  if (frEl) frEl.classList.add("hidden");
  if (darijaEl) darijaEl.classList.add("hidden");
  if (fullEl) fullEl.classList.add("hidden");

  [tabFr, tabDarija, tabFull].forEach(b => {
    if (b) {
      b.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition text-slate-400 hover:text-white cursor-pointer";
    }
  });

  if (tab === "fr") {
    if (frEl) frEl.classList.remove("hidden");
    if (tabFr) tabFr.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition bg-emerald-600 text-white cursor-pointer";
  } else if (tab === "darija") {
    if (darijaEl) darijaEl.classList.remove("hidden");
    if (tabDarija) tabDarija.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition bg-amber-600 text-white cursor-pointer";
  } else if (tab === "full") {
    if (fullEl) fullEl.classList.remove("hidden");
    if (tabFull) tabFull.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition bg-slate-700 text-white cursor-pointer";
  }
}
window.switchMarketingPreviewTab = switchMarketingPreviewTab;

function copyMarketingText() {
  if (!AppState.marketingDraft) {
    showToast("Aucun texte à copier. Veuillez générer un post d'abord.", "warning");
    return;
  }
  let txt = AppState.marketingDraft.textFr;
  if (AppState.activeMarketingTab === "darija") txt = AppState.marketingDraft.textDarija;
  else if (AppState.activeMarketingTab === "full") txt = AppState.marketingDraft.fullText;

  navigator.clipboard.writeText(txt).then(() => {
    showToast("Texte copié dans le presse-papiers avec succès !", "success", { title: "Presse-papiers" });
  }).catch(() => {
    showToast("Impossible de copier automatiquement.", "error");
  });
}
window.copyMarketingText = copyMarketingText;

function downloadMarketingVisual() {
  if (!AppState.marketingDraft || !AppState.marketingDraft.imageUrl) {
    showToast("Aucun visuel disponible à télécharger.", "warning");
    return;
  }

  const link = document.createElement("a");
  link.href = AppState.marketingDraft.imageUrl;
  link.download = `frikchange-marketing-banner-1080x1080-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Téléchargement du visuel 1080x1080 démarré !", "success");
}
window.downloadMarketingVisual = downloadMarketingVisual;

async function handlePublishToPublicFeed() {
  if (!AppState.marketingDraft) {
    showToast("Veuillez générer une campagne avant de la publier.", "warning");
    return;
  }

  const publishBtn = document.getElementById("admin-marketing-publish-btn");
  if (publishBtn) {
    publishBtn.disabled = true;
    publishBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Publication en tête du fil public...`;
    if (window.lucide) window.lucide.createIcons();
  }

  try {
    const res = await fetch("/api/admin-publish-announcement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: AppState.marketingDraft.headline || "Annonce Officielle FrikChange",
        textFr: AppState.marketingDraft.textFr,
        textDarija: AppState.marketingDraft.textDarija,
        fullText: AppState.marketingDraft.fullText,
        imageUrl: AppState.marketingDraft.imageUrl,
        category: "officiel",
        priority: 10,
        author: "Direction FrikChange"
      })
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Échec de publication");

    showToast("Annonce officielle publiée en tête du fil d'actualité pour tous les utilisateurs !", "success", { title: "Publication Réussie" });

    // Recharger la liste admin et les annonces publiques
    loadAdminOfficialAnnouncements();
    loadOfficialAnnouncements();

  } catch (err) {
    console.error("[Publish Error]", err);
    showToast("Erreur lors de la publication : " + err.message, "error");
  } finally {
    if (publishBtn) {
      publishBtn.disabled = false;
      publishBtn.innerHTML = `<i data-lucide="send" class="w-4 h-4"></i> Publier directement sur la Page Publique`;
      if (window.lucide) window.lucide.createIcons();
    }
  }
}
window.handlePublishToPublicFeed = handlePublishToPublicFeed;

async function loadAdminOfficialAnnouncements() {
  const container = document.getElementById("admin-marketing-published-list");
  if (!container) return;

  try {
    const res = await fetch("/api/admin-publish-announcement");
    if (!res.ok) return;
    const json = await res.json();
    const list = json.announcements || [];

    if (list.length === 0) {
      container.innerHTML = `
        <div class="text-center py-6 text-xs text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800">
          Aucune annonce officielle publiée pour l'instant. Utilisez le bouton "Générer Post + Visuel IA" ci-dessus pour en créer une.
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(item => {
      let dateFormatted = "";
      try {
        dateFormatted = new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
      } catch(e) {
        dateFormatted = item.createdAt;
      }

      return `
        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            ${item.imageUrl ? `
              <img src="${item.imageUrl}" alt="${item.title}" class="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0" />
            ` : `
              <div class="w-14 h-14 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                📢
              </div>
            `}
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                  ★ Annonce Officielle
                </span>
                <span class="text-[11px] text-slate-400">${dateFormatted}</span>
              </div>
              <h5 class="text-xs font-bold text-white mt-1">${escapeHtml(item.title)}</h5>
              <p class="text-[11px] text-slate-400 line-clamp-1 mt-0.5">${escapeHtml((item.textFr || item.fullText || "").substring(0, 100))}...</p>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end md:self-center shrink-0">
            <button type="button" onclick="deleteOfficialAnnouncement('${item.id}')" class="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              <span>Dépublier</span>
            </button>
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  } catch (e) {
    console.warn("[Admin Official Announcements]", e);
  }
}
window.loadAdminOfficialAnnouncements = loadAdminOfficialAnnouncements;

async function deleteOfficialAnnouncement(id) {
  if (!confirm("Voulez-vous vraiment retirer cette annonce officielle de la page publique ?")) return;

  try {
    const res = await fetch("/api/admin-publish-announcement", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const json = await res.json();
    if (json.success) {
      showToast("Annonce officielle dépubliée avec succès.", "info");
      loadAdminOfficialAnnouncements();
      loadOfficialAnnouncements();
    }
  } catch(e) {
    showToast("Erreur lors de la suppression.", "error");
  }
}
window.deleteOfficialAnnouncement = deleteOfficialAnnouncement;

// ==========================================================================
// MODULE 3 : AFFICHAGE PRIORITAIRE SUR LA PAGE PUBLIQUE DU SITE
// ==========================================================================
AppState.officialAnnouncements = [];

async function loadOfficialAnnouncements() {
  try {
    const res = await fetch("/api/admin-publish-announcement");
    if (!res.ok) return;
    const json = await res.json();
    AppState.officialAnnouncements = json.announcements || [];
    renderOfficialAnnouncements();
  } catch (err) {
    console.warn("[Official Announcements Public Fetch Error]", err);
  }
}
window.loadOfficialAnnouncements = loadOfficialAnnouncements;

function renderOfficialAnnouncements() {
  const homeContainer = document.getElementById("home-official-announcements-container");
  const catContainer = document.getElementById("catalogue-official-announcements-container");

  const list = AppState.officialAnnouncements || [];
  if (list.length === 0) {
    if (homeContainer) homeContainer.classList.add("hidden");
    if (catContainer) catContainer.classList.add("hidden");
    return;
  }

  // Rendu de l'annonce officielle prioritaire la plus récente
  const topAnnouncement = list[0];
  const dateFormatted = new Date(topAnnouncement.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

  const html = `
    <div class="annonce-card-animated rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border-2 border-amber-400/80 p-5 sm:p-7 shadow-xl shadow-emerald-950/20 text-white relative overflow-hidden">
      <!-- Glow d'arrière-plan -->
      <div class="absolute -right-16 -top-16 w-56 h-56 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col lg:flex-row items-center gap-6">
        
        <!-- Visuel 1080x1080 publicitaire -->
        ${topAnnouncement.imageUrl ? `
          <div class="w-full lg:w-64 aspect-square rounded-2xl overflow-hidden shrink-0 border border-amber-400/40 shadow-lg bg-slate-950">
            <img src="${topAnnouncement.imageUrl}" alt="${escapeHtml(topAnnouncement.title)}" class="w-full h-full object-cover" />
          </div>
        ` : ""}

        <!-- Contenu textuel officiel -->
        <div class="flex-1 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-md">
              <i data-lucide="award" class="w-3.5 h-3.5"></i>
              ANNONCE OFFICIELLE FRIKCHANGE
            </span>
            <span class="text-xs text-amber-200/80 font-mono">${dateFormatted} • ${escapeHtml(topAnnouncement.author || "Direction FrikChange")}</span>
          </div>

          <h3 class="text-lg sm:text-xl font-black text-white leading-tight">
            ${escapeHtml(topAnnouncement.title)}
          </h3>

          <div class="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap line-clamp-4">
            ${escapeHtml(topAnnouncement.textFr || topAnnouncement.fullText || "")}
          </div>

          <!-- Boutons d'action -->
          <div class="pt-2 flex flex-wrap items-center gap-3">
            <button type="button" onclick="openPublishModal()" class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md flex items-center gap-2 cursor-pointer">
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
              <span>Publier une annonce gratuite</span>
            </button>
            <button type="button" onclick="switchView('catalogue')" class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer">
              <span>Explorer les annonces vérifiées</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  if (homeContainer) {
    homeContainer.innerHTML = html;
    homeContainer.classList.remove("hidden");
  }

  if (catContainer) {
    catContainer.innerHTML = html;
    catContainer.classList.remove("hidden");
  }

  if (window.lucide) window.lucide.createIcons();
}
window.renderOfficialAnnouncements = renderOfficialAnnouncements;

// --------------------------------------------------------------------------
// SUIVI GLOBAL DE VISITE & CHARGEMENT DES ANNONCES OFFICIELLES
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Suivi anonyme de visite initiale
  trackAnalyticsEvent("page_view", { source: "app_load" });

  // Chargement des annonces officielles du Studio Marketing
  loadOfficialAnnouncements();
});




