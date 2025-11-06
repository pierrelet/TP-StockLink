import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { MovementController } from '../controllers/MovementController';
import { LocationController } from '../controllers/LocationController';

const router = Router();

// Routes pour les produits
router.get('/products', ProductController.getAll);
router.post('/products', ProductController.create);
router.put('/products/:id', ProductController.update);
router.delete('/products/:id', ProductController.delete);

// Routes pour les mouvements
router.get('/movements', MovementController.getAll);
router.post('/movements', MovementController.create);

// Routes pour les locations
router.get('/warehouses/:id/locations', LocationController.getByWarehouseId);
router.post('/warehouses/:id/locations', LocationController.create);
router.put('/warehouses/:id/locations', LocationController.update);
router.get('/locations/:binCode/exists', LocationController.checkBinExists);

export default router;

