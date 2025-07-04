import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Memorialocal } from '../almacen/memorialocal';

import { MenuLateralComponent } from '../componentes/menu-lateral/menu-lateral.component';
import {IonContent, IonApp, IonMenuButton, IonHeader, IonTitle, 
  IonToolbar, IonInput, IonToggle,
  IonGrid, IonRow, IonCol, IonButton, IonItem, IonLabel, IonSelect, 
  IonSelectOption,  } from '@ionic/angular/standalone';
import { CentroServicio } from '../servicio/centro-servicio';
import { Menu, MenuItem } from '../servicio/menu';
import { Agenda } from '../servicio/agenda';
import { ToastController } from '@ionic/angular';
import { AutentificacionUsuario } from '../servicio/autentificacion-usuario';
import { Validator } from '@angular/forms';


@Component({
  selector: 'app-solicitud-viaje',
  templateUrl:'./solicitud-viaje.page.html',
  styleUrls: ['./solicitud-viaje.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonApp, IonMenuButton, IonHeader, IonTitle, 
    IonToolbar, IonInput, IonToggle ,ReactiveFormsModule, MenuLateralComponent,
    IonGrid, IonRow, IonCol, IonButton, IonItem, IonLabel, IonSelect, 
    IonSelectOption, CommonModule, FormsModule, ]
})
export class SolicitudViajePage implements OnInit {

  centros: {
    salud: any[];
    atm: any[];
    educacion: any[];
    central: any[];
  } = {
    salud: [],
    atm: [],
    educacion: [],
    central: []
  };

  auto: { vehiculo: any[] } = { vehiculo: [] };

  usuarioActivo?: { usuario: string; rol: string }| null = null;

  registroForm!: FormGroup;

  // Variables para mostrar campos dinámicamente
  showNivelCentralFields = false;
  showEducacionFields = false;
  showAtmFields = false;
  showSaludFields = false; 
  showComunalFields = false;
  showOtroFields = false;
  horasAgendadas: string[] = [];
  showOtroSalida = false;
  showOtroDestino = false;


  constructor(
    private router: Router,
    private fb: FormBuilder, 
    private toastController: ToastController,
    private centroServicio: CentroServicio,
    public agendaServicio: Agenda,
    private menu: Menu,
    private auth: AutentificacionUsuario
  ) { }

  rolUsuario: string = '';
 

  async ngOnInit() {
    this.registroForm = this.fb.group({
      puntoSalida: ['', Validators.required],
      direccionSalida: [''],
      dentroComuna: [false],             
      necesitaCarga: [false],
      centro: ['', Validators.required],
      direccionDestino: [''], 
      centroSalud: [''],
      centroEducacion: [''],
      centroAtm: [''],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      tiempoUso: ['', Validators.required],
      motivo: ['', Validators.required ],
      ocupante: ['', Validators.required],
      tipoVehiculo: ['', Validators.required],
      ocupantes: ['', Validators.required]
    });
    

    this.centros = {
      
      salud: this.centroServicio.obtenerCentros('salud'),
      atm: this.centroServicio.obtenerCentros('atm'),
      educacion: this.centroServicio.obtenerCentros('educacion'),
      central: this.centroServicio.obtenerCentros('central')
    };

    this.auto = {
      vehiculo: this.centroServicio.obtenerAuto('vehiculo')
    };
    
    this.usuarioActivo = await this.auth.obtenerUsuarioActivo();

  }

 onSalidaChange(ev: any) {
  const selected = ev.detail.value;

  // mostramos u ocultamos el input “otro” de salida
  this.showOtroSalida = (selected === 'otro');

  // si ya no es “otro”, limpiamos su valor
  if (!this.showOtroSalida) {
    this.registroForm.get('direccionSalida')!.setValue('');
  }

  // reutilizamos la lógica de limpiar validadores y ocultar todos
  this.resetCentroFields();

  // mostramos el resto de campos según el select (si quieres)
  this.applyCentroLogic(selected);

  // actualizamos validaciones de esos campos
  this.updateCentroValidators();
}

/** Cuando cambia el Punto de Destino */
onDestinoChange(ev: any) {
  const selected = ev.detail.value;

  // mostramos u ocultamos el input “otro” de destino
  this.showOtroDestino = (selected === 'otro');

  // si ya no es “otro”, limpiamos su valor
  if (!this.showOtroDestino) {
    this.registroForm.get('direccionDestino')!.setValue('');
  }

  // limpiamos validador de los sub-centros y ocultamos
  this.resetCentroFields();

  // mostramos dinámicamente tus campos de salud/educación/atm/etc
  this.applyCentroLogic(selected);

  // actualizamos validador de esos sub-centros
  this.updateCentroValidators();
}

/** Tu función original de Centro (educación/salud/atm/nivelCentral/otro) */
onCentroChange(ev: any) {
  const selected = ev.detail.value;

  // limpiamos validador y ocultamos todo
  this.resetCentroFields();

  // mostramos sólo el bloque que corresponda
  this.applyCentroLogic(selected);

  // actualizamos validaciones
  this.updateCentroValidators();
}

/** Helpers para no repetir código */
private resetCentroFields() {
  // quitar validadores de los selects + direcciones
  this.registroForm.get('centroSalud')?.clearValidators();
  this.registroForm.get('centroEducacion')?.clearValidators();
  this.registroForm.get('centroAtm')?.clearValidators();
  this.registroForm.get('direccion')?.clearValidators();
  this.registroForm.get('direccionSalida')?.clearValidators();
  this.registroForm.get('direccionDestino')?.clearValidators();

  // ocultar todos los bloques dinámicos
  this.showSaludFields       = false;
  this.showEducacionFields   = false;
  this.showAtmFields         = false;
  this.showNivelCentralFields= false;
  this.showOtroFields        = false;
  this.showComunalFields     = false;
}

/** Muestra el bloque correcto según el valor del select */
private applyCentroLogic(value: string) {
  switch (value) {
    case 'comunal':
      this.showComunalFields = true;
      break;
    case 'educacion':
      this.showEducacionFields = true;
      break;
    case 'atm':
      this.showAtmFields = true;
      break;
    case 'salud':
      this.showSaludFields = true;
      break;
    case 'nivelCentral':
      this.showNivelCentralFields = true;
      break;
    case 'otro':
      this.showOtroFields = true;
      break;
  }
}

/** Finalmente, fijamos los validadores según los bloques visibles */
private updateCentroValidators() {
  this.registroForm.get('centroSalud')?.updateValueAndValidity();
  this.registroForm.get('centroEducacion')?.updateValueAndValidity();
  this.registroForm.get('centroAtm')?.updateValueAndValidity();
  this.registroForm.get('direccion')?.updateValueAndValidity();
  this.registroForm.get('direccionSalida')?.updateValueAndValidity();
  this.registroForm.get('direccionDestino')?.updateValueAndValidity();
}

