import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, 
  FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar,
   IonItem, IonLabel, IonInput, IonButton, IonIcon, ToastController } from '@ionic/angular/standalone';

import { RecuContraServicio } from '../servicio/recu-contra-servicio';
import { Validadores } from '../validador/validadores';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

@Component({
  selector: 'app-nueva-contrasena',
  templateUrl: './nueva-contrasena.page.html',
  styleUrls: ['./nueva-contrasena.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
   IonItem, IonLabel, IonInput, IonButton, IonIcon, ReactiveFormsModule
  ]
})
export class NuevaContrasenaPage implements OnInit {

  passwordForm: FormGroup;
  token: string | null = null;
  showPassword = false;
  showConfirmPassword = false;
  tokenValido = false;
  mensajeError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private recuContraServicio: RecuContraServicio
  ) { 
    addIcons({ 'eye-outline': eyeOutline, 'eye-off-outline': eyeOffOutline });
    
    this.passwordForm = this.fb.group({
      contrasena: ['', [Validadores.contra, Validators.minLength(8), Validators.maxLength(12)]],
      confirmarContrasena: ['',  [Validadores.contra, Validators.minLength(6), Validators.maxLength(12)]]
    }, {
      validators: this.passwordMatchValidator 
    });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    
    if (!this.token) {
      this.mensajeError = 'Enlace no válido. Falta el token.';
      this.tokenValido = false;
      return;
    }

    // Verificamos el token con el backend
    this.recuContraServicio.verificarToken(this.token).subscribe({
      next: () => {
        this.tokenValido = true;
      },
      error: (err) => {
        this.mensajeError = 'El enlace es inválido o ha expirado. Por favor, solicita uno nuevo.';
        this.tokenValido = false;
      }
    });
  }

  // Validador personalizado para asegurar que las contraseñas coincidan
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const contrasena = control.get('contrasena');
    const confirmarContrasena = control.get('confirmarContrasena');
    
    if (contrasena && confirmarContrasena && contrasena.value !== confirmarContrasena.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }
  onSubmit() {
    if (this.passwordForm.invalid || !this.token) {
      this.mostrarToast('Por favor, corrige los errores del formulario.', 'danger');
      return;
    }

    const nuevaContrasena = this.passwordForm.value.contrasena;
    
    this.recuContraServicio.resetearContrasena(this.token, nuevaContrasena).subscribe({
      next: async () => {
        await this.mostrarToast('¡Contraseña actualizada con éxito!', 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.mostrarToast(err.error?.message || 'Error al actualizar la contraseña.', 'danger');
      }
    });
  }

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  async mostrarToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top',
    });
    toast.present();
  }


 
   goTologinPage() {
    this.router.navigate(['/login']);
  }

}
