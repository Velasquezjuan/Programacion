import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Memorialocal } from '../almacen/memorialocal';
import { Observable, from, of, throwError } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs'; 


interface LoginResponse {
  message: string;
  token: string;
  usuario: any;
}

export interface NuevoUsuario {
  id:string;
  rut: string;
  usuario: string;
  contraseña: string;
  nombre: string;
  rol: 'adminsistema' | 'conductor' | 'its' | 'solicitante' | 'coordinador';
  correo: string;
}

  @Injectable({
    providedIn: 'root'
  })
  export class AutentificacionUsuario {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'auth-token';
  private usuarioActivoSubject = new BehaviorSubject<any | null>(null);
  public usuarioActivo$ = this.usuarioActivoSubject.asObservable();

  constructor( private http: HttpClient) {
     this.cargarUsuarioInicial();
  }

    async cargarUsuarioInicial() {
    const usuario = await this.obtenerUsuarioActivo();
    if (usuario && this.estaLogeado()) {
      this.usuarioActivoSubject.next(usuario);
    } else {
      this.usuarioActivoSubject.next(null);
    }
  }


  login(correo: string, contrasena: string): Observable<any> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { correo, contrasena }).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.token);
        const usuarioParaGuardar = { ...response.usuario, id: response.usuario.rut};
        Memorialocal.guardar('usuarioActivo', usuarioParaGuardar);
        console.log('Login API exitoso.');
        this.usuarioActivoSubject.next(usuarioParaGuardar);
        console.log('Login API exitoso.');
      }),
      catchError(error => {
        console.warn('Falló el login con la API, intentando login local...', error);
        return from(this.loginLocal(correo, contrasena));
      })
    );
  }

  /**
   * Login local usando Memorialocal
   */

  private async loginLocal(correo: string, contrasena: string): Promise<any> {
    const todos = await Memorialocal.obtener<NuevoUsuario>('usuarios') || [];
    const usuario = todos.find(u => u.correo === correo);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado localmente.');
    }

 
    if (usuario.contraseña !== contrasena) {
      throw new Error('Contraseña incorrecta para login offline.');
    }

    console.log('Login local exitoso.');
 
     const { contraseña: _, ...usuarioParaSesion } = usuario;
    await Memorialocal.guardar('usuarioActivo', usuarioParaSesion);
    this.usuarioActivoSubject.next(usuarioParaSesion);
    return { message: 'Login local exitoso', usuario: usuarioParaSesion };

  }

  /** Registro de nuevo usuario online con respaldo offline*/
  
    registrarUsuario(nuevoUsuario: any): Observable<any> {
    if (navigator.onLine) {
      return this.http.post(`${this.apiUrl}/registro-usuario`, nuevoUsuario).pipe(
        switchMap(() => from(Memorialocal.guardar('usuarios', nuevoUsuario)))
      );
    } else {
      console.warn('Sin conexión. Registrando usuario localmente para sincronizar después.');
      const usuarioOffline = { ...nuevoUsuario, syncPending: true };
      return from(Memorialocal.guardar('usuarios', usuarioOffline));
    }
  }

  // Logout

   async logout(): Promise<void> {
    localStorage.removeItem(this.tokenKey);
    const usuario = await this.obtenerUsuarioActivo();
    if (usuario) {
      await Memorialocal.eliminar('usuarioActivo', usuario.id);
    }
    this.usuarioActivoSubject.next(null);
  }
  
  /** Obtiene el token guardado */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** Usuario activo ( Memorialocal) */
  async obtenerUsuarioActivo(): Promise<any | null> {
    const arr = await Memorialocal.obtener<any>('usuarioActivo');
    return arr.length ? arr[0] : null;
  }
  
  /** ve rificacion del token es valido y no ha expirado */
  estaLogeado(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      const expiracion = decodedToken.exp * 1000;
      const ahora = new Date().getTime();

      
      return expiracion > ahora;
    } catch (error) {
 
      console.error('Error al decodificar el token:', error);
      return false;
    }
  }
  }