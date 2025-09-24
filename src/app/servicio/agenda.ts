import { Injectable } from "@angular/core";
import { openDB, IDBPDatabase,  } from "idb";
import { BaseItem, Memorialocal } from "../almacen/memorialocal";

export interface AgendaItem {
  
  id: string;
  fecha: string;
  hora: string;
  direccion?: string;
  motivo?: string;
  ocupante?: string;
  tipoVehiculo?: string;
  ocupantes?: number;
  estado: 'pendiente' | 'aceptado' | 'rechazado';
  motivoRechazo?: string;
}



@Injectable({ providedIn: 'root' })

export class Agenda {
  private agenda: AgendaItem[] = [];
  private schedule: { [fecha: string]: string[] } = {};
  private horaMin = '08:00';
  private horaMax = '17:30';

  constructor( ) {}

  // Inicializa la base de datos 
  private async initDB(): Promise<IDBPDatabase<any>> {
    return await openDB('AppDB', 16, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('viajesSolicitados')) {
          db.createObjectStore('viajesSolicitados', { keyPath: 'id' });
        }
      }
    });
  }

  async agregarHorario(fecha: string, hora: string): Promise<boolean> {
    if (hora < this.horaMin || hora > this.horaMax) return false;
    const horas = this.schedule[fecha] || [];
    if (horas.includes(hora)) return false;
    horas.push(hora);
    this.schedule[fecha] = horas;
    return true;
  }

  async obtenerHorarios(fecha: string): Promise<string[]> {
    return this.schedule[fecha] || [];
  }

  async obtenerSolicitudes(): Promise<AgendaItem[]> {
    const db = await this.initDB();
    return await db.getAll('viajesSolicitados');
  }
  
  
  async eliminarSolicitud(id: string): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction('viajesSolicitados', 'readwrite');
    await tx.objectStore('viajesSolicitados').delete(id);
    await tx.done;
  }
  
  async filtrarSolicitudesPorCampo(campo: keyof any, valor: any): Promise<any[]> {
    const db = await this.initDB();
    const tx = db.transaction('viajesSolicitados', 'readonly');
    const store = tx.objectStore('viajesSolicitados');
    const items = await store.getAll();
    return items.filter(item => item[campo] === valor);
  }
  
  async actualizarEstadoSolicitud(id: string, nuevoEstado: string): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction('viajesSolicitados', 'readwrite');
    const store = tx.objectStore('viajesSolicitados');
    const solicitud = await store.get(id);
    if (solicitud) {
      solicitud.estado = nuevoEstado;
      await store.put(solicitud);
    }
    await tx.done;
  }
  
  async reagendarSolicitud(id: string, nuevaFecha: string, nuevaHora: string): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction('viajesSolicitados', 'readwrite');
    const store = tx.objectStore('viajesSolicitados');
    const solicitud = await store.get(id);
    if (solicitud) {
      solicitud.fecha = nuevaFecha;
      solicitud.hora = nuevaHora;
      await store.put(solicitud);
    }
    await tx.done;
  }

  async actualizarEstadoSolicitudConMotivo(
    id: string,
    estado: 'rechazado',
    motivoRechazo: string
  ): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction('viajesSolicitados', 'readwrite');
    const solicitud = await tx.store.get(id);
    if (solicitud) {
      solicitud.estado = estado;
      solicitud.motivoRechazo = motivoRechazo;
      await tx.store.put(solicitud);
    }
    await tx.done;
  }

  async guardarSolicitud(solicitud: AgendaItem): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction('viajesSolicitados', 'readwrite');
    await tx.store.put(solicitud);
    await tx.done;
  }


}

