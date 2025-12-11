import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuLateralComponent } from '../componentes/menu-lateral/menu-lateral.component';

import { IonContent, IonHeader, IonToolbar, IonInput, 
         IonGrid, IonRow, IonCol, IonButton, IonItem, IonLabel, IonSelect, 
         IonSelectOption,  } from '@ionic/angular/standalone';
import { Validadores } from '../validador/validadores';
import { ToastController } from '@ionic/angular';
import { CentroServicio } from '../servicio/centro-servicio';
import { AutentificacionUsuario } from '../servicio/autentificacion-usuario';
import { Memorialocal } from '../almacen/memorialocal';
import { NotificacionesCorreo } from '../servicio/notificaciones-correo';
import { HttpErrorResponse } from '@angular/common/http';


interface NuevoUsuario {
  id: string;
  rut: string;
  usuario: string;
  contraseña: string;
  nombre: string;
  rol: 'adminSistema' | 'conductor' | 'its' | 'solicitante' | 'coordinador';
  correo: string;
}

@Component({
  selector: 'app-registro-usuario',
  templateUrl: './registro-usuario.page.html',
  styleUrls: ['./registro-usuario.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent,  IonHeader, IonToolbar, IonInput,  
    IonGrid, IonRow, ReactiveFormsModule, IonCol, IonButton, IonItem, IonLabel, IonSelect, IonSelectOption,
    CommonModule, FormsModule, 
  ]
})



export class RegistroUsuarioPage implements OnInit {

  
  nombre: string = '';
  correo: string = '';
  rut: string = '';
  contraseña: string = '';
  rol: 'adminSistema' | 'conductor' | 'its' | 'solicitante' | 'coordinador' = 'solicitante';
  usarAPI: boolean = false;

  /*centros: {
    salud: any[];
    atm: any[];
    educacion: any[];
    central: any[];
  } = {
    salud: [],
    atm: [],
    educacion: [],
    central: []
  };*/

  registroForm!: FormGroup; 

  centrosPrincipales: { value: number; label: string }[] = [];
  establecimientos: { value: number; label: string }[] = [];
  establecimientosSalud: { value: number, label: string }[] = [];
  establecimientosEducacion: { value: number, label: string }[] = [];
  establecimientosAtm: { value: number, label: string }[] = [];
  establecimientosDisponibles: { value: number; label: string }[] = []; 


   //Variables para mostrar campos dinámicamente
   showSolicitanteFields = false;
   showConductorFields = false;
   showCoordinadorFields = false;
   showItsFields = false;
   showAdminSistemaFields = false;
   showEstablecimiento = false;
   showSalud = false;
   showEducacion = false;
   showAtm = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private toastController: ToastController,
    private centroServicio: CentroServicio,
    private auth: AutentificacionUsuario,
    private notificaciones: NotificacionesCorreo,
  ) {}

  rolUsuario: string = '';

  //metodo para  mensajes de error
  async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 20000,
      position: 'top',
      color: color
    });
    toast.present();
  }

  //validadores de formulario
  ngOnInit() {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.compose([Validators.required, Validadores.soloTexto])],
      apellidoPaterno: ['', Validators.compose([Validators.required, Validadores.soloTexto])],
      apellidoMaterno: ['', Validators.compose([Validators.required, Validadores.soloTexto])],
      rut: ['', Validators.compose([Validators.required, Validadores.validarRut])],
      correo: ['', Validators.compose([Validators.required, Validadores.correoValido])],
      contrasena: ['', Validators.compose([Validators.required, Validadores.contra])],
      cargo: ['', Validators.required], 
      centro: ['', Validators.required],
      establecimiento: [''],
      areaDesempeno: ['', Validators.compose([Validators.required, Validadores.soloTexto])],
     centroSalud: [''],
      centroEducacion: [''],
      centroAtm: [''],
      nivelCentral: ['']
    
    });

       this.centrosPrincipales = this.centroServicio.obtenerCentros();
  
   
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      this.mostrarToast('Formulario incompleto', 'danger');
      return;
    }
    
    const f = this.registroForm.value;

    let establecimientoId = null;

    const centroId = Number(f.centro); 

      if (centroId === 2) {
          establecimientoId = f.centroSalud;
      } else if (centroId === 3) {
          establecimientoId = f.centroEducacion;
      } else if (centroId === 4) {
          establecimientoId = f.centroAtm;
      }
    
    

      const nuevoUsuario = {
      rut_usuario: f.rut,
      nombre: f.nombre,
      apellido_paterno: f.apellidoPaterno,
      apellido_materno: f.apellidoMaterno,
      correo: f.correo,
      contrasena: f.contrasena,
      rol: f.cargo,
      area: f.areaDesempeno,
      centro: f.centro,
      establecimiento: establecimientoId
    };

     this.auth.registrarUsuario(nuevoUsuario).subscribe({
      next: () => {
        this.notificaciones.enviarCorreoBienvenida(nuevoUsuario.correo, nuevoUsuario.nombre);
        this.mostrarToast('¡Usuario registrado con éxito!', 'success');
        this.registroForm.reset();
      },
      error: (error) => {
        console.error('Error en el proceso de registro:', error);
        
        let mensajeError = 'Error al registrar usuario.';
        if (error instanceof HttpErrorResponse) {
          mensajeError = error.error?.message || error.error?.errors?.[0]?.msg || 'Error de conexión.';
        } else if (error instanceof Error) {
          mensajeError = error.message;
        }
        
        this.mostrarToast(mensajeError, 'danger');
      }
    });
  }


  onCargoChange(event: any) {
    const selectedCargo = event.detail.value;

    // Restablecer los campos visibles
    this.showSolicitanteFields = false;
    this.showConductorFields = false;
    this.showCoordinadorFields = false;
    this.showItsFields = false;
    this.showAdminSistemaFields = false;
    

    // Mostrar campos según el cargo seleccionado
   if (selectedCargo === 'solicitante') {
      this.showSolicitanteFields = true;
    } else if (selectedCargo === 'conductor') {
      this.showConductorFields = true;
    } else if (selectedCargo === 'coordinador') {
      this.showCoordinadorFields = true;
    } else if (selectedCargo === 'its') {
     this.showItsFields = true;
    } else if (selectedCargo ==='adminSistema'){
      this.showAdminSistemaFields = true;
    }
 }

