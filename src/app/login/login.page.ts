import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutentificacionUsuario } from '../servicio/autentificacion-usuario';
import { IonContent, IonHeader, IonTitle, IonToolbar,
  IonList, IonItem, IonInput, IonButton
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { Memorialocal } from '../almacen/memorialocal';
import { addIcons } from 'ionicons';
import { logInOutline, atSharp, lockClosed } from 'ionicons/icons'; 


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [ CommonModule,  FormsModule, IonContent, IonHeader, IonTitle,
    IonToolbar, IonList, IonItem, IonInput, IonButton
  ]
})
export class LoginPage {
  correo = '';
  contrasena = '';

  constructor(
    private auth: AutentificacionUsuario,
    private router: Router,
    private toastCtrl: ToastController
  ) {
      addIcons({atSharp,lockClosed});}

  async login() {
    if (!this.correo || !this.contrasena) {
      return this.show('Debes ingresar correo y contraseña','warning');
    }
    try {
      await this.auth.loginLocal(this.correo, this.contrasena);
      await this.show(`¡Bienvenido ${this.correo}!`,'success');
      this.router.navigate(['/home']);
    } catch(err: any) {
      await this.show(err.message,'danger');
    }
  }

  private async show(msg: string, col: 'success'|'warning'|'danger' = 'success') {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color: col, position: 'top' });
    await t.present();
  }

  async showToast(message: string, color: 'success'|'warning'|'danger' = 'success') {
    const t = await this.toastCtrl.create({
      message, duration: 2000, position: 'top', color
    });
    await t.present();
  }

  goToRegistroUsuarioPage() {
    this.router.navigate(['/registro-usuario']);
  }

  goToRecuperarContrasenaPage(){
    this.router.navigate(['/recuperar-contrasena']);
  }
}

