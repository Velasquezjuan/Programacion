import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonIcon, IonContent} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, logOutOutline } from 'ionicons/icons';
import { AutentificacionUsuario } from '../servicio/autentificacion-usuario';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonIcon, IonContent
  ]
})
export class HomePage implements OnInit {
  estaLogeado = false;
  nombreUsuario = '';

  constructor(
    private router: Router,
    private auth: AutentificacionUsuario
  ) {
    addIcons({ person, logOutOutline });
  }

  async ngOnInit() {
    this.estaLogeado = await this.auth.estaLogeado();
    if (this.estaLogeado) {
      const u = await this.auth.obtenerUsuarioActivo();
      this.nombreUsuario = u?.nombre || '';
    }
  }

  goToLoginPage() {
    this.router.navigate(['/login']);
  }

  async logout() {
    await this.auth.logout();
    // tras cerrar, redirige a login
    this.router.navigate(['/login']);
  }
}
