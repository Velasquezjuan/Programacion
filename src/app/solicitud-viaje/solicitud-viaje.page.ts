import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// componentes
import { MenuLateralComponent } from '../componentes/menu-lateral/menu-lateral.component';
import {IonContent,IonMenuButton, IonHeader, IonTitle, 
  IonToolbar, IonInput, IonToggle,
  IonGrid, IonRow, IonCol, IonButton, IonItem, IonLabel, IonSelect, 
  IonSelectOption,  } from '@ionic/angular/standalone';

import { ToastController } from '@ionic/angular';

import { Validadores } from '../validador/validadores';

// servicios
import { AutentificacionUsuario } from '../servicio/autentificacion-usuario';
import { Memorialocal } from '../almacen/memorialocal';
import { NotificacionesCorreo } from '../servicio/notificaciones-correo';
import { ViajesServicio } from '../servicio/viajes-servicio';
import { VehiculoServicio } from '../servicio/vehiculo-servicio';
import { CentroServicio } from '../servicio/centro-servicio';
import { Agenda } from '../servicio/agenda';


@Component({
  selector: 'app-solicitud-viaje',
  templateUrl:'./solicitud-viaje.page.html',
  styleUrls: ['./solicitud-viaje.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonContent, IonMenuButton, IonHeader, IonTitle,
    IonToolbar, IonInput, IonToggle ,ReactiveFormsModule, MenuLateralComponent,
    IonGrid, IonRow, IonCol, IonButton, IonItem, IonLabel, IonSelect,
    IonSelectOption, CommonModule, FormsModule,
  ]
})
export class SolicitudViajePage implements OnInit {
 registroForm!: FormGroup;
  
 /* centros = {
    central:   [] as { value:string; label:string }[],
    salud:     [] as { value:string; label:string }[],
    educacion: [] as { value:string; label:string }[],
    atm:       [] as { value:string; label:string }[]
  };*/
  auto = {
    vehiculo: [] as { value:string; label:string }[]
  };

    centrosPrincipales: { value: number; label: string }[] = [];
 programas: { value: string; label: string }[] = [];
  establecimientosSaludSalida: { value: number; label: string }[] = [];
  establecimientosEducacionSalida: { value: number; label: string }[] = [];
  establecimientosAtmSalida: { value: number; label: string }[] = [];
  establecimientosSaludDestino: { value: number; label: string }[] = [];
  establecimientosEducacionDestino: { value: number; label: string }[] = [];
  establecimientosAtmDestino: { value: number; label: string }[] = [];

  showOtroSalida    = false;
  showSaludSalida   = false;
  showEducacionSalida= false;
  showAtmSalida     = false;

  showOtroDestino    = false;
  showSaludDestino   = false;
  showEducacionDestino= false;
  showAtmDestino     = false;

  programa: { prog: any[] } = { prog: [] };

  rolUsuario = '';
  usuarioActivo: { nombre: string; rol: string; correo?: string; rut_usuario?: string } | null = null;

  maxOcupantes = 9;
  minDate: string = '';


  constructor(
    private fb:       FormBuilder,
    private router:   Router,
    private toast:    ToastController,
    private centroSvc: CentroServicio,
    private auth:     AutentificacionUsuario,
    public  agenda:    Agenda,
    private notificaciones: NotificacionesCorreo,
    private vehiculoSvc: VehiculoServicio,
    private viajesServicio: ViajesServicio,
  ) {}

  async ngOnInit() {
    this.minDate = new Date().toISOString().split('T')[0];

    this.registroForm = this.fb.group({
      puntoSalida: ['', Validators.required],
      direccionSalida: ['', Validadores.soloTexto],
      centroSaludSalida: [''],
      centroEducacionSalida: [''],
      centroAtmSalida: [''],
      nivelCentralSalida: [false],
      puntoDestino: ['', Validators.required],
      direccionDestino: ['', Validadores.soloTexto],
      centroSaludDestino: [''],
      centroEducacionDestino: [''],
      centroAtmDestino: [''],
      nivelCentralDestino: [false],
      dentroComuna: [false],
      necesita_carga:[false],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      tiempoUso: ['', Validators.required],
      vehiculo_deseado: ['', Validators.required],
      programa: ['',Validators.required],
      ocupantes: ['', [Validators.required, Validators.min(1)]],
      motivo: ['',  Validators.compose([Validators.required, Validadores.soloTexto])],
      responsable: ['', Validators.required],

    });

   
      this.centroSvc.obtenerEstablecimientos(2),
      this.centroSvc.obtenerEstablecimientos(4),
      this.centroSvc.obtenerEstablecimientos(3),
      this.centroSvc.obtenerEstablecimientos(1)
    
    this.auto.vehiculo     = this.centroSvc.obtenerAuto('vehiculo');

    this.usuarioActivo = await this.auth.obtenerUsuarioActivo();

    this.programa = { prog: this.centroSvc.obtenerPrograma('prog') };
    this.rolUsuario    = this.usuarioActivo?.rol ?? '';
  }

 
    
