import { Request, Response } from 'express';
import { LocationModel } from '../models/LocationModel';
import { WarehouseModel } from '../models/WarehouseModel';
import { Zone } from '../types';

export class LocationController {
  static async getByWarehouseId(req: Request, res: Response): Promise<void> {
    try {
      const warehouseId = parseInt(req.params.id);

      if (isNaN(warehouseId)) {
        res.status(400).json({ error: 'ID d\'entrepôt invalide' });
        return;
      }

      const warehouse = await WarehouseModel.findById(warehouseId);
      if (!warehouse) {
        res.status(404).json({ error: 'Entrepôt non trouvé' });
        return;
      }

      const location = await LocationModel.findByWarehouseId(warehouseId);
      if (!location) {
        res.status(404).json({ error: 'Structure interne non trouvée pour cet entrepôt' });
        return;
      }

      res.status(200).json(location);
    } catch (error) {
      console.error('Erreur lors de la récupération de la structure:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la récupération de la structure' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const warehouseId = parseInt(req.params.id);
      const { zones }: { zones: Zone[] } = req.body;

      if (isNaN(warehouseId)) {
        res.status(400).json({ error: 'ID d\'entrepôt invalide' });
        return;
      }

      if (!zones || !Array.isArray(zones)) {
        res.status(400).json({ error: 'Le champ zones est requis et doit être un tableau' });
        return;
      }

      const warehouse = await WarehouseModel.findById(warehouseId);
      if (!warehouse) {
        res.status(404).json({ error: 'Entrepôt non trouvé' });
        return;
      }

      const existingLocation = await LocationModel.findByWarehouseId(warehouseId);
      if (existingLocation) {
        res.status(409).json({ error: 'Une structure existe déjà pour cet entrepôt. Utilisez PUT pour la mettre à jour.' });
        return;
      }

      const location = await LocationModel.create(warehouseId, zones);
      res.status(201).json(location);
    } catch (error) {
      console.error('Erreur lors de la création de la structure:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la création de la structure' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const warehouseId = parseInt(req.params.id);
      const { zones }: { zones: Zone[] } = req.body;

      if (isNaN(warehouseId)) {
        res.status(400).json({ error: 'ID d\'entrepôt invalide' });
        return;
      }

      if (!zones || !Array.isArray(zones)) {
        res.status(400).json({ error: 'Le champ zones est requis et doit être un tableau' });
        return;
      }

      const warehouse = await WarehouseModel.findById(warehouseId);
      if (!warehouse) {
        res.status(404).json({ error: 'Entrepôt non trouvé' });
        return;
      }

      const location = await LocationModel.update(warehouseId, zones);
      res.status(200).json(location);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la structure:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de la structure' });
    }
  }

  static async checkBinExists(req: Request, res: Response): Promise<void> {
    try {
      const binCode = req.params.binCode;
      const warehouseId = req.query.warehouse_id ? parseInt(req.query.warehouse_id as string) : null;

      if (!binCode) {
        res.status(400).json({ error: 'Le code du bac est requis' });
        return;
      }

      if (!warehouseId || isNaN(warehouseId)) {
        res.status(400).json({ error: 'Le paramètre warehouse_id est requis' });
        return;
      }

      const warehouse = await WarehouseModel.findById(warehouseId);
      if (!warehouse) {
        res.status(404).json({ error: 'Entrepôt non trouvé' });
        return;
      }

      const exists = await LocationModel.binExists(warehouseId, binCode);
      res.status(200).json({ exists, binCode, warehouse_id: warehouseId });
    } catch (error) {
      console.error('Erreur lors de la vérification du bac:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la vérification du bac' });
    }
  }
}

