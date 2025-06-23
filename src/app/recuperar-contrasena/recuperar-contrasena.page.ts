import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
//import { CommonModule } from '@angular/common';
//import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonLabel, IonAlert,
  IonList, IonItem, IonInput,IonButton, AlertController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-recuperar-contrasena',
  templateUrl: './recuperar-contrasena.page.html',
  styleUrls: ['./recuperar-contrasena.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonLabel, IonAlert,
    IonList, IonItem, IonInput, IonButton]
})
export class RecuperarContrasenaPage implements OnInit {
  email: string = '';

  constructor(private router: Router, private alertController: AlertController) {}

  ngOnInit() {}

  // Método para enviar correo de recuperación
  async sendEmail() {
    if (!this.email || !this.isValidEmail(this.email)) {
      // Mostrar alerta de error si el correo es inválido
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor, ingrese un correo válido.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Simulación de envío de correo
    console.log(`Correo enviado a: ${this.email}`);

    // Mostrar alerta de confirmación
    const confirmationAlert = await this.alertController.create({
      header: 'Correo Enviado',
      message: 'Su contraseña será enviada en un plazo máximo de 2 días.',
      buttons: ['OK']
    });
    await confirmationAlert.present();
  }

  // Validación del formato de correo específico para nombre.apellidos@cmpuentealto.cl
  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z]+\.[a-zA-Z]+@cmpuentealto\\.cl$/;
    return emailPattern.test(email);
  }

  goTohomePage() {
    this.router.navigate(['/home']);
  }
}