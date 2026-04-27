# Location Habitat

Plateforme web de location immobilière conçue pour le marché québécois. Les utilisateurs peuvent consulter des annonces, publier leurs propres biens, gérer leurs favoris et échanger des messages directement avec les propriétaires.

Projet personnel développé dans le but d'explorer une architecture full-stack moderne avec un frontend Angular récent et un backend Java microservices.

**Démo en ligne :** [maps-5995c.web.app](https://maps-5995c.web.app/)

---

## Aperçu

Voir les captures d'écrans dans le dossier screenshots

---

## Stack technique

**Frontend**
- Angular 21 (standalone components, lazy loading des routes)
- Angular Material
- Signal Forms (`@angular/forms/signals`) pour la validation des formulaires
- Leaflet + OpenStreetMap (Nominatim) pour la cartographie et le géocodage
- RxJS pour la gestion asynchrone

**Backend** — Architecture microservices
- Spring Boot 4.0.4, Java 17
- Spring Security + JWT (HS256)
- Spring Data JPA + Hibernate
- Liquibase pour les migrations de schéma
- PostgreSQL
- Spring Mail (envoi des emails de réinitialisation)

**Infrastructure**
- Frontend déployé sur Firebase Hosting
- Services backend conteneurisés (Docker) et déployés sur Render
- Base de données PostgreSQL hébergée sur Supabase

---

## Architecture

```
┌──────────────────────────────┐
│  Frontend Angular            │
│  (Firebase Hosting)          │
└──────────────┬───────────────┘
               │ HTTP + JWT Bearer
       ┌───────┴────────┐
       ▼                ▼
┌──────────────┐  ┌──────────────────┐
│ auth-service │  │ business-service │
│  (Render)    │  │    (Render)      │
└──────┬───────┘  └────────┬─────────┘
       │                   │
       ▼                   ▼
   ┌───────────────────────────┐
   │  PostgreSQL (Supabase)    │
   │  2 schémas isolés         │
   └───────────────────────────┘
```

Les deux services partagent uniquement le secret JWT. Le `business-service` ne consulte pas la base d'authentification : il décode le JWT et en extrait l'identité de l'utilisateur (`authUserId`, `email`).

### auth-service
Gestion des comptes utilisateurs, authentification JWT, réinitialisation de mot de passe par email.

### business-service
Gestion des annonces (création, modification, activation, vues), de la messagerie entre utilisateurs et de l'upload des photos.

---

## Fonctionnalités

**Pour les visiteurs**
- Consultation publique des annonces actives
- Filtres de recherche : mot-clé, fourchette de prix
- Visualisation de la localisation sur une carte
- Pages statiques (À propos, FAQ, Conditions, etc.)

**Pour les utilisateurs connectés**
- Inscription, connexion, mot de passe oublié
- Création et gestion de leurs propres annonces (jusqu'à activation/désactivation et suppression)
- Upload de plusieurs photos par annonce
- Géocodage automatique de l'adresse avec retour qualité (exact / approximatif / vague)
- Système de favoris persisté localement
- Messagerie interne (boîte de réception, marquage lu/non lu, suppression)
- Modification du profil avec confirmation par mot de passe

---

## Structure du dépôt

```
LocationHabitat/
├── src/                          # Application Angular
│   ├── app/
│   │   ├── core/                 # Services, guards, interceptors, utils
│   │   ├── features/             # Pages organisées par domaine métier
│   │   ├── models/               # Interfaces TypeScript
│   │   └── shared/               # Composants, pipes, validators réutilisables
│   ├── assets/
│   └── environments/
├── backend/
│   ├── auth-service/             # Microservice d'authentification
│   │   └── src/main/java/.../authservice/
│   │       ├── controller/       # Endpoints REST
│   │       ├── service/          # Logique métier
│   │       ├── entity/           # Entités JPA
│   │       ├── repository/       # Repositories Spring Data
│   │       ├── security/         # JWT filter, UserDetailsService
│   │       └── dto/
│   └── business-service/         # Microservice métier (annonces, messages)
└── README.md
```

---

### Prérequis
- Node.js 20+ et npm
- JDK 17
- Maven 3.9+ (ou utiliser le wrapper `mvnw` fourni)
- PostgreSQL 14+ (deux bases : `location_auth_liquibase_db` et `location_business_liquibase_db`)
- Compte SMTP (Mailtrap recommandé pour le développement)

### 1. Bases de données

```sql
CREATE DATABASE location_auth_liquibase_db;
CREATE DATABASE location_business_liquibase_db;
```

Les schémas sont créés automatiquement au démarrage des services via Liquibase.

### 2. auth-service

```bash
cd backend/auth-service

# Variables d'environnement minimales
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/location_auth_liquibase_db
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=postgres
export JWT_SECRET=$(openssl rand -base64 48)
export SPRING_MAIL_USERNAME=votre_user_mailtrap
export SPRING_MAIL_PASSWORD=votre_password_mailtrap

./mvnw spring-boot:run
# Service disponible sur http://localhost:8081
```

### 3. business-service

```bash
cd backend/business-service

export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/location_business_liquibase_db
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=postgres
export JWT_SECRET=<le_même_secret_que_auth-service>
export APP_BASE_URL=http://localhost:8082

./mvnw spring-boot:run
# Service disponible sur http://localhost:8082
```

> **Important** : `JWT_SECRET` doit être strictement identique sur les deux services pour que les tokens soient validés par `business-service`.

### 4. Frontend

```bash
npm install

# Adapter src/environments/environment.ts pour pointer vers le local :
# authApiUrl: 'http://localhost:8081/api/auth'
# businessApiUrl: 'http://localhost:8082/api'

npm start
# Application disponible sur http://localhost:4200
```

---

## Variables d'environnement

### auth-service

| Variable | Description | Défaut |
|----------|-------------|--------|
| `PORT` | Port HTTP | `8081` |
| `SPRING_DATASOURCE_URL` | URL JDBC PostgreSQL | local |
| `SPRING_DATASOURCE_USERNAME` | Utilisateur DB | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Mot de passe DB | `postgres` |
| `JWT_SECRET` | Secret de signature JWT (minimum 32 caractères) | placeholder |
| `JWT_EXPIRATION` | Durée de vie du token en millisecondes | `86400000` (24h) |
| `SPRING_MAIL_HOST` / `PORT` / `USERNAME` / `PASSWORD` | Configuration SMTP | Mailtrap |
| `APP_FRONTEND_RESET_PASSWORD_URL` | URL de la page de reset côté frontend | local |
| `APP_CORS_ALLOWED_ORIGINS` | Origines autorisées (séparées par virgules) | `http://localhost:4200` |

### business-service

| Variable | Description | Défaut |
|----------|-------------|--------|
| `PORT` | Port HTTP | `8082` |
| `SPRING_DATASOURCE_URL` | URL JDBC PostgreSQL | local |
| `JWT_SECRET` | Doit être identique à celui de `auth-service` | placeholder |
| `APP_UPLOAD_DIR` | Répertoire de stockage des images uploadées | `uploads` |
| `APP_BASE_URL` | URL publique du service (utilisée pour générer les URLs des images) | `http://localhost:8082` |
| `APP_CORS_ALLOWED_ORIGINS` | Origines autorisées | `http://localhost:4200` |

---

## API REST — vue d'ensemble

### auth-service (`/api/auth`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/register` | — | Création de compte |
| POST | `/login` | — | Connexion, retourne un JWT |
| POST | `/forgot-password` | — | Envoi d'un email de réinitialisation |
| POST | `/reset-password` | — | Réinitialisation via token |
| GET | `/me` | JWT | Profil de l'utilisateur courant |
| PUT | `/me` | JWT | Modification du profil (requiert mot de passe actuel) |

### business-service (`/api`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/announcements` | — | Liste des annonces actives (filtre `?ownerId=`) |
| GET | `/announcements/{id}` | — | Détail d'une annonce |
| POST | `/announcements/{id}/views` | — | Incrémenter le compteur de vues |
| POST | `/announcements` | JWT | Créer une annonce |
| PUT | `/announcements/{id}` | JWT (owner) | Modifier une annonce |
| PATCH | `/announcements/{id}/toggle-active` | JWT (owner) | Activer/désactiver |
| DELETE | `/announcements/{id}` | JWT (owner) | Supprimer |
| GET | `/announcements/my` | JWT | Mes annonces |
| GET | `/announcements/{id}/owner` | JWT (owner) | Récupérer une annonce dont je suis propriétaire |
| POST | `/uploads/images` | JWT | Upload multipart d'images (max 5 MB par fichier) |
| POST | `/messages` | JWT | Envoyer un message au propriétaire d'une annonce |
| GET | `/messages/inbox` | JWT | Messages reçus |
| GET | `/messages/sent` | JWT | Messages envoyés |
| PATCH | `/messages/{id}/read` | JWT (recipient) | Marquer comme lu |
| DELETE | `/messages/{id}` | JWT (sender ou recipient) | Supprimer |

---

## Modèle de données

**auth-service**
- `users` — informations du compte, mot de passe hashé en BCrypt
- `password_reset_tokens` — token UUID, expiration 1h, à usage unique

**business-service**
- `announcements` — annonces immobilières, l'identifiant du propriétaire est l'`authUserId` issu du JWT (pas de clé étrangère cross-database)
- `messages` — messagerie liée à une annonce, suppression en cascade si l'annonce est supprimée

Les schémas évoluent par migrations Liquibase versionnées (`db/changelog/`).

---

## Sécurité

- Mots de passe hashés en **BCrypt**
- JWT signé en **HMAC-SHA256**, durée de vie 24h
- CORS strictement configuré côté backend
- CSRF désactivé (API stateless, pas de cookies de session)
- Validation Bean Validation (`jakarta.validation`) sur les DTOs entrants
- Autorisations métier vérifiées au niveau service (un utilisateur ne peut modifier ou supprimer que ses propres ressources)
- Le secret JWT n'est jamais commit dans le code, il doit être fourni via variable d'environnement

---

## Choix techniques notables

**Signal Forms** — Le frontend utilise la nouvelle API de formulaires basée sur les signals d'Angular plutôt que les Reactive Forms classiques. Avantage : validation déclarative typée avec `schema()`, gestion des erreurs custom propre.

**Microservices avec JWT partagé** — Permet à `business-service` de rester indépendant d'`auth-service` à l'exécution. Le découplage est total : on peut redémarrer ou redéployer un service sans impacter l'autre, tant que le secret reste synchronisé.

**Géocodage côté client** — Les coordonnées GPS ne sont pas stockées en base : elles sont résolues à la demande via Nominatim, avec un cache RxJS et un système de scoring de la qualité du résultat. Compromis assumé en faveur de la simplicité de l'API backend.

**Liquibase plutôt que Flyway ou DDL Hibernate** — Permet une évolution contrôlée du schéma avec rollback possible, et garde la trace de chaque modification dans le repo.

---

## Limitations connues

- Les coordonnées GPS sont géocodées à chaque rendu de carte (dépendance à Nominatim, qui a un rate limit). Une mise en cache backend serait pertinente pour la production.
- Les photos sont stockées en CSV dans une seule colonne TEXT. Une table `announcement_photos` séparée serait plus propre pour gérer l'ordre et permettre l'indexation.
- Les favoris sont persistés en `localStorage` côté navigateur et non en base. Ils ne suivent pas l'utilisateur d'un appareil à l'autre.
- Le profil public d'un autre utilisateur n'est pas exposé par l'API : seul l'email est affiché côté frontend pour les annonces consultées.

---

## Auteur

**El Amri Saifeddine**
[github.com/elamrisaifeddinepro](https://github.com/elamrisaifeddinepro)

---

## Licence

Projet personnel. Tous droits réservés sauf mention contraire.
