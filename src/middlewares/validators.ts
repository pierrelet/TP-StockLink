import { body, param, validationResult } from 'express-validator';

export const productCreateValidators = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nom requis')
    .isLength({ max: 100 })
    .withMessage('Nom max 100 caractères'),
  body('reference')
    .trim()
    .notEmpty()
    .withMessage('Référence requise')
    .isLength({ max: 50 })
    .withMessage('Référence max 50 caractères'),
  body('warehouse_id')
    .isInt({ min: 1 })
    .withMessage('warehouse_id invalide'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('quantity invalide')
];

export const productUpdateValidators = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID invalide'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Nom requis')
    .isLength({ max: 100 })
    .withMessage('Nom max 100 caractères'),
  body('reference')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Référence requise')
    .isLength({ max: 50 })
    .withMessage('Référence max 50 caractères'),
  body('warehouse_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('warehouse_id invalide'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('quantity invalide')
];

export const productIdValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID invalide')
];

export const movementCreateValidators = [
  body('product_id')
    .isInt({ min: 1 })
    .withMessage('product_id invalide'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('quantity invalide'),
  body('type')
    .isIn(['IN', 'OUT'])
    .withMessage('type doit être IN ou OUT')
];

export function validate(req: any, res: any, next: any): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
}

