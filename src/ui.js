/**
 * FrikChange - Module UI, UX, Logo & Navigation SPA
 * Gère le logo vectoriel, le masquage/dépliement de la FAQ et de la Carte,
 * ainsi que l'interception de l'historique et du bouton Retour Android.
 */

// 1. Définition du Logo SVG Vectoriel Professionnel
export const FRIKCHANGE_LOGO_SVG = `
<svg class="w-10 h-10 shrink-0 drop-shadow-md transition-transform duration-300 group-hover:scale-105" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Logo FrikChange">
  <defs>
    <linearGradient id="fc-logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064E3B" />
      <stop offset="50%" stop-color="#065F46" />
      <stop offset="100%" stop-color="#022C22" />
    </linearGradient>
    <linearGradient id="fc-logo-arrow1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>
    <linearGradient id="fc-logo-arrow2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0EA5E9" />
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#fc-logo-bg)" stroke="#10B981" stroke-width="1.5" stroke-opacity="0.45" />
  <path d="M24 8L36 13V23C36 30 30.5 36.5 24 40C17.5 36.5 12 30 12 23V13L24 8Z" fill="#10B981" fill-opacity="0.12" stroke="#10B981" stroke-width="1.2" stroke-opacity="0.35" stroke-dasharray="2.5 2" />
  <path d="M16 19.5C18 15 22.5 12.5 27.5 13.5C31.5 14.5 34.5 17.5 35.5 21" stroke="url(#fc-logo-arrow1)" stroke-width="2.8" stroke-linecap="round" />
  <path d="M31.5 22.5L36 21L37 16.5" fill="none" stroke="url(#fc-logo-arrow1)" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round" />
  <path d="M32 28.5C30 33 25.5 35.5 20.5 34.5C16.5 33.5 13.5 30.5 12.5 27" stroke="url(#fc-logo-arrow2)" stroke-width="2.8" stroke-linecap="round" />
  <path d="M16.5 25.5L12 27L11 31.5" fill="none" stroke="url(#fc-logo-arrow2)" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round" />
  <circle cx="24" cy="24" r="3.2" fill="#FFFFFF" />
  <circle cx="24" cy="24" r="1.6" fill="#059669" />
</svg>
`;

// 2. Gestionnaire de Navigation et Historique SPA (Bouton Retour Android)
export function pushNavState(stateObj, title, url) {
  try {
    const targetUrl = url || window.location.pathname;
    history.pushState(stateObj, title || "", targetUrl);
  } catch (err) {
    console.warn("[Navigation] Erreur pushNavState:", err);
  }
}

export function handleHistoryPop(state) {
  if (typeof window.handleHistoryPop === "function") {
    window.handleHistoryPop(state);
  }
}

export function initNavigationHistory() {
  if (typeof window.initNavigationHistory === "function") {
    window.initNavigationHistory();
  }
}

// 3. Masquage & Affichage de la FAQ
export function toggleFaqSection(forceOpen, updateHistory = true) {
  if (typeof window.toggleFaqSection === "function") {
    window.toggleFaqSection(forceOpen, updateHistory);
  }
}

// 4. Masquage & Affichage de la Carte des Lieux Sécurisés
export function toggleMapSection(forceOpen, updateHistory = true) {
  if (typeof window.toggleMapSection === "function") {
    window.toggleMapSection(forceOpen, updateHistory);
  }
}

// Export groupé pour utilisation modulaire
export default {
  FRIKCHANGE_LOGO_SVG,
  pushNavState,
  handleHistoryPop,
  initNavigationHistory,
  toggleFaqSection,
  toggleMapSection
};
