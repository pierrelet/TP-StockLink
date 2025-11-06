import { Router } from 'express';
import { AuthController, registerValidators, loginValidators } from '../controllers/AuthController';

const router = Router();

// Routes d'authentification
router.post('/register', registerValidators, AuthController.register);
router.post('/login', loginValidators, AuthController.login);

export default router;

