# FrikChange — suivi de migration vers le service d'annonces et de mise en relation

## Positionnement validé
FrikChange permet uniquement de publier des offres et des demandes et de faciliter une mise en relation entre utilisateurs autour de deux rubriques :
1. **Monnaie numérique** : annonces d'offre ou de demande et prise de contact entre utilisateurs.
2. **Colis** : annonces de proposition ou de demande de mise en relation au sujet d'un trajet et d'un colis.

FrikChange ne calcule pas de taux de conversion, ne reçoit ni ne conserve de fonds, n'exécute aucun paiement, transfert ou échange, ne reçoit ni ne transporte de colis et ne garantit pas les accords entre utilisateurs. Cette description technique ne constitue pas une conclusion sur les obligations légales applicables ; le lancement public doit faire l'objet d'une vérification juridique et de conformité adaptée au Maroc.

## Phase 1 — nettoyage initial
- Ancienne interface et ancien script client généraliste retirés de l'entrée publique.
- Anciennes API héritées de taux de change, support financier/voyageurs, marketing, annonces officielles non protégées et analytics locale supprimées.
- Anciennes routes API associées retirées de `server.ts`.
- Tableau de bord d'analytics de démonstration supprimé.
- Service worker historique remplacé par un script de retrait des anciens caches et de désinscription.
- Des éléments historiques peuvent encore subsister dans le dépôt ; le dépôt entier ne doit pas être considéré comme purgé.

## Phase 2 — interface réorientée
- Page d'accueil et métadonnées réorientées vers FrikChange.
- Deux rubriques uniquement : `DIGITAL_CURRENCY` et `PARCEL_CONNECTION`.
- Parcours présenté : publier, rechercher, prendre contact.
- Limites du service affichées clairement : aucune conversion calculée, aucun fonds reçu ou transféré, aucun paiement exécuté, aucun colis reçu ou transporté, aucune garantie des accords.

## Phase 3 — table Supabase et RLS
Migration `create_community_listings_with_rls` appliquée au projet Supabase `hykhktrkziotifcsufge`.
- Table distincte `public.community_listings` créée ; aucune table historique ni aucune ligne existante modifiée.
- Catégories autorisées : `DIGITAL_CURRENCY` et `PARCEL_CONNECTION` ; type : `OFFER` ou `REQUEST`.
- Aucun numéro WhatsApp, montant, paire de devises, taux ou coordonnées de paiement dans les colonnes.
- Les annonces colis utilisent uniquement villes d'origine/destination et date indicative.
- Statut initial imposé à `PENDING` par trigger ; le propriétaire ne peut pas modifier lui-même le statut de modération.
- RLS activée ; lecture anonyme limitée aux annonces publiées non expirées ; utilisateurs authentifiés limités à leurs propres créations/éditions/suppressions ; privilèges Data API explicites et minimaux.
- Trigger `SECURITY INVOKER`, `search_path` vide ; exécution directe de la fonction révoquée aux rôles client.
- Vérification SQL antérieure : RLS active, cinq politiques attendues présentes, un trigger présent, table vide à ce moment.
- Les tables historiques `currency_listings`, `travel_listings`, `transactions`, `commissions`, `pricing_tiers` et `payment_events` ne sont pas utilisées par ce nouveau parcours.

## Phase 4 — intégration frontend Supabase (branche de travail)
- Ajout de `src/lib/supabase.ts` pour initialiser le client navigateur avec uniquement l'URL et la clé publique anon/publishable.
- Configuration Vite pour lire les noms de variables existants `SUPABASE_URL` et `SUPABASE_ANON_KEY`, avec prise en charge des variantes `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`. Seules l'URL et la clé publique sont injectées dans le bundle navigateur.
- Vérification Vercel en lecture seule (sans déchiffrement) : les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` existent en Production ; `SUPABASE_URL` et `SUPABASE_ANON_KEY` existent en Production/Preview ; `SUPABASE_SERVICE_ROLE_KEY` est une variable secrète distincte. Aucune variable n'a été modifiée.
- `SUPABASE_SERVICE_ROLE_KEY` n'est jamais lue ni injectée dans Vite ou le code client.
- Inscription et connexion par e-mail/mot de passe via Supabase Auth ; le message d'interface précise que la confirmation e-mail peut être requise selon les réglages Auth du projet.
- Consultation publique des annonces `PUBLISHED` non expirées, avec recherche et filtres.
- Espace connecté : création d'annonces, consultation de ses propres annonces (y compris en attente), modification du titre/de la description/de la ville et suppression.
- Le client ne choisit jamais le statut de modération ; la création est soumise au trigger avec le statut `PENDING`.
- Les champs de contact privés ne sont pas affichés et aucun parcours de contact direct n'est activé dans cette phase.
- Aucune nouvelle table, politique RLS ou modification de données Supabase n'a été demandée ni exécutée pendant cette phase.
- Aucun test de build, typecheck, navigateur, Auth réel ou test multi-comptes n'est encore revendiqué. L'intégration doit être vérifiée avant toute activation publique.

## Sécurité et vérifications restantes
- Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` dans le navigateur, dans les variables `VITE_*`, dans le dépôt ou dans les journaux.
- RLS reste la frontière de sécurité ; l'interface seule ne fait pas autorité.
- Tester Auth avec confirmation e-mail et récupération de session.
- Tester deux comptes distincts : isolation des annonces personnelles, lecture publique, édition, suppression et statut PENDING imposé.
- Tester les contraintes de catégorie et de champs colis/monnaie avec des entrées valides et invalides.
- Prévoir une modération de confiance, le signalement et les protections anti-spam avant ouverture plus large.
- Le contact direct doit faire l'objet d'une conception séparée, avec consentement et contrôle d'accès ; ne pas exposer les coordonnées privées dans le flux public.
- Faire vérifier les obligations locales applicables au Maroc avant le lancement public.

## État de livraison et limites d'autorisation
- Les changements de code de ces phases sont conservés sur la branche `mvp-community` et proposés dans la PR de revue.
- Aucune fusion vers `main`, aucune modification des variables Vercel, du domaine ou du projet Vercel, aucun déploiement.
- Les tables historiques Supabase et les autres projets Supabase sont laissés inchangés.
- Les phases frontend et base de données ne sont pas considérées comme validées en production tant que les tests réels ci-dessus ne sont pas passés.
