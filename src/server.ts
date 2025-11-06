import dotenv from 'dotenv';
import { createApp, initializeApp } from './app';
import { closeMongoDB } from './config/database';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3001', 10);

async function startServer() {
  const app = createApp();
  
  const server = app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });

  initializeApp().catch(() => {});

  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} déjà utilisé`);
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
}

startServer().catch((error) => {
  console.error('Erreur:', error);
  process.exit(1);
});

