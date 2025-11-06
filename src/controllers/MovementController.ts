import { Request, Response } from 'express';
import { MovementModel } from '../models/MovementModel';
import { ProductModel } from '../models/ProductModel';
import { MovementCreate } from '../types';

export class MovementController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const movements = await MovementModel.findAll();
      res.status(200).json(movements);
    } catch (error) {
      console.error('Erreur mouvements:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data: MovementCreate = req.body;

      if (!data.product_id || !data.quantity || !data.type) {
        res.status(400).json({ error: 'Champs requis manquants' });
        return;
      }

      if (data.type !== 'IN' && data.type !== 'OUT') {
        res.status(400).json({ error: 'Type invalide' });
        return;
      }

      if (data.quantity <= 0) {
        res.status(400).json({ error: 'Quantité invalide' });
        return;
      }

      const product = await ProductModel.findById(data.product_id);
      if (!product) {
        res.status(404).json({ error: 'Produit non trouvé' });
        return;
      }

      if (data.type === 'OUT' && product.quantity < data.quantity) {
        res.status(400).json({ 
          error: `Stock insuffisant: ${product.quantity} disponible` 
        });
        return;
      }

      const newQuantity = data.type === 'IN' 
        ? product.quantity + data.quantity 
        : product.quantity - data.quantity;

      const movement = await MovementModel.create(data);
      await ProductModel.updateQuantity(data.product_id, newQuantity);

      res.status(201).json({
        movement,
        product: await ProductModel.findById(data.product_id),
      });
    } catch (error) {
      console.error('Erreur création mouvement:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}
