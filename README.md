# Raiatea Rental Car - SaaS Multi-tenant

Plateforme de gestion de location de voitures et bungalows (SaaS B2B).
Architecture moderne Multi-tenant sécurisée par Row Level Security (RLS).

## 🚀 Architecture Technique

- **Frontend** : React + TypeScript + Vite
- **Backend / DB** : Supabase (Postgres)
- **Sécurité** : RLS (Row Level Security) avec isolation par `company_id`
- **Déploiement** : Render (Static Site)

## 🛠 Installation & Développement

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer l'environnement**
   Copier `.env.example` vers `.env` et ajouter vos clés Supabase.

3. **Lancer en local**
   ```bash
   npm run dev
   ```

## 📦 Migration Multi-tenant

L'application utilise une base de données unique partagée. L'isolation des données entre les sociétés (Tenants) est assurée par le script SQL `scripts/migrate-to-multitenant.sql`.

Pour initialiser une nouvelle base de données :
1. Exécuter les scripts de création de tables standards.
2. Exécuter `scripts/migrate-to-multitenant.sql` pour activer l'architecture SaaS.

## ☁️ Déploiement sur Render

Ce projet est configuré pour un déploiement automatique sur [Render](https://render.com).

1. Connecter votre repo GitHub à Render.
2. Créer un nouveau "Static Site".
3. Render détectera automatiquement la configuration dans `render.yaml`.
4. **Important** : Ajouter les variables d'environnement dans le dashboard Render :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
