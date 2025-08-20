import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators  } from '@angular/forms';
import { Router } from '@angular/router';
import { AutentificacionUsuario } from '../servicio/autentificacion-usuario';
import { IonContent, IonHeader, IonTitle, IonToolbar,
  IonList, IonItem, IonInput, IonButton
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { Memorialocal } from '../almacen/memorialocal';
import { addIcons } from 'ionicons';
import { logInOutline, atSharp, lockClosed } from 'ionicons/icons'; 
import { Validadores } from '../validador/validadores';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [ CommonModule,  FormsModule, IonContent, IonHeader, IonTitle,
    IonToolbar, IonList, IonItem, IonInput, IonButton, ReactiveFormsModule,
    IonButton, IonInput, IonList, IonItem, IonTitle, IonToolbar,
 
  ]
})
export class LoginPage {

  loginForm!: FormGroup;


  constructor(
    private auth: AutentificacionUsuario,
    private router: Router,
    private toastCtrl: ToastController,
    private fb: FormBuilder,
  ) {
      addIcons({atSharp,lockClosed, logInOutline});}


  ngOnInit() {
        this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validadores.correoValido]],
      contrasena: ['', [Validators.required, Validadores.contra]]
    });
  }

async login() {
    if (this.loginForm.invalid) {
      return this.show('Debes ingresar correo y contraseña válidos', 'warning');
    }
    
    const { correo, contrasena } = this.loginForm.value;

    this.auth.login(correo, contrasena).subscribe({
      next: async (respuesta) => {
        await this.show(`¡Bienvenido ${respuesta.usuario.nombre}!`, 'success');
        this.router.navigate(['/home']);
      },
      error: async (error) => {
        console.error('Error en el proceso de login:', error);
        await this.show(error.message || 'Error al iniciar sesión.', 'danger');
      }
    });
  }


  private async show(msg: string, col: 'success'|'warning'|'danger' = 'success') {
    const t = await this.toastCtrl.create({ message: msg, duration: 3000, color: col, position: 'top' });
    await t.present();
  }



  goToRegistroUsuarioPage() {
    this.router.navigate(['/registro-usuario']);
  }

  goToRecuperarContrasenaPage(){
    this.router.navigate(['/recuperar-contrasena']);
  }
}

