/**
 * ============================================================================
 * PROYECTO: GECOVI (Gestión de Control de Viajes)
 * DESARROLLADO POR: Juan Velasquez
 * FECHA DE CREACIÓN: 10 DE MARZO DEL 2025
 * ============================================================================
 * Este código es propiedad intelectual de Juan Velasquez.
 * Prohibida su distribución o copia sin autorización.
 * Lo hice para mi examen de titulo y que si me salio CTM AJAJ
 * ============================================================================
 */
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonIcon, IonContent, IonMenuButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, logOutOutline } from 'ionicons/icons';
import { AutentificacionUsuario } from '../servicio/autentificacion-usuario';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonIcon, IonContent, IonMenuButton
  ]
})
export class HomePage implements OnInit, OnDestroy {
  estaLogeado = false;
  nombreUsuario = '';
  private authSubscription!: Subscription;

  constructor(
    private router: Router,
    private auth: AutentificacionUsuario
  ) {
    addIcons({ person, logOutOutline });
  }

  async ngOnInit() {
    this.authSubscription = this.auth.usuarioActivo$.subscribe(usuario => {
      if (usuario) {
        this.estaLogeado = true;
        this.nombreUsuario = usuario.nombre || '';
      } else {
        this.estaLogeado = false;
        this.nombreUsuario = '';
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
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