  private handleLocationChange(type: 'Salida' | 'Destino', value: any) {
    const isSalida = type === 'Salida';
    
    this[isSalida ? 'showOtroSalida' : 'showOtroDestino'] = false;
    this[isSalida ? 'showSaludSalida' : 'showSaludDestino'] = false;
    this[isSalida ? 'showEducacionSalida' : 'showEducacionDestino'] = false;
    this[isSalida ? 'showAtmSalida' : 'showAtmDestino'] = false;
    
    const controlsToReset = [
      `direccion${type}`,
      `centroSalud${type}`,
      `centroEducacion${type}`,
      `centroAtm${type}`
    ];

    controlsToReset.forEach(controlName => {
      const control = this.registroForm.get(controlName);
      control?.clearValidators();
      control?.setValue('');
    });

    let controlToValidate: string | null = null;
    
    switch (value) {
      case '2': // Salud
        this[isSalida ? 'showSaludSalida' : 'showSaludDestino'] = true;
        this[isSalida ? 'establecimientosSaludSalida' : 'establecimientosSaludDestino'] = this.centroSvc.obtenerEstablecimientos(2);
        controlToValidate = `centroSalud${type}`;
        break;
      case '3': // Educación
        this[isSalida ? 'showEducacionSalida' : 'showEducacionDestino'] = true;
        this[isSalida ? 'establecimientosEducacionSalida' : 'establecimientosEducacionDestino'] = this.centroSvc.obtenerEstablecimientos(3);
        controlToValidate = `centroEducacion${type}`;
        break;
      case '4': // ATM
        this[isSalida ? 'showAtmSalida' : 'showAtmDestino'] = true;
        this[isSalida ? 'establecimientosAtmSalida' : 'establecimientosAtmDestino'] = this.centroSvc.obtenerEstablecimientos(4);
        controlToValidate = `centroAtm${type}`;
        break;
      case '5': // Otro
        this[isSalida ? 'showOtroSalida' : 'showOtroDestino'] = true;
        controlToValidate = `direccion${type}`;
        break;
    }

    if (controlToValidate) {
      this.registroForm.get(controlToValidate)?.setValidators([Validators.required]);
    }

   /* if (controlToValidate == `direccion${type}`) {
      this.registroForm.get(controlToValidate)?.setValidators([Validators.required, Validadores.soloTexto]);
    }*/

    controlsToReset.forEach(controlName => {
      this.registroForm.get(controlName)?.updateValueAndValidity();
    });
  }

  
  onSalidaChange(ev: any) {
    this.handleLocationChange('Salida', ev.detail.value);
  }


  onDestinoChange(ev: any) {
    this.handleLocationChange('Destino', ev.detail.value);
  }

  actualizarMaxOcupantes(tipo: string) {
    this.maxOcupantes = tipo === 'minivan' ? 4 : 9;

    this.registroForm.get('ocupantes')!.setValidators([Validators.required, Validators.min(1), Validators.max(this.maxOcupantes)]);
    this.registroForm.get('ocupantes')!.updateValueAndValidity();
  }
  private async showToast(msg: string, color: 'success'|'warning'|'danger'='success') {
    const t = await this.toast.create({ message: msg, color, duration: 15000 });
    await t.present();
  }

  async onSubmit() {
     if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      this.showToast('Formulario incompleto','danger');
      return;
    }
    
    if (!this.usuarioActivo?.rut_usuario) {
        this.showToast('Error: No se pudo identificar al usuario. Por favor, inicie sesión de nuevo.', 'danger');
        return;
    }

    const v = this.registroForm.value;

