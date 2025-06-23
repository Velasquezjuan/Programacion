import { openDB, IDBPDatabase } from 'idb';

export interface BaseItem {
  id: string;
}

export class Memorialocal {
  private static dbPromise: Promise<IDBPDatabase>;

  private static initDB(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      // Usamos versión alta para asegurarnos de que siempre sea >= la existente
      this.dbPromise = openDB('AppDB', 10, {
        upgrade(db) {
          const stores = [
            'usuarios',
            'usuarioActivo',
            'usuarioDesactivado',
            'vehiculos',
            'viajesSolicitados'
          ];
          for (const storeName of stores) {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, { keyPath: 'id' });
            }
          }
        }
      });
    }
    return this.dbPromise;
  }

  static async guardar<T extends BaseItem>(store: string, data: T | T[]): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction(store, 'readwrite');
    const os = tx.objectStore(store);
    if (Array.isArray(data)) {
      for (const item of data) await os.put(item);
    } else {
      await os.put(data);
    }
    await tx.done;
  }

  static async obtener<T>(store: string): Promise<T[]> {
    const db = await this.initDB();
    return db.getAll(store);
  }

  static async eliminar(store: string, id: string): Promise<void> {
    const db = await this.initDB();
    await db.delete(store, id);
  }

  static async limpiarTodo(): Promise<void> {
    const db = await this.initDB();
    for (const name of db.objectStoreNames) {
      const tx = db.transaction(name, 'readwrite');
      tx.objectStore(name).clear();
      await tx.done;
    }
  }

  static async existe(store: string, id: string): Promise<boolean> {
    const db = await this.initDB();
    return (await db.get(store, id)) !== undefined;
  }

  static async desactivarUsuario(id: string): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction(['usuarioActivo','usuarioDesactivado'], 'readwrite');
    const act = tx.objectStore('usuarioActivo');
    const des = tx.objectStore('usuarioDesactivado');
    const u = await act.get(id);
    if (u) { await act.delete(id); await des.put(u); }
    await tx.done;
  }

  static async activarUsuario(id: string): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction(['usuarioDesactivado','usuarioActivo'], 'readwrite');
    const des = tx.objectStore('usuarioDesactivado');
    const act = tx.objectStore('usuarioActivo');
    const u = await des.get(id);
    if (u) { await des.delete(id); await act.put(u); }
    await tx.done;
  }

  static async actualizarEstadoSolicitudConMotivo(
    id: string, nuevoEstado: string, motivoRechazo: string
  ): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction('viajesSolicitados', 'readwrite');
    const store = tx.objectStore('viajesSolicitados');
    const sol: any = await store.get(id);
    if (sol) {
      sol.estado = nuevoEstado;
      sol.motivoRechazo = motivoRechazo;
      await store.put(sol);
    }
    await tx.done;
  }

  static async obtenerSolicitudes(): Promise<any[]> {
    const db = await this.initDB();
    return db.getAll('viajesSolicitados');
  }

  // Métodos genéricos basados en campos
  static async actualizarPorCampo<T extends BaseItem>(
    store: string,
    campo: keyof T,
    valor: T[keyof T],
    transform: (item: T) => T
  ): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction(store, 'readwrite');
    const os = tx.objectStore(store);
    const items = (await os.getAll()) as T[];
    const idx = items.findIndex(i => i[campo] === valor);
    if (idx >= 0) {
      const updated = transform(items[idx]);
      await os.put(updated);
    }
    await tx.done;
  }

  static async eliminarPorCampo<T>(
    store: string,
    campo: keyof T,
    valor: any
  ): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction(store, 'readwrite');
    const os = tx.objectStore(store);
    const items = (await os.getAll()) as T[];
    for (const item of items.filter(i => (i as any)[campo] !== valor)) {
      await os.put(item as BaseItem);
    }
    await tx.done;
  }

  static async buscarPorCampo<T>(
    store: string,
    campo: keyof T,
    valor: any
  ): Promise<T | undefined> {
    const db = await this.initDB();
    const os = db.transaction(store, 'readonly').objectStore(store);
    const items = (await os.getAll()) as T[];
    return items.find(i => (i as any)[campo] === valor);
  }

  static async reemplazarPorCampo<T extends BaseItem>(
    store: string,
    campo: keyof T,
    valor: T[keyof T],
    nuevo: T
  ): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction(store, 'readwrite');
    const os = tx.objectStore(store);
    const items = (await os.getAll()) as T[];
    const idx = items.findIndex(i => i[campo] === valor);
    if (idx >= 0) {
      await os.put(nuevo);
    }
    await tx.done;
  }
}
