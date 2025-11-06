import express, { Express } from 'express';
import cors from 'cors';
import routes from './routes';
import { testPostgreSQL, connectMongoDB, pgPool } from './config/database';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'StockLink Core API is running' });
  });

  app.get('/health/db', async (req, res) => {
    try {
      const pgResult = await pgPool.query('SELECT NOW() as time, current_database() as database');
      const mongoDb = await connectMongoDB();
      const mongoCollections = await mongoDb.listCollections().toArray();
      
      res.status(200).json({
        status: 'OK',
        postgresql: {
          connected: true,
          database: pgResult.rows[0].database,
          time: pgResult.rows[0].time
        },
        mongodb: {
          connected: true,
          database: mongoDb.databaseName,
          collections: mongoCollections.map(c => c.name)
        }
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'ERROR',
        error: error.message
      });
    }
  });

  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'StockLink Core API',
      version: '1.0.0',
      endpoints: {
        health: {
          '/health': 'GET - Vérifier le statut de l\'API',
          '/health/db': 'GET - Vérifier les connexions aux bases de données'
        },
        products: {
          'GET /products': 'Récupérer tous les produits',
          'POST /products': 'Créer un nouveau produit',
          'PUT /products/:id': 'Mettre à jour un produit',
          'DELETE /products/:id': 'Supprimer un produit'
        },
        movements: {
          'GET /movements': 'Récupérer tous les mouvements',
          'POST /movements': 'Créer un nouveau mouvement'
        },
        locations: {
          'GET /warehouses/:id/locations': 'Récupérer les emplacements d\'un entrepôt',
          'POST /warehouses/:id/locations': 'Créer un nouvel emplacement',
          'PUT /warehouses/:id/locations': 'Mettre à jour un emplacement',
          'GET /locations/:binCode/exists': 'Vérifier si un code d\'emplacement existe'
        }
      }
    });
  });

  app.use('/', routes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
  });

  return app;
}

export async function initializeApp(): Promise<void> {
  try {
    await testPostgreSQL();
    await connectMongoDB();
  } catch (error: any) {
    console.error('Erreur lors de l\'initialisation:', error.message || error);
    throw error;
  }
}

