import { Request, Response } from 'express';
import { UserModel } from '../models/UserModel';
import { UserLogin, UserCreate } from '../types';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const data: UserCreate = req.body;
      const existingUser = await UserModel.findByUsername(data.username);
      if (existingUser) {
        res.status(409).json({ error: 'Nom d\'utilisateur déjà utilisé' });
        return;
      }

      const user = await UserModel.create(data);
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Utilisateur créé',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const data: UserLogin = req.body;
      const user = await UserModel.findByUsername(data.username);
      if (!user) {
        res.status(401).json({ error: 'Identifiants incorrects' });
        return;
      }

      const isValidPassword = await UserModel.verifyPassword(data.password, user.password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Identifiants incorrects' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error: any) {
      console.error('Erreur connexion:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}

export const registerValidators = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username entre 3 et 50 caractères')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username invalide'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password min 6 caractères'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role invalide')
];

export const loginValidators = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username requis'),
  body('password')
    .notEmpty()
    .withMessage('Password requis')
];
