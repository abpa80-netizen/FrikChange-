# FrikChange — plan de migration MVP communautaire

## Objectif
Préparer une version publique de petites annonces communautaires générales. Les annonces d'échange de monnaie, de change, de transfert d'argent, de transport de bagages/colis et les services de voyageurs sont exclus du MVP. Aucun paiement, déblocage de contact payant, commission ou rémunération de parrainage n'est activé.

## Phase 1 — nettoyage initial effectué sur la branche de travail
- Remplacement de l'ancien `index.html` par une entrée React propre.
- Remplacement de l'ancienne interface par une page communautaire avec catégories générales et recherche locale de catégories.
- Le navigateur ne charge plus l'ancien `app.js`; le script n'est plus copié dans `dist`, puis le fichier historique a été supprimé.
- Suppression des API héritées : marketing, annonces officielles non protégées, analytics locale/démo, taux de change et support qui décrivait les services financiers et voyageurs.
- Nettoyage de `server.ts` : retrait des routes API héritées et du catalogue de lieux de rencontre issu de l'ancien parcours.
- Retrait du tableau de bord React d'analytics de démonstration qui dépendait de l'ancienne API.
- Les tables Supabase `currency_listings` et `travel_listings` n'ont pas été modifiées.

## Fichiers principaux modifiés
`index.html`, `src/App.tsx`, `src/main.tsx`, `src/index.css`, `server.ts`, `package.json`.
Ancien `app.js` supprimé. Ancien `src/components/AnalyticsDashboard.tsx` supprimé.
Le service worker historique a été remplacé par un script de retrait qui vide les caches puis se désenregistre ; le manifeste PWA a été actualisé. Les anciens fichiers HTML autonomes et l'archive source présents dans les assets publics ont été supprimés.

API supprimées : `api/admin-generate-marketing.js`, `api/admin-publish-announcement.js`, `api/analytics.js`, `api/exchange-rates.js`, `api/support-chat.js`.

## Limites importantes — application non publiable à ce stade
- L'interface affiche des catégories, mais ne présente pas encore d'annonces issues d'une base de données.
- Authentification, publication, édition/suppression, recherche dans les annonces, signalement et modération ne sont pas encore implémentés.
- Le formulaire de compte et les actions de publication ne sont donc pas activés.
- Les fichiers d'administration/analytics hérités non montés peuvent encore exister dans le dépôt et doivent être vérifiés avant de les réintroduire.
- Aucun build local, test navigateur ou test multi-comptes n'a été exécuté dans cette étape. Aucun workflow CI GitHub n'a été trouvé pour le commit contrôlé.
- Aucune migration Supabase, modification des variables Vercel, modification du domaine, fusion ou déploiement n'a été effectué.

## Étapes suivantes
1. Vérifier les références et fichiers résiduels, puis exécuter build/lint.
2. Concevoir une table séparée `community_listings` avec RLS, validations et statuts de modération.
3. Connecter Supabase Auth et implémenter les opérations CRUD, sans exposer de clé service_role.
4. Ajouter signalements, blocage, modération serveur et protection des données personnelles.
5. Tester deux comptes distincts, les accès publics, l'isolation des propriétaires et les cas abusifs.
6. Préparer un déploiement de prévisualisation seulement après réussite des tests.

## Préservation
Le travail reste sur `mvp-community`. La branche `main`, le projet Supabase, les variables Vercel, le domaine et la production n'ont pas été modifiés.
