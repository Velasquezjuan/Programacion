import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, of, Observer} from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Memorialocal } from '../almacen/memorialocal';


export interface UsuarioPendiente {
  id: string;
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
export class UsuarioServicio {
  private apiUrl = 'http://localhost:3000/api/usuarios'; 

  constructor(private http: HttpClient) {}

  registrarUsuario(usuario: UsuarioPendiente): Observable<any> {
    if (!navigator.onLine) {
      return from (this.guardarUsuarioPendiente(usuario)).pipe(
        catchError(() => of({ guardadoLocalmente: true }))
      );
    }

    return this.http.post(`${this.apiUrl}/registro`, usuario).pipe(
      catchError(async err => {
        await this.guardarUsuarioPendiente(usuario);
        return of({ error: true, mensaje: 'Guardado local por error de red', detalles: err });
      })
    );
  }

  private async guardarUsuarioPendiente(usuario: UsuarioPendiente): Promise<void> {
    usuario.id = usuario.correo;
    const existentes = await Memorialocal.obtener<UsuarioPendiente>('usuarios_pendientes') || [];
    existentes.push(usuario);
    await Memorialocal.guardar('usuarios_pendientes', existentes);
  }

  sincronizarUsuarios(): Observable<any[]> {
    return new Observable((observer: Observer<any[]>) => {
      (async () => {
        const registrosLocales = await Memorialocal.obtener<UsuarioPendiente>('usuarios_pendientes') || [];

        if (!registrosLocales.length) {
          observer.next([]);
          observer.complete();
          return;
        }

        const resultados: any[] = [];
        let completados = 0;

        for (const usuario of registrosLocales) {
          this.http.post(`${this.apiUrl}/registro`, usuario).subscribe({
            next: async res => {
              resultados.push(res);
              completados++;
              if (completados === registrosLocales.length) {
                await Memorialocal.eliminar('usuarios_pendientes', usuario.id);
                observer.next(resultados);
                observer.complete();
              }
            },
            error: async err => {
              resultados.push({ error: true, detalles: err });
              completados++;
              if (completados === registrosLocales.length) {
                observer.next(resultados);
                observer.complete();
              }
            }
          });
        }
      })();
    });
  }
}