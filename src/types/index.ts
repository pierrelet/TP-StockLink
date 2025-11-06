// Types pour les entrepôts
export interface Warehouse {
  id: number;
  name: string;
  location: string;
}

export interface WarehouseCreate {
  name: string;
  location: string;
}

// Types pour les produits
export interface Product {
  id: number;
  name: string;
  reference: string;
  quantity: number;
  warehouse_id: number;
}

export interface ProductCreate {
  name: string;
  reference: string;
  quantity?: number;
  warehouse_id: number;
}

export interface ProductUpdate {
  name?: string;
  reference?: string;
  quantity?: number;
  warehouse_id?: number;
}

// Types pour les mouvements
export type MovementType = 'IN' | 'OUT';

export interface Movement {
  id: number;
  product_id: number;
  quantity: number;
  type: MovementType;
  created_at: Date;
}

export interface MovementCreate {
  product_id: number;
  quantity: number;
  type: MovementType;
}

// Types pour les locations MongoDB
export interface Location {
  _id?: string;
  warehouse_id: number;
  zones: Zone[];
}

export interface Zone {
  name: string;
  rows: Row[];
}

export interface Row {
  name: string;
  levels: Level[];
}

export interface Level {
  name: string;
  bins: Bin[];
}

export interface Bin {
  code: string;
  product_id?: number;
  quantity?: number;
}


