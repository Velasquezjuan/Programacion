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
import { CentroServicio } from '../servicio/centro-servicio';
import { Agenda } from '../servicio/agenda';
import { ToastController } from '@ionic/angular';
import { AutentificacionUsuario } from '../servicio/autentificacion-usuario';

 import { addIcons } from 'ionicons';
import { addCircleOutline, trashOutline} from 'ionicons/icons';




@Component({
  selector: 'app-viajes-masivos',
  templateUrl: './viajes-masivos.page.html',
  styleUrls: ['./viajes-masivos.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonMenuButton, IonHeader, IonTitle, IonToolbar,
    IonInput, IonFooter, IonGrid, IonRow, IonCol, IonButton,
    IonItem, IonLabel, IonSelect, IonSelectOption, CommonModule,
    FormsModule, ReactiveFormsModule, IonDatetime, IonDatetimeButton,
     IonCheckbox, IonIcon, IonItemDivider, IonItemGroup,
    MenuLateralComponent 
   ]
})
export class ViajesMasivosPage implements OnInit {
  
 planificacionForm: FormGroup;
  vehiculos: any[] = [];
  programa: { prog: any[] } = { prog: [] };
  rolUsuario = '';
  usuarioActivo: { usuario: string; rol: string } | null = null;
  maxOcupantes = 9;
  canAddHorario: boolean = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private auth: AutentificacionUsuario,
    private centroServicio: CentroServicio
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
  }

  async ngOnInit() {
    this.usuarioActivo = await this.auth.obtenerUsuarioActivo();
    if (this.usuarioActivo) {
        this.rolUsuario = this.usuarioActivo.rol;
        this.planificacionForm.get('responsable')?.setValue(this.usuarioActivo.usuario);
    }
    
    await this.cargarVehiculos();
    this.cargarProgramas(); 
    this.agregarHorario();

    this.planificacionForm.get('vehiculo')?.valueChanges.subscribe(() => this.updateOcupantesValidator());
    this.planificacionForm.get('diasSeleccionados')?.valueChanges.subscribe(() => this.checkTimeRestrictions());
    this.checkTimeRestrictions();
  }

  updateOcupantesValidator() {
    const vehiculoId = this.planificacionForm.get('vehiculo')?.value;
    const vehiculoSeleccionado = this.vehiculos.find(v => v.id === vehiculoId);
    if (vehiculoSeleccionado) {
      this.maxOcupantes = vehiculoSeleccionado.capacidad;
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

  isWeekday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return utcDay !== 0 && utcDay !== 6;
  }

  async cargarVehiculos() {
    this.vehiculos = await Memorialocal.getVehiculosConConductor();
  }
  
  cargarProgramas() {
    this.programa = { prog: this.centroServicio.obtenerPrograma('prog') };
  }

  get horarios(): FormArray {
    return this.planificacionForm.get('horarios') as FormArray;
  }

  nuevoHorario(): FormGroup {
    return this.fb.group({
      inicio: ['08:00', Validators.required],
      fin: ['17:00', Validators.required],
      programa: ['', Validators.required] 
    });
  }

  agregarHorario() {
    this.checkTimeRestrictions();
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
      return;
    }

    this.checkTimeRestrictions();
    if (!this.canAddHorario) {
      this.mostrarToast('No se puede agendar para hoy después de las 17:00.', 'error');
      return;
    }

    const formValue = this.planificacionForm.value;
    const diasSeleccionados = formValue.diasSeleccionados;

    if (!diasSeleccionados || diasSeleccionados.length === 0) {
      this.mostrarToast('Debe seleccionar al menos un día en el calendario.', 'warning');
      return;
    }

    // ==================================================================
    // ||           SOLUCIÓN: AQUÍ ESTÁ LA MAGIA                     ||
    // ==================================================================
    // 1. Buscamos el objeto COMPLETO del vehículo seleccionado.
    const vehiculoSeleccionado = this.vehiculos.find(v => v.id === formValue.vehiculo);
    if (!vehiculoSeleccionado) {
      this.mostrarToast('Error: Vehículo no encontrado.', 'danger');
      return;
    }

    const nuevosViajes = [];
    for (const fechaStr of diasSeleccionados) {
      for (const horario of formValue.horarios) {
        // 2. Buscamos el objeto COMPLETO del programa seleccionado.
        const programaSeleccionado = this.programa.prog.find(p => p.value === horario.programa);

        const nuevoViaje = {
          id: `viaje-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          origen: 'Por definir',
          destino: 'Por definir',
          fecha: new Date(fechaStr).toISOString().split('T')[0],
          hora_inicio: horario.inicio,
          hora_fin: horario.fin,
          ocupantes: formValue.ocupantes,
          motivo: formValue.motivo,
          responsable: formValue.responsable,
          estado: 'Agendado',
          
          // 3. Añadimos los DATOS ENRIQUECIDOS que el calendario necesita.
          idVehiculo: vehiculoSeleccionado.id,
          vehiculo: `${vehiculoSeleccionado.patente}`, // Guardamos la patente para mostrar
          conductor: vehiculoSeleccionado.conductor, // Guardamos el nombre del conductor
          idPrograma: programaSeleccionado ? programaSeleccionado.value : 'N/A',
          programa: programaSeleccionado ? programaSeleccionado.label : 'No especificado' // Guardamos el nombre del programa
        };
        nuevosViajes.push(nuevoViaje);
      }
    }

    try {
      await Memorialocal.guardar('viajesSolicitados', nuevosViajes);
      await this.mostrarToast(`¡Se han agendado ${nuevosViajes.length} viajes con éxito!`, 'success');
      this.router.navigate(['/calendario']);
    } catch (error) {
      this.mostrarToast('Hubo un error al guardar los viajes.', 'danger');
      console.error('Error al guardar viajes masivos:', error);
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
