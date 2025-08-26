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
  
  centros: { salud: any[]; atm: any[]; educacion: any[]; central: any[]; } = 
    { salud: [], atm: [], educacion: [], central: [] };
  programa: { prog: any[] } = { prog: [] };
  auto: { vehiculo: any[] } = { vehiculo: [] };
  
  showSaludFields = false; 
  showEducacionFields = false;
  showAtmFields = false;
  showNivelCentralFields = false;
  
  rolUsuario: string = '';
  usuarioActivo: { usuario:string; rol:string; correo?: string } | null = null;
  maxOcupantes = 9;


    isAnoPickerOpen = false;
    isRevPickerOpen = false;

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


  onSubmit() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      this.mostrarToast('Lo sentimos, el formulario no está completo.', 'danger');
      return;
    }
  
    const formValue = this.registroForm.value;
    
    
    const nuevoVehiculo = {
       patente: formValue.patente.toUpperCase(),
       marca: formValue.marca,
       modelo: formValue.modelo,
       ano: new Date(formValue.anoVehiculo).getFullYear(), 
       capacidad: formValue.capacidad,
       tipo_vehiculo: formValue.tipoVehiculo,
       revision_tecnica: new Date(formValue.fechaRevision).toISOString().split('T')[0],
       nombre_conductor: formValue.conductorTitular,
       encargado_nombre: `${formValue.nombreEncVehiculo} ${formValue.apellidoEncVehiculo}`, 
       encargado_rut: formValue.rutEncVehiculo,
       conductor_reemplazo: formValue.conductorReemplazo,
       centro_asignado: formValue.centro,
       centro_salud_1: formValue.centroSalud1 || null,
       centro_salud_2: formValue.centroSalud2 || null,
       centro_educacion: formValue.centroEducacion || null,
       centro_atm: formValue.centroAtm || null,
       programa: formValue.programa,
       contrato: formValue.contrato,
          
    };
  
     this.VehiculoServicio.registrarVehiculo(nuevoVehiculo).subscribe({
            next: () => {
                this.mostrarToast('Vehículo registrado con éxito.', 'success');
                this.registroForm.reset();
                this.router.navigate(['/gestion']);
            },
            error: (error) => {
                console.error('Error al registrar vehículo:', error);
                let mensajeError = 'Error desconocido al registrar el vehículo.';
                if (error instanceof HttpErrorResponse) {
                    mensajeError = error.error?.message || 'Error de conexión con el servidor.';
                }
                this.mostrarToast(mensajeError, 'danger');
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

  this.centros = {
      salud: this.centroServicio.obtenerCentros('salud'),
      atm: this.centroServicio.obtenerCentros('atm'),
      educacion: this.centroServicio.obtenerCentros('educacion'),
      central: this.centroServicio.obtenerCentros('central')
    };
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
  const selectedCentro = event.detail.value;
   this.showSaludFields = selectedCentro === 'salud';
    this.showEducacionFields = selectedCentro === 'educacion';
    this.showAtmFields = selectedCentro === 'atm';

        // Limpia validadores y valores de los campos dinámicos
 const dynamicControls = ['centroSalud1', 'centroSalud2', 'centroEducacion', 'centroAtm'];
    dynamicControls.forEach(controlName => {
    this.registroForm.get(controlName)?.clearValidators();
     this.registroForm.get(controlName)?.setValue('');
       this.registroForm.get(controlName)?.updateValueAndValidity();
     });

   if (this.showSaludFields) {
      this.registroForm.get('centroSalud1')?.setValidators([Validators.required]);
   }
   if (this.showEducacionFields) {
    this.registroForm.get('centroEducacion')?.setValidators([Validators.required]);
    }
   if (this.showAtmFields) {
     this.registroForm.get('centroAtm')?.setValidators([Validators.required]);
    }
        
   dynamicControls.forEach(controlName => {
     this.registroForm.get(controlName)?.updateValueAndValidity();
     });
    
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
