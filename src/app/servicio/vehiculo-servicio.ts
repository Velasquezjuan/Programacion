import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class VehiculoServicio {

    private apiUrl = 'http://localhost:3000/api/vehiculos';

  constructor(private http: HttpClient) { }

  getVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createVehiculo(vehiculoData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro-vehiculo`, vehiculoData);
  }
}
