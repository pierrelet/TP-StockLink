import { pgPool } from '../config/database';
import { Movement, MovementCreate } from '../types';

export class MovementModel {
  static async findAll(): Promise<Movement[]> {
    const result = await pgPool.query('SELECT * FROM movements ORDER BY created_at DESC');
    return result.rows;
  }

  static async findById(id: number): Promise<Movement | null> {
    const result = await pgPool.query('SELECT * FROM movements WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(data: MovementCreate): Promise<Movement> {
    const result = await pgPool.query(
      'INSERT INTO movements (product_id, quantity, type) VALUES ($1, $2, $3) RETURNING *',
      [data.product_id, data.quantity, data.type]
    );
    return result.rows[0];
  }

  static async findByProductId(productId: number): Promise<Movement[]> {
    const result = await pgPool.query(
      'SELECT * FROM movements WHERE product_id = $1 ORDER BY created_at DESC',
      [productId]
    );
    return result.rows;
  }
}

