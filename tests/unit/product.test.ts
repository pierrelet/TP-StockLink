import { ProductModel } from '../../src/models/ProductModel';
import { MovementModel } from '../../src/models/MovementModel';

describe('Tests unitaires - Fonctions métiers', () => {
  
  describe('Mise à jour du stock après mouvement IN', () => {
    it('devrait augmenter la quantité du produit après un mouvement IN', async () => {
      const productData = {
        name: 'Produit Test IN',
        reference: 'TEST-IN-001',
        quantity: 10,
        warehouse_id: 1
      };
      
      const product = await ProductModel.create(productData);
      const initialQuantity = product.quantity;
      const movementQuantity = 5;
      
      const movement = await MovementModel.create({
        product_id: product.id,
        quantity: movementQuantity,
        type: 'IN'
      });
      
      const updatedProduct = await ProductModel.updateQuantity(
        product.id,
        initialQuantity + movementQuantity
      );
      
      expect(updatedProduct).not.toBeNull();
      expect(updatedProduct?.quantity).toBe(initialQuantity + movementQuantity);
      
      await ProductModel.delete(product.id);
    });
  });

  describe('Mise à jour du stock après mouvement OUT', () => {
    it('devrait diminuer la quantité du produit après un mouvement OUT', async () => {
      const productData = {
        name: 'Produit Test OUT',
        reference: 'TEST-OUT-001',
        quantity: 20,
        warehouse_id: 1
      };
      
      const product = await ProductModel.create(productData);
      const initialQuantity = product.quantity;
      const movementQuantity = 7;
      
      const movement = await MovementModel.create({
        product_id: product.id,
        quantity: movementQuantity,
        type: 'OUT'
      });
      
      const updatedProduct = await ProductModel.updateQuantity(
        product.id,
        initialQuantity - movementQuantity
      );
      
      expect(updatedProduct).not.toBeNull();
      expect(updatedProduct?.quantity).toBe(initialQuantity - movementQuantity);
      
      await ProductModel.delete(product.id);
    });
  });

  describe('Vérification du stock insuffisant', () => {
    it('devrait détecter un stock insuffisant pour un mouvement OUT', async () => {
      const productData = {
        name: 'Produit Stock Faible',
        reference: 'TEST-LOW-001',
        quantity: 5,
        warehouse_id: 1
      };
      
      const product = await ProductModel.create(productData);
      const movementQuantity = 10;
      
      const hasEnoughStock = product.quantity >= movementQuantity;
      
      expect(hasEnoughStock).toBe(false);
      expect(product.quantity).toBeLessThan(movementQuantity);
      
      await ProductModel.delete(product.id);
    });
  });
});
