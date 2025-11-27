import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { Router } from '@angular/router';

import { MenuLateralComponent } from '../componentes/menu-lateral/menu-lateral.component';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import {  IonMenuButton, IonHeader, IonTitle, IonToolbar, IonDatetimeButton, IonContent,
    IonInput, IonDatetime, IonGrid, IonRow, IonCol, IonModal, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonButton, IonItem, IonLabel, IonSelect,
    IonSelectOption, IonText, IonButtons, IonToggle, IonIcon, 

   } from '@ionic/angular/standalone';
import { Validadores } from '../validador/validadores';
import { ToastController } from '@ionic/angular';
import { Memorialocal } from '../almacen/memorialocal';

import { CentroServicio } from '../servicio/centro-servicio';
import { VehiculoServicio } from '../servicio/vehiculo-servicio';
import  { HttpErrorResponse } from '@angular/common/http';
import { NotificacionesCorreo } from '../servicio/notificaciones-correo';
import { AutentificacionUsuario } from '../servicio/autentificacion-usuario';

import { IonicModule } from '@ionic/angular';

import { addIcons  } from 'ionicons';
import { calendarOutline } from 'ionicons/icons';



@Component({
  selector: 'app-registro-vehiculo',
  templateUrl: './registro-vehiculo.page.html',
  styleUrls: ['./registro-vehiculo.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [ 
    //IonicModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
      //  MenuLateralComponent,
        IonMenuButton, IonHeader, IonTitle, IonToolbar,  IonContent,
    IonInput,  IonGrid, IonRow, IonCol,  IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonButton, IonItem,  IonSelect,
    IonSelectOption,  IonButtons, IonToggle, 
  ]
})
export class RegistroVehiculoPage implements OnInit {

    registroForm!: FormGroup;
    startYear = 2015;
    maxYearIso = new Date().getFullYear().toString();
    todayIso = new Date().toISOString();
    endYearNum = new Date().getFullYear();
    endYear = new Date().getFullYear().toString();
    minDate: string;
    maxDate: string;
  
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


    //isAnoPickerOpen = false;
    //isRevPickerOpen = false;
   // isPermisoPickerOpen = false; 
   // isSeguroPickerOpen = false;
    
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
    private VehiculoServicio : VehiculoServicio,
    private notificaciones: NotificacionesCorreo,
    private auth: AutentificacionUsuario,
    ) {
      addIcons({ calendarOutline
      });
      const today = new Date();

      // 1. Fecha Mínima = Hoy
      // (Formato YYYY-MM-DD)
      this.minDate = today.toISOString().split('T')[0];

      // 2. Fecha Máxima = 1 año desde Hoy
      const maxYear = new Date();
      maxYear.setFullYear(today.getFullYear() + 1);
      this.maxDate = maxYear.toISOString().split('T')[0];
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
    
    // lista de objeto a alamcenar
    const nuevoVehiculo = {
      // Proveedor / Contrato
      rut_proveedor: formValue.rutEncVehiculo,
      nombre_proveedor: `${formValue.nombreEncVehiculo} ${formValue.apellidoEncVehiculo}`,
      id_contrato: formValue.contrato,
      fecha_inicio: formValue.inicioContrato,
      fecha_termino: formValue.terminoContrato,
      horas_contratadas: formValue.horasContratadas,


      // Vehículo
      patente: formValue.patente.toUpperCase(),
      marca: formValue.marca,
      modelo: formValue.modelo,
      ano: new Date(formValue.anoVehiculo).getFullYear(),
      tipo_vehiculo: formValue.tipoVehiculo,
      capacidad: formValue.capacidad ? 1 : 0, 
      revision_tecnica: formValue.fechaRevision,
      permiso_circulacion: formValue.permisoCirculacion,
      seguro_obligatorio: formValue.seguroObligatorio,
      nombre_conductor: formValue.conductorTitular,
      conductor_reemplazo: formValue.conductorReemplazo,

      // Asignaciones
      programa: formValue.programa,
      centro: formValue.centro,
      centroSalud1: formValue.centroSalud1,
      centroSalud2: formValue.centroSalud2,
      centroEducacion: formValue.centroEducacion,
      centroAtm: formValue.centroAtm
    };

    this.VehiculoServicio.registrarVehiculo(nuevoVehiculo).subscribe({
      next: () => {
        this.mostrarToast('Vehículo registrado con éxito.', 'success');
        console.log('Vehículo registrado:', nuevoVehiculo);
        if (this.usuarioActivo?.correo) {
          this.notificaciones.enviarCorreoVehiculoRegistrado(this.usuarioActivo.correo, nuevoVehiculo.patente);
        }
        this.registroForm.reset();
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
      inicioContrato: ['',[Validators.required]],
      terminoContrato: ['',[Validators.required]],
      horasContratadas: ['',[Validators.required, Validators.min(1), Validators.max(44)]],
      fechaRevision: ['',[Validators.required, Validators.min(2025)]],
      permisoCirculacion: ['',[Validators.required, Validators.min(2025)]],
      seguroObligatorio: ['',[Validators.required, Validators.min(2025)]],
      //fechaContrato: ['',Validators.required],futuras actualizaciones, considerar tambien el tema de las horas contratadas
      // para forzar el uso del vehiculo solamente en horarios maximo establecido segun el contratos

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

onRevSelectedContrato(ev: any) {
  this.registroForm.patchValue({ inicioContrato: ev.detail.value });
}

onRevSelectedFinContrato(ev: any) {
  this.registroForm.patchValue({ terminoContrato: ev.detail.value });
}

onRevSelected(ev: any) {
  this.registroForm.patchValue({ fechaRevision: ev.detail.value });
}

onRevSelectedPermiso(ev: any) {
  this.registroForm.patchValue({ permisoCirculacion: ev.detail.value });
}
onRevSelectedSeguro(ev: any) {
  this.registroForm.patchValue({ seguroObligatorio: ev.detail.value });
}

 /*onDateChange(event: any, controlName: string, pickerToClose: 'ano' | 'rev'| 'permiso' | 'seguro') {
 this.registroForm.get(controlName)?.setValue(event.detail.value);
          /*if (pickerToClose === 'ano') {
                this.isAnoPickerOpen = false;
            } else 
              if (pickerToClose === 'rev') {
                this.isRevPickerOpen = false;
            } else if (pickerToClose === 'permiso') {
                this.isPermisoPickerOpen = false; 
            } else if (pickerToClose === 'seguro') {
                this.isSeguroPickerOpen = false; 
            }
    }*/

onAnoChange(event: any) {
  const dateString = event.detail.value; 
  if (dateString) {
    const year = dateString.split('-')[0]; 
    this.registroForm.get('anoVehiculo')?.setValue(year);
  } else {
    this.registroForm.get('anoVehiculo')?.setValue(null);
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
    conversacion entren el front, backend y la bd
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
