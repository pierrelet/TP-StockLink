import { Request, Response } from 'express';
import { ProductModel } from '../models/ProductModel';
import { ProductCreate, ProductUpdate } from '../types';

export class ProductController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const products = await ProductModel.findAll();
      res.status(200).json(products);
    } catch (error) {
      console.error('Erreur produits:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data: ProductCreate = req.body;
      
      if (!data.name || !data.reference || !data.warehouse_id) {
        res.status(400).json({ error: 'Champs requis manquants' });
        return;
      }

      const product = await ProductModel.create(data);
      res.status(201).json(product);
    } catch (error: any) {
      console.error('Erreur création:', error);
      if (error.code === '23505') {
        res.status(409).json({ error: 'Référence déjà existante' });
      } else {
        res.status(500).json({ error: 'Erreur serveur' });
      }
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const data: ProductUpdate = req.body;

      if (isNaN(id)) {
        res.status(400).json({ error: 'ID invalide' });
        return;
      }

      const product = await ProductModel.update(id, data);
      if (!product) {
        res.status(404).json({ error: 'Produit non trouvé' });
        return;
      }

      res.status(200).json(product);
    } catch (error: any) {
      console.error('Erreur update:', error);
      if (error.code === '23505') {
        res.status(409).json({ error: 'Référence déjà existante' });
      } else {
        res.status(500).json({ error: 'Erreur serveur' });
      }
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({ error: 'ID invalide' });
        return;
      }

      const deleted = await ProductModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Produit non trouvé' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Erreur suppression:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}
