// src/modules/location/location.controller.ts
import { NextRequest, NextResponse } from 'next/server';
import { LocationService } from './location.service';
import { getSession } from '@/lib/auth';

const locationService = new LocationService();

export class LocationController {
  static async getAll() {
    const locations = await locationService.getAllLocations();
    return NextResponse.json({ success: true, locations });
  }

  static async getById(id: number) {
    const location = await locationService.getLocationById(id);
    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, location });
  }

  static async create(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const location = await locationService.createLocation({
      name: body.name,
      company: body.company,
    });
    return NextResponse.json({ success: true, location }, { status: 201 });
  }

  static async update(request: NextRequest, id: number) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const location = await locationService.updateLocation(id, {
      name: body.name,
      company: body.company,
    });
    return NextResponse.json({ success: true, location });
  }

  static async delete(id: number) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await locationService.deleteLocation(id);
    return NextResponse.json({ success: true });
  }
}