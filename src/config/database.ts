import dotenv from 'dotenv';
import { Pool } from 'pg';
import { MongoClient, Db } from 'mongodb';

dotenv.config();

export const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'stocklink',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
});

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const mongoDbName = process.env.MONGODB_DB || 'stocklink';

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

export async function connectMongoDB(): Promise<Db> {
  if (mongoDb) {
    return mongoDb;
  }

  try {
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    mongoDb = mongoClient.db(mongoDbName);
    return mongoDb;
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error);
    throw error;
  }
}

export async function closeMongoDB(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    mongoDb = null;
  }
}

export async function testPostgreSQL(): Promise<void> {
  try {
    await pgPool.query('SELECT NOW()');
  } catch (error) {
    console.error('Erreur de connexion PostgreSQL:', error);
    throw error;
  }
}

