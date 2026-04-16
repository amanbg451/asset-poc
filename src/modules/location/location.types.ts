// src/modules/location/location.types.ts

export interface LocationInput {
  name: string;
  company?: string;
}

export interface LocationResponse {
  id: number;
  name: string;
  company: string | null;
  createdAt: Date;
  updatedAt: Date;
  assetCount?: number;
}