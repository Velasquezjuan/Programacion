import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class Administracion {

 private apiUrl = `${environment.apiUrl}api/gestion`;

 constructor(private http: HttpClient) { } 

 getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`);
  }

  updateUsuario(rut: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${rut}`, data);
  }
  
  getEstablecimientos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/establecimientos`);
  }

  getVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vehiculos`);
  }

  updateVehiculo(patente: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/vehiculos/${patente}`, data);
  }
  
  desbloquearUsuario(rut: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/usuarios/${rut}/desbloquear`, {});
}

}
