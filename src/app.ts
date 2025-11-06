import express, { Express } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import authRoutes from './routes/auth';
import { setupSwagger } from './config/swagger';
import { testPostgreSQL, connectMongoDB } from './config/database';

export function createApp(): Express {
  const app = express();

  app.use(cors({
    origin: '*',
    credentials: true
  }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Trop de requêtes depuis cette IP'
  });
  app.use(limiter);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  setupSwagger(app);

  app.use('/auth', authRoutes);
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
    console.error('Erreur initialisation:', error.message || error);
    throw error;
  }
}
