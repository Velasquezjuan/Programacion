import { Injectable } from '@angular/core';

export interface MenuItem {
  label: string;
  path: string;
  roles: string[];
}


@Injectable({
  providedIn: 'root'
})
export class Menu {

  private base: MenuItem[] = [];
   /* { label: 'Home', path: '/home' }
  ];

  private adminSistema: MenuItem[] = [
    { label: 'Registro Vehículo', path: '/registro-vehiculo' },
    { label: 'Usuarios', path: '/registro-usuario' },
    { label: 'Cargar Planificación', path: '/cargar-planificacion' },
    { label: 'Bitácora', path: '/bitacora' },
    { label: 'Gestiones', path: '/gestion' },
    { label: 'Estado del Móvil', path: '/estado-movil' }
  ];

  private solicitante: MenuItem[] = [
    { label: 'Solicitud de Viaje', path: '/solicitud-viaje' }
  ];

  private conductor: MenuItem[] = [
    { label: 'Vehículo Asignado', path: '/vehiculo' }
  ];

  private its: MenuItem[] = [
    { label: 'Registro Vehículo', path: '/registro-vehiculo' },
    { label: 'Cargar Planificación', path: '/cargar-planificacion' },
    { label: 'Bitácora', path: '/bitacora' }
  ];

  private coordinador: MenuItem[] = [
    { label: 'Cargar Planificación', path: '/cargar-planificacion' },
    { label: 'Bitácora', path: '/bitacora' }
  ];

  getMenuItems(rol: 'adminSistema' | 'its' | 'solicitante' | 'coordinador' | 'conductor'): MenuItem[] {
    switch (rol) {
      case 'adminSistema': return [...this.base, ...this.adminSistema];
      case 'its':          return [...this.base, ...this.its];
      case 'solicitante':  return [...this.base, ...this.solicitante];
      case 'coordinador':  return [...this.base, ...this.coordinador];
      case 'conductor':    return [...this.base, ...this.conductor];
      default:             return [...this.base];
    }
  }*/
}
