import { pgPool } from '../config/database';
import { Warehouse, WarehouseCreate } from '../types';

export class WarehouseModel {
  static async findAll(): Promise<Warehouse[]> {
    const result = await pgPool.query('SELECT * FROM warehouses ORDER BY id');
    return result.rows;
  }

  static async findById(id: number): Promise<Warehouse | null> {
    const result = await pgPool.query('SELECT * FROM warehouses WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(data: WarehouseCreate): Promise<Warehouse> {
    const result = await pgPool.query(
      'INSERT INTO warehouses (name, location) VALUES ($1, $2) RETURNING *',
      [data.name, data.location]
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<WarehouseCreate>): Promise<Warehouse | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(data.location);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await pgPool.query(
      `UPDATE warehouses SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pgPool.query('DELETE FROM warehouses WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}

