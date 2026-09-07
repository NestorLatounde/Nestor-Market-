# Nestor Market

Marketplace en ligne connectant chercheurs de services/produits et vendeurs,
dans toutes les communes de tous les pays. Construit avec Next.js
(App Router) et Supabase (base de données, comptes, stockage de fichiers,
temps réel).

## Mise en route

1. Crée un projet sur [supabase.com](https://supabase.com) (gratuit).
2. Dans **SQL Editor**, colle tout le contenu de
   [`supabase/schema.sql`](./supabase/schema.sql) et clique **Run**. Ça crée
   les tables `profiles`, `listings`, `listing_media`, `listing_boosts`,
   `messages`, les règles de sécurité, et le bucket de stockage
   `listing-media` pour les photos et vidéos — en une seule fois.
3. Dans **Project Settings > API**, récupère l'**URL du projet** et la clé
   **anon / public**.
4. Copie `.env.local.example` en `.env.local` et renseigne ces deux valeurs.
5. `npm install` puis `npm run dev` pour tester en local.

## Déploiement (Vercel)

1. Pousse ce dépôt sur GitHub.
2. Sur [vercel.com](https://vercel.com), importe le dépôt.
3. Ajoute les mêmes variables d'environnement que dans `.env.local`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `NEXT_PUBLIC_SITE_URL` avec l'URL Vercel finale).
4. Déploie. Vercel sert automatiquement le site depuis le serveur le plus
   proche de chaque visiteur, partout dans le monde.

## Ce qui fonctionne déjà

- Comptes utilisateurs par lien magique (pas de mot de passe)
- Publication d'annonces (services et produits), stockées en base
- Recherche par mot-clé, par type, par pays (195 pays), et par commune
- **Repli intelligent** : si aucune annonce n'existe exactement dans la
  commune recherchée, le site propose automatiquement les résultats de la
  commune la plus proche, calculée par vraie distance GPS (formule de
  haversine, exécutée côté base de données)
- Détection de position (avec l'accord du visiteur) pour pré-remplir pays et
  commune, à la publication comme à la recherche
- **Photos et vidéos** sur chaque annonce (jusqu'à 6 fichiers, galerie sur la
  page de l'annonce, vignette de couverture dans la liste), stockées via
  Supabase Storage
- **Annonces mises en avant** (boostées) : colonnes et table prêtes en base,
  triées en tête de liste ; l'activation reste verrouillée côté serveur tant
  que le paiement (Stripe) n'est pas branché, pour éviter qu'un vendeur se
  boost lui-même gratuitement
- Messagerie par annonce, mise à jour en temps réel (Supabase Realtime)

## Pistes d'évolution

- **Paiement des mises en avant** : brancher Stripe Checkout, puis activer
  `is_featured` uniquement via une route serveur utilisant la clé
  `service_role`, après confirmation du paiement.
- **Conversations privées** : aujourd'hui, le fil de messages d'une annonce
  est public entre tous les utilisateurs connectés (comme un espace
  questions/réponses). Passer à des conversations privées acheteur ↔ vendeur
  demande une table de conversations dédiée.
- **Avis et notation** des vendeurs.
- **Autocomplétion des communes** : la recherche compare aujourd'hui du texte
  libre ; brancher une API de communes donnerait une saisie assistée.
