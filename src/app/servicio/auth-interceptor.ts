import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AutentificacionUsuario } from './autentificacion-usuario';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

     constructor(private authService: AutentificacionUsuario) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
          let request = req;
          
          if (token) {
             request = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${token}`)
             });
          }
          return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
              if (error.status === 401) {
                console.log('Token expirado o inválido detectado por Interceptor');
                this.authService.logout('Su sesión ha caducado. Ingrese nuevamente.');
              }
              return throwError(() => error);
            })
          );
      })
    );
  }
}
