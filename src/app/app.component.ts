import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MenuLateralComponent } from './componentes/menu-lateral/menu-lateral.component';
import { AutentificacionUsuario } from './servicio/autentificacion-usuario';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    IonicModule,
    RouterModule,
    MenuLateralComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  rolUsuario = '';
  private authSubscription: Subscription;

  constructor(private auth: AutentificacionUsuario) {
    this.authSubscription = new Subscription();
  }
   ngOnInit() {
    this.authSubscription = this.auth.usuarioActivo$.subscribe(usuario => {
      this.rolUsuario = usuario?.rol || '';
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
