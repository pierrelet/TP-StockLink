import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { MovementController } from '../controllers/MovementController';
import { LocationController } from '../controllers/LocationController';
import { WarehouseModel } from '../models/WarehouseModel';
import { authMiddleware, isAdmin } from '../middlewares/authMiddleware';
import { 
  productCreateValidators, 
  productUpdateValidators, 
  productIdValidator,
  movementCreateValidators,
  validate 
} from '../middlewares/validators';
import { Request, Response } from 'express';

const router = Router();

router.get('/products', ProductController.getAll);
router.post('/products', authMiddleware, productCreateValidators, validate, ProductController.create);
router.put('/products/:id', authMiddleware, productUpdateValidators, validate, ProductController.update);
router.delete('/products/:id', authMiddleware, isAdmin, productIdValidator, validate, ProductController.delete);

router.get('/movements', MovementController.getAll);
router.post('/movements', authMiddleware, movementCreateValidators, validate, MovementController.create);

router.get('/warehouses', async (req: Request, res: Response) => {
  try {
    const warehouses = await WarehouseModel.findAll();
    res.status(200).json(warehouses);
  } catch (error) {
    console.error('Erreur warehouses:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/warehouses', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, location } = req.body;
    if (!name || !location) {
      res.status(400).json({ error: 'name et location requis' });
      return;
    }
    const warehouse = await WarehouseModel.create({ name, location });
    res.status(201).json(warehouse);
  } catch (error) {
    console.error('Erreur création warehouse:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/warehouses/:id/locations', LocationController.getByWarehouseId);
router.post('/warehouses/:id/locations', authMiddleware, LocationController.create);
router.put('/warehouses/:id/locations', authMiddleware, LocationController.update);
router.get('/locations/:binCode/exists', LocationController.checkBinExists);

export default router;


