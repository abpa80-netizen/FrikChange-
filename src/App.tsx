import { useMemo, useState } from "react";

const categories = [
  {
    id: "monnaie-numerique",
    title: "Monnaie numérique",
    eyebrow: "Offres et demandes",
    icon: "◈",
    description: "Publiez une annonce décrivant votre besoin lié à la monnaie numérique et trouvez des personnes souhaitant entrer en contact.",
    examples: ["Proposer une disponibilité", "Rechercher une disponibilité"],
  },
  {
    id: "colis",
    title: "Colis",
    eyebrow: "Offres et demandes",
    icon: "▣",
    description: "Publiez une proposition ou une demande de mise en relation concernant un trajet et un colis.",
    examples: ["Proposer une possibilité d'acheminement", "Rechercher une personne pour un trajet"],
  },
];

export default function App() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("toutes");
  const visible = useMemo(() => categories.filter((category) => {
    const matches = selected === "toutes" || category.id === selected;
    const searchable = [category.title, category.description, ...category.examples].join(" ").toLocaleLowerCase("fr");
    return matches && searchable.includes(query.trim().toLocaleLowerCase("fr"));
  }), [query, selected]);

  return (
    <main className="min-h-screen bg-[#f5f8f8] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#accueil" className="flex items-center gap-3" aria-label="FrikChange, accueil">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-xl font-extrabold text-white">F</span>
            <span><strong className="block text-xl font-extrabold">FrikChange</strong><small className="text-xs text-slate-500">Annonces et mise en relation</small></span>
          </a>
          <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">Service digital</span>
        </div>
      </header>

      <section id="accueil" className="bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.2fr_.8fr] md:items-center md:py-24">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1.5 text-xs font-semibold text-teal-200">La mise en relation commence par une annonce</p>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Trouvez le bon contact pour votre <span className="text-teal-300">besoin.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">FrikChange permet de publier des offres et des demandes autour de la monnaie numérique et des colis, puis de faciliter la prise de contact entre utilisateurs.</p>
            <a href="#rubriques" className="mt-8 inline-flex rounded-xl bg-teal-400 px-5 py-3 font-bold text-slate-950 hover:bg-teal-300">Explorer les rubriques ↓</a>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold text-teal-200">Le rôle de FrikChange</p>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-200">
              <li>✓　Publier des offres et des demandes</li>
              <li>✓　Rechercher des annonces pertinentes</li>
              <li>✓　Faciliter la prise de contact entre utilisateurs</li>
              <li>✓　Protéger les informations personnelles et modérer les annonces</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="rubriques" className="mx-auto max-w-7xl px-5 py-14">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700">Les services</p>
          <h2 className="mt-2 text-3xl font-extrabold">Deux rubriques, un service de mise en relation</h2>
          <p className="mt-2 text-sm text-slate-600">Choisissez le sujet de votre annonce ou recherchez une rubrique.</p>
        </div>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <input aria-label="Rechercher une rubrique" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher : monnaie numérique, colis…" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-600" />
          <select value={selected} onChange={(event) => setSelected(event.target.value)} aria-label="Filtrer les rubriques" className="rounded-xl border border-slate-300 bg-white px-4 py-3">
            <option value="toutes">Toutes les rubriques</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}
          </select>
        </div>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {visible.map((category) => (
            <article key={category.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-3xl text-teal-800">{category.icon}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{category.eyebrow}</span>
              </div>
              <h3 className="mt-5 text-2xl font-extrabold">{category.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{category.description}</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                {category.examples.map((example) => <li key={example} className="flex gap-2"><span className="text-teal-700">•</span>{example}</li>)}
              </ul>
              <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">La publication et la prise de contact seront activées après l'intégration et les tests de sécurité.</p>
            </article>
          ))}
        </div>
        {visible.length === 0 && <p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Aucune rubrique ne correspond à cette recherche.</p>}
      </section>

      <section id="fonctionnement" className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold">Comment fonctionne le service ?</h2>
            <ol className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
              <li><strong className="text-slate-900">1. Publier.</strong> L'utilisateur décrit clairement son offre ou sa demande.</li>
              <li><strong className="text-slate-900">2. Rechercher.</strong> Les autres utilisateurs consultent les annonces et leurs informations utiles.</li>
              <li><strong className="text-slate-900">3. Prendre contact.</strong> Les personnes intéressées choisissent de se contacter directement, selon les options de confidentialité.</li>
            </ol>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <h2 className="text-base font-extrabold">Limites du service</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
              <li>FrikChange ne calcule ni ne publie de taux de conversion.</li>
              <li>FrikChange ne reçoit, ne conserve et ne transfère pas l'argent des utilisateurs et n'exécute aucune opération financière.</li>
              <li>FrikChange ne reçoit, ne stocke et ne transporte aucun colis.</li>
              <li>FrikChange ne garantit ni les personnes, ni les accords, ni les opérations ou acheminements convenus entre utilisateurs.</li>
            </ul>
            <p className="mt-4 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">Les utilisateurs doivent respecter les lois applicables et vérifier eux-mêmes les personnes et les conditions de tout accord. Les annonces interdites, frauduleuses ou dangereuses peuvent être retirées.</p>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 px-5 py-8 text-center text-sm text-slate-400">
        <strong className="text-white">FrikChange</strong>
        <p className="mt-2">Service digital d'annonces et de mise en relation.</p>
        <p className="mt-3 text-xs">Version de développement — comptes, annonces et contacts non encore activés.</p>
      </footer>
    </main>
  );
}
