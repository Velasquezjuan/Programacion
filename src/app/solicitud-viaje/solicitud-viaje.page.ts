import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Memorialocal } from '../almacen/memorialocal';

import { MenuLateralComponent } from '../componentes/menu-lateral/menu-lateral.component';
import {IonContent,IonMenuButton, IonHeader, IonTitle, 
  IonToolbar, IonInput, IonToggle,
  IonGrid, IonRow, IonCol, IonButton, IonItem, IonLabel, IonSelect, 
  IonSelectOption,  } from '@ionic/angular/standalone';
import { CentroServicio } from '../servicio/centro-servicio';
import { Agenda } from '../servicio/agenda';
import { ToastController } from '@ionic/angular';
import { AutentificacionUsuario } from '../servicio/autentificacion-usuario';



@Component({
  selector: 'app-solicitud-viaje',
  templateUrl:'./solicitud-viaje.page.html',
  styleUrls: ['./solicitud-viaje.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonMenuButton, IonHeader, IonTitle, 
    IonToolbar, IonInput, IonToggle ,ReactiveFormsModule, MenuLateralComponent,
    IonGrid, IonRow, IonCol, IonButton, IonItem, IonLabel, IonSelect, 
    IonSelectOption, CommonModule, FormsModule, ]
})
export class SolicitudViajePage implements OnInit {
 registroForm!: FormGroup;
  centros = {
    central:     [] as { value:string; label:string }[],
    salud:       [] as { value:string; label:string }[],
    educacion:   [] as { value:string; label:string }[],
    atm:         [] as { value:string; label:string }[]
  };
  auto = {
    vehiculo: [] as { value:string; label:string }[]
  };

  showOtroSalida     = false;
  showSaludSalida    = false;
  showEducacionSalida= false;
  showAtmSalida      = false;
  // nivelCentralSalida no necesita input adicional

  showOtroDestino     = false;
  showSaludDestino    = false;
  showEducacionDestino= false;
  showAtmDestino      = false;
  // nivelCentralDestino no necesita input adicional

  rolUsuario = '';
  usuarioActivo: { usuario:string; rol:string } | null = null;
   maxOcupantes = 9;

  constructor(
    private fb:      FormBuilder,
    private router:  Router,
    private toast:   ToastController,
    private centroSvc: CentroServicio,
    private auth:    AutentificacionUsuario,
    public agenda:   Agenda
  ) {}

  async ngOnInit() {
    // 1) Formulario
    this.registroForm = this.fb.group({
      // SALIDA
      puntoSalida:        ['', Validators.required],
      direccionSalida:    [''],
      centroSaludSalida:     [''],
      centroEducacionSalida: [''],
      centroAtmSalida:       [''],
      nivelCentralSalida:    [false],
      // DESTINO
      puntoDestino:       ['', Validators.required],
      direccionDestino:   [''],
      centroSaludDestino:     [''],
      centroEducacionDestino: [''],
      centroAtmDestino:       [''],
      nivelCentralDestino:    [false],
      // RESTO
      dentroComuna: [false],
      necesitaCarga:[false],
      fecha:        ['', Validators.required],
      hora:         ['', Validators.required],
      tiempoUso:    ['', Validators.required],
      tipoVehiculo: ['', Validators.required],
      ocupantes:    ['', [Validators.required, Validators.min(1)]],
      motivo:       ['', Validators.required],
      ocupante:     ['', Validators.required]
    });

    // 2) Carga catálogos
    this.centros.central   = this.centroSvc.obtenerCentros('central');
    this.centros.salud     = this.centroSvc.obtenerCentros('salud');
    this.centros.educacion = this.centroSvc.obtenerCentros('educacion');
    this.centros.atm       = this.centroSvc.obtenerCentros('atm');
    this.auto.vehiculo     = this.centroSvc.obtenerAuto('vehiculo');

    // 3) Usuario activo
    this.usuarioActivo = await this.auth.obtenerUsuarioActivo();
    this.rolUsuario    = this.usuarioActivo?.rol ?? '';
  }

  // ─── CAMBIOS DINÁMICOS ─────────────────────────────────────────────────────

  onSalidaChange(ev: any) {
    const val = ev.detail.value;
    this.showOtroSalida      = val === 'otro';
    this.showSaludSalida     = val === 'salud';
    this.showEducacionSalida = val === 'educacion';
    this.showAtmSalida       = val === 'atm';
    // nivelCentralSalida: no necesita ningún otro input

    // limpiar validaciones
    ['direccionSalida',
     'centroSaludSalida','centroEducacionSalida','centroAtmSalida']
      .forEach(k => this.registroForm.get(k)!.clearValidators());

    if (this.showOtroSalida) {
      this.registroForm.get('direccionSalida')!.setValidators([Validators.required]);
    }
    if (this.showSaludSalida) {
      this.registroForm.get('centroSaludSalida')!.setValidators([Validators.required]);
    }
    if (this.showEducacionSalida) {
      this.registroForm.get('centroEducacionSalida')!.setValidators([Validators.required]);
    }
    if (this.showAtmSalida) {
      this.registroForm.get('centroAtmSalida')!.setValidators([Validators.required]);
    }

    // actualizar
    ['direccionSalida',
     'centroSaludSalida','centroEducacionSalida','centroAtmSalida']
      .forEach(k => this.registroForm.get(k)!.updateValueAndValidity());
  }

  onDestinoChange(ev: any) {
    const val = ev.detail.value;
    this.showOtroDestino      = val === 'otro';
    this.showSaludDestino     = val === 'salud';
    this.showEducacionDestino = val === 'educacion';
    this.showAtmDestino       = val === 'atm';
    // nivelCentralDestino: no necesita más input

    ['direccionDestino',
     'centroSaludDestino','centroEducacionDestino','centroAtmDestino']
      .forEach(k => this.registroForm.get(k)!.clearValidators());

    if (this.showOtroDestino) {
      this.registroForm.get('direccionDestino')!.setValidators([Validators.required]);
    }
    if (this.showSaludDestino) {
      this.registroForm.get('centroSaludDestino')!.setValidators([Validators.required]);
    }
    if (this.showEducacionDestino) {
      this.registroForm.get('centroEducacionDestino')!.setValidators([Validators.required]);
    }
    if (this.showAtmDestino) {
      this.registroForm.get('centroAtmDestino')!.setValidators([Validators.required]);
    }

    ['direccionDestino',
     'centroSaludDestino','centroEducacionDestino','centroAtmDestino']
      .forEach(k => this.registroForm.get(k)!.updateValueAndValidity());
  }

  actualizarMaxOcupantes(tipo: string) {
    this.maxOcupantes = tipo === 'minivan' ? 9 : 4;
    // ajustar validador max
    this.registroForm.get('ocupantes')!.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(this.maxOcupantes)
    ]);
    this.registroForm.get('ocupantes')!.updateValueAndValidity();
  }
  private async showToast(msg: string, color: 'success'|'warning'|'danger'='success') {
    const t = await this.toast.create({ message: msg, color, duration: 2000 });
    await t.present();
  }

  // ─── ENVÍO ──────────────────────────────────────────────────────────────────

  async onSubmit() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return this.showToast('Formulario incompleto','danger');
    }
    const v = this.registroForm.value;

    // arma el objeto
    const solicitud = {
      id: Date.now().toString(),
      solicitante: this.usuarioActivo?.usuario||'desconocido',
      fecha: v.fecha,
      hora:  v.hora,

      // SALIDA
      puntoSalida: v.puntoSalida,
      direccionSalida:      this.showOtroSalida      ? v.direccionSalida      : undefined,
      centroSaludSalida:    this.showSaludSalida     ? v.centroSaludSalida     : undefined,
      centroEducacionSalida:this.showEducacionSalida ? v.centroEducacionSalida : undefined,
      centroAtmSalida:      this.showAtmSalida       ? v.centroAtmSalida       : undefined,
      nivelCentralSalida:   v.puntoSalida==='nivelCentral',

      // DESTINO
      puntoDestino: v.puntoDestino,
      direccionDestino:      this.showOtroDestino      ? v.direccionDestino      : undefined,
      centroSaludDestino:    this.showSaludDestino     ? v.centroSaludDestino     : undefined,
      centroEducacionDestino:this.showEducacionDestino ? v.centroEducacionDestino : undefined,
      centroAtmDestino:      this.showAtmDestino       ? v.centroAtmDestino       : undefined,
      nivelCentralDestino:   v.puntoDestino==='nivelCentral',

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
