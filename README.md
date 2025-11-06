# StockLink Core - API Back-End

API Back-End pour la gestion d'entrepôts StockLink, développée avec Node.js, TypeScript, PostgreSQL et MongoDB.

## Description

StockLink Core est une API REST permettant de gérer :
- Les entrepôts (warehouses)
- Les produits stockés (products)
- Les mouvements de stock (movements)
- La structure interne des entrepôts (locations) avec zones, allées, niveaux et bacs

## Architecture

Le projet suit une architecture **MVC** (Model-View-Controller) :

```
src/
├── config/          # Configuration des bases de données
├── controllers/     # Logique métier et gestion des requêtes
├── models/          # Modèles de données (PostgreSQL et MongoDB)
├── routes/          # Définition des routes API
├── types/           # Définitions TypeScript
├── app.ts           # Configuration Express
└── server.ts        # Point d'entrée du serveur
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
   PORT=3000
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=stocklink
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB=stocklink
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

Le serveur sera accessible sur `http://localhost:3000` (ou le port configuré dans `.env`).

## Routes API

### Produits

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/products` | Liste tous les produits |
| POST | `/products` | Ajoute un produit |
| PUT | `/products/:id` | Met à jour un produit |
| DELETE | `/products/:id` | Supprime un produit |

**Exemple de création de produit :**
```json
POST /products
{
  "name": "Ordinateur portable",
  "reference": "LAPTOP-001",
  "quantity": 10,
  "warehouse_id": 1
}
```

### Mouvements de stock

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/movements` | Liste l'historique des mouvements |
| POST | `/movements` | Enregistre un mouvement et met à jour le stock |

**Exemple de création de mouvement :**
```json
POST /movements
{
  "product_id": 1,
  "quantity": 5,
  "type": "IN"
}
```

Types de mouvement : `"IN"` (entrée) ou `"OUT"` (sortie)

### Locations (Structure interne des entrepôts)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/warehouses/:id/locations` | Récupère la structure MongoDB d'un entrepôt |
| POST | `/warehouses/:id/locations` | Crée la structure interne d'un entrepôt |
| PUT | `/warehouses/:id/locations` | Met à jour la structure interne d'un entrepôt |
| GET | `/locations/:binCode/exists?warehouse_id=:id` | Vérifie si un bac existe |

**Exemple de structure de location :**
```json
POST /warehouses/1/locations
{
  "zones": [
    {
      "name": "Zone A",
      "rows": [
        {
          "name": "R1",
          "levels": [
            {
              "name": "L1",
              "bins": [
                {
                  "code": "A1-R1-L1-B01"
                },
                {
                  "code": "A1-R1-L1-B02"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

**Exemple de vérification de bac :**
```
GET /locations/A1-R1-L1-B01/exists?warehouse_id=1
```

### Santé de l'API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/health` | Vérifie l'état de l'API |
| GET | `/health/db` | Vérifie les connexions aux bases de données |

## Structure des bases de données

### PostgreSQL

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

## Technologies utilisées

- **Node.js** : Runtime JavaScript
- **TypeScript** : Langage de programmation
- **Express** : Framework web
- **PostgreSQL** : Base de données relationnelle
- **MongoDB** : Base de données NoSQL
- **pg** : Client PostgreSQL pour Node.js
- **mongodb** : Driver MongoDB officiel

## Notes importantes

- Les mouvements de type "OUT" vérifient automatiquement que le stock est suffisant
- La suppression d'un entrepôt supprime également tous ses produits (CASCADE)
- La suppression d'un produit supprime également tous ses mouvements (CASCADE)
- Les références de produits doivent être uniques
- Les quantités de mouvement doivent être strictement positives

## Dépannage

### Erreur de connexion PostgreSQL
- Vérifiez que PostgreSQL est démarré
- Vérifiez les identifiants dans `.env`
- Vérifiez que la base de données `stocklink` existe

### Erreur de connexion MongoDB
- Vérifiez que MongoDB est démarré
- Vérifiez l'URI MongoDB dans `.env`

### Erreur de compilation TypeScript
- Vérifiez que toutes les dépendances sont installées : `npm install`
- Vérifiez la version de Node.js : `node --version`

## Licence

ISC


