import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Memorialocal } from '../almacen/memorialocal';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class VehiculoServicio {

    private apiUrl = 'http://localhost:3000/api/vehiculos';

  constructor(private http: HttpClient) { }

   registrarVehiculo(datosVehiculo: any): Observable<any> {
    const token = Memorialocal.obtener('token');

   
    if (!token) {
      return new Observable(observer => {
        observer.error({ error: { message: 'No se encontró token de autenticación.' } });
      });
    }

    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}/registro-vehiculo`, datosVehiculo, { headers: headers });
  }
}
