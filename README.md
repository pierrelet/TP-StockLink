# StockLink Pro - API Sécurisée et Documentée

API Back-End professionnelle pour la gestion d'entrepôts StockLink, développée avec Node.js, TypeScript, PostgreSQL et MongoDB.

## Description

StockLink Pro est une API REST sécurisée permettant de gérer :
- Les utilisateurs et l'authentification (JWT)
- Les entrepôts (warehouses)
- Les produits stockés (products)
- Les mouvements de stock (movements)
- La structure interne des entrepôts (locations) avec zones, allées, niveaux et bacs

## Fonctionnalités de sécurité

- **Authentification JWT** : Système complet d'authentification avec tokens JWT
- **Autorisation par rôles** : Contrôle d'accès basé sur les rôles (user/admin)
- **CORS** : Protection contre les requêtes cross-origin non autorisées
- **Rate Limiting** : Limitation à 100 requêtes / 15 minutes par IP
- **Validation des données** : Validation automatique des entrées avec express-validator
- **Documentation Swagger** : Documentation interactive disponible sur `/docs`

## Architecture

Le projet suit une architecture **MVC** (Model-View-Controller) :

```
src/
├── config/          # Configuration des bases de données et Swagger
├── controllers/     # Logique métier et gestion des requêtes
├── models/          # Modèles de données (PostgreSQL et MongoDB)
├── routes/          # Définition des routes API
├── middlewares/     # Middlewares d'authentification et validation
├── types/           # Définitions TypeScript
├── app.ts           # Configuration Express
└── server.ts        # Point d'entrée du serveur
tests/
├── unit/            # Tests unitaires
└── integration/     # Tests d'intégration
```

## Installation

### Prérequis

- Node.js (version 18 ou supérieure)
- PostgreSQL (version 12 ou supérieure)
- MongoDB (version 5 ou supérieure)
- npm ou yarn

### Étapes d'installation

1. **Cloner le projet** (si applicable) ou naviguer dans le dossier du projet

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   
   Créez un fichier `.env` à la racine du projet en vous basant sur `.env.example` :
   ```bash
   cp .env.example .env
   ```
   
   Modifiez les valeurs selon votre configuration :
   ```env
   PORT=3001
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=stocklink
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB=stocklink
   JWT_SECRET=6f50aacf5266fd507764b51f7b0cd331365ad057e82d6f12fe2ffcccfa1257a7
   ```
   
   **Important** : Pour générer une nouvelle clé JWT secrète, utilisez :
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Initialiser la base de données PostgreSQL**
   
   Connectez-vous à PostgreSQL et exécutez le script d'initialisation :
   ```bash
   psql -U postgres -f init_pgadmin.sql
   ```
   
   Ou manuellement :
   ```bash
   psql -U postgres
   ```
   Puis exécutez le contenu de `init_pgadmin.sql`

5. **Vérifier MongoDB**
   
   Assurez-vous que MongoDB est démarré :
   ```bash
   mongod
   ```
   
   La base de données sera créée automatiquement lors de la première connexion.

## Exécution

### Mode développement
```bash
npm run dev
```

### Compilation TypeScript
```bash
npm run build
```

### Mode production
```bash
npm run build
npm start
```

Le serveur sera accessible sur `http://localhost:3001` (ou le port configuré dans `.env`).

## Documentation Swagger

La documentation interactive de l'API est disponible sur :
**http://localhost:3001/docs**

Vous pouvez y tester toutes les routes directement depuis l'interface Swagger.

## Authentification

### Inscription
```bash
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123",
  "role": "user"  // optionnel, par défaut "user"
}
```

### Connexion
```bash
POST /auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

Réponse :
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "role": "user"
  }
}
```

### Utilisation du token

Pour les routes protégées, incluez le token dans l'en-tête `Authorization` :
```
Authorization: Bearer <votre_token>
```

## Routes API et Protection

### Authentification

| Méthode | Endpoint | Description | Protection |
|---------|----------|-------------|------------|
| POST | `/auth/register` | Crée un nouvel utilisateur | Libre |
| POST | `/auth/login` | Connexion et obtention du token JWT | Libre |

### Produits

| Méthode | Endpoint | Description | Protection |
|---------|----------|-------------|------------|
| GET | `/products` | Liste tous les produits | **Libre** |
| POST | `/products` | Crée un nouveau produit | **Authentifié** |
| PUT | `/products/:id` | Met à jour un produit | **Authentifié** |
| DELETE | `/products/:id` | Supprime un produit | **Admin uniquement** |

### Mouvements

| Méthode | Endpoint | Description | Protection |
|---------|----------|-------------|------------|
| GET | `/movements` | Liste l'historique des mouvements | **Libre** |
| POST | `/movements` | Enregistre un mouvement et met à jour le stock | **Authentifié** |

### Entrepôts

| Méthode | Endpoint | Description | Protection |
|---------|----------|-------------|------------|
| GET | `/warehouses` | Liste tous les entrepôts | **Libre** |
| POST | `/warehouses` | Crée un nouvel entrepôt | **Authentifié** |

