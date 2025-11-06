import { connectMongoDB } from '../config/database';
import { Location, Zone, Row, Level, Bin } from '../types';

export class LocationModel {
  private static collectionName = 'locations';

  private static async getCollection() {
    const db = await connectMongoDB();
    return db.collection<Location>(this.collectionName);
  }

  static async findByWarehouseId(warehouseId: number): Promise<Location | null> {
    const collection = await this.getCollection();
    const location = await collection.findOne({ warehouse_id: warehouseId });
    return location;
  }

  static async create(warehouseId: number, zones: Zone[]): Promise<Location> {
    const collection = await this.getCollection();
    const location: Location = {
      warehouse_id: warehouseId,
      zones: zones,
    };
    const result = await collection.insertOne(location);
    return { ...location, _id: result.insertedId.toString() };
  }

  static async update(warehouseId: number, zones: Zone[]): Promise<Location | null> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { warehouse_id: warehouseId },
      { $set: { zones: zones } },
      { returnDocument: 'after', upsert: true }
    );
    return (result as any)?.value || null;
  }

  static async binExists(warehouseId: number, binCode: string): Promise<boolean> {
    const location = await this.findByWarehouseId(warehouseId);
    if (!location) {
      return false;
    }

    for (const zone of location.zones) {
      for (const row of zone.rows) {
        for (const level of row.levels) {
          for (const bin of level.bins) {
            if (bin.code === binCode) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  static async findBinByCode(warehouseId: number, binCode: string): Promise<Bin | null> {
    const location = await this.findByWarehouseId(warehouseId);
    if (!location) {
      return null;
    }

    for (const zone of location.zones) {
      for (const row of zone.rows) {
        for (const level of row.levels) {
          for (const bin of level.bins) {
            if (bin.code === binCode) {
              return bin;
            }
          }
        }
      }
    }
    return null;
  }
}

