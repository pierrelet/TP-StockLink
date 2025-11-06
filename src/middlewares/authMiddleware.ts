import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'Token manquant' });
      return;
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      res.status(401).json({ error: 'Token manquant' });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Token invalide ou expiré' });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur vérification token' });
    return;
  }
}

export function isAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentification requise' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Accès refusé' });
    return;
  }

  next();
}

