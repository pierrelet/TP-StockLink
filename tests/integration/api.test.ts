import request from 'supertest';
import { createApp } from '../../src/app';
import { UserModel } from '../../src/models/UserModel';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

describe('Tests d\'intégration - API', () => {
  let app: any;
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    app = createApp();
    
    const testUser = await UserModel.create({
      username: 'testuser_' + Date.now(),
      password: 'testpass123',
      role: 'user'
    });
    authToken = jwt.sign(
      { id: testUser.id, username: testUser.username, role: testUser.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const testAdmin = await UserModel.create({
      username: 'testadmin_' + Date.now(),
      password: 'adminpass123',
      role: 'admin'
    });
    adminToken = jwt.sign(
      { id: testAdmin.id, username: testAdmin.username, role: testAdmin.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('POST /auth/login', () => {
    it('devrait retourner un token JWT avec des identifiants valides', async () => {
      const username = 'logintest_' + Date.now();
      const password = 'password123';
      
      await UserModel.create({
        username,
        password,
        role: 'user'
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          username,
          password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', username);
      expect(response.body.user).toHaveProperty('role', 'user');
    });

    it('devrait retourner 401 avec des identifiants invalides', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('devrait retourner 400 avec des données manquantes', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /products', () => {
    it('devrait retourner la liste des produits sans authentification', async () => {
      const response = await request(app)
        .get('/products');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /products', () => {
    it('devrait créer un produit avec un token valide', async () => {
      const response = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Produit Test',
          reference: 'TEST-' + Date.now(),
          quantity: 10,
          warehouse_id: 1
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Produit Test');
    });

    it('devrait retourner 401 sans token', async () => {
      const response = await request(app)
        .post('/products')
        .send({
          name: 'Produit Test',
          reference: 'TEST-001',
          quantity: 10,
          warehouse_id: 1
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /products/:id', () => {
    it('devrait supprimer un produit avec un token admin', async () => {
      const createResponse = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Produit à supprimer',
          reference: 'DELETE-' + Date.now(),
          quantity: 5,
          warehouse_id: 1
        });

      const productId = createResponse.body.id;

      const deleteResponse = await request(app)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(204);
    });

    it('devrait retourner 403 avec un token user (non-admin)', async () => {
      const createResponse = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Produit Test',
          reference: 'TEST-403-' + Date.now(),
          quantity: 5,
          warehouse_id: 1
        });

      const productId = createResponse.body.id;

      const deleteResponse = await request(app)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(403);
    });
  });
});
