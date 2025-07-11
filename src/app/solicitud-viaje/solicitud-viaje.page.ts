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

  // listas de centros
  centros = {
    central:   [] as Array<{ value: string; label: string }>,
    salud:     [] as Array<{ value: string; label: string }>,
    educacion: [] as Array<{ value: string; label: string }>,
    atm:       [] as Array<{ value: string; label: string }>
  };
  auto = { vehiculo: [] as Array<{ value: string; label: string }> };

  // visibilidades
  showOtroSalida = false;
  showSaludSalida = false;
  showEducacionSalida = false;
  showAtmSalida = false;
  showNivelCentralSalida = false;

  showOtroDestino = false;
  showSaludDestino = false;
  showEducacionDestino = false;
  showAtmDestino = false;
  showNivelCentralDestino = false;

  // control de ocupantes
  maxOcupantes = 9;

  // usuario
  usuarioActivo: { usuario: string; rol: string } | null = null;
  rolUsuario = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastCtrl: ToastController,
    private centroSvc: CentroServicio,
    private auth: AutentificacionUsuario,
    public agenda: Agenda
  ) {}

  async ngOnInit() {
    // 1) FormGroup
    this.registroForm = this.fb.group({
      // SALIDA
      puntoSalida:         ['', Validators.required],
      direccionSalida:     [''],
      centroSaludSalida:   [''],
      centroEducacionSalida: [''],
      centroAtmSalida:     [''],
      nivelCentralSalida:  [false],
      // DESTINO
      puntoDestino:        ['', Validators.required],
      direccionDestino:    [''],
      centroSaludDestino:  [''],
      centroEducacionDestino: [''],
      centroAtmDestino:    [''],
      nivelCentralDestino: [false],
      // COMUNES
      dentroComuna:        [false],
      necesitaCarga:       [false],
      fecha:               ['', Validators.required],
      hora:                ['', Validators.required],
      tiempoUso:           ['', Validators.required],
      tipoVehiculo:        ['', Validators.required],
      ocupantes:           [
        '',
        [Validators.required, Validators.min(1), Validators.max(this.maxOcupantes)]
      ],
      motivo:              ['', Validators.required],
      ocupante:            ['', Validators.required]
    });

    // 2) cargar listas
    this.centros.central   = this.centroSvc.obtenerCentros('central');
    this.centros.salud     = this.centroSvc.obtenerCentros('salud');
    this.centros.educacion = this.centroSvc.obtenerCentros('educacion');
    this.centros.atm       = this.centroSvc.obtenerCentros('atm');
    this.auto.vehiculo     = this.centroSvc.obtenerAuto('vehiculo');

    // 3) usuario activo
    this.usuarioActivo = await this.auth.obtenerUsuarioActivo();
    this.rolUsuario    = this.usuarioActivo?.rol ?? '';
  }

  /** Punto de SALIDA */
  onSalidaChange(ev: any) {
    const v = ev.detail.value;
    this.showOtroSalida = v === 'otro';
    this.showSaludSalida = this.showEducacionSalida = this.showAtmSalida = this.showNivelCentralSalida = false;

    // limpiar validaciones
    ['direccionSalida','centroSaludSalida','centroEducacionSalida','centroAtmSalida']
      .forEach(k => this.registroForm.get(k)!.clearValidators());

    if (this.showOtroSalida) {
      this.registroForm.get('direccionSalida')!.setValidators([Validators.required]);
    } else {
      switch (v) {
        case 'salud':
          this.showSaludSalida = true;
          this.registroForm.get('centroSaludSalida')!.setValidators([Validators.required]);
          break;
        case 'educacion':
          this.showEducacionSalida = true;
          this.registroForm.get('centroEducacionSalida')!.setValidators([Validators.required]);
          break;
        case 'atm':
          this.showAtmSalida = true;
          this.registroForm.get('centroAtmSalida')!.setValidators([Validators.required]);
          break;
        case 'nivelCentral':
          this.showNivelCentralSalida = true;
          break;
      }
    }
    // actualizar
    ['direccionSalida','centroSaludSalida','centroEducacionSalida','centroAtmSalida']
      .forEach(k => this.registroForm.get(k)!.updateValueAndValidity());
  }

  /** Punto de DESTINO */
  onDestinoChange(ev: any) {
    const v = ev.detail.value;
    this.showOtroDestino = v === 'otro';
    this.showSaludDestino = this.showEducacionDestino = this.showAtmDestino = this.showNivelCentralDestino = false;

    ['direccionDestino','centroSaludDestino','centroEducacionDestino','centroAtmDestino']
      .forEach(k => this.registroForm.get(k)!.clearValidators());

    if (this.showOtroDestino) {
      this.registroForm.get('direccionDestino')!.setValidators([Validators.required]);
    } else {
      switch (v) {
        case 'salud':
          this.showSaludDestino = true;
          this.registroForm.get('centroSaludDestino')!.setValidators([Validators.required]);
          break;
        case 'educacion':
          this.showEducacionDestino = true;
          this.registroForm.get('centroEducacionDestino')!.setValidators([Validators.required]);
          break;
        case 'atm':
          this.showAtmDestino = true;
          this.registroForm.get('centroAtmDestino')!.setValidators([Validators.required]);
          break;
        case 'nivelCentral':
          this.showNivelCentralDestino = true;
          break;
      }
    }
    ['direccionDestino','centroSaludDestino','centroEducacionDestino','centroAtmDestino']
      .forEach(k => this.registroForm.get(k)!.updateValueAndValidity());
  }

  actualizarMaxOcupantes(tipo: string) {
    this.maxOcupantes = tipo === 'minivan' ? 6 : 4;
    // ajustar validador max
    this.registroForm.get('ocupantes')!.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(this.maxOcupantes)
    ]);
    this.registroForm.get('ocupantes')!.updateValueAndValidity();
  }

  private async showToast(msg: string, color: 'success'|'warning'|'danger'='success') {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    await t.present();
  }

  async onSubmit() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return this.showToast('Formulario incompleto', 'danger');
    }

    const v = this.registroForm.value;

    if (v.puntoSalida === v.centro && !this.showOtroDestino) {
      return this.showToast('Salida y destino no pueden coincidir', 'warning');
    }

    // arma el objeto a guardar
    const solicitud = {
      id: Date.now().toString(),
      solicitante: this.usuarioActivo?.usuario || 'desconocido',
      puntoSalida: v.puntoSalida,
      direccionSalida: v.direccionSalida || null,
      centro: v.centro,
      direccionDestino: v.direccionDestino || null,
      dentroComuna: v.dentroComuna ? 'si' : 'no',
      necesitaCarga: v.necesitaCarga ? 'si' : 'no',
      fecha: v.fecha,
      hora: v.hora,
      tiempoUso: v.tiempoUso,
      tipoVehiculo: v.tipoVehiculo,
      ocupantes: v.ocupantes,
      motivo: v.motivo,
      ocupante: v.ocupante,
      estado: 'pendiente',
      fechaRegistro: new Date().toISOString()
    };

    try {
      await this.agenda.agregarHorario(v.fecha, v.hora);
      await Memorialocal.guardar('viajesSolicitados', solicitud);
      this.registroForm.reset();
      this.showToast('Solicitud creada', 'success');
    } catch {
      this.showToast('Error al guardar', 'danger');
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
