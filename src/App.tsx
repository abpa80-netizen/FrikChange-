import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigReady } from "./lib/supabase";

type Category = "DIGITAL_CURRENCY" | "PARCEL_CONNECTION";
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
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
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
  const [category, setCategory] = useState<Category>("DIGITAL_CURRENCY");
  const [listingType, setListingType] = useState<ListingType>("OFFER");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("Maroc");
  const [city, setCity] = useState("");
  const [originCity, setOriginCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
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
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthMessage("");
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
    if (category === "PARCEL_CONNECTION" && (!originCity.trim() || !destinationCity.trim() || originCity.trim().toLocaleLowerCase("fr") === destinationCity.trim().toLocaleLowerCase("fr"))) {
      setLoadError("Pour une annonce colis, indiquez deux villes différentes : départ et destination.");
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
      origin_city: category === "PARCEL_CONNECTION" ? originCity.trim() : null,
      destination_city: category === "PARCEL_CONNECTION" ? destinationCity.trim() : null,
      preferred_date: category === "PARCEL_CONNECTION" && preferredDate ? preferredDate : null,
    };
    const { error } = await supabase.from("community_listings").insert(payload);
    setBusy(false);
    if (error) { setLoadError(readableError(error.message)); return; }
    setTitle(""); setDescription(""); setCity(""); setOriginCity(""); setDestinationCity(""); setPreferredDate("");
    setShowComposer(false);
    setLoadError("Annonce envoyée à la modération. Elle sera visible publiquement après validation.");
    await refreshListings();
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
    <main className="min-h-screen bg-[#f5f8f8] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <a href="#accueil" className="flex items-center gap-3" aria-label="FrikChange, accueil">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-xl font-extrabold text-white">F</span>
            <span><strong className="block text-xl font-extrabold">FrikChange</strong><small className="text-xs text-slate-500">Annonces et mise en relation</small></span>
          </a>
          {session ? <div className="flex items-center gap-3"><span className="hidden max-w-44 truncate text-xs text-slate-500 sm:block">{session.user.email}</span><button onClick={handleSignOut} disabled={busy} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50">Déconnexion</button></div> : <a href="#compte" className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800">Se connecter</a>}
        </div>
      </header>

      <section id="accueil" className="bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.2fr_.8fr] md:items-center md:py-24">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1.5 text-xs font-semibold text-teal-200">La mise en relation commence par une annonce</p>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Trouvez le bon contact pour votre <span className="text-teal-300">besoin.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">Publiez une offre ou une demande autour de la monnaie numérique et des colis, puis consultez les annonces validées.</p>
            <a href="#annonces" className="mt-8 inline-flex rounded-xl bg-teal-400 px-5 py-3 font-bold text-slate-950 hover:bg-teal-300">Voir les annonces ↓</a>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold text-teal-200">Le rôle de FrikChange</p>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-200">
              <li>✓　Publier des offres et des demandes</li><li>✓　Consulter les annonces validées</li><li>✓　Modération avant publication</li><li>✓　Accès aux annonces personnelles après connexion</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="compte" className="mx-auto max-w-7xl px-5 py-12">
        {!supabaseConfigReady ? <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Configuration Supabase requise.</strong><p className="mt-1">Le site attend l'URL du projet et la clé publique anon/publishable. Configurez les variables de build SUPABASE_URL et SUPABASE_ANON_KEY dans l'environnement de déploiement. N'ajoutez jamais SUPABASE_SERVICE_ROLE_KEY au navigateur.</p></div>
        : !session ? <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Espace utilisateur</p>
          <h2 className="mt-2 text-2xl font-extrabold">{authMode === "login" ? "Connexion" : "Créer un compte"}</h2>
          <div className="mt-5 flex gap-2 rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => { setAuthMode("login"); setAuthMessage(""); }} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${authMode === "login" ? "bg-white shadow-sm" : "text-slate-500"}`}>Se connecter</button><button type="button" onClick={() => { setAuthMode("signup"); setAuthMessage(""); }} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ${authMode === "signup" ? "bg-white shadow-sm" : "text-slate-500"}`}>Créer mon compte</button></div>
          <form onSubmit={handleAuth} className="mt-5 space-y-4">
            <label className="block text-sm font-semibold">Adresse e-mail<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-teal-600" placeholder="vous@exemple.com" /></label>
            <label className="block text-sm font-semibold">Mot de passe<input required minLength={6} type="password" autoComplete={authMode === "login" ? "current-password" : "new-password"} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-teal-600" placeholder="6 caractères minimum" /></label>
            <button disabled={busy || !authReady} className="w-full rounded-xl bg-teal-700 px-5 py-3 font-bold text-white hover:bg-teal-800 disabled:opacity-50">{busy ? "Patientez…" : authMode === "login" ? "Se connecter" : "Créer mon compte"}</button>
          </form>
          {authMessage && <p role="status" className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{authMessage}</p>}
          <p className="mt-4 text-xs leading-5 text-slate-500">L'inscription utilise l'authentification e-mail de Supabase. Selon les réglages du projet, une confirmation par e-mail peut être nécessaire.</p>
        </div> : <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Votre espace</p><h2 className="mt-1 text-2xl font-extrabold">Mes annonces</h2></div><button onClick={() => setShowComposer(!showComposer)} className="rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white hover:bg-teal-800">{showComposer ? "Fermer" : "+ Publier une annonce"}</button></div>
          {showComposer && <form onSubmit={handleCreateListing} className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 md:grid-cols-2">
            <label className="text-sm font-semibold">Rubrique<select value={category} onChange={e => setCategory(e.target.value as Category)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"><option value="DIGITAL_CURRENCY">Monnaie numérique</option><option value="PARCEL_CONNECTION">Colis</option></select></label>
            <label className="text-sm font-semibold">Type d'annonce<select value={listingType} onChange={e => setListingType(e.target.value as ListingType)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"><option value="OFFER">Offre</option><option value="REQUEST">Demande</option></select></label>
            <label className="text-sm font-semibold md:col-span-2">Titre (5 à 100 caractères)<input required minLength={5} maxLength={100} value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal" /></label>
            <label className="text-sm font-semibold md:col-span-2">Description (20 à 2 000 caractères)<textarea required minLength={20} maxLength={2000} rows={4} value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal" /></label>
            <label className="text-sm font-semibold">Pays<input required maxLength={80} value={country} onChange={e => setCountry(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal" /></label>
            <label className="text-sm font-semibold">Ville principale<input required maxLength={100} value={city} onChange={e => setCity(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal" /></label>
            {category === "PARCEL_CONNECTION" && <><label className="text-sm font-semibold">Ville de départ<input required maxLength={100} value={originCity} onChange={e => setOriginCity(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal" /></label><label className="text-sm font-semibold">Ville de destination<input required maxLength={100} value={destinationCity} onChange={e => setDestinationCity(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal" /></label><label className="text-sm font-semibold">Date indicative (facultatif)<input type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal" /></label></>}
            <div className="flex items-end md:col-span-2"><button disabled={busy} className="w-full rounded-xl bg-teal-700 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? "Envoi…" : "Envoyer à la modération"}</button></div>
            <p className="text-xs leading-5 text-slate-500 md:col-span-2">Ne publiez aucun numéro de téléphone, montant, taux, moyen de paiement, instruction de transfert ou information personnelle. Toute annonce est créée avec le statut « En attente de modération ».</p>
          </form>}
          {myListings.length === 0 ? <p className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">Vous n'avez pas encore publié d'annonce.</p> : <div className="mt-6 grid gap-4 md:grid-cols-2">{myListings.map(item => <article key={item.id} className="rounded-2xl border border-slate-200 p-5">
            {editingId === item.id ? <div className="space-y-3"><input aria-label="Titre" value={editTitle} onChange={e => setEditTitle(e.target.value)} maxLength={100} className="w-full rounded-lg border border-slate-300 px-3 py-2" /><textarea aria-label="Description" value={editDescription} onChange={e => setEditDescription(e.target.value)} minLength={20} maxLength={2000} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2" /><input aria-label="Ville" value={editCity} onChange={e => setEditCity(e.target.value)} maxLength={100} className="w-full rounded-lg border border-slate-300 px-3 py-2" /><div className="flex gap-2"><button onClick={() => void saveEdit(item.id)} disabled={busy} className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-bold text-white">Enregistrer</button><button onClick={() => setEditingId(null)} className="rounded-lg border px-3 py-2 text-sm">Annuler</button></div></div> : <><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold text-teal-800">{item.category === "DIGITAL_CURRENCY" ? "Monnaie numérique" : "Colis"} · {item.listing_type === "OFFER" ? "Offre" : "Demande"}</span><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">{statusLabel(item.status)}</span></div><h3 className="mt-3 text-lg font-extrabold">{item.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.description}</p><p className="mt-3 text-xs text-slate-500">{item.city}, {item.country}{item.origin_city && item.destination_city ? ` · ${item.origin_city} → ${item.destination_city}` : ""}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => beginEdit(item)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold">Modifier</button><button onClick={() => void handleDelete(item.id)} disabled={busy} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700">Supprimer</button></div></>}
          </article>)}</div>}
        </div>}
        {authMessage && session && <p role="status" className="mt-4 text-sm text-slate-600">{authMessage}</p>}
      </section>

      {session && (
        <section id="moderation" className="mx-auto max-w-7xl px-5 pb-10">
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
                    <div className="text-xs font-bold text-teal-800">{item.category === "DIGITAL_CURRENCY" ? "Monnaie numérique" : "Colis"} · {item.listing_type === "OFFER" ? "Offre" : "Demande"}</div>
                    <h3 className="mt-2 font-extrabold">{item.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.description}</p>
                    <p className="mt-3 text-xs text-slate-500">{item.city}, {item.country}{item.origin_city && item.destination_city ? ` · ${item.origin_city} → ${item.destination_city}` : ""}</p>
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

      <section id="annonces" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Annonces validées</p><h2 className="mt-2 text-3xl font-extrabold">Explorer les annonces</h2><p className="mt-2 text-sm text-slate-600">Seules les annonces publiées et non expirées apparaissent ici.</p></div><span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">{visibleListings.length} annonce(s)</span></div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3"><input aria-label="Rechercher une annonce" value={query} onChange={e => setQuery(e.target.value)} placeholder="Mot-clé, ville…" className="rounded-xl border border-slate-300 px-4 py-3 sm:col-span-1" /><select aria-label="Filtrer par rubrique" value={filterCategory} onChange={e => setFilterCategory(e.target.value as "ALL" | Category)} className="rounded-xl border border-slate-300 px-4 py-3"><option value="ALL">Toutes les rubriques</option><option value="DIGITAL_CURRENCY">Monnaie numérique</option><option value="PARCEL_CONNECTION">Colis</option></select><select aria-label="Filtrer par type" value={filterType} onChange={e => setFilterType(e.target.value as "ALL" | ListingType)} className="rounded-xl border border-slate-300 px-4 py-3"><option value="ALL">Offres et demandes</option><option value="OFFER">Offres</option><option value="REQUEST">Demandes</option></select></div>
          {loadError && <p role="status" className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{loadError}</p>}
          {visibleListings.length === 0 ? <p className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">{publicListings.length === 0 ? "Aucune annonce publiée pour le moment." : "Aucune annonce ne correspond à votre recherche."}</p> : <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{visibleListings.map(item => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">{item.category === "DIGITAL_CURRENCY" ? "Monnaie numérique" : "Colis"}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{item.listing_type === "OFFER" ? "Offre" : "Demande"}</span></div><h3 className="mt-4 text-lg font-extrabold">{item.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.description}</p><p className="mt-4 text-xs font-semibold text-slate-500">{item.city}, {item.country}</p>{item.origin_city && item.destination_city && <p className="mt-1 text-xs text-slate-500">{item.origin_city} → {item.destination_city}{item.preferred_date ? ` · ${item.preferred_date}` : ""}</p>}<p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">Contact direct non activé à cette étape. Aucune coordonnée privée n'est affichée.</p></article>)}</div>}
        </div>
      </section>

      <section id="fonctionnement" className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-2">
        <div><h2 className="text-2xl font-extrabold">Comment fonctionne le service ?</h2><ol className="mt-5 space-y-4 text-sm leading-6 text-slate-600"><li><strong className="text-slate-900">1. Créer un compte.</strong> Inscrivez-vous avec votre adresse e-mail.</li><li><strong className="text-slate-900">2. Publier.</strong> Votre annonce est soumise à modération.</li><li><strong className="text-slate-900">3. Consulter.</strong> Les annonces validées sont visibles dans le catalogue public.</li></ol></div>
        <div className="rounded-2xl bg-slate-50 p-5"><h2 className="text-base font-extrabold">Limites du service</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600"><li>FrikChange ne calcule ni ne publie de taux de conversion.</li><li>FrikChange ne reçoit, ne conserve et ne transfère pas l'argent et n'exécute aucune opération financière.</li><li>FrikChange ne reçoit, ne stocke et ne transporte aucun colis.</li><li>FrikChange ne garantit ni les personnes, ni les accords, ni les opérations convenues entre utilisateurs.</li></ul><p className="mt-4 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">Les utilisateurs doivent respecter les lois applicables. Les annonces interdites, frauduleuses ou dangereuses peuvent être retirées. Cette description technique ne remplace pas une vérification juridique et réglementaire locale.</p></div>
      </section>

      <footer className="bg-slate-950 px-5 py-8 text-center text-sm text-slate-400"><strong className="text-white">FrikChange</strong><p className="mt-2">Service digital d'annonces et de mise en relation.</p><p className="mt-3 text-xs">Version de test — fonctionnalité de contact direct non activée.</p></footer>
    </main>
  );
}
