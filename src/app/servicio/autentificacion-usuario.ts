import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Memorialocal } from '../almacen/memorialocal';
import { Observable, from, of, throwError } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs'; 
import { environment } from 'src/environments/environment';


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
  private apiUrl = `${environment.apiUrl}api/auth`;
  private tokenKey = 'auth-token';
  private usuarioActivoSubject = new BehaviorSubject<any | null>(null);
  public usuarioActivo$ = this.usuarioActivoSubject.asObservable();

  constructor( private http: HttpClient) {
     this.cargarUsuarioInicial();
  }

  public getUsuarios(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/usuarios`);  
}
  buscarUsuarioPorRut(rut: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/buscar-por-rut`, { rut });
}
    async cargarUsuarioInicial() {
    const token = await Memorialocal.obtenerValor<string>('token');
    if (token && this.tokenEsValido(token)) {
      const usuario = await Memorialocal.obtenerValor('usuarioActivo');
      this.usuarioActivoSubject.next(usuario);
    } else {
      this.usuarioActivoSubject.next(null);
    }
  }


  login(correo: string, contrasena: string): Observable<any> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { correo, contrasena }).pipe(
      switchMap(async (response) => {
        
        await Memorialocal.guardarValor('token', response.token);
        await Memorialocal.guardarValor('usuarioActivo', response.usuario);
        this.usuarioActivoSubject.next(response.usuario);
        return response;
      }),
      catchError(error => {
        console.error('Error en el login de la API:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Login local usando Memorialocal
   */

  private async loginLocal(correo: string, contrasena: string): Promise<any> {
    const todos = await Memorialocal.obtener<NuevoUsuario>('usuarios') || [];
    const usuario = todos.find(u => u.correo === correo);
    
    if (!usuario || usuario.contraseña !== contrasena) {
      throw new Error('Credenciales locales inválidas.');
    }

    const { contraseña: _, ...usuarioParaSesion } = usuario;
    await Memorialocal.guardarValor('usuarioActivo', usuarioParaSesion);
    this.usuarioActivoSubject.next(usuarioParaSesion);
    return { message: 'Login local exitoso', usuario: usuarioParaSesion };
  }

  /** Registro de nuevo usuario online con respaldo offline*/
  
  registrarUsuario(datosUsuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro-usuario`, datosUsuario);
  }


  // Logout
 async logout(): Promise<void> {
    await Memorialocal.eliminarValor('token');
    await Memorialocal.eliminarValor('usuarioActivo');
    this.usuarioActivoSubject.next(null);
  }
  
  /** Obtiene el token guardado */
  getToken(): Promise<string | null> {
    return Memorialocal.obtenerValor('token');
  }

  /** Usuario activo ( Memorialocal) */
  obtenerUsuarioActivo(): Promise<any | null> {
    return Memorialocal.obtenerValor('usuarioActivo');
  }
  
  /** ve rificacion del token es valido y no ha expirado */
  async estaLogeado(): Promise<boolean> {
    const token = await this.getToken();
    return this.tokenEsValido(token);
  }

  private tokenEsValido(token: string | null): boolean {
    if (!token) {
      return false;
    }
    try {
      const decodedToken: any = jwtDecode(token);
      const expiracion = decodedToken.exp * 1000;
      return expiracion > new Date().getTime();
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return false;
    }
  }
  }