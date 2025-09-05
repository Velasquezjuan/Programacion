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
  centros = {
    central:   [] as { value:string; label:string }[],
    salud:     [] as { value:string; label:string }[],
    educacion: [] as { value:string; label:string }[],
    atm:       [] as { value:string; label:string }[]
  };
  auto = {
    vehiculo: [] as { value:string; label:string }[]
  };

  showOtroSalida    = false;
  showSaludSalida   = false;
  showEducacionSalida= false;
  showAtmSalida     = false;

  showOtroDestino    = false;
  showSaludDestino   = false;
  showEducacionDestino= false;
  showAtmDestino     = false;

  rolUsuario = '';
  usuarioActivo: { usuario:string; rol:string; correo?: string } | null = null;
  maxOcupantes = 9;


  constructor(
   private fb:       FormBuilder,
    private router:   Router,
    private toast:    ToastController,
    private centroSvc: CentroServicio,
    private auth:     AutentificacionUsuario,
    public agenda:    Agenda,
    private notificaciones: NotificacionesCorreo,
  ) {}

  async ngOnInit() {
    this.registroForm = this.fb.group({
      puntoSalida: ['', Validators.required],
      direccionSalida: [''],
      centroSaludSalida: [''],
      centroEducacionSalida: [''],
      centroAtmSalida: [''],
      nivelCentralSalida: [false],
      puntoDestino: ['', Validators.required],
      direccionDestino: [''],
      centroSaludDestino: [''],
      centroEducacionDestino: [''],
      centroAtmDestino: [''],
      nivelCentralDestino: [false],
      dentroComuna: [false],
      necesitaCarga:[false],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      tiempoUso: ['', Validators.required],
      tipoVehiculo: ['', Validators.required],
      ocupantes: ['', [Validators.required, Validators.min(1)]],
      motivo: ['', Validators.required],
      ocupante: ['', Validators.required]
    });

   
      this.centroSvc.obtenerEstablecimientos(2),
      this.centroSvc.obtenerEstablecimientos(4),
      this.centroSvc.obtenerEstablecimientos(3),
      this.centroSvc.obtenerEstablecimientos(1)
    
    this.auto.vehiculo     = this.centroSvc.obtenerAuto('vehiculo');

    this.usuarioActivo = await this.auth.obtenerUsuarioActivo();
    this.rolUsuario    = this.usuarioActivo?.rol ?? '';
  }

 
  onSalidaChange(ev: any) {
    const val = ev.detail.value;
    this.showOtroSalida      = val === 'otro';
    this.showSaludSalida     = val === 'salud';
    this.showEducacionSalida = val === 'educacion';
    this.showAtmSalida       = val === 'atm';
    ['direccionSalida', 'centroSaludSalida','centroEducacionSalida','centroAtmSalida'].forEach(k => this.registroForm.get(k)!.clearValidators());
    if (this.showOtroSalida) { this.registroForm.get('direccionSalida')!.setValidators([Validators.required]); }
    if (this.showSaludSalida) { this.registroForm.get('centroSaludSalida')!.setValidators([Validators.required]); }
    if (this.showEducacionSalida) { this.registroForm.get('centroEducacionSalida')!.setValidators([Validators.required]); }
    if (this.showAtmSalida) { this.registroForm.get('centroAtmSalida')!.setValidators([Validators.required]); }
    ['direccionSalida', 'centroSaludSalida','centroEducacionSalida','centroAtmSalida'].forEach(k => this.registroForm.get(k)!.updateValueAndValidity());
  }

  onDestinoChange(ev: any) {
    const val = ev.detail.value;
    this.showOtroDestino      = val === 'otro';
    this.showSaludDestino     = val === 'salud';
    this.showEducacionDestino = val === 'educacion';
    this.showAtmDestino       = val === 'atm';
    ['direccionDestino', 'centroSaludDestino','centroEducacionDestino','centroAtmDestino'].forEach(k => this.registroForm.get(k)!.clearValidators());
    if (this.showOtroDestino) { this.registroForm.get('direccionDestino')!.setValidators([Validators.required]); }
    if (this.showSaludDestino) { this.registroForm.get('centroSaludDestino')!.setValidators([Validators.required]); }
    if (this.showEducacionDestino) { this.registroForm.get('centroEducacionDestino')!.setValidators([Validators.required]); }
    if (this.showAtmDestino) { this.registroForm.get('centroAtmDestino')!.setValidators([Validators.required]); }
    ['direccionDestino', 'centroSaludDestino','centroEducacionDestino','centroAtmDestino'].forEach(k => this.registroForm.get(k)!.updateValueAndValidity());
  }

  actualizarMaxOcupantes(tipo: string) {
    this.maxOcupantes = tipo === 'minivan' ? 9 : 4;
    this.registroForm.get('ocupantes')!.setValidators([Validators.required, Validators.min(1), Validators.max(this.maxOcupantes)]);
    this.registroForm.get('ocupantes')!.updateValueAndValidity();
  }
  private async showToast(msg: string, color: 'success'|'warning'|'danger'='success') {
    const t = await this.toast.create({ message: msg, color, duration: 2000 });
    await t.present();
  }

  async onSubmit() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return this.showToast('Formulario incompleto','danger');
    }
    const v = this.registroForm.value;

    const solicitud = {
      id: Date.now().toString(),
      solicitante: this.usuarioActivo?.usuario||'desconocido',
      fecha: v.fecha,
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
      fechaRegistro: new Date().toISOString()
    };

    try {
      await this.agenda.agregarHorario(v.fecha, v.hora);
      await Memorialocal.guardar('viajesSolicitados', solicitud);
      this.registroForm.reset();
      this.showToast('Solicitud creada','success');

      if (this.usuarioActivo?.correo) {
        this.notificaciones.enviarCorreoSolicitud(this.usuarioActivo.correo, solicitud);
      } else {
        console.warn('No se pudo enviar la notificación: el usuario no tiene un email registrado.');
      }
      const todosLosUsuarios = await Memorialocal.obtener<any>('usuarios');
      console.log('Todos los usuarios encontrados:', todosLosUsuarios); 

      const rolesAdmin = ['adminSistema', 'its', 'coordinador'];
      
      const adminsEncontrados = todosLosUsuarios
        .filter(usuario => rolesAdmin.includes(usuario.rol));
      console.log('Administradores filtrados:', adminsEncontrados); 

      const correosDeAdmins = adminsEncontrados
        .map(admin => admin.correo)
        .filter(correo => correo); 
      console.log('Correos de admins para notificar:', correosDeAdmins); 
      
      this.notificaciones.enviarNotificacionAdmin(correosDeAdmins, solicitud);
    } catch {
      this.showToast('Error al guardar','danger');
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