  async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 20000,
      position: 'top',
      color: color
    });
    toast.present();
  }

  async agendarHora() {
    const fecha = this.registroForm.get('fecha')?.value;
    const hora = this.registroForm.get('hora')?.value;
  
    if (fecha && hora) {
      const ok = await this.agendaServicio.agregarHorario(fecha, hora); 
      if (ok) {
        this.horasAgendadas = await this.agendaServicio.obtenerHorarios(fecha); 
        this.mostrarToast('Hora agendada con éxito');
      } else {
        this.mostrarToast('Esa hora ya está ocupada', 'warning');
      }
    } else {
      this.mostrarToast('Debes seleccionar fecha y hora para agendar', 'danger');
    }
  }
  async reagendarSolicitud(id: string) {
    const nuevaFecha = prompt('Nueva fecha (YYYY-MM-DD):');
    const nuevaHora = prompt('Nueva hora (HH:mm):');
  
    if (nuevaFecha && nuevaHora) {
      await this.agendaServicio.reagendarSolicitud(id, nuevaFecha, nuevaHora);
      this.mostrarToast('Solicitud reagendada.');
    }
  }
  
  async verHorasDelDia() {
    const fecha = this.registroForm.get('fecha')?.value;
    this.horasAgendadas = await this.agendaServicio.obtenerHorarios(fecha); 
  }
  maxOcupantes: number = 9;

  actualizarMaxOcupantes(tipo: string) {
    switch (tipo) {
      case 'suv':
      case 'sedan':
        this.maxOcupantes = 4;
        break;
      case 'minivan':
        this.maxOcupantes = 6;
        break;
      case 'camioneta':
        this.maxOcupantes = 4;
        break;
         case 'camion':
        this.maxOcupantes = 4;
        break;
      default:
        this.maxOcupantes = 4;
    }
  }

  async onSubmit(){
    if (this.registroForm.invalid) {
      console.log(this.registroForm.value);
      console.log(this.registroForm.errors);
      this.registroForm.markAllAsTouched();
      this.mostrarToast('Formulario incompleto. Revisa los errores.', 'danger');
      return;
    }
  
    const v = this.registroForm.value;

    if (v.puntoSalida === v.centro) {
      return this.mostrarToast(
        'Punto de salida y destino no pueden ser iguales',
        'warning'
      );
    }

    const dentroComuna = v.dentroComuna ? 'si' : 'no';
    const necesitaCarga = v.necesitaCarga ? 'si' : 'no';
    
  
    const solicitud = {
      id: Date.now().toString(), 
      puntoSalida:  v.puntoSalida,
      centro:       v.centro,
      dentroComuna,                        // "si" / "no"
      necesitaCarga,                       // "si" / "no"
      direccion:    v.direccion || null,
      fecha:        v.fecha,
      hora:         v.hora,
      motivo:       v.motivo,
      ocupante:     v.ocupante,
      tipoVehiculo: v.tipoVehiculo,
      ocupantes:    v.ocupantes,
      estado:       'pendiente',
      fechaRegistro: new Date().toISOString(),
      solicitante: this.usuarioActivo?.usuario || 'desconocido'
    };
  
    try {
      await this.agendaServicio.agregarHorario(v.fecha, v.hora);
      await Memorialocal.guardar('viajesSolicitados', solicitud); 
      this.registroForm.reset();
      this.mostrarToast('Solicitud de viaje registrada con éxito');
    } catch (error) {
      this.mostrarToast('Error al guardar la solicitud', 'danger');
    };


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
