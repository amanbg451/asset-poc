// src/modules/location/location.service.ts
import prisma from '@/lib/prisma';

export class LocationService {
  async getAllLocations() {
    const locations = await prisma.location.findMany();
    return locations;
  }

  async getLocationById(id: number) {
    return await prisma.location.findUnique({
      where: { id }
    });
  }

  async createLocation(data: { name: string; company?: string }) {
    // Check for duplicate name
    const existing = await prisma.location.findFirst({
      where: {
        name: data.name
      }
    });
    
    if (existing) {
      throw new Error('Location already exists');
    }
    
    return await prisma.location.create({
      data: {
        name: data.name,
        company: data.company || 'LeadTech',
      }
    });
  }

  async updateLocation(id: number, data: { name: string; company?: string }) {
    // Check for duplicate name
    const existing = await prisma.location.findFirst({
      where: {
        name: data.name,
        id: { not: id }
      }
    });
    
    if (existing) {
      throw new Error('Location already exists');
    }
    
    return await prisma.location.update({
      where: { id },
      data: {
        name: data.name,
        company: data.company,
      }
    });
  }

  async deleteLocation(id: number) {
    return await prisma.location.delete({ where: { id } });
  }
}