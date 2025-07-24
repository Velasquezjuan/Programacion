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
    { label: 'Viajes solicitados',  path: '/viajes-solicitados',             roles: ['adminSistema','its','coordinador'] },
    { label: 'Solicitar viaje',     path: '/solicitud-viaje',                roles: ['adminSistema','its','coordinador','solicitante'] },
    { label: 'Carga de Viajes',     path: '/viajes-masivos' ,               roles: ['adminSistema','its','coordinador'] },
    { label: 'Registro Usuario',    path: '/registro-usuario',               roles: ['adminSistema'] },
    { label: 'Registro Vehículo',   path: '/registro-vehiculo',              roles: ['adminSistema','its'] },
    { label: 'Bitácora',            path: '/bitacora',                       roles: ['adminSistema','its','conductor'] },
    { label: 'Gestión',             path: '/gestion',                        roles: ['adminSistema','coordinador'] },
    { label: 'Calendario',          path: '/calendario',                     roles: ['adminSistema','conductor','its','solicitante','coordinador'] },
    { label: 'Mis Viajes',          path: '/mis-viajes',                     roles: ['adminSistema','conductor','its','solicitante','coordinador'] }, 

  ];

  constructor(
    private auth: AutentificacionUsuario,
    private menuCtrl: MenuController,
    private router: Router
  ) {}

  async onLogout() {
    // cierra el menú
    await this.menuCtrl.close();
    // borra sesión y redirige
    await this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