    const solicitud = {
      id: Date.now().toString(),

      //solicitante: this.usuarioActivo?.usuario||'desconocido',
      /*fecha: v.fecha,
      hora:  v.hora,
      puntoSalida: v.puntoSalida,
      direccionSalida:       this.showOtroSalida      ? v.direccionSalida       : undefined,
      centroSaludSalida:     this.showSaludSalida     ? v.centroSaludSalida     : undefined,
      centroEducacionSalida: this.showEducacionSalida ? v.centroEducacionSalida : undefined,
      centroAtmSalida:       this.showAtmSalida       ? v.centroAtmSalida       : undefined,
      nivelCentralSalida:  v.puntoSalida==='nivelCentral',
      puntoDestino: v.puntoDestino,
      direccionDestino:       this.showOtroDestino      ? v.direccionDestino      : undefined,
      centroSaludDestino:     this.showSaludDestino     ? v.centroSaludDestino    : undefined,
      centroEducacionDestino: this.showEducacionDestino ? v.centroEducacionDestino: undefined,
      centroAtmDestino:       this.showAtmDestino       ? v.centroAtmDestino      : undefined,
      nivelCentralDestino:  v.puntoDestino==='nivelCentral',
      dentroComuna:  v.dentroComuna ? 'si':'no',
      necesitaCarga: v.necesitaCarga? 'si':'no',
      tiempoUso:     v.tiempoUso,
      tipoVehiculo:  v.tipoVehiculo,
      ocupantes:     v.ocupantes,
      motivo:        v.motivo,
      ocupante:      v.ocupante,
      estado:        'pendiente',
      fechaRegistro: new Date().toISOString()*/
      fecha_viaje: v.fecha,
      hora_inicio: v.hora,
      punto_salida: this.obtenerTextoUbicacion(v.puntoSalida, v),
      punto_destino: this.obtenerTextoUbicacion(v.puntoDestino, v, false),
      motivo: v.motivo,
      vehiculo_deseado: v.vehiculo_deseado,
      necesita_carga: v.necesita_carga? 'si':'no',
      ocupantes: v.ocupantes,
      programa: v.programa,
      responsable: v.responsable,
      solicitante_rut: this.usuarioActivo?.rut_usuario
    };

    this.viajesServicio.createViaje(solicitud).subscribe({

    next: async (respuesta) => {
      this.showToast('Solicitud enviada con éxito', 'success');
      this.registroForm.reset();
      
      const viajeConfirmado = respuesta.viaje; 

      if (this.usuarioActivo?.correo) {
          this.notificaciones.enviarCorreoSolicitud(this.usuarioActivo.correo, viajeConfirmado);
      }

      this.auth.getUsuarios().subscribe({
        next: (todosLosUsuarios) => {
          const rolesAdmin = ['adminSistema', 'its', ];
          const correosDeAdmins = todosLosUsuarios
            .filter(usuario => rolesAdmin.includes(usuario.rol) && usuario.correo)
            .map(admin => admin.correo);
          
          if (correosDeAdmins.length > 0) {
            viajeConfirmado.nombre = this.usuarioActivo?.nombre || 'Usuario Desconocido';
            this.notificaciones.enviarNotificacionAdmin(correosDeAdmins, viajeConfirmado);
          } else {
            console.warn('No se encontraron administradores con correo para notificar.');
          }
        },
        error: (err) => console.error('Error al obtener lista de usuarios para notificar a admins:', err)
      });
    },
    error: (error) => {
      console.error('Error al crear el viaje:', error);
      const mensajeError = error.error?.message || 'Error al enviar la solicitud.';
      this.showToast(mensajeError, 'danger');
    }
  });
  }
  
  private obtenerTextoUbicacion(tipo: string, formValues: any, esSalida = true): string {
    const prefijo = esSalida ? 'Salida' : 'Destino';
    const punto = esSalida ? formValues.puntoSalida : formValues.puntoDestino;
    switch(punto) {
        case '1': return 'Nivel Central';
        case '2': 
          const centroSalud = formValues[`centroSalud${prefijo}`] || 'No especificado';
          return `Salud: ${centroSalud}`;
        case '3': 
          const centroEducacion = formValues[`centroEducacion${prefijo}`] || 'No especificado';
          return `Educación: ${centroEducacion}`;
        case '4': 
          const centroAtm = formValues[`centroAtm${prefijo}`] || 'No especificado';
          return `ATM: ${centroAtm}`;
        case '5': 
          const direccion = formValues[`direccion${prefijo}`] || 'No especificada';
          return `Otro: ${direccion}`;
        default: return 'Ubicación no especificada';
    }
  }


  goToHomePage() {
    this.router.navigate(['/home']);
  }

  goToBitacoraPage() {
    this.router.navigate(['/bitacora']);
  }

  goToRegistroVehiculoPage() {
    this.router.navigate(['/registro-vehiculo']);
  }
  
  goToViajesSolicitadosPage() {
    this.router.navigate(['/viajes-solicitados']);
  }

  goToGestionPage(){
    this.router.navigate(['/gestion']);
  }


}
