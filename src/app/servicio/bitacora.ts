import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; 

@Injectable({
  providedIn: 'root'
})

export class Bitacora {
     private apiUrl = `${environment.apiUrl}api/bitacora`;

      constructor(private http: HttpClient) { }

  getDashboardData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  generarReporte(filtros: any): Observable<any> {
    let params = new HttpParams();
    for (const key in filtros) {
      if (filtros.hasOwnProperty(key) && filtros[key]) {
        params = params.append(key, filtros[key]);
      }
    }
    return this.http.get(`${this.apiUrl}/reporte`, { params });
  }

  // Si necesitas exportar a CSV/Excel, podrías hacer algo así
  exportarReporte(filtros: any): Observable<any> {
    let params = new HttpParams();
    for (const key in filtros) {
      if (filtros.hasOwnProperty(key) && filtros[key]) {
        params = params.append(key, filtros[key]);
      }
    }
    
    return this.http.get(`${this.apiUrl}/reporte/exportar`, { params, responseType: 'blob' });
  }

  exportarDashboard(): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/dashboard/exportar`, { responseType: 'blob' });
}

}
