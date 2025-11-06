import { pgPool } from '../config/database';
import { User, UserCreate } from '../types';
import bcrypt from 'bcrypt';

export class UserModel {
  static async findByUsername(username: string): Promise<User | null> {
    const result = await pgPool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await pgPool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(data: UserCreate): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const role = data.role || 'user';
    
    const result = await pgPool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [data.username, hashedPassword, role]
    );
    
    return {
      id: result.rows[0].id,
      username: result.rows[0].username,
      password: hashedPassword,
      role: result.rows[0].role
    };
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

