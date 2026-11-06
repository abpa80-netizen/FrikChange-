# FrikChange — plan de migration du service de mise en relation

## Positionnement validé
FrikChange est un service digital de publication d'offres et de demandes et de mise en relation entre utilisateurs autour de deux sujets :
1. Monnaie numérique : annonces d'offre ou de demande et prise de contact entre utilisateurs.
2. Colis : annonces de proposition ou de demande de mise en relation au sujet d'un trajet et d'un colis.

FrikChange ne calcule pas de taux de conversion, ne reçoit ni ne conserve de fonds, n'exécute aucun paiement, transfert ou échange, ne reçoit ni ne transporte de colis et ne garantit pas les accords entre utilisateurs. Cette description du rôle technique ne constitue pas une conclusion sur les obligations légales applicables ; le lancement public doit faire l'objet d'une vérification juridique et de conformité adaptée au Maroc.

## Phase 1 — nettoyage initial
- Ancienne interface et ancien script client généraliste retirés de l'entrée publique.
- Anciennes API héritées de taux de change, support financier/voyageurs, marketing, annonces officielles non protégées et analytics locale supprimées.
- Anciennes routes API associées retirées de `server.ts`.
- Tableau de bord d'analytics de démonstration supprimé.
- Service worker historique remplacé par un script de retrait des anciens caches et de désinscription.
- Les anciennes tables Supabase `currency_listings` et `travel_listings` n'ont pas été modifiées.

## Phase 2 — interface réorientée dans la branche de travail
- Page d'accueil et métadonnées réorientées vers FrikChange.
- Deux rubriques uniquement : `Monnaie numérique` et `Colis`.
- Présentation explicite du parcours : publier, rechercher, prendre contact.
- Limites du service affichées clairement : aucune conversion calculée, aucun fonds reçu ou transféré, aucun paiement exécuté, aucun colis reçu ou transporté, aucune garantie des accords.
- Publication et contact restent désactivés tant que l'authentification, les données, la confidentialité et la modération ne sont pas intégrées et testées.

## Architecture à préparer — sans migration exécutée
- Créer une table distincte `community_listings` ; ne pas réutiliser les tables héritées `currency_listings` et `travel_listings` sans audit et décision explicite.
- Champs à concevoir : propriétaire, catégorie limitée à `DIGITAL_CURRENCY` ou `PARCEL_CONNECTION`, type `OFFER` ou `REQUEST`, titre, description, pays/ville, champs contextuels strictement nécessaires, statut de modération, dates.
- Ne jamais exposer publiquement le numéro de téléphone ou les coordonnées privées. Concevoir la prise de contact avec consentement explicite et accès contrôlé.
- RLS obligatoire : lecture publique limitée aux annonces publiées et non expirées ; lecture/édition propriétaire limitée à `auth.uid()` ; création avec propriétaire authentifié et statut initial contrôlé ; modération réservée à un rôle serveur de confiance.
- Ne jamais exposer la clé Supabase `service_role` au navigateur. Ne pas utiliser `user_metadata` comme autorité d'administration.
- Ajouter signalement, blocage, limites anti-spam, journal de modération et règles de conservation minimales.

## Vérifications avant toute mise en production
- Inspecter les fichiers résiduels et les dépendances avant réintroduction.
- Exécuter build, lint et tests automatisés.
- Tester avec au moins deux comptes distincts : isolation des annonces, accès public, édition, suppression, confidentialité et modération.
- Vérifier les règles de sécurité Supabase et le parcours de contact.
- Faire vérifier les obligations locales applicables avant toute ouverture publique.

## État et préservation
- Changements conservés sur la branche `mvp-community` et proposés dans la PR de revue.
- Aucune fusion vers `main`, aucune migration Supabase, aucune modification des variables Vercel, du domaine ou du projet Vercel, aucun déploiement.
- Le dépôt contient encore des éléments historiques non nécessairement utilisés par la nouvelle interface ; ne pas considérer l'ensemble du dépôt comme purgé.
- Aucun build, test navigateur ou test multi-comptes n'est revendiqué pour cette étape.

## Audit Supabase en lecture seule — 6 novembre 2026
Projet contrôlé : `hykhktrkziotifcsufge`.
- La table cible `community_listings` n'existe pas encore.
- La table historique `public.listings` contient 3 lignes et mélange des champs hérités de monnaie (montants/devises), de voyageurs/colis et des coordonnées WhatsApp. Elle ne convient pas comme base publique de la nouvelle interface sans refonte et contrôle de confidentialité.
- Les tables `currency_listings` et `travel_listings` existent mais sont vides (0 ligne chacune) ; elles restent inchangées et ne seront pas réutilisées pour la nouvelle architecture.
- Les anciennes tables `transactions`, `commissions`, `pricing_tiers` et `payment_events` appartiennent à l'ancienne logique de paiement/déblocage. Elles ne doivent pas être appelées par le nouveau parcours.
- Les tables publiques contrôlées disposent de politiques RLS existantes ; aucune nouvelle table n'a été créée et aucune donnée n'a été modifiée pendant cet audit.

## Proposition de modèle de données — à valider avant migration
Créer une table distincte `public.community_listings` avec :
- `id` UUID, `owner_id` UUID FK vers `auth.users`, `category` limitée à `DIGITAL_CURRENCY` / `PARCEL_CONNECTION`, `listing_type` limité à `OFFER` / `REQUEST`.
- `title` (2–100 caractères), `description` (10–2000 caractères), `country`, `city`, `created_at`, `updated_at`, `expires_at`.
- Données contextuelles non financières et minimales : pour les annonces monnaie numérique, uniquement la nature du besoin et le contexte géographique ; aucun champ de taux, montant, devise contre-devise, coordonnées de paiement ou statut de transaction. Pour les annonces colis, uniquement origine/destination et dates indicatives ; aucun paiement, frais, prix, prise en charge ou confirmation d'acheminement par FrikChange.
- `status` contrôlé côté serveur : `PENDING`, `PUBLISHED`, `PAUSED`, `REJECTED`, `EXPIRED`. Le propriétaire ne peut ni publier lui-même ni changer le statut de modération.
- Pas de numéro WhatsApp dans les champs publics. La prise de contact doit être une fonction séparée, consentie, protégée et auditée, après décision sur le mécanisme de confidentialité.

### Contrôles SQL attendus
- RLS activée ; SELECT public uniquement pour les annonces `PUBLISHED` et non expirées ; SELECT propriétaire pour ses propres annonces ; INSERT authentifié avec `owner_id = auth.uid()` et statut forcé à `PENDING` ; UPDATE avec politiques SELECT préalable, `USING` et `WITH CHECK` propriétaires ; DELETE propriétaire.
- Trigger `SECURITY INVOKER` pour protéger les champs immuables et la transition des statuts ; pas de fonction `SECURITY DEFINER` publique.
- Accorder explicitement les privilèges Data API requis après vérification des paramètres du projet : depuis le 30 octobre 2026, les nouvelles tables ne sont plus exposées automatiquement à la Data API. Les GRANT et RLS sont deux contrôles complémentaires.
- Aucun accès client à `service_role`. Le rôle de modérateur doit être établi côté serveur avec une source d'autorité non modifiable par l'utilisateur.
- Ajouter une table privée séparée pour les signalements et une table privée pour les demandes de contact uniquement si nécessaire, avec politiques minimales et aucun accès public.

**Aucune de ces propositions n'a encore été appliquée à Supabase.**