onCentroChange(event: any) {
     const centroId = event.detail.value;

    // Resetear todo
    this.showSalud = false;
    this.showEducacion = false;
    this.showAtm = false;
    const estControls = ['establecimientoSalud', 'establecimientoEducacion', 'establecimientoAtm'];
    estControls.forEach(controlName => {
        const control = this.registroForm.get(controlName);
        control?.clearValidators();
        control?.setValue('');
        control?.updateValueAndValidity();
    });

    if (centroId === 2) { // Salud
      this.showSalud = true;
      this.establecimientosSalud = this.centroServicio.obtenerEstablecimientos(centroId);
      this.registroForm.get('establecimientoSalud')?.setValidators([Validators.required]);
    } else if (centroId === 3) { // Educación
      this.showEducacion = true;
      this.establecimientosEducacion = this.centroServicio.obtenerEstablecimientos(centroId);
      this.registroForm.get('establecimientoEducacion')?.setValidators([Validators.required]);
    } else if (centroId === 4) { // ATM
      this.showAtm = true;
      this.establecimientosAtm = this.centroServicio.obtenerEstablecimientos(centroId);
      this.registroForm.get('establecimientoAtm')?.setValidators([Validators.required]);
    }
    /*
    considerar que los centros estan guardados segun su id para la 
    conversacion entren el front, backend y bd 
    */

   /* this.showSalud = false;
    this.showEducacion = false;
    this.showAtm = false;
    
    const estControl = this.registroForm.get('establecimiento');
    estControl?.setValue(''); 
    estControl?.clearValidators(); 


    if (centroId === 2) { 
      this.showSalud = true;
      this.establecimientosSalud = this.centroServicio.obtenerEstablecimientos(centroId);
      estControl?.setValidators([Validators.required]);
    }
    estControl?.updateValueAndValidity();*/
  }


   // Navegaciones
   goToHomePage() {
    this.router.navigate(['/home']);
  }
  goToRegistroUsuarioPage() {
    this.router.navigate(['/registro-usuario']);
  }
  goToRegistroVehiculoPage() {
    this.router.navigate(['/registro-vehiculo']);
  }
  goToBitacoraPage() {
    this.router.navigate(['/bitacora']);
  }
  goToViajesSolicitadosPage() {
    this.router.navigate(['/viajes-solicitados']);
  }
  
  goToLoginPage() {
    this.router.navigate(['/login']);
  }


}
