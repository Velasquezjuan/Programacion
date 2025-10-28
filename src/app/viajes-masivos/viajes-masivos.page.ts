import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule,  FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Memorialocal } from '../almacen/memorialocal';

import { MenuLateralComponent } from '../componentes/menu-lateral/menu-lateral.component';
import {IonContent, IonMenuButton, IonHeader, IonTitle,
  IonToolbar, IonInput, IonFooter, IonGrid, IonRow,
  IonCol, IonButton, IonItem, IonLabel, IonSelect,
  IonSelectOption, IonDatetime, IonDatetimeButton, IonModal,
  IonCheckbox, IonIcon, IonItemDivider, IonItemGroup  } from '@ionic/angular/standalone';
import { Agenda } from '../servicio/agenda';
import { ToastController } from '@ionic/angular';

import { firstValueFrom, forkJoin } from 'rxjs';

 import { addIcons } from 'ionicons';
import { addCircleOutline, trashOutline} from 'ionicons/icons';

import { CentroServicio } from '../servicio/centro-servicio';
import { AutentificacionUsuario } from '../servicio/autentificacion-usuario';
import { NotificacionesCorreo } from '../servicio/notificaciones-correo';
import { ViajesServicio } from '../servicio/viajes-servicio';
import { VehiculoServicio } from '../servicio/vehiculo-servicio';

interface Usuario { id: string; usuario: string; rol: string; correo: string; }
interface Vehiculo { id: string; patente: string; conductor: string; capacidad: number; tipo: string; }

@Component({
  selector: 'app-viajes-masivos',
  templateUrl: './viajes-masivos.page.html',
  styleUrls: ['./viajes-masivos.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonMenuButton, IonHeader, IonTitle, IonToolbar,
    IonInput,  IonGrid, IonRow, IonCol, IonButton,
    IonItem,  IonSelect, IonSelectOption, CommonModule,
    FormsModule, ReactiveFormsModule, IonDatetime, 
     IonIcon, 
    MenuLateralComponent 
   ]
})
export class ViajesMasivosPage implements OnInit {

  planificacionForm: FormGroup;
  vehiculos: any[] = [];
  programa: { prog: any[] } = { prog: [] };
  rolUsuario = '';
  usuarioActivo: { usuario: string; rol: string; nombre: string; correo: string } | null = null;
  maxOcupantes = 9;
  canAddHorario: boolean = true;

  programasDisponibles: any[] = [];

    auto = {
    vehiculo: [] as { value:string; label:string }[]
  };

  centros: { salud: any[]; atm: any[]; educacion: any[]; central: any[]; } = 
    { salud: [], atm: [], educacion: [], central: []};

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


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private auth: AutentificacionUsuario,
    private centroServicio: CentroServicio,
    private notificaciones: NotificacionesCorreo, 
    private viajesServicio: ViajesServicio,
    private vehiculoServicio: VehiculoServicio,
  ) {
    addIcons({ trashOutline, addCircleOutline });

    this.planificacionForm = this.fb.group({
      vehiculo: ['', Validators.required],
      diasSeleccionados: [[], Validators.required],
      horarios: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      ocupantes: ['', [Validators.required, Validators.min(1)]],
      motivo: ['', Validators.required],
      responsable: ['', Validators.required],
    });

      this.centroServicio.obtenerEstablecimientos(2),
      this.centroServicio.obtenerEstablecimientos(4),
      this.centroServicio.obtenerEstablecimientos(3),
      this.centroServicio.obtenerEstablecimientos(1)

   this.auto.vehiculo     = this.centroServicio.obtenerAuto('vehiculo');

    this.programa = { prog: this.centroServicio.obtenerPrograma('prog') };
    
  }

  async ngOnInit() {
    this.usuarioActivo = await this.auth.obtenerUsuarioActivo();
    if (this.usuarioActivo) {
        this.rolUsuario = this.usuarioActivo.rol;
        this.planificacionForm.get('')?.setValue(this.usuarioActivo.nombre);
    } else {
        this.rolUsuario = '';
    }
    
    this.cargarVehiculos(); 
   // this.cargarProgramas(); 
    this.cargarCentros(); 
    this.agregarHorario();

    const inicialVehiculo = this.planificacionForm.get('vehiculo')?.value || '';
    this.cargarProgramasPorVehiculo(inicialVehiculo);

    this.planificacionForm.get('vehiculo')?.valueChanges.subscribe((val: string) => {
      this.updateOcupantesValidator();
      this.cargarProgramasPorVehiculo(val || '');
    });
  }

  updateOcupantesValidator() {
  const vehiculoId = this.planificacionForm.get('vehiculo')?.value;
  const vehiculoSeleccionado = this.vehiculos.find(v => v.id === vehiculoId);
  
  if (vehiculoSeleccionado) {
    switch (vehiculoSeleccionado.tipoVehiculo.toLowerCase()) {
      case 'suv':
      case 'camioneta':
        this.maxOcupantes = 4;
        break;
      case 'minivan':
        this.maxOcupantes = 9;
        break;
      case 'camion':
        this.maxOcupantes = 2;
        break;
      default:
        this.maxOcupantes = 4; 
    }

    this.planificacionForm.get('ocupantes')?.setValidators([Validators.required, Validators.min(1), Validators.max(this.maxOcupantes)]);
    this.planificacionForm.get('ocupantes')?.updateValueAndValidity();
  }
  }

  checkTimeRestrictions() {
    const diasSeleccionados = this.planificacionForm.get('diasSeleccionados')?.value || [];
    const ahora = new Date();
    const hoyString = ahora.toISOString().split('T')[0];
    const agendandoParaHoy = diasSeleccionados.some((d: string) => d.startsWith(hoyString));

    if (agendandoParaHoy && ahora.getHours() >= 17) {
      this.canAddHorario = false;
      this.mostrarToast('No se pueden agregar más horarios para hoy después de las 17:00.', 'warning');
    } else {
      this.canAddHorario = true;
    }
  }
  cargarProgramasPorVehiculo(patente: string) {
    if (!patente) {
      this.programasDisponibles = [];
      this.horarios.controls.forEach(control => {
        control.get('programa')?.setValue(''); 
      });
      return;
    }

    const vehiculoSeleccionado = this.vehiculos.find(v => v.id === patente);
    if (!vehiculoSeleccionado) return;

    this.vehiculoServicio.getProgramasPorVehiculo(vehiculoSeleccionado.patente).subscribe({
      next: (data) => {
        this.programasDisponibles = data;
     
        this.horarios.controls.forEach(control => {
          control.get('programa')?.setValue('');
        });
        if (data.length === 0) {
          this.mostrarToast('Este vehículo no tiene programas asignados.', 'warning');
        }
      },
      error: (err) => {
        this.mostrarToast('Error al cargar programas para este vehículo.', 'danger');
        this.programasDisponibles = [];
      }
    });
  }

  isWeekday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return utcDay !== 0 && utcDay !== 6;
  }

  async cargarVehiculos() {
      this.vehiculoServicio.getVehiculos().subscribe({
        next: (data) => this.vehiculos = data,
        error: (err) => this.mostrarToast('Error al cargar vehículos.', 'danger')
    });
  }
  
