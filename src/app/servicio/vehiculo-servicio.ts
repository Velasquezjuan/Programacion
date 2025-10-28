import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Memorialocal } from '../almacen/memorialocal';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})

export class VehiculoServicio {

    private apiUrl = `${environment.apiUrl}api/vehiculos`;

  constructor(private http: HttpClient) { }

private getAuthHeaders(): Observable<HttpHeaders> {
    return from(Memorialocal.obtenerValor<string>('token')).pipe(
      switchMap(token => {
        if (!token) {
          return of(new HttpHeaders({ 'Content-Type': 'application/json' }));
        }
        return of(
          new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          })
        );
      })
    );
  }

  getVehiculos(): Observable<any[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get<any[]>(this.apiUrl, { headers });
      })
    );
  }

  registrarVehiculo(nuevoVehiculo: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers =>
        this.http.post(`${this.apiUrl}/registro-vehiculo`, nuevoVehiculo, {
          headers
        })
      ),
      catchError(error => {
        console.error('Error al registrar vehículo en la API:', error);
        return throwError(() => new Error(error.error?.message || 'Error de conexión con el servidor.'));
      })
    );
  }

  actualizarVehiculo(id: string, datosVehiculo: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.put(`${this.apiUrl}/${id}`, datosVehiculo, {
          headers
        });
      })
    );
  }

  getVehiculosPorPrograma(idPrograma: string): Observable<any[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get<any[]>(`${this.apiUrl}/por-programa/${idPrograma}`, { headers });
      })
    );
  }

  getTiposVehiculoPorPrograma(idPrograma: string): Observable<any[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get<any[]>(`${this.apiUrl}/tipos-por-programa/${idPrograma}`, { headers });
      })
    );
  }
  
  getProgramasPorVehiculo(patente: string): Observable<any[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get<any[]>(`${this.apiUrl}/programas-por-vehiculo/${patente}`, { headers });
      })
    );
  }


}
