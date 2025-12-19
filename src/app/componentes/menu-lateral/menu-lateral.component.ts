import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular';
import { AutentificacionUsuario } from 'src/app/servicio/autentificacion-usuario';
import { logOutOutline } from 'ionicons/icons';

interface MenuItem {
  label: string;
  path: string;
  roles: string[];
}

@Component({
  selector: 'app-menu-lateral',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonicModule
  ],
  template: `
<ion-list lines="full">
  <ion-menu-toggle auto-hide="false" *ngFor="let item of menuItems">
    <ion-item
      button
      [routerLink]="item.path"
      routerDirection="root"
      *ngIf="item.roles.includes(rol)"
    >
      <ion-label>{{ item.label }}</ion-label>
    </ion-item>
  </ion-menu-toggle>
</ion-list>

<ion-list lines="none">
  <ion-menu-toggle auto-hide="false">
    <ion-item button (click)="onLogout()">
      <ion-icon slot="start" [icon]="logOutOutline"></ion-icon>
      <ion-label>Cerrar Sesión</ion-label>
    </ion-item>
  </ion-menu-toggle>
</ion-list>
`
})
export class MenuLateralComponent {
  @Input() rol!: string;
  logOutOutline = logOutOutline;

  menuItems: MenuItem[] = [
    { label: 'Inicio',              path: '/home',                           roles: ['adminSistema','conductor','its','solicitante','coordinador'] },
    { label: 'Viajes solicitados',  path: '/viajes-solicitados',             roles: ['adminSistema','coordinador'] },
    { label: 'Solicitar viaje',     path: '/solicitud-viaje',                roles: ['adminSistema','its','coordinador','solicitante'] },
    { label: 'Carga de Viajes Masivos',     path: '/viajes-masivos' ,        roles: ['adminSistema','coordinador'] },
    { label: 'Registro Usuario',    path: '/registro-usuario',               roles: ['adminSistema'] },
    { label: 'Registro Vehículo',   path: '/registro-vehiculo',              roles: ['adminSistema','coordinador'] },
    { label: 'Bitácora',            path: '/bitacora',                       roles: ['adminSistema','coordinador'] },
    { label: 'Gestión de usuarios',             path: '/gestion',                        roles: ['adminSistema','coordinador'] },
    { label: 'Planificación Masiva',          path: '/calendario',                     roles: ['adminSistema','coordinador'] },
    { label: 'Programacion',        path: '/programacion',                     roles: ['adminSistema','coordinador'] },
    { label: 'Mis Viajes',          path: '/mis-viajes',                     roles: ['adminSistema','conductor','its','solicitante','coordinador'] },
    { label: 'Historico de Solicitudes',          path: '/historico-solicitud',             roles: ['adminSistema','coordinador'] },  
   
  
  ];

  constructor(
    private auth: AutentificacionUsuario,
    private menuCtrl: MenuController,
    private router: Router
  ) {}

  async onLogout() {
    await this.menuCtrl.close();
    await this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
