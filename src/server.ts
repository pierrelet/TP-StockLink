import dotenv from 'dotenv';
import { createApp, initializeApp } from './app';
import { closeMongoDB } from './config/database';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  try {
    try {
      await initializeApp();
    } catch (error: any) {
      console.error('Erreur lors de la connexion aux bases de données:', error.message);
      console.error('Le serveur va démarrer quand même...');
    }

    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });

    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Le port ${PORT} est déjà utilisé.`);
      } else {
        console.error('Erreur lors du démarrage du serveur:', error.message);
      }
      process.exit(1);
    });

    process.on('SIGINT', async () => {
      server.close();
      await closeMongoDB();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      server.close();
      await closeMongoDB();
      process.exit(0);
    });
  } catch (error: any) {
    console.error('Erreur fatale lors du démarrage:', error.message);
    process.exit(1);
  }
}

startServer();

