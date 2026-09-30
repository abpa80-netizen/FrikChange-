import React, { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

interface FunnelPublication {
  step1_clicks: number;
  step2_submits: number;
  conversion_rate: number;
}

interface FunnelUnlock {
  step1_clicks: number;
  step2_modal_opens: number;
  step3_chariow_pay_clicks: number;
  modal_open_rate: number;
  pay_rate_from_modal: number;
  overall_conversion_rate: number;
}

interface AnalyticsSummary {
  page_views: number;
  publish_clicks: number;
  publish_submits: number;
  unlock_clicks: number;
  unlock_modal_opens: number;
  unlock_chariow_clicks: number;
}

interface AnalyticsRecentEvent {
  id: string;
  eventName: string;
  source: string;
  device: string;
  annonceRef?: string | null;
  timestamp: string;
}

interface AnalyticsPayload {
  success: boolean;
  summary: AnalyticsSummary;
  funnels: {
    publication: FunnelPublication;
    unlock: FunnelUnlock;
  };
  recentEvents: AnalyticsRecentEvent[];
}

const COLORS_DEVICE = ["#10b981", "#38bdf8", "#f59e0b", "#a855f7"];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [simulating, setSimulating] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Erreur de communication avec le serveur d'analytics");
      const json: AnalyticsPayload = await res.json();
      setData(json);
      setLastRefreshed(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (err: any) {
      console.error("[Recharts Analytics Fetch Error]", err);
      setError(err.message || "Impossible de charger les données analytiques");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();

    // Permettre à app.js de déclencher l'actualisation globale du dashboard
    (window as any).refreshRechartsAnalytics = fetchAnalytics;

    // Déclencher un recalcul des dimensions Recharts en cas de redimensionnement de l'onglet
    const handleResize = () => {
      // Force Recharts ResponsiveContainer update
      window.dispatchEvent(new Event("resize"));
    };
    window.addEventListener("resize", handleResize);

    return () => {
      delete (window as any).refreshRechartsAnalytics;
      window.removeEventListener("resize", handleResize);
    };
  }, [fetchAnalytics]);

  // Simuler un événement en direct pour tester le tracker et les graphiques
  const handleSimulateEvent = async (eventName: string, source: string = "test_simulator") => {
    try {
      setSimulating(true);
      const res = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          source,
          device: window.innerWidth < 768 ? "mobile" : "desktop",
          annonceId: "ANN-DEMO"
        })
      });
      if (res.ok) {
        setSuccessToast(`Événement "${eventName}" enregistré avec succès !`);
        setTimeout(() => setSuccessToast(null), 3000);
        await fetchAnalytics();
      }
    } catch (err) {
      console.error("Simulation error", err);
    } finally {
      setSimulating(false);
    }
  };

  // Initialiser des données de démonstration réalistes
  const handleSeedDemoData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed_demo" })
      });
      if (res.ok) {
        setSuccessToast("Données représentatives initialisées !");
        setTimeout(() => setSuccessToast(null), 3000);
        await fetchAnalytics();
      }
    } catch (err) {
      console.error("Seed error", err);
    } finally {
      setLoading(false);
    }
  };

  const summary = data?.summary || {
    page_views: 0,
    publish_clicks: 0,
    publish_submits: 0,
    unlock_clicks: 0,
    unlock_modal_opens: 0,
    unlock_chariow_clicks: 0,
  };

  const pubFunnel = data?.funnels?.publication || {
    step1_clicks: 0,
    step2_submits: 0,
    conversion_rate: 0,
  };

  const unlFunnel = data?.funnels?.unlock || {
    step1_clicks: 0,
    step2_modal_opens: 0,
    step3_chariow_pay_clicks: 0,
    modal_open_rate: 0,
    pay_rate_from_modal: 0,
    overall_conversion_rate: 0,
  };

  // Données Graphique 1 : Entonnoir Publication
  const pubChartData = [
    {
      step: "1. Clic 'Publier'",
      volume: pubFunnel.step1_clicks,
      taux: 100,
      fill: "#10b981",
    },
    {
      step: "2. Formulaire Soumis",
      volume: pubFunnel.step2_submits,
      taux: pubFunnel.conversion_rate,
      fill: "#059669",
    },
  ];

  // Données Graphique 2 : Entonnoir Déblocage WhatsApp & Paiement Chariow
  const unlockChartData = [
    {
      step: "1. Clic Débloquer",
      volume: unlFunnel.step1_clicks,
      taux: 100,
      fill: "#f59e0b",
    },
    {
      step: "2. Vue Modale Tarifs",
      volume: unlFunnel.step2_modal_opens,
      taux: unlFunnel.modal_open_rate,
      fill: "#d97706",
    },
    {
      step: "3. Clic Paiement",
      volume: unlFunnel.step3_chariow_pay_clicks,
      taux: unlFunnel.overall_conversion_rate,
      fill: "#6366f1",
    },
  ];

  // Données Graphique 3 : Comparatif des Taux de Conversion
  const conversionRatesData = [
    { name: "Conv. Dépôt Annonce", taux: pubFunnel.conversion_rate, fill: "#10b981" },
    { name: "Ouverture Modale Tarifs", taux: unlFunnel.modal_open_rate, fill: "#38bdf8" },
    { name: "Modale ➔ Paiement Chariow", taux: unlFunnel.pay_rate_from_modal, fill: "#f59e0b" },
    { name: "Conv. Globale WhatsApp", taux: unlFunnel.overall_conversion_rate, fill: "#8b5cf6" },
  ];

  // Données Graphique 4 : Répartition par appareil
  const deviceCounts: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
  (data?.recentEvents || []).forEach((e) => {
    const dev = (e.device || "desktop").toLowerCase();
    if (dev.includes("mob")) deviceCounts.mobile = (deviceCounts.mobile || 0) + 1;
    else if (dev.includes("tab")) deviceCounts.tablet = (deviceCounts.tablet || 0) + 1;
    else deviceCounts.desktop = (deviceCounts.desktop || 0) + 1;
  });

  const deviceChartData = [
    { name: "Mobile", value: Math.max(deviceCounts.mobile, deviceCounts.mobile === 0 && deviceCounts.desktop === 0 ? 1 : 0) },
    { name: "Ordinateur", value: Math.max(deviceCounts.desktop, 0) },
    { name: "Tablette", value: Math.max(deviceCounts.tablet, 0) },
  ].filter((d) => d.value > 0);

  // Données Graphique 5 : Synthèse globale du volume
  const activityOverviewData = [
    { name: "Visites", total: summary.page_views, fill: "#38bdf8" },
    { name: "Clics Publier", total: summary.publish_clicks, fill: "#10b981" },
    { name: "Dépôts Validés", total: summary.publish_submits, fill: "#059669" },
    { name: "Clics Débloquer", total: summary.unlock_clicks, fill: "#f59e0b" },
    { name: "Vues Tarifs", total: summary.unlock_modal_opens, fill: "#d97706" },
    { name: "Paiements Chariow", total: summary.unlock_chariow_clicks, fill: "#6366f1" },
  ];

  // Filtrage des événements récents
  const filteredEvents = (data?.recentEvents || []).filter((e) => {
    if (eventFilter === "all") return true;
    if (eventFilter === "publish") return e.eventName.includes("publish");
    if (eventFilter === "unlock") return e.eventName.includes("unlock");
    if (eventFilter === "views") return e.eventName === "page_view";
    return true;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1 backdrop-blur-md">
          <p className="font-bold text-white">{label || payload[0]?.name}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} className="text-slate-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color || item.payload?.fill || "#10b981" }}></span>
              <span>{item.name || "Valeur"} :</span>
              <strong className="text-white font-mono">{item.value}</strong>
              {item.payload?.taux !== undefined && (
                <span className="text-emerald-400 font-bold">({item.payload.taux}%)</span>
              )}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* Toast de confirmation temporaire */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-600/80 text-emerald-200 text-xs flex items-center justify-between shadow-lg animate-bounce">
          <span className="flex items-center gap-2">
            <span>✓</span>
            <strong>{successToast}</strong>
          </span>
          <button type="button" onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Barre d'état & En-tête de contrôle Recharts */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-md shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-black text-white">Tableau de bord des statistiques (Recharts)</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                Tracker Temps Réel
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                100% Anonymisé
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {lastRefreshed ? `Dernière synchronisation à ${lastRefreshed}` : "Chargement des métriques..."} • Taux de conversion des annonces & déblocages WhatsApp
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            title="Rafraîchir les métriques immédiatement"
          >
            <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? "Actualisation..." : "Actualiser"}</span>
          </button>

          <button
            type="button"
            onClick={handleSeedDemoData}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Charger un jeu de données représentatif pour tester la visualisation"
          >
            <span>✨ Données Démo</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Cartes KPI Synthétiques Recharts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : Taux Conversion Annonces Publiées */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Taux Conversion Dépôt</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 flex items-baseline gap-2 mt-1">
            <span>{pubFunnel.conversion_rate}%</span>
            <span className="text-xs font-medium text-slate-400">
              ({pubFunnel.step2_submits}/{pubFunnel.step1_clicks || 0})
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, pubFunnel.conversion_rate)}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Formulaires soumis / Clics initiaux</p>
        </div>

        {/* KPI 2 : Taux Conversion Déblocage WhatsApp */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Taux Conv. WhatsApp</span>
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 flex items-baseline gap-2 mt-1">
            <span>{unlFunnel.overall_conversion_rate}%</span>
            <span className="text-xs font-medium text-slate-400">
              ({unlFunnel.step3_chariow_pay_clicks}/{unlFunnel.step1_clicks || 0})
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, unlFunnel.overall_conversion_rate)}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Vers passerelle Chariow</p>
        </div>

        {/* KPI 3 : Passage de la modale au paiement */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Modale ➔ Paiement</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 flex items-baseline gap-2 mt-1">
            <span>{unlFunnel.pay_rate_from_modal}%</span>
            <span className="text-xs font-medium text-slate-400">
              ({unlFunnel.step3_chariow_pay_clicks}/{unlFunnel.step2_modal_opens || 0})
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, unlFunnel.pay_rate_from_modal)}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Validation après vue des tarifs</p>
        </div>

        {/* KPI 4 : Total Pages Vues */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Audience &amp; Visites</span>
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-300 mt-1">
            {summary.page_views}
          </div>
          <p className="text-[11px] text-slate-400 mt-3">Sessions anonymisées actives</p>
        </div>

      </div>

      {/* Ligne 1 : Les 2 Grands Graphiques Recharts d'Entonnoir */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRAPHIQUE RECHARTS 1 : Entonnoir de Publication d'Annonces */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h4 className="text-xs font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                Recharts : Entonnoir de Publication d'Annonces
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Étape 1 (Clics 'Publier') ➔ Étape 2 (Formulaire Soumis)</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-800">
              {pubFunnel.conversion_rate}% Conversion
            </span>
          </div>

          <div className="w-full h-64 min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pubChartData} margin={{ top: 20, right: 25, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="step" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="volume" name="Nombre d'utilisateurs" radius={[8, 8, 0, 0]} label={{ position: "top", fill: "#ffffff", fontSize: 11, fontWeight: "bold" }}>
                  {pubChartData.map((entry, index) => (
                    <Cell key={`cell-pub-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Clics Déclencheurs</span>
              <strong className="text-emerald-400 font-mono text-sm">{pubFunnel.step1_clicks}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Annonces Validées</span>
              <strong className="text-emerald-300 font-mono text-sm">{pubFunnel.step2_submits}</strong>
            </div>
          </div>
        </div>

        {/* GRAPHIQUE RECHARTS 2 : Entonnoir de Déblocage WhatsApp */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h4 className="text-xs font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                Recharts : Entonnoir Déblocage WhatsApp
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Clic carte ➔ Consultation prix ➔ Passerelle Chariow</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-950 text-amber-300 border border-amber-800">
              {unlFunnel.overall_conversion_rate}% Conv. Globale
            </span>
          </div>

          <div className="w-full h-64 min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unlockChartData} margin={{ top: 20, right: 25, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="step" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="volume" name="Interactions" radius={[8, 8, 0, 0]} label={{ position: "top", fill: "#ffffff", fontSize: 11, fontWeight: "bold" }}>
                  {unlockChartData.map((entry, index) => (
                    <Cell key={`cell-unl-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-xs text-center">
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">1. Clics Débloquer</span>
              <strong className="text-amber-400 font-mono">{unlFunnel.step1_clicks}</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">2. Vues Tarifs</span>
              <strong className="text-amber-300 font-mono">{unlFunnel.step2_modal_opens}</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">3. Clics Chariow</span>
              <strong className="text-indigo-400 font-mono">{unlFunnel.step3_chariow_pay_clicks}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Ligne 2 : Comparatif des Ratios de Conversion & Répartition des Terminaux */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GRAPHIQUE RECHARTS 3 : Taux de Conversion Comparés */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-lg space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h4 className="text-xs font-black text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              Recharts : Comparatif des Ratios d&apos;Engagement &amp; de Conversion (%)
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Taux de rétention et d&apos;efficacité à chaque jalon stratégique</p>
          </div>

          <div className="w-full h-60 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionRatesData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis type="number" domain={[0, 100]} unit="%" stroke="#94a3b8" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={130} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="taux" name="Taux calculé" radius={[0, 6, 6, 0]} label={{ position: "right", fill: "#38bdf8", fontSize: 10, fontWeight: "bold", formatter: (val: any) => `${val}%` }}>
                  {conversionRatesData.map((entry, index) => (
                    <Cell key={`cell-cr-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <span>💡</span>
            <span>Un ratio élevé entre la consultation de la modale et le clic Chariow indique une tarification claire et bien comprise.</span>
          </div>
        </div>

        {/* GRAPHIQUE RECHARTS 4 : Répartition des Terminaux (Donut Chart) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-lg space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h4 className="text-xs font-black text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              Recharts : Terminaux des Visiteurs
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Répartition Mobile vs Ordinateur vs Tablette</p>
          </div>

          <div className="w-full h-48 min-h-[192px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={6}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {deviceChartData.map((_, index) => (
                    <Cell key={`cell-pie-${index}`} fill={COLORS_DEVICE[index % COLORS_DEVICE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-950">
              <span className="text-[10px] text-slate-400 block">Mobile</span>
              <strong className="text-emerald-400 font-mono">{deviceCounts.mobile || 0}</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-950">
              <span className="text-[10px] text-slate-400 block">Ordinateur</span>
              <strong className="text-cyan-400 font-mono">{deviceCounts.desktop || 0}</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-950">
              <span className="text-[10px] text-slate-400 block">Tablette</span>
              <strong className="text-amber-400 font-mono">{deviceCounts.tablet || 0}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Ligne 3 : Volume Global des Actions FrikChange */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              Recharts : Volume Global des Interactions Capturées par le Tracker
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Visites, intentions et actions clés de mise en relation</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Total : {summary.page_views + summary.publish_clicks + summary.publish_submits + summary.unlock_clicks + summary.unlock_chariow_clicks} interactions
          </span>
        </div>

        <div className="w-full h-56 min-h-[224px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityOverviewData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} interval={0} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" name="Volume d'interactions" radius={[6, 6, 0, 0]}>
                {activityOverviewData.map((entry, index) => (
                  <Cell key={`cell-act-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Simulateur d'Événements de Test en Direct */}
      <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">
              Console de Test du Tracker Analytics en Direct
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">Cliquez pour tester et observer la mise à jour immédiate des graphiques Recharts</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            disabled={simulating}
            onClick={() => handleSimulateEvent("page_view", "console_test")}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold transition cursor-pointer"
          >
            + Visite Page
          </button>
          <button
            type="button"
            disabled={simulating}
            onClick={() => handleSimulateEvent("publish_click", "console_test")}
            className="px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-bold transition cursor-pointer"
          >
            + Clic 'Publier'
          </button>
          <button
            type="button"
            disabled={simulating}
            onClick={() => handleSimulateEvent("publish_submit", "console_test")}
            className="px-3 py-1.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-700 text-xs font-bold transition cursor-pointer"
          >
            + Soumission Validée
          </button>
          <button
            type="button"
            disabled={simulating}
            onClick={() => handleSimulateEvent("unlock_click", "console_test")}
            className="px-3 py-1.5 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 text-xs font-bold transition cursor-pointer"
          >
            + Clic 'Débloquer'
          </button>
          <button
            type="button"
            disabled={simulating}
            onClick={() => handleSimulateEvent("unlock_modal_open", "console_test")}
            className="px-3 py-1.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-amber-200 border border-amber-700 text-xs font-bold transition cursor-pointer"
          >
            + Vue Modale Tarifs
          </button>
          <button
            type="button"
            disabled={simulating}
            onClick={() => handleSimulateEvent("unlock_chariow_click", "console_test")}
            className="px-3 py-1.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 text-xs font-bold transition cursor-pointer"
          >
            + Clic Paiement Chariow
          </button>
        </div>
      </div>

      {/* Journal des Derniers Événements Capturés */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              Flux des Événements Anonymes Capturés par le Tracker
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Historique des interactions récentes sans aucune donnée nominative
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setEventFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${eventFilter === "all" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Tous
            </button>
            <button
              type="button"
              onClick={() => setEventFilter("publish")}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${eventFilter === "publish" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Publication
            </button>
            <button
              type="button"
              onClick={() => setEventFilter("unlock")}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${eventFilter === "unlock" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Déblocage
            </button>
            <button
              type="button"
              onClick={() => setEventFilter("views")}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${eventFilter === "views" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Visites
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold text-[11px]">
                <th className="py-2.5 px-3">Date &amp; Heure</th>
                <th className="py-2.5 px-3">Événement Tracker</th>
                <th className="py-2.5 px-3">Source Déclencheur</th>
                <th className="py-2.5 px-3">Appareil</th>
                <th className="py-2.5 px-3">Réf Annonce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                    Aucun événement enregistré dans cette catégorie.
                  </td>
                </tr>
              ) : (
                filteredEvents.slice(0, 15).map((evt) => {
                  let timeFormatted = evt.timestamp;
                  try {
                    timeFormatted = new Date(evt.timestamp).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    });
                  } catch (e) {}

                  let badgeColor = "bg-slate-800 text-slate-300";
                  let eventLabel = evt.eventName;
                  if (evt.eventName === "page_view") {
                    eventLabel = "👁️ Visite page";
                    badgeColor = "bg-slate-800 text-slate-300";
                  } else if (evt.eventName === "publish_click") {
                    eventLabel = "➕ Clic 'Publier une annonce'";
                    badgeColor = "bg-emerald-950 text-emerald-300 border border-emerald-800";
                  } else if (evt.eventName === "publish_submit") {
                    eventLabel = "✅ Annonce soumise avec succès";
                    badgeColor = "bg-emerald-600 text-white font-bold";
                  } else if (evt.eventName === "unlock_click") {
                    eventLabel = "🔓 Clic 'Débloquer WhatsApp'";
                    badgeColor = "bg-amber-950 text-amber-300 border border-amber-800";
                  } else if (evt.eventName === "unlock_modal_open") {
                    eventLabel = "📋 Consultation modale tarifs";
                    badgeColor = "bg-amber-900 text-amber-200";
                  } else if (evt.eventName === "unlock_chariow_click") {
                    eventLabel = "💳 Clic vers paiement Chariow";
                    badgeColor = "bg-indigo-600 text-white font-bold";
                  }

                  return (
                    <tr key={evt.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{timeFormatted}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${badgeColor}`}>
                          {eventLabel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">{evt.source || "inconnue"}</td>
                      <td className="py-2.5 px-3 capitalize text-slate-400">{evt.device || "desktop"}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-cyan-400">{evt.annonceRef || "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
