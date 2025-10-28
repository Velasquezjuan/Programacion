import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class RecuContraServicio {
    private apiUrl = `${environment.apiUrl}api/cambiocontra`;

  constructor(private http: HttpClient) { }

  solicitarReseteo(rut: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/solicitar-reseteo`, { rut });
  }

  verificarToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verificar-token/${token}`);
  }

  resetearContrasena(token: string, contrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resetear-contrasena`, { token, contrasena });
  }
}
