import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';
import { AutentificacionUsuario } from './autentificacion-usuario';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AutentificacionUsuario,
    private router: Router
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const logged = await this.auth.estaLogeado();
    if (!logged) {
      await this.router.navigate(['/login']);
      return false;
    }

    const allowedRoles: string[] = route.data['roles'] || [];
    if (allowedRoles.length) {
      const u = await this.auth.obtenerUsuarioActivo();
      if (!u || !allowedRoles.includes(u.rol)) {
        await this.router.navigate(['/home']);
        return false;
      }
    }

    return true;
  }
}
