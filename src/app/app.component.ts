import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MenuLateralComponent } from './componentes/menu-lateral/menu-lateral.component';
import { AutentificacionUsuario } from './servicio/autentificacion-usuario';

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
  constructor(private auth: AutentificacionUsuario) {}
  async ngOnInit() {
    const u = await this.auth.obtenerUsuarioActivo();
    this.rolUsuario = u?.rol || '';
  }
}
