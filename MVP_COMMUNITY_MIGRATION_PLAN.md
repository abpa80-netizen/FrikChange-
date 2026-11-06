# FrikChange — plan de migration MVP communautaire

## Objectif
Préparer une version publique de petites annonces communautaires générales. Les annonces d'échange de monnaie, de change, de transfert d'argent, de transport de bagages/colis et les services de voyageurs sont exclus du MVP. Aucun paiement, déblocage de contact payant, commission ou rémunération de parrainage n'est activé.

## Périmètre vérifié sur la branche `mvp-community`
- `index.html` contient encore les entrées de navigation Voyageurs GP, Simulateur, Ambassadeurs, des contenus sur les devises et Chariow, ainsi que la section de transport GP.
- `app.js` contient encore l'URL Google Apps Script, les paramètres de taux, les promotions Chariow/GP, l'administration locale et des données de démonstration.
- `api/support-chat.js` contient des instructions Chariow, échange de devises et transport GP.
- `api/analytics.js` utilise des fichiers locaux, expose les actions `seed_demo` et `reset`, et suit des événements de déblocage Chariow.
- `api/admin-publish-announcement.js` utilise un stockage local de secours et les routes POST/DELETE n'ont pas de contrôle d'accès administrateur visible dans le fichier inspecté.
- `server.ts` monte les anciennes API.
- `package.json` utilise Vite et copie `app.js` dans `dist`. Aucun `vercel.json` n'existe à la racine au moment de l'inspection.

## Règles de migration
1. Ne pas simplement cacher les anciennes rubriques : retirer les actions, handlers, routes et traitements côté serveur correspondants.
2. Ne pas réutiliser les tables `currency_listings` et `travel_listings` dans le MVP.
3. Créer une table distincte pour les annonces communautaires générales, avec RLS et tests d'isolation.
4. Supprimer toute dépendance de publication aux Google Apps Script et au stockage local navigateur pour les annonces partagées.
5. Retirer les paiements, les commissions, les déblocages de contacts et les faux indicateurs de démonstration.
6. Remplacer l'administration locale par un contrôle serveur fondé sur un rôle fiable.
7. Préserver les variables d'environnement, le projet Vercel et le domaine ; ne pas déployer avant les tests et la revue.

## Ordre de travail proposé
- Étape A : inventorier et retirer les sections HTML et les fonctions JS financières/GP/parrainage.
- Étape B : retirer ou neutraliser les API Chariow, exchange-rates, GP et les endpoints d'administration non sécurisés.
- Étape C : implémenter le modèle communautaire Supabase, l'authentification, les politiques RLS et les opérations CRUD.
- Étape D : implémenter la modération, les signalements, la confidentialité et les statistiques réelles.
- Étape E : exécuter build, lint, tests multi-comptes et tests de sécurité avant toute demande de déploiement.

## État
Branche de travail créée depuis `main`. Ce document est un plan d'audit ; aucun code applicatif, aucune donnée Supabase, aucun secret Vercel, aucun domaine et aucun déploiement n'ont été modifiés.
