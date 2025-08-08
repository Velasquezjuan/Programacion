import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Memorialocal } from '../almacen/memorialocal';
import { Observable, tap } from 'rxjs';

export interface AuthResponse {
  message: string;
  token: string;
  username: string;
  rol: string;
}

export interface NuevoUsuario {
  
  id:string;
  rut: string;
  usuario: string;
  contraseña: string;
  nombre: string;
  rol: 'adminSistema' | 'conductor' | 'its' | 'solicitante' | 'coordinador';
  correo: string;
}

  @Injectable({
    providedIn: 'root'
  })
  export class AutentificacionUsuario {

  constructor() {}

    /**
   * LOGIN LOCAL con IndexedDB
   */
    async loginLocal(correo: string, contraseña: string): Promise<NuevoUsuario> {
      const todos = await Memorialocal.obtener<NuevoUsuario>('usuarios') || [];
      const u = todos.find(u => u.correo === correo);
      if (!u) {
        throw new Error('Usuario no encontrado (offline)');
      }
      if (u.contraseña !== contraseña) {
        throw new Error('Contraseña incorrecta (offline)');
      }
        console.log('Usuario encontrado para iniciar sesión:', u);
      // marcamos usuario activo
      await Memorialocal.guardar('usuarioActivo', u);
      return u;
    }
  
    /**
     * REGISTRO ONLINE: llama a la API y luego guarda en IndexedDB
    
    registrarUsuarioAPI(u: NuevoUsuario): Observable<any> {
      return this.http.post('/api/auth/register', {
        username: u.usuario,
        password: u.contraseña,
        rol: u.rol
      }).pipe(
        tap(async () => {
          // guardado local para fallback offline
          await Memorialocal.guardar('usuarios', u);
        })
      );
    } 
      */
    /**
     * REGISTRO OFFLINE: sólo IndexedDB
     */
    async registrarUsuarioLocal(nuevo: NuevoUsuario): Promise<boolean> {
      const todos = await Memorialocal.obtener<NuevoUsuario>('usuarios') || [];
      if (todos.some(x => x.correo === nuevo.correo)) {
        return false;
      }
      // aquí ya tenemos id, lo usamos directamente
      await Memorialocal.guardar('usuarios', nuevo);
      return true;
    }
  
    /** Logout */
    async logout(): Promise<void> {
      const activo = await this.obtenerUsuarioActivo();
      if (activo) {
        await Memorialocal.eliminar('usuarioActivo', activo.id);
      }
    }
  
    /** Usuario activo */
    async obtenerUsuarioActivo(): Promise<NuevoUsuario|null> {
      const arr = await Memorialocal.obtener<NuevoUsuario>('usuarioActivo');
      return arr.length ? arr[0] : null;
    }
  
    /** Está logeado */
    async estaLogeado(): Promise<boolean> {
      const arr = await Memorialocal.obtener<NuevoUsuario>('usuarioActivo');
      return arr.length > 0;
    }
  }