import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Memorialocal } from '../almacen/memorialocal';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ViajesServicio {

  private apiUrl = `${environment.apiUrl}api/viajes`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): Observable<HttpHeaders> {
    
    return from(Memorialocal.obtenerValor<string>('token') as Promise<string>).pipe(
      switchMap((token: string | null) => {
        if (!token) {
          return new Observable<HttpHeaders>(observer => observer.error(new Error('No se encontró token de autenticación.')));
        }
        return of(new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }));
      })
    );
  }

  getViajes(): Observable<any[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get<any[]>(this.apiUrl, { headers });
      })
    );
  }

  createViaje(datosViaje: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.post(`${this.apiUrl}/solicitar`, datosViaje, { headers });
      })
    );
  }

  updateEstado(id: string, estado: 'aceptado' | 'rechazado' | 'reagendado', motivo: string = '', patente: string = '', nuevaHora: string = '', nuevaFecha: string = ''): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const body: any = { estado };
        if (estado === 'reagendado') {
          body.motivo_reagendamiento = motivo; 
        } else if (estado === 'rechazado') {
          body.motivo_rechazo = motivo; 
        }
        if (patente) body.vehiculo_patente = patente;
        if ( nuevaHora ) body.nueva_hora = nuevaHora;
        if ( nuevaFecha ) body.nueva_fecha = nuevaFecha;
        return this.http.put(`${this.apiUrl}/${id}/estado`, body, { headers });
      })
    );
  }
  
getViajesPorUsuario(nombreUsuario: string): Observable<any[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get<any[]>(`${this.apiUrl}/usuario/${nombreUsuario}`, { headers });
      })
    );
  }

updateViaje(id: string, datosViaje: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.put(`${this.apiUrl}/${id}`, datosViaje, { headers });
      })
    );
  }


  public createViajeMasivo(viaje: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/masivo`, viaje);
}

public getViajesMasivos(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/masivos`);
}

}
