import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Memorialocal } from '../almacen/memorialocal';

@Injectable({
  providedIn: 'root'
})

export class VehiculoServicio {

    private apiUrl = 'http://localhost:3000/api/vehiculos';

  constructor(private http: HttpClient) { }

private getAuthHeaders(): Observable<HttpHeaders> {
    return from(Memorialocal.obtener<string>('token')).pipe(
      switchMap(token => {
        if (!token) {
          return of(new HttpHeaders({ 'Content-Type': 'application/json' }));
        }
        return of(new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }));
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
      switchMap(headers => {
        return this.http.post(`${this.apiUrl}/registro-vehiculo`, nuevoVehiculo, { headers });
      })
    );
  }
    actualizarVehiculo(id: string, datosVehiculo: any): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.put(`${this.apiUrl}/${id}`, datosVehiculo, { headers });
      })
    );
  }
}
