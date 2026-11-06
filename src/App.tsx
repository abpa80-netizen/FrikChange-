import { useMemo, useState } from "react";

const categories = [
  { id: "logement", label: "Logement", icon: "⌂", description: "Chambres, colocations et logements" },
  { id: "emploi", label: "Emploi", icon: "▤", description: "Offres et recherches d'emploi" },
  { id: "services", label: "Services", icon: "✳", description: "Compétences et services de proximité" },
  { id: "commerce", label: "Commerce local", icon: "▣", description: "Articles et commerces de quartier" },
  { id: "formation", label: "Cours & formation", icon: "▧", description: "Cours, ateliers et apprentissages" },
  { id: "entraide", label: "Entraide", icon: "♡", description: "Initiatives et vie communautaire" },
  { id: "evenements", label: "Événements", icon: "✦", description: "Rencontres et activités locales" },
  { id: "autres", label: "Autres annonces", icon: "＋", description: "Autres annonces communautaires" },
];

export default function App() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("toutes");
  const visible = useMemo(() => categories.filter((c) => {
    const matches = selected === "toutes" || c.id === selected;
    const text = (c.label + " " + c.description).toLocaleLowerCase("fr");
    return matches && text.includes(query.trim().toLocaleLowerCase("fr"));
  }), [query, selected]);

  return <main className="min-h-screen bg-[#f6f8f7] text-slate-900">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
      <a href="#accueil" className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-xl font-extrabold text-white">F</span><span><strong className="block text-xl font-extrabold">FrikChange</strong><small className="text-xs text-slate-500">La communauté partage ses annonces</small></span></a>
      <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">Version communautaire</span>
    </div></header>
    <section id="accueil" className="bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.3fr_.7fr] md:items-center md:py-24">
      <div><p className="mb-5 inline-flex rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1.5 text-xs font-semibold text-teal-200">Un espace d'annonces pour la communauté</p><h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Les bonnes informations circulent mieux <span className="text-teal-300">ensemble.</span></h1><p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">Consultez les annonces de la communauté, trouvez des services près de chez vous et partagez vos opportunités au Maroc.</p><a href="#annonces" className="mt-8 inline-flex rounded-xl bg-teal-400 px-5 py-3 font-bold text-slate-950 hover:bg-teal-300">Découvrir les catégories ↓</a></div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6"><p className="text-sm font-semibold text-teal-200">FrikChange, c'est</p><ul className="mt-5 space-y-4 text-sm leading-6 text-slate-200"><li>✓　Des annonces locales et communautaires</li><li>✓　Des informations faciles à rechercher</li><li>✓　Un espace avec signalement et modération</li></ul></div>
    </div></section>
    <section id="annonces" className="mx-auto max-w-7xl px-5 py-14"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Explorer</p><h2 className="mt-2 text-3xl font-extrabold">Catégories d'annonces</h2><p className="mt-2 text-sm text-slate-600">Choisissez un thème ou recherchez une catégorie.</p></div>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row"><input aria-label="Rechercher une catégorie" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher : logement, emploi, services…" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-600"/><select value={selected} onChange={(e) => setSelected(e.target.value)} aria-label="Filtrer les catégories" className="rounded-xl border border-slate-300 bg-white px-4 py-3"><option value="toutes">Toutes les catégories</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{visible.map((c) => <button key={c.id} type="button" onClick={() => setSelected(c.id)} className={"rounded-2xl border p-5 text-left transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg " + (selected === c.id ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white")}><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-2xl text-teal-800">{c.icon}</span><strong className="mt-4 block">{c.label}</strong><span className="mt-1 block text-sm text-slate-500">{c.description}</span></button>)}</div>
      {visible.length === 0 && <p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Aucune catégorie ne correspond à cette recherche.</p>}
    </section>
    <section className="border-y border-slate-200 bg-white"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-2"><div><h2 className="text-2xl font-extrabold">Un espace simple et utile</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">FrikChange prépare un service de petites annonces communautaires. Les comptes, la publication et la consultation des annonces seront activés après intégration et vérification de la base de données et des protections des utilisateurs.</p></div><div className="rounded-2xl bg-slate-50 p-5"><strong className="text-sm">Règles de la communauté</strong><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600"><li>Publiez des informations exactes et respectueuses.</li><li>Ne partagez pas de données personnelles sans consentement.</li><li>Les annonces illicites, frauduleuses ou dangereuses sont interdites.</li><li>Signalez tout contenu préoccupant.</li></ul></div></div></section>
    <footer className="bg-slate-950 px-5 py-8 text-center text-sm text-slate-400"><strong className="text-white">FrikChange</strong><p className="mt-2">Espace communautaire de petites annonces.</p><p className="mt-3 text-xs">Version de développement — les publications et comptes ne sont pas encore activés.</p></footer>
  </main>;
}