/* cargarProgramas() {
    this.programa = { prog: this.centroServicio.obtenerPrograma('prog') };
  }*/

 
  cargarCentros() {
    this.centros = {
      salud: this.centroServicio.obtenerEstablecimientos(2),
      atm: this.centroServicio.obtenerEstablecimientos(4),
      educacion: this.centroServicio.obtenerEstablecimientos(3),
      central: this.centroServicio.obtenerEstablecimientos(1)
    };
  }

  get horarios(): FormArray {
    return this.planificacionForm.get('horarios') as FormArray;
  }

  nuevoHorario(): FormGroup {
    return this.fb.group({
      inicio: [ /*'08:00'*/, Validators.required],
      fin: [/*'17:00'*/, Validators.required],
      programa: ['', Validators.required],
      puntoSalida: ['', Validators.required],
      direccionSalida: [''],
      centroSaludSalida: [''],
      centroEducacionSalida: [''],
      centroAtmSalida: [''],
      puntoDestino: ['', Validators.required],
      direccionDestino: [''],
      centroSaludDestino: [''],
      centroEducacionDestino: [''],
      centroAtmDestino: [''],
    });
  }

  agregarHorario() {
    if (this.canAddHorario) {
      this.horarios.push(this.nuevoHorario());
    } else {
      this.mostrarToast('No se pueden agregar más horarios para hoy después de las 17:00.', 'warning');
    }
  }

  removerHorario(i: number) {
    if (this.horarios.length > 1) {
        this.horarios.removeAt(i);
    } else {
        this.mostrarToast('Debe haber al menos un rango de horario.', 'warning');
    }
  }

  async onSubmit() {
    if (this.planificacionForm.invalid) {
    this.mostrarToast('Por favor, complete todos los campos requeridos.', 'danger');
    this.planificacionForm.markAllAsTouched();
    return;
  }
  
  const formValue = this.planificacionForm.value;

  const vehiculoSeleccionado = this.vehiculos.find(v => v.id === formValue.vehiculo);
  if (!vehiculoSeleccionado) {
    this.mostrarToast('Error: Vehículo no encontrado.', 'danger');
    return;
  }
  const viajesParaCrear = [];
  for (const fechaStr of formValue.diasSeleccionados) {
    for (const horario of formValue.horarios) {
        
        const nuevoViaje = {
          
          /*id: `viaje-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          solicitante: this.usuarioActivo?.usuario || 'Desconocido',
          fecha: new Date(fechaStr).toISOString().split('T')[0],
          hora: horario.inicio,
          puntoSalida: horario.puntoSalida,
          direccionSalida: horario.direccionSalida,
          centroSaludSalida: horario.centroSaludSalida,
          centroEducacionSalida: horario.centroEducacionSalida,
          centroAtmSalida: horario.centroAtmSalida,
          puntoDestino: horario.puntoDestino,
          direccionDestino: horario.direccionDestino,
          centroSaludDestino: horario.centroSaludDestino,
          centroEducacionDestino: horario.centroEducacionDestino,
          centroAtmDestino: horario.centroAtmDestino,
          tipoVehiculo: vehiculoSeleccionado.tipo || 'Vehículo',
          ocupante: formValue.responsable,
          hora_inicio: horario.inicio,
          hora_fin: horario.fin,
          ocupantes: formValue.ocupantes,
          motivo: formValue.motivo,
          responsable: formValue.responsable,
          estado: 'agendado',
          idVehiculo: vehiculoSeleccionado.id,
          vehiculo: `${vehiculoSeleccionado.patente} - ${vehiculoSeleccionado.conductor}`,
          idPrograma: programaSeleccionado ? programaSeleccionado.value : 'N/A',
          programa: programaSeleccionado ? programaSeleccionado.label : 'No especificado'
          */
        fecha_viaje: new Date(fechaStr).toISOString().split('T')[0],
        hora_inicio: horario.inicio,
        hora_fin: horario.fin,
        punto_salida: this.obtenerTextoUbicacion('Salida', horario),
        punto_destino: this.obtenerTextoUbicacion('Destino', horario),
        motivo: formValue.motivo,
        ocupantes: formValue.ocupantes,
        programa: horario.programa,
        responsable: formValue.responsable,
        necesita_carga: 'no',
        vehiculo_deseado: vehiculoSeleccionado.tipoVehiculo || 'No especificado',
        vehiculo_patente: vehiculoSeleccionado.patente,
        estado: 'aceptado'
        };

        viajesParaCrear.push(nuevoViaje);
      }
    }
    if (viajesParaCrear.length === 0) {
      this.mostrarToast('No hay viajes para planificar. Seleccione al menos un día.', 'warning');
      return;
    }

    try {
   
    for (const viaje of viajesParaCrear) {
    
      await firstValueFrom(this.viajesServicio.createViajeMasivo(viaje));
    }

   this.mostrarToast(`¡Se han agendado ${viajesParaCrear.length} viajes con éxito!`, 'success');
    
    if (this.usuarioActivo?.correo) {
      this.notificaciones.enviarCorreoMasivo(this.usuarioActivo.correo);
    }
    
    this.router.navigate(['/calendario']);

  } catch (error) {
    this.mostrarToast('Hubo un error al guardar uno o más viajes. Intente de nuevo.', 'danger');
    console.error('Error al guardar viajes masivos:', error);
  }
}


  private handleLocationChange(type: 'Salida' | 'Destino', value: any, index: number ) {
    const isSalida = type === 'Salida';

  const horarioGroup = this.horarios.at(index);
    
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
     const control = horarioGroup.get(controlName); 
      control?.clearValidators();
      control?.setValue('');
    });

    let controlToValidate: string | null = null;
    
    switch (value) {
      case '2': // Salud
        this[isSalida ? 'showSaludSalida' : 'showSaludDestino'] = true;
        this[isSalida ? 'establecimientosSaludSalida' : 'establecimientosSaludDestino'] = this.centroServicio.obtenerEstablecimientos(2);
        controlToValidate = `centroSalud${type}`;
        break;
      case '3': // Educación
        this[isSalida ? 'showEducacionSalida' : 'showEducacionDestino'] = true;
        this[isSalida ? 'establecimientosEducacionSalida' : 'establecimientosEducacionDestino'] = this.centroServicio.obtenerEstablecimientos(3);
        controlToValidate = `centroEducacion${type}`;
        break;
      case '4': // ATM
        this[isSalida ? 'showAtmSalida' : 'showAtmDestino'] = true;
        this[isSalida ? 'establecimientosAtmSalida' : 'establecimientosAtmDestino'] = this.centroServicio.obtenerEstablecimientos(4);
        controlToValidate = `centroAtm${type}`;
        break;
      case '5': // Otro
        this[isSalida ? 'showOtroSalida' : 'showOtroDestino'] = true;
        controlToValidate = `direccion${type}`;
        break;
    }

   if (controlToValidate) {
    horarioGroup.get(controlToValidate)?.setValidators([Validators.required]); 
   }

   /* if (controlToValidate == `direccion${type}`) {
      this.registroForm.get(controlToValidate)?.setValidators([Validators.required, Validadores.soloTexto]);
    }*/

    controlsToReset.forEach(controlName => {
      this.planificacionForm.get(controlName)?.updateValueAndValidity();
    });
  }

  
  onSalidaChange(ev: any, index: number) {
    this.handleLocationChange('Salida', ev.detail.value, index);
  }


  onDestinoChange(ev: any, index: number) {
    this.handleLocationChange('Destino', ev.detail.value, index);
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

  async mostrarToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top',
    });
    toast.present();
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
