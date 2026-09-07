# Nestor Market

Marketplace en ligne connectant chercheurs de services/produits et vendeurs,
dans toutes les communes de tous les pays. Construit avec Next.js
(App Router) et Supabase (base de données, comptes, stockage de fichiers,
temps réel).

## Mise en route

1. Crée un projet sur supabase.com (gratuit).
2. Dans SQL Editor, colle tout le contenu de `supabase/schema.sql` et clique Run.
3. Dans Project Settings > API, récupère l'URL du projet et la clé anon / public.
4. Copie `.env.local.example` en `.env.local` et renseigne ces deux valeurs.
5. `npm install` puis `npm run dev` pour tester en local.

## Déploiement (Vercel)

1. Pousse ce dépôt sur GitHub.
2. Sur vercel.com, importe le dépôt.
3. Ajoute les mêmes variables d'environnement que dans `.env.local`.
4. Déploie.

## Ce qui fonctionne déjà

- Comptes utilisateurs par lien magique
- Publication d'annonces (services et produits)
- Recherche par mot-clé, type, pays (195 pays) et commune
- Repli sur la commune la plus proche par vraie distance GPS
- Photos et vidéos par annonce
- Annonces mises en avant (boostées), prêtes en base
- Messagerie par annonce en temps réel
