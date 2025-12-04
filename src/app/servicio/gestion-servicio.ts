import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Memorialocal } from '../almacen/memorialocal';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GestionServicio {

  private apiUrl = `${environment.apiUrl}api/usuarios`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): Observable<HttpHeaders> {
    return from(Memorialocal.obtener<string>('token')).pipe(
      switchMap(token => {
        if (!token) {
          throw new Error('No se encontró token de autenticación.');
        }
        return of(new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }));
      })
    );
  }


  getUsuarios(): Observable<any[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get<any[]>(this.apiUrl, { headers });
      })
    );
  }
}
