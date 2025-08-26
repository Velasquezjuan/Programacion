import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  getVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }


 registrarVehiculo(nuevoVehiculo: any): Observable<any> {
    if (navigator.onLine) {
      return this.http.post(`${this.apiUrl}/registro-vehiculo`, nuevoVehiculo).pipe(
        switchMap(() => from(Memorialocal.guardar('vehiculos', nuevoVehiculo)))
      );
    } else {
      console.warn('Sin conexión. Registrando vehículo localmente para sincronizar después.');
      const vehiculoOffline = { ...nuevoVehiculo, syncPending: true }; 
      return from(Memorialocal.guardar('vehiculos', vehiculoOffline));
    }
  }
}
