import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express, Request, Response } from 'express';

let swaggerSpec: any = null;

function getSwaggerSpec() {
  if (!swaggerSpec) {
    const options: swaggerJsdoc.Options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'StockLink Pro API',
          version: '1.0.0',
          description: 'API StockLink',
        },
        servers: [
          {
            url: 'http://localhost:3001',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
      apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
    };
    swaggerSpec = swaggerJsdoc(options);
  }
  return swaggerSpec;
}

export function setupSwagger(app: Express): void {
  app.use('/docs', swaggerUi.serve);
  app.get('/docs', (req: Request, res: Response, next: any) => {
    swaggerUi.setup(getSwaggerSpec())(req, res, next);
  });
}

