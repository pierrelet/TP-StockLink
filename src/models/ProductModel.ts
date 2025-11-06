import { pgPool } from '../config/database';
import { Product, ProductCreate, ProductUpdate } from '../types';

export class ProductModel {
  static async findAll(): Promise<Product[]> {
    const result = await pgPool.query('SELECT * FROM products ORDER BY id');
    return result.rows;
  }

  static async findById(id: number): Promise<Product | null> {
    const result = await pgPool.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(data: ProductCreate): Promise<Product> {
    const quantity = data.quantity || 0;
    const result = await pgPool.query(
      'INSERT INTO products (name, reference, quantity, warehouse_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.name, data.reference, quantity, data.warehouse_id]
    );
    return result.rows[0];
  }

  static async update(id: number, data: ProductUpdate): Promise<Product | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.reference !== undefined) {
      updates.push(`reference = $${paramIndex++}`);
      values.push(data.reference);
    }
    if (data.quantity !== undefined) {
      updates.push(`quantity = $${paramIndex++}`);
      values.push(data.quantity);
    }
    if (data.warehouse_id !== undefined) {
      updates.push(`warehouse_id = $${paramIndex++}`);
      values.push(data.warehouse_id);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await pgPool.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pgPool.query('DELETE FROM products WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async updateQuantity(id: number, quantity: number): Promise<Product | null> {
    const result = await pgPool.query(
      'UPDATE products SET quantity = $1 WHERE id = $2 RETURNING *',
      [quantity, id]
    );
    return result.rows[0] || null;
  }
}

