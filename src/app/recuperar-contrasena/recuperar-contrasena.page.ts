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
import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { IonContent, IonLabel, IonList, IonItem, 
IonInput, IonButton, } from '@ionic/angular/standalone';

import { AlertController, ToastController, } from '@ionic/angular';

import { HttpClient } from '@angular/common/http';
import { RecuContraServicio } from '../servicio/recu-contra-servicio';
import { AutentificacionUsuario } from '../servicio/autentificacion-usuario';
import { Validadores } from '../validador/validadores';
import { addIcons } from 'ionicons';
import { mailOutline, personOutline } from 'ionicons/icons';

addIcons({mailOutline,personOutline});

@Component({
  selector: 'app-recuperar-contrasena',
  templateUrl: './recuperar-contrasena.page.html',
  styleUrls: ['./recuperar-contrasena.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonLabel,  IonList, IonItem, CommonModule, FormsModule,
IonInput, IonButton, ]
})
export class RecuperarContrasenaPage implements OnInit {

  email: string = '';
  rut: string = '';
  correoEncontrado: string = '';
  correoMascarado: string = '';
  paso: 'ingresarRUT' | 'confirmarCorreo' | 'contactarAdmin' = 'ingresarRUT';

  constructor(
    private router: Router, 
    private alertController: AlertController,
    private toastController: ToastController,
    private recuContraServicio: RecuContraServicio,
    private authServicio: AutentificacionUsuario,
  ) {
    addIcons({
      'mail-sharp': mailOutline,
       'person-outline': personOutline
      });
  }

  ngOnInit() {}

  async buscarCorreoPorRUT() {
    if (!this.rut) {
      this.mostrarToast('Por favor, ingrese un RUT.', 'danger');
      return;
    }
    
    const validacion = Validadores.validarRut({ value: this.rut } as any);
    if (validacion) {
      this.mostrarToast('RUT inválido. Verifique el formato.', 'danger');
      return;
    }

    this.authServicio.buscarUsuarioPorRut(this.rut).subscribe({
      next: (data) => {
        this.correoEncontrado = data.correo;
        this.correoMascarado = this.mascararCorreo(data.correo);
        this.paso = 'confirmarCorreo'; 
      },
      error: (err) => {
        this.mostrarToast('RUT no encontrado en nuestros registros.', 'danger');
      }
    });
  }

  // El usuario hace clic en "Sí, enviar enlace"
  async confirmarEnvio() {
    this.recuContraServicio.solicitarReseteo(this.rut).subscribe({
      next: async (respuesta) => {
        const alert = await this.alertController.create({
          header: 'Petición Enviada',
          message: `Se ha enviado un enlace de recuperación a su correo: ${this.correoMascarado}`,
          buttons: ['OK']
        });
        await alert.present();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.mostrarToast('Error al enviar el correo. Intente más tarde.', 'danger');
      }
    });
  }

  //  El usuario hace clic en "No"
  mostrarMensajeAdmin() {
    this.paso = 'contactarAdmin';
  }

  // El usuario hace clic en "Volver" desde el mensaje de admin
  volverAInicio() {
    this.paso = 'ingresarRUT';
    this.rut = '';
    this.correoEncontrado = '';
    this.correoMascarado = '';
  }

  // Función para enmascarar el correo (ej: ju***@dominio.cl)
  mascararCorreo(email: string): string {
    const [usuario, dominio] = email.split('@');
    if (usuario.length <= 3) {
      return `${usuario.substring(0, 1)}**@${dominio}`;
    }
    return `${usuario.substring(0, 3)}****@${dominio}`;
  }

  async mostrarToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top',
    });
    toast.present();
  }

  goTohomePage() {
    this.router.navigate(['/home']);
  }
}