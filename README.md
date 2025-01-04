# Raiatea Rent Car - Système de Gestion de Location

## Description
Application web de gestion pour "Raiatea Rent Car", permettant la gestion des locations de véhicules et de bungalows. Développée avec React, TypeScript, et Supabase.

## Fonctionnalités
- 🚗 Gestion des véhicules
- 🏠 Gestion des bungalows
- 👥 Gestion des clients
- 📅 Système de réservation
- 💰 Système de facturation
- 🔐 Authentification et gestion des rôles

## Configuration Technique

### Prérequis
- Node.js (v18+)
- npm ou yarn
- Compte Supabase

### Variables d'Environnement
Créez un fichier `.env` avec :
```env
VITE_SUPABASE_URL=https://qskctvadactgyeguosag.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon
VITE_APP_NAME="Raiatea Rent Car"
VITE_APP_VERSION="1.0.0"
```

### Installation
1. Clonez le repository
2. Installez les dépendances :
```bash
npm install
```
3. Lancez l'application :
```bash
npm run dev
```

### Configuration de la Base de Données
1. Exécutez les scripts SQL dans l'ordre :
   - `scripts/complete-setup.sql`
   - `scripts/add-invoicing.sql`

### Accès Initial
- Email : admin@raiatea-rentcar.com
- Mot de passe : Admin123!

## Structure du Projet

### Frontend
```
src/
├── components/     # Composants React
├── hooks/         # Hooks personnalisés
├── lib/           # Configuration et utilitaires
├── pages/         # Pages de l'application
├── types/         # Types TypeScript
└── styles/        # Styles CSS
```

### Base de Données
Tables principales :
- profiles
- vehicles
- bungalows
- clients
- reservations
- invoices
- payments
- invoice_items
- company_settings

## Sécurité
- Row Level Security (RLS) configuré
- Politiques d'accès par rôle (admin, staff)
- Authentification Supabase

## Prochaines Étapes
- [ ] Interface de gestion des véhicules
- [ ] Interface de gestion des bungalows
- [ ] Système de réservation
- [ ] Système de facturation complet
- [ ] Rapports et tableaux de bord
- [ ] Génération de PDF pour les factures

## Support
Pour toute question ou assistance :
- Créez une issue dans le repository
- Contactez l'équipe de développement

## Licence
Tous droits réservés - Raiatea Rent Car 2025