### Locations

| Méthode | Endpoint | Description | Protection |
|---------|----------|-------------|------------|
| GET | `/warehouses/:id/locations` | Récupère la structure d'un entrepôt | **Libre** |
| POST | `/warehouses/:id/locations` | Crée la structure interne d'un entrepôt | **Authentifié** |
| PUT | `/warehouses/:id/locations` | Met à jour la structure interne | **Authentifié** |
| GET | `/locations/:binCode/exists` | Vérifie si un bac existe | Libre |

## Tests

### Lancer tous les tests
```bash
npm test
```

### Lancer les tests en mode watch
```bash
npm run test:watch
```

### Lancer les tests avec couverture
```bash
npm run test:coverage
```

### Tests inclus

**Tests unitaires** (3 tests minimum) :
- Mise à jour du stock après mouvement IN
- Mise à jour du stock après mouvement OUT
- Vérification du stock insuffisant

**Tests d'intégration** (1 test minimum) :
- Test de la route `/auth/login`
- Test de création de produit avec authentification
- Test de suppression avec contrôle d'accès admin

## Structure des bases de données

### PostgreSQL

#### Table `users`
- `id` (SERIAL PRIMARY KEY)
- `username` (VARCHAR(50) UNIQUE)
- `password` (VARCHAR(255)) - haché avec bcrypt
- `role` (VARCHAR(10)) - 'user' ou 'admin'
- `created_at` (TIMESTAMP)

#### Table `warehouses`
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(100))
- `location` (VARCHAR(150))

#### Table `products`
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(100))
- `reference` (VARCHAR(50) UNIQUE)
- `quantity` (INT)
- `warehouse_id` (INT, FOREIGN KEY)

#### Table `movements`
- `id` (SERIAL PRIMARY KEY)
- `product_id` (INT, FOREIGN KEY)
- `quantity` (INT)
- `type` (VARCHAR(10), 'IN' ou 'OUT')
- `created_at` (TIMESTAMP)

### MongoDB

#### Collection `locations`
Structure hiérarchique :
- `warehouse_id` (Number) : Référence à l'entrepôt PostgreSQL
- `zones` (Array) : Zones de l'entrepôt
  - `name` (String) : Nom de la zone
  - `rows` (Array) : Allées
    - `name` (String) : Nom de l'allée
    - `levels` (Array) : Niveaux
      - `name` (String) : Nom du niveau
      - `bins` (Array) : Bacs
        - `code` (String) : Code du bac (ex: "A1-R1-L2-B03")
        - `product_id` (Number, optionnel) : Produit stocké
        - `quantity` (Number, optionnel) : Quantité dans le bac

## Sécurité

### CORS
- Origine autorisée : `http://localhost:3000`
- Credentials : activés

### Rate Limiting
- Limite : 100 requêtes par IP
- Fenêtre : 15 minutes

### Validation
- Toutes les routes POST/PUT sont validées avec `express-validator`
- Les mots de passe sont hachés avec `bcrypt` (10 rounds)
- Les tokens JWT expirent après 24 heures

## Technologies utilisées

- **Node.js** : Runtime JavaScript
- **TypeScript** : Langage de programmation
- **Express** : Framework web
- **PostgreSQL** : Base de données relationnelle
- **MongoDB** : Base de données NoSQL
- **JWT** : Authentification par tokens
- **bcrypt** : Hachage des mots de passe
- **Swagger/OpenAPI** : Documentation interactive
- **Jest** : Framework de tests
- **express-validator** : Validation des données
- **express-rate-limit** : Limitation du taux de requêtes

## Notes importantes

- Les mots de passe sont hachés avec bcrypt avant stockage
- Les tokens JWT contiennent : id, username et role
- La clé secrète JWT doit être changée en production
- Les mouvements de type "OUT" vérifient automatiquement que le stock est suffisant
- La suppression d'un entrepôt supprime également tous ses produits (CASCADE)
- La suppression d'un produit supprime également tous ses mouvements (CASCADE)
- Les références de produits doivent être uniques

## Dépannage

### Erreur de connexion PostgreSQL
- Vérifiez que PostgreSQL est démarré
- Vérifiez les identifiants dans `.env`
- Vérifiez que la base de données `stocklink` existe
- Vérifiez que la table `users` existe (exécutez `init_pgadmin.sql`)

### Erreur de connexion MongoDB
- Vérifiez que MongoDB est démarré
- Vérifiez l'URI MongoDB dans `.env`

### Erreur d'authentification
- Vérifiez que le token JWT est valide et non expiré
- Vérifiez que le header `Authorization: Bearer <token>` est correct
- Vérifiez que `JWT_SECRET` dans `.env` correspond à celui utilisé pour générer le token

### Erreur 403 (Forbidden)
- Vérifiez que votre utilisateur a le rôle `admin` pour les routes admin uniquement
- Vérifiez que le token contient bien le bon rôle

### Erreur de compilation TypeScript
- Vérifiez que toutes les dépendances sont installées : `npm install`
- Vérifiez la version de Node.js : `node --version`

## Licence

ISC
