import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MenuLateralComponent } from '../componentes/menu-lateral/menu-lateral.component';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import {  IonMenuButton, IonHeader, IonTitle, IonToolbar, IonDatetimeButton, IonContent,
    IonInput, IonDatetime, IonGrid, IonRow, IonCol, IonModal, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonButton, IonItem, IonLabel, IonSelect,
    IonSelectOption, IonText, IonButtons, IonToggle, IonIcon
      } from '@ionic/angular/standalone';
import { Validadores } from '../validador/validadores';
import { ToastController } from '@ionic/angular';
import { Memorialocal } from '../almacen/memorialocal';

import { CentroServicio } from '../servicio/centro-servicio';
import { VehiculoServicio } from '../servicio/vehiculo-servicio';
import  { HttpErrorResponse } from '@angular/common/http';

import { addIcons  } from 'ionicons';
import { calendarOutline } from 'ionicons/icons';
@Component({
  selector: 'app-registro-vehiculo',
  templateUrl: './registro-vehiculo.page.html',
  styleUrls: ['./registro-vehiculo.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [  CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MenuLateralComponent,
        IonMenuButton, IonHeader, IonTitle, IonToolbar,  IonContent,
    IonInput, IonDatetime, IonGrid, IonRow, IonCol, IonModal, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonButton, IonItem, IonLabel, IonSelect,
    IonSelectOption, IonText, IonButtons, IonToggle, IonIcon
  ]
})
export class RegistroVehiculoPage implements OnInit {

    registroForm!: FormGroup;
    startYear = 2015;
    maxYearIso = new Date().getFullYear().toString();
    todayIso = new Date().toISOString();
    endYearNum = new Date().getFullYear();
    endYear = new Date().getFullYear().toString();
  
  programa: { prog: any[] } = { prog: [] };
  auto: { vehiculo: any[] } = { vehiculo: [] };
  
  centrosPrincipales: { value: number; label: string }[] = [];
  establecimientos: { value: number; label: string }[] = [];
  establecimientosSalud: { value: number, label: string }[] = [];
  establecimientosEducacion: { value: number, label: string }[] = [];
  establecimientosAtm: { value: number, label: string }[] = [];
  
  rolUsuario: string = '';
  usuarioActivo: { usuario:string; rol:string; correo?: string } | null = null;
  maxOcupantes = 9;


    isAnoPickerOpen = false;
    isRevPickerOpen = false;
    
    //vaiables para mostrar los select de los establecimientos
    showEstablecimiento = false;
    showSalud = false;
    showEducacion = false;
    showAtm = false;



  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private toastController: ToastController,
    private centroServicio: CentroServicio,
    private VehiculoServicio : VehiculoServicio
    ) {
      addIcons({ calendarOutline
      });
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


    async onSubmit() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      this.mostrarToast('Por favor, complete todos los campos requeridos.', 'danger');
      return;
    }

    const formValue = this.registroForm.value;
    
    // Preparar el objeto para enviar a la API
    const nuevoVehiculo = {
      // Proveedor / Contrato
      rut_proveedor: formValue.rutEncVehiculo,
      nombre_proveedor: `${formValue.nombreEncVehiculo} ${formValue.apellidoEncVehiculo}`,
      id_contrato: formValue.contrato,
      
      // Vehículo
      patente: formValue.patente.toUpperCase(),
      marca: formValue.marca,
      modelo: formValue.modelo,
      ano: new Date(formValue.anoVehiculo).getFullYear(),
      TIPO_VEHICULO_id_tipoVehiculo: formValue.tipoVehiculo,
      capacidad: formValue.capacidad ? 1 : 0, 
      revision_tecnica: new Date(formValue.fechaRevision).toISOString().split('T')[0],
      nombre_conductor: formValue.conductorTitular,
      nombre_conductor_reemplazo: formValue.conductorReemplazo,

      // Asignaciones
      programas: formValue.programa,
      establecimientos: formValue.establecimiento
    };

    this.VehiculoServicio.registrarVehiculo(nuevoVehiculo).subscribe({
      next: () => {
        this.mostrarToast('Vehículo registrado con éxito.', 'success');
        this.registroForm.reset();
        this.router.navigate(['/gestion']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al registrar vehículo:', err);
        const errorMsg = err.error?.message || 'Error de conexión con el servidor.';
        this.mostrarToast(errorMsg, 'danger');
      }
    });
  }


  ngOnInit() {
    this.registroForm = this.fb.group({
      //encargado
      nombreEncVehiculo: ['',Validators.compose( [Validators.required, Validadores.soloTexto])],
      apellidoEncVehiculo: ['',Validators.compose([ Validators.required, Validadores.soloTexto])],
      rutEncVehiculo: ['', Validators.compose( [Validators.required, Validadores.validarRut])],
    
      //vehiculo
      patente: ['',Validators.compose( [Validators.required, Validadores.validarPatente])],
      marca: ['',Validators.compose([ Validators.required, Validadores.soloTexto])],
      modelo: ['',Validators.compose([ Validators.required, Validadores.soloTexto])],
      capacidad: [false, Validators.required],
      tipoVehiculo: ['', Validators.required],
      anoVehiculo: ['',[Validators.required, Validators.min(2015), Validators.max(this.endYearNum)]],
      conductorTitular: ['',Validators.compose( [Validators.required, Validadores.soloTexto])],
      conductorReemplazo: ['',Validators.compose( [Validators.required, Validadores.soloTexto])],
      
      //centros
      centro: ['', Validators.required],
      centroSalud1: [''],
      centroSalud2: [''],
      centroEducacion: [''],
      centroAtm: [''],

      //Documentación
      programa: ['',Validators.required],
      contrato: ['',Validators.required],
      fechaRevision: ['',Validators.required],
    });

  this.centrosPrincipales = this.centroServicio.obtenerCentros();

  this.auto = {
      vehiculo: this.centroServicio.obtenerAuto('vehiculo')
    };
  this.programa = {
       prog: this.centroServicio.obtenerPrograma('prog')
        };

  }

 onYearSelected(ev: any) {
  const year = new Date(ev.detail.value).getFullYear();
  this.registroForm.patchValue({ anoVehiculo: year });
}

onRevSelected(ev: any) {
  this.registroForm.patchValue({ fechaRevision: ev.detail.value });
}

 onDateChange(event: any, controlName: string, pickerToClose: 'ano' | 'rev') {
        this.registroForm.get(controlName)?.setValue(event.detail.value);
        if (pickerToClose === 'ano') {
            this.isAnoPickerOpen = false;
        } else {
            this.isRevPickerOpen = false;
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

    // dejamos los 4 centros para realizar bien el registro.
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
  }


  goToHomePage() {
    this.router.navigate(['/home']);
  }

  goToBitacoraPage() {
    this.router.navigate(['/bitacora']);
  }

  goToEstadoViajePage() {
    this.router.navigate(['/estado-viaje']);
  }
  
  goToViajesSolicitadosPage() {
    this.router.navigate(['/viajes-solicitados']);
  }

  goToGestionPage(){
    this.router.navigate(['/gestion']);
  }





}
