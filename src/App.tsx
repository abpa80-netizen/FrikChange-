import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigReady } from "./lib/supabase";

type Category = "COMMUNITY_HELP" | "LOCAL_SERVICES" | "GOODS_DONATIONS" | "COMMUNITY_EVENTS" | "OTHER";
type ListingType = "OFFER" | "REQUEST";
type Listing = {
  id: string;
  owner_id: string;
  category: Category;
  listing_type: ListingType;
  title: string;
  description: string;
  country: string;
  city: string;
  origin_city: string | null;
  destination_city: string | null;
  preferred_date: string | null;
  status: "PENDING" | "PUBLISHED" | "PAUSED" | "REJECTED" | "EXPIRED";
  created_at: string;
  expires_at: string;
};

const listingFields = "id,owner_id,category,listing_type,title,description,country,city,origin_city,destination_city,preferred_date,status,created_at,expires_at";

const CATEGORY_LABELS: Record<Category, string> = {
  COMMUNITY_HELP: "Entraide communautaire",
  LOCAL_SERVICES: "Services de proximité",
  GOODS_DONATIONS: "Objets & dons",
  COMMUNITY_EVENTS: "Événements communautaires",
  OTHER: "Autres annonces",
};
function categoryLabel(category: string) { return CATEGORY_LABELS[category as Category] || "Autres annonces"; }
const RESTRICTED_CONTENT = /(?:\b(?:wave|orange\s*money|western\s*union|moneygram|mtn\s*momo|moov\s*money|mouv|virement|transfert\s+d['’]?argent|transfert\s+mobile|taux\s+de\s+change|conversion\s+de\s+devise|échange\s+de\s+devise|monnaie\s+numérique|crypto(?:monnaie)?|devise|cash|colis|bagages?|valises?)\b|\b\d+(?:[.,]\d+)?\s*(?:dh|dhs|mad|fcfa|xof|xaf|eur|usd|dollars?|dirhams?)\b|transport\s+de\s+(?:bagages?|colis|valises?))/i;
function contentPolicyMessage(value: string) {
  return RESTRICTED_CONTENT.test(value) ? "Cette annonce semble contenir une proposition financière, un transfert d'argent ou du transport de bagages. Ces activités ne sont pas autorisées sur FrikChange." : "";
}
function readableError(message: string) {
  if (/Invalid login credentials/i.test(message)) return "Adresse e-mail ou mot de passe incorrect.";
  if (/Email not confirmed/i.test(message)) return "Confirmez votre adresse e-mail depuis le message reçu avant de vous connecter.";
  if (/User already registered/i.test(message)) return "Cette adresse e-mail possède déjà un compte.";
  if (/Password should be at least/i.test(message)) return "Le mot de passe doit contenir au moins 6 caractères.";
  if (/row-level security|permission denied/i.test(message)) return "Cette action n'est pas autorisée par les règles de sécurité.";
  return message;
}

function statusLabel(status: Listing["status"]) {
  return ({ PENDING: "En attente de modération", PUBLISHED: "Publiée", PAUSED: "En pause", REJECTED: "Refusée", EXPIRED: "Expirée" })[status];
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "explore" | "favorites" | "profile">("home");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authView, setAuthView] = useState<"form" | "forgot" | "reset">("form");
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [publicListings, setPublicListings] = useState<Listing[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"ALL" | Category>("ALL");
  const [filterType, setFilterType] = useState<"ALL" | ListingType>("ALL");
  const [showComposer, setShowComposer] = useState(false);
  const [category, setCategory] = useState<Category>("COMMUNITY_HELP");
  const [listingType, setListingType] = useState<ListingType>("OFFER");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("Maroc");
  const [city, setCity] = useState("");
   const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCity, setEditCity] = useState("");
  const [moderationOpen, setModerationOpen] = useState(false);
  const [moderationListings, setModerationListings] = useState<Listing[]>([]);
  const [moderationMessage, setModerationMessage] = useState("");
  const [moderationBusy, setModerationBusy] = useState(false);

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return; }
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setAuthMessage(readableError(error.message));
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
        setAuthView("reset");
        setAuthMessage("Choisissez votre nouveau mot de passe.");
      } else if (event === "SIGNED_OUT") {
        setPasswordRecovery(false);
      } else {
        setAuthMessage("");
      }
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const refreshListings = useCallback(async () => {
    if (!supabase) return;
    setLoadError("");
    const now = new Date().toISOString();
    const [publicResult, ownResult] = await Promise.all([
      supabase.from("community_listings").select(listingFields).eq("status", "PUBLISHED").gt("expires_at", now).order("created_at", { ascending: false }).limit(100),
      session?.user
        ? supabase.from("community_listings").select(listingFields).eq("owner_id", session.user.id).order("created_at", { ascending: false }).limit(100)
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (publicResult.error || ownResult.error) {
      setLoadError(readableError(publicResult.error?.message || ownResult.error?.message || "Impossible de charger les annonces."));
      return;
    }
    setPublicListings((publicResult.data || []) as Listing[]);
    setMyListings((ownResult.data || []) as Listing[]);
  }, [session?.user?.id]);

  useEffect(() => { if (authReady) void refreshListings(); }, [authReady, refreshListings]);

  const visibleListings = useMemo(() => publicListings.filter((listing) => {
    const matchesCategory = filterCategory === "ALL" || listing.category === filterCategory;
    const matchesType = filterType === "ALL" || listing.listing_type === filterType;
    const text = [listing.title, listing.description, listing.city, listing.country, listing.origin_city || "", listing.destination_city || ""].join(" ").toLocaleLowerCase("fr");
    return matchesCategory && matchesType && text.includes(query.trim().toLocaleLowerCase("fr"));
  }), [publicListings, filterCategory, filterType, query]);

  async function handleAuth(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setAuthMessage("");
    try {
      const result = authMode === "signup"
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      if (authMode === "signup" && !result.data.session) {
        setAuthMessage("Compte créé. Consultez votre boîte e-mail pour confirmer votre adresse avant de vous connecter.");
      } else {
        setAuthMessage(authMode === "signup" ? "Compte créé et connecté." : "Connexion réussie.");
        setPassword("");
      }
    } catch (error) {
      setAuthMessage(readableError(error instanceof Error ? error.message : "Une erreur est survenue."));
    } finally { setBusy(false); }
  }

  async function handlePasswordResetRequest(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setAuthMessage("");
    try {
      const redirectTo = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), { redirectTo });
      if (error) throw error;
      setAuthMessage("Si cette adresse correspond à un compte, un e-mail de récupération vient d'être envoyé. Vérifiez aussi vos courriers indésirables.");
    } catch (error) {
      setAuthMessage(readableError(error instanceof Error ? error.message : "Impossible d'envoyer l'e-mail de récupération."));
    } finally { setBusy(false); }
  }

  async function handlePasswordUpdate(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setAuthMessage("");
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setPasswordRecovery(false);
      setAuthView("form");
      setAuthMode("login");
      await supabase.auth.signOut();
      setAuthMessage("Mot de passe modifié. Vous pouvez maintenant vous connecter.");
    } catch (error) {
      setAuthMessage(readableError(error instanceof Error ? error.message : "Impossible de modifier le mot de passe."));
    } finally { setBusy(false); }
  }

  async function handleSignOut() {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.signOut();
    setBusy(false);
    if (error) setAuthMessage(readableError(error.message));
    else { setMyListings([]); setAuthMessage("Vous êtes déconnecté."); }
  }

  async function handleCreateListing(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !session?.user) return;
    const policyError = contentPolicyMessage(`${title} ${description}`);
    if (policyError) { setLoadError(policyError); return; }
    if (title.trim().length < 5 || description.trim().length < 20 || !city.trim()) {
      setLoadError("Complétez le titre, la description et la ville avant de continuer.");
      return;
    }
    setBusy(true); setLoadError("");
    const payload = {
      owner_id: session.user.id,
      category,
      listing_type: listingType,
      title: title.trim(),
      description: description.trim(),
      country: country.trim(),
      city: city.trim(),
     };
    const { error } = await supabase.from("community_listings").insert(payload);
    setBusy(false);
    if (error) { setLoadError(readableError(error.message)); return; }
    setTitle(""); setDescription(""); setCity("");
    setShowComposer(false);
    setLoadError("Annonce envoyée à la modération. Elle sera visible publiquement après validation.");
    setModerationMessage("");
    await refreshListings();
    if (moderationOpen) await loadModeration();
  }

  async function handleDelete(id: string) {
    if (!supabase || !window.confirm("Supprimer définitivement cette annonce ?")) return;
    setBusy(true);
    const { error } = await supabase.from("community_listings").delete().eq("id", id);
    setBusy(false);
    if (error) setLoadError(readableError(error.message));
    else await refreshListings();
  }

  function beginEdit(item: Listing) {
    setEditingId(item.id); setEditTitle(item.title); setEditDescription(item.description); setEditCity(item.city);
  }

  async function saveEdit(id: string) {
    if (!supabase) return;
    const policyError = contentPolicyMessage(`${editTitle} ${editDescription}`);
    if (policyError) { setLoadError(policyError); return; }
    if (editTitle.trim().length < 5 || editDescription.trim().length < 20 || !editCity.trim()) {
      setLoadError("Le titre, la description et la ville sont obligatoires.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("community_listings").update({
      title: editTitle.trim(), description: editDescription.trim(), city: editCity.trim(),
    }).eq("id", id);
    setBusy(false);
    if (error) setLoadError(readableError(error.message));
    else { setEditingId(null); await refreshListings(); }
  }

  async function loadModeration() {
    if (!session?.access_token) return;
    setModerationBusy(true);
    setModerationMessage("");
    try {
      const response = await fetch("/api/admin/community-listings", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Accès à la modération impossible.");
      setModerationListings((result.listings || []) as Listing[]);
      setModerationOpen(true);
      setModerationMessage(`${(result.listings || []).length} annonce(s) en attente.`);
    } catch (error) {
      setModerationMessage(error instanceof Error ? error.message : "Erreur de modération.");
      setModerationOpen(false);
    } finally {
      setModerationBusy(false);
    }
  }

  async function moderateListing(id: string, action: "PUBLISH" | "REJECT") {
    if (!session?.access_token) return;
    setModerationBusy(true);
    setModerationMessage("");
    try {
      const response = await fetch("/api/admin/community-listings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id, action }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Décision impossible.");
      setModerationListings(current => current.filter(item => item.id !== id));
      setModerationMessage(action === "PUBLISH" ? "Annonce publiée." : "Annonce refusée.");
      await refreshListings();
    } catch (error) {
      setModerationMessage(error instanceof Error ? error.message : "Erreur de modération.");
    } finally {
      setModerationBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f8f8] pb-24 text-slate-900">
      <section id="accueil" hidden={activeTab !== "home"} className="bg-[#061426] text-white">
        <div className="relative isolate overflow-hidden">
          <img src="https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1800&q=90" alt="Vue nocturne de la ville au Maroc" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#041225]/95 via-[#06172d]/80 to-[#071629]/35" />
          <header className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 pb-2 pt-4 sm:px-6">
            <button onClick={() => setActiveTab("home")} className="flex items-center gap-2.5 text-left" aria-label="FrikChange accueil">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400 to-blue-600 text-2xl font-black text-white shadow-lg">F</span>
              <span><strong className="block text-[1.65rem] font-black leading-none tracking-tight text-white">FrikChange</strong><small className="mt-1 block text-[9px] font-bold uppercase tracking-[.19em] text-cyan-200">Annonces · Communauté</small></span>
            </button>
            <span className="rounded-full border border-white/25 bg-slate-950/35 px-3 py-2 text-[10px] font-bold text-white/90">MAROC <span className="ml-1 text-cyan-300">⌄</span></span>
          </header>
          <div className="mx-auto max-w-7xl px-4 pb-7 pt-4 sm:px-6 sm:pb-10 sm:pt-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[.22em] text-cyan-300">La communauté commence ici</p>
            <h1 className="mt-2 max-w-xl text-[2rem] font-black leading-[1.08] tracking-tight sm:text-4xl">Les bonnes opportunités,<br/><span className="text-cyan-300">près de vous.</span></h1>
            <p className="mt-2 max-w-lg text-xs leading-5 text-slate-100/90 sm:text-sm">Publiez et découvrez des annonces utiles : entraide, services, objets, dons et événements.</p>
            <div className="mt-5 flex gap-2 rounded-2xl bg-white p-1.5 shadow-2xl shadow-black/25">
              <span className="flex items-center pl-2 text-xl text-slate-700">⌕</span>
              <input aria-label="Rechercher par mot-clé ou ville" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")setActiveTab("explore")}} placeholder="Que recherchez-vous ? (ville, service…)" className="min-w-0 flex-1 border-0 bg-transparent px-1 py-2.5 text-xs text-slate-900 outline-none placeholder:text-slate-500"/>
              <button onClick={()=>setActiveTab("explore")} className="rounded-xl bg-gradient-to-r from-cyan-700 to-blue-800 px-4 py-2 text-xs font-extrabold text-white">Rechercher</button>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-semibold text-white/90 sm:text-xs">
              <span><b className="mr-1.5 text-cyan-300">✦</b>Annonces modérées</span><span><b className="mr-1.5 text-cyan-300">⌖</b>Partout au Maroc</span><span><b className="mr-1.5 text-cyan-300">◎</b>Communauté</span><span><b className="mr-1.5 text-cyan-300">✓</b>Accès gratuit</span>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-5 pt-4 sm:px-6">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-black tracking-wide text-white sm:text-base">Explorer par rubrique</h2><button onClick={()=>setActiveTab("explore")} className="text-[10px] font-bold text-cyan-300">Tout voir ›</button></div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              {label:"Entraide",key:"COMMUNITY_HELP",icon:"🤝",image:"https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=700&q=85",tone:"from-blue-600/70"},
              {label:"Services",key:"LOCAL_SERVICES",icon:"🛠️",image:"https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=700&q=85",tone:"from-emerald-600/70"},
              {label:"Objets & dons",key:"GOODS_DONATIONS",icon:"🎁",image:"https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=700&q=85",tone:"from-orange-600/70"},
              {label:"Événements",key:"COMMUNITY_EVENTS",icon:"🎉",image:"https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=700&q=85",tone:"from-violet-600/70"}
            ].map(item=><button key={item.key} onClick={()=>{setFilterCategory(item.key as Category);setActiveTab("explore")}} className="group relative h-[112px] overflow-hidden rounded-2xl border border-white/15 text-left shadow-lg sm:h-36">
              <img src={item.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"/>
              <span className={`absolute inset-0 bg-gradient-to-br ${item.tone} via-slate-950/25 to-slate-950/80`}/>
              <span className="absolute left-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white/15 text-xl shadow-lg backdrop-blur">{item.icon}</span>
              <span className="absolute bottom-2.5 left-3 right-2 text-xs font-extrabold text-white drop-shadow sm:text-sm">{item.label}<span className="float-right text-cyan-200">›</span></span>
            </button>)}
          </div>
        </div>
      </section>

      <section id="accueil-annonces" hidden={activeTab !== "home"} className="bg-[#061426] px-4 pb-5 pt-2 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 flex items-center justify-between"><div><p className="text-[9px] font-extrabold uppercase tracking-[.2em] text-cyan-300">Sélection communautaire</p><h2 className="mt-1 text-lg font-black">Annonces en vedette</h2></div><button onClick={()=>setActiveTab("explore")} className="rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-bold text-cyan-200">Voir tout ›</button></div>
          {publicListings.length===0 ? <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">Les annonces validées apparaîtront ici dès leur publication.</div> :
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(["COMMUNITY_HELP","LOCAL_SERVICES","GOODS_DONATIONS","COMMUNITY_EVENTS","OTHER"] as Category[]).map(cat=>{const item=publicListings.find(x=>x.category===cat);if(!item)return null;const photo=cat==="COMMUNITY_HELP"?"https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=900&q=85":cat==="LOCAL_SERVICES"?"https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85":cat==="GOODS_DONATIONS"?"https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=900&q=85":cat==="COMMUNITY_EVENTS"?"https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=85":"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=85";return <article key={item.id} className="w-[78vw] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-[#10243a] shadow-xl">
              <button onClick={()=>setSelectedListing(item)} className="block w-full text-left"><div className="relative h-36 overflow-hidden"><img src={photo} alt="" loading="lazy" className="h-full w-full object-cover"/><span className="absolute left-3 top-3 rounded-full bg-cyan-400 px-2.5 py-1 text-[9px] font-black text-slate-950">{categoryLabel(cat)}</span><span className="absolute right-3 top-3 rounded-full bg-slate-950/60 px-2 py-1 text-xs text-white">↗</span></div><div className="p-3"><p className="line-clamp-1 text-sm font-extrabold text-white">{item.title}</p><p className="mt-1 text-[10px] text-slate-400">⌖ {item.city}, {item.country}</p><p className="mt-2 text-[10px] font-bold text-cyan-300">Découvrir l’annonce ›</p></div></button>
              <button aria-label="Ajouter aux favoris" onClick={()=>setFavoriteIds(ids=>ids.includes(item.id)?ids.filter(id=>id!==item.id):[...ids,item.id])} className="absolute hidden"/>
            </article>})}
          </div>}
          <button onClick={()=>{setActiveTab("profile");setShowComposer(true)}} className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-[#0b4770] via-[#075c70] to-[#087e83] p-3.5 text-left shadow-lg shadow-cyan-950/30">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-200/50 bg-white/10 text-2xl">＋</span><span className="min-w-0 flex-1"><b className="block text-xs font-extrabold text-white">Publiez votre annonce gratuitement</b><small className="mt-1 block text-[10px] text-cyan-100">Faites connaître votre offre ou votre besoin à la communauté.</small></span><span className="rounded-full bg-cyan-300 px-3 py-2 text-[10px] font-black text-slate-950">Publier ›</span>
          </button>
        </div>
      </section>

      <section id="compte" hidden={activeTab !== "profile"} className="mx-auto max-w-7xl px-5 py-8">
        {!supabaseConfigReady ? <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Configuration Supabase requise.</strong><p className="mt-1">Le site attend l'URL du projet et la clé publique anon/publishable. Configurez les variables de build SUPABASE_URL et SUPABASE_ANON_KEY dans l'environnement de déploiement. N'ajoutez jamais SUPABASE_SERVICE_ROLE_KEY au navigateur.</p></div>
        : passwordRecovery ? <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Sécurité du compte</p>
          <h2 className="mt-2 text-2xl font-extrabold">Nouveau mot de passe</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Le lien de récupération a été accepté. Choisissez un nouveau mot de passe pour votre compte FrikChange.</p>
          <form onSubmit={handlePasswordUpdate} className="mt-5 space-y-4">
            <label className="block text-sm font-semibold">Nouveau mot de passe<input required minLength={8} type="password" autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-teal-600" placeholder="8 caractères minimum" /></label>
            <button disabled={busy} className="w-full rounded-xl bg-teal-700 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "Modification…" : "Enregistrer le nouveau mot de passe"}</button>
          </form>
          {authMessage && <p role="status" className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{authMessage}</p>}
        </div>
        : !session ? <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Espace utilisateur</p>
          <h2 className="mt-2 text-2xl font-extrabold">{authView === "forgot" ? "Récupérer mon compte" : authView === "reset" ? "Nouveau mot de passe" : authMode === "login" ? "Connexion" : "Créer un compte"}</h2>
          {authView === "form" ? <>
          <div className="mt-5 flex gap-2 rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => { setAuthMode("login"); setAuthMessage(""); }} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${authMode === "login" ? "bg-white shadow-sm" : "text-slate-500"}`}>Se connecter</button><button type="button" onClick={() => { setAuthMode("signup"); setAuthMessage(""); }} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${authMode === "signup" ? "bg-white shadow-sm" : "text-slate-500"}`}>Créer mon compte</button></div>
          <form onSubmit={handleAuth} className="mt-5 space-y-4">
            <label className="block text-sm font-semibold">Adresse e-mail<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-teal-600" placeholder="vous@exemple.com" /></label>
            <label className="block text-sm font-semibold">Mot de passe<input required minLength={6} type="password" autoComplete={authMode === "login" ? "current-password" : "new-password"} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-teal-600" placeholder="6 caractères minimum" /></label>
            {authMode === "login" && <button type="button" onClick={() => { setResetEmail(email); setAuthView("forgot"); setAuthMessage(""); }} className="text-sm font-semibold text-teal-700 hover:underline">Mot de passe oublié ?</button>}
            <button disabled={busy || !authReady} className="w-full rounded-xl bg-teal-700 px-5 py-3 font-bold text-white hover:bg-teal-800 disabled:opacity-50">{busy ? "Patientez…" : authMode === "login" ? "Se connecter" : "Créer mon compte"}</button>
          </form></> : authView === "forgot" ? <form onSubmit={handlePasswordResetRequest} className="mt-5 space-y-4">
            <p className="text-sm leading-6 text-slate-600">Saisissez l'adresse e-mail de votre compte. Nous vous enverrons un lien pour choisir un nouveau mot de passe.</p>
            <label className="block text-sm font-semibold">Adresse e-mail<input required type="email" autoComplete="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-teal-600" /></label>
            <button disabled={busy} className="w-full rounded-xl bg-teal-700 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "Envoi…" : "Envoyer le lien de récupération"}</button>
            <button type="button" onClick={() => { setAuthView("form"); setAuthMessage(""); }} className="w-full text-sm font-semibold text-slate-600 hover:underline">Retour à la connexion</button>
          </form> : <form onSubmit={handlePasswordUpdate} className="mt-5 space-y-4">
            <label className="block text-sm font-semibold">Nouveau mot de passe<input required minLength={8} type="password" autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-teal-600" placeholder="8 caractères minimum" /></label>
            <button disabled={busy} className="w-full rounded-xl bg-teal-700 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "Modification…" : "Enregistrer le nouveau mot de passe"}</button>
          </form>}
          {authMessage && <p role="status" className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{authMessage}</p>}
          <p className="mt-4 text-xs leading-5 text-slate-500">L'inscription utilise l'authentification e-mail de Supabase. Selon les réglages du projet, une confirmation par e-mail peut être nécessaire.</p>
        </div> : <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Votre espace</p><h2 className="mt-1 text-2xl font-extrabold">Mes annonces</h2><p className="mt-1 text-xs text-slate-500">{session.user.email}</p></div><div className="flex gap-2"><button onClick={handleSignOut} disabled={busy} className="rounded-xl border border-slate-300 px-3 py-3 text-xs font-bold">Déconnexion</button><button onClick={() => setShowComposer(!showComposer)} className="rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white hover:bg-teal-800">{showComposer ? "Fermer" : "+ Publier"}</button></div></div>
          {showComposer && <form onSubmit={handleCreateListing} className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 md:grid-cols-2">
            <label className="text-sm font-semibold">Rubrique<select value={category} onChange={e => setCategory(e.target.value as Category)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"><option value="COMMUNITY_HELP">Entraide communautaire</option><option value="LOCAL_SERVICES">Services de proximité</option><option value="GOODS_DONATIONS">Objets & dons</option><option value="COMMUNITY_EVENTS">Événements communautaires</option><option value="OTHER">Autres annonces</option></select></label>
            <label className="text-sm font-semibold">Type d'annonce<select value={listingType} onChange={e => setListingType(e.target.value as ListingType)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"><option value="OFFER">Offre</option><option value="REQUEST">Demande</option></select></label>
            <label className="text-sm font-semibold md:col-span-2">Titre (5 à 100 caractères)<input required minLength={5} maxLength={100} value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal" /></label>
            <label className="text-sm font-semibold md:col-span-2">Description (20 à 2 000 caractères)<textarea required minLength={20} maxLength={2000} rows={4} value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal" /></label>
            <label className="text-sm font-semibold">Pays<input required maxLength={80} value={country} onChange={e => setCountry(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal" /></label>
            <label className="text-sm font-semibold">Ville principale<input required maxLength={100} value={city} onChange={e => setCity(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal" /></label>

            <div className="flex items-end md:col-span-2"><button disabled={busy} className="w-full rounded-xl bg-teal-700 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "Envoi…" : "Envoyer à la modération"}</button></div>
            <p className="text-xs leading-5 text-slate-500 md:col-span-2">Les annonces proposant des échanges d’argent, des transferts ou le transport de bagages sont interdites. N’indiquez pas de numéro de téléphone ni d’informations personnelles. Votre annonce sera vérifiée avant publication.</p>
          </form>}
          {myListings.length === 0 ? <p className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">Vous n'avez pas encore publié d'annonce.</p> : <div className="mt-6 grid gap-4 md:grid-cols-2">{myListings.map(item => <article key={item.id} className="rounded-2xl border border-slate-200 p-5">
            {editingId === item.id ? <div className="space-y-3"><input aria-label="Titre" value={editTitle} onChange={e => setEditTitle(e.target.value)} maxLength={100} className="w-full rounded-lg border border-slate-300 px-3 py-2" /><textarea aria-label="Description" value={editDescription} onChange={e => setEditDescription(e.target.value)} minLength={20} maxLength={2000} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2" /><input aria-label="Ville" value={editCity} onChange={e => setEditCity(e.target.value)} maxLength={100} className="w-full rounded-lg border border-slate-300 px-3 py-2" /><div className="flex gap-2"><button onClick={() => void saveEdit(item.id)} disabled={busy} className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-bold text-white">Enregistrer</button><button onClick={() => setEditingId(null)} className="rounded-lg border px-3 py-2 text-sm">Annuler</button></div></div> : <><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold text-teal-800">{categoryLabel(item.category)} · {item.listing_type === "OFFER" ? "Offre" : "Demande"}</span><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">{statusLabel(item.status)}</span></div><h3 className="mt-3 text-lg font-extrabold">{item.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.description}</p><p className="mt-3 text-xs text-slate-500">{item.city}, {item.country}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => beginEdit(item)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold">Modifier</button><button onClick={() => void handleDelete(item.id)} disabled={busy} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700">Supprimer</button></div></>}
          </article>)}</div>}
        </div>}
        {authMessage && session && <p role="status" className="mt-4 text-sm text-slate-600">{authMessage}</p>}
      </section>

      {session && (
        <section id="moderation" hidden={activeTab !== "profile"} className="mx-auto max-w-7xl px-5 pb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Administration</p>
                <h2 className="mt-1 text-xl font-extrabold">Modération des annonces</h2>
                <p className="mt-1 text-sm text-slate-500">Accès réservé aux comptes explicitement autorisés côté serveur.</p>
              </div>
              <button onClick={() => void loadModeration()} disabled={moderationBusy} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold hover:bg-slate-50 disabled:opacity-50">
                {moderationBusy ? "Vérification…" : moderationOpen ? "Actualiser" : "Ouvrir la modération"}
              </button>
            </div>
            {moderationMessage && <p role="status" className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{moderationMessage}</p>}
            {moderationOpen && (moderationListings.length === 0 ? (
              <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Aucune annonce en attente.</p>
            ) : (
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {moderationListings.map(item => (
                  <article key={item.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="text-xs font-bold text-teal-800">{categoryLabel(item.category)} · {item.listing_type === "OFFER" ? "Offre" : "Demande"}</div>
                    <h3 className="mt-2 font-extrabold">{item.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.description}</p>
                    <p className="mt-3 text-xs text-slate-500">{item.city}, {item.country}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => void moderateListing(item.id, "PUBLISH")} disabled={moderationBusy} className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Publier</button>
                      <button onClick={() => void moderateListing(item.id, "REJECT")} disabled={moderationBusy} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-50">Refuser</button>
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="annonces" hidden={activeTab !== "explore"} className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Annonces validées</p><h2 className="mt-2 text-3xl font-extrabold">Explorer les annonces</h2><p className="mt-2 text-sm text-slate-600">Seules les annonces publiées et non expirées apparaissent ici.</p></div><span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">{visibleListings.length} annonce(s)</span></div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3"><input aria-label="Rechercher une annonce" value={query} onChange={e => setQuery(e.target.value)} placeholder="Mot-clé, ville…" className="rounded-xl border border-slate-300 px-4 py-3 sm:col-span-1" /><select aria-label="Filtrer par rubrique" value={filterCategory} onChange={e => setFilterCategory(e.target.value as "ALL" | Category)} className="rounded-xl border border-slate-300 px-4 py-3"><option value="ALL">Toutes les rubriques</option><option value="COMMUNITY_HELP">Entraide communautaire</option><option value="LOCAL_SERVICES">Services de proximité</option><option value="GOODS_DONATIONS">Objets & dons</option><option value="COMMUNITY_EVENTS">Événements communautaires</option><option value="OTHER">Autres annonces</option></select><select aria-label="Filtrer par type" value={filterType} onChange={e => setFilterType(e.target.value as "ALL" | ListingType)} className="rounded-xl border border-slate-300 px-4 py-3"><option value="ALL">Offres et demandes</option><option value="OFFER">Offres</option><option value="REQUEST">Demandes</option></select></div>
          {loadError && <p role="status" className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{loadError}</p>}
          {visibleListings.length === 0 ? <p className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">{publicListings.length === 0 ? "Aucune annonce publiée pour le moment." : "Aucune annonce ne correspond à votre recherche."}</p> : <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{visibleListings.map(item => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">{categoryLabel(item.category)}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{item.listing_type === "OFFER" ? "Offre" : "Demande"}</span></div><h3 className="mt-4 text-lg font-extrabold">{item.title}</h3><details className="mt-2 group"><summary className="cursor-pointer list-none text-xs font-bold text-teal-300">Voir les détails <span className="ml-1 group-open:hidden">＋</span><span className="ml-1 hidden group-open:inline">−</span></summary><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{item.description}</p></details><p className="mt-4 text-xs font-semibold text-slate-500">{item.city}, {item.country}</p><p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">Contact direct non activé à cette étape. Aucune coordonnée privée n'est affichée.</p></article>)}</div>}
        </div>
      </section>

      <section id="fonctionnement" hidden={activeTab !== "profile"} className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:grid-cols-2">
        <div><h2 className="text-2xl font-extrabold">Comment fonctionne le service ?</h2><ol className="mt-5 space-y-4 text-sm leading-6 text-slate-600"><li><strong className="text-slate-900">1. Créer un compte.</strong> Inscrivez-vous avec votre adresse e-mail.</li><li><strong className="text-slate-900">2. Publier.</strong> Votre annonce est soumise à modération.</li><li><strong className="text-slate-900">3. Consulter.</strong> Les annonces validées sont visibles dans le catalogue public.</li></ol></div>
        <div className="rounded-2xl bg-slate-50 p-5"><h2 className="text-base font-extrabold">Limites du service</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600"><li>FrikChange ne propose aucun échange d’argent, transfert, paiement ni conversion de devises.</li><li>FrikChange ne prend pas en charge le transport de bagages ou de colis.</li><li>FrikChange ne garantit ni les personnes, ni les accords, ni les opérations convenues entre utilisateurs.</li></ul><p className="mt-4 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">Les utilisateurs doivent respecter les lois applicables. Les annonces interdites, frauduleuses ou dangereuses peuvent être retirées. Cette description technique ne remplace pas une vérification juridique et réglementaire locale.</p></div>
      </section>

      {selectedListing && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label="Détail de l’annonce" onClick={() => setSelectedListing(null)}><div className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-cyan-300/20 bg-[#0c1b2d] text-white shadow-2xl sm:rounded-3xl" onClick={e => e.stopPropagation()}><div className="flex items-center justify-between border-b border-white/10 p-4"><span className="text-xs font-bold uppercase tracking-widest text-cyan-300">Détail de l’annonce</span><button onClick={() => setSelectedListing(null)} className="rounded-full bg-white/10 px-3 py-1 text-lg">×</button></div><div className="p-5"><span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-bold text-cyan-200">{categoryLabel(selectedListing.category)} · {selectedListing.listing_type==="OFFER"?"Offre":"Demande"}</span><h2 className="mt-4 text-2xl font-black">{selectedListing.title}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">{selectedListing.description}</p><p className="mt-5 border-t border-white/10 pt-4 text-xs text-slate-400">⌖ {selectedListing.city}, {selectedListing.country}</p><p className="mt-4 rounded-xl bg-white/5 p-3 text-xs leading-5 text-slate-400">Contact direct non activé. FrikChange facilite la découverte des annonces et la mise en relation, sans paiement ni transaction sur la plateforme.</p></div></div></div>}

      {activeTab==="favorites" && <section className="min-h-[75vh] bg-[#061426] px-4 py-8 text-white"><div className="mx-auto max-w-4xl"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-300">Votre sélection</p><h1 className="mt-1 text-2xl font-black">Mes favoris</h1>{publicListings.filter(item=>favoriteIds.includes(item.id)).length===0?<p className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">Vos annonces favorites apparaîtront ici. Touchez le cœur sur une annonce pour l’enregistrer.</p>:<div className="mt-5 grid gap-3 sm:grid-cols-2">{publicListings.filter(item=>favoriteIds.includes(item.id)).map(item=><button key={item.id} onClick={()=>setSelectedListing(item)} className="rounded-2xl border border-white/10 bg-[#10243a] p-4 text-left"><b>{item.title}</b><p className="mt-1 text-xs text-slate-400">{item.city}, {item.country}</p></button>)}</div>}</div></section>}
      <nav aria-label="Navigation principale" className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan-300/15 bg-[#061321]/95 px-2 pb-[max(env(safe-area-inset-bottom),.55rem)] pt-2 shadow-[0_-12px_35px_rgba(0,0,0,.3)] backdrop-blur-xl">
        <div className="mx-auto grid max-w-xl grid-cols-5 items-end gap-1">
          <button onClick={()=>setActiveTab("home")} className={`rounded-xl py-1.5 text-[9px] font-bold ${activeTab==="home"?"text-cyan-300":"text-slate-400"}`}><span className="block text-xl">⌂</span>Accueil</button>
          <button onClick={()=>setActiveTab("explore")} className={`rounded-xl py-1.5 text-[9px] font-bold ${activeTab==="explore"?"text-cyan-300":"text-slate-400"}`}><span className="block text-xl">▦</span>Explorer</button>
          <button onClick={()=>{setActiveTab("profile");setShowComposer(true)}} className="relative -mt-7 flex flex-col items-center text-[9px] font-bold text-slate-300"><span className="mb-1 flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#061321] bg-gradient-to-br from-cyan-400 to-blue-600 text-3xl font-light text-white shadow-lg shadow-cyan-500/30">＋</span>Publier</button>
          <button onClick={()=>setActiveTab("favorites")} className={`rounded-xl py-1.5 text-[9px] font-bold ${activeTab==="favorites"?"text-cyan-300":"text-slate-400"}`}><span className="block text-xl">♡</span>Favoris</button>
          <button onClick={()=>{setActiveTab("profile");setShowComposer(false)}} className={`rounded-xl py-1.5 text-[9px] font-bold ${activeTab==="profile"?"text-cyan-300":"text-slate-400"}`}><span className="block text-xl">♙</span>Profil</button>
        </div>
      </nav>

      <footer hidden={activeTab !== "home"} className="bg-slate-950 px-5 py-8 text-center text-sm text-slate-400"><strong className="text-white">FrikChange</strong><p className="mt-2">Service digital d'annonces et de mise en relation.</p><p className="mt-3 text-xs">Version de test — fonctionnalité de contact direct non activée.</p></footer>
    </main>
  );
}
