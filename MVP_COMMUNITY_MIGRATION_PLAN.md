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
