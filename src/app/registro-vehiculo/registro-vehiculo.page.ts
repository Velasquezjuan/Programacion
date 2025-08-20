import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MenuLateralComponent } from '../componentes/menu-lateral/menu-lateral.component';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonMenu, IonMenuButton, IonHeader, IonTitle, IonToolbar,
   IonInput, IonDatetime, IonGrid, IonRow, IonCol, IonList,
   IonButton, IonItem, IonLabel, IonSelect, IonToggle, 
  IonSelectOption, IonApp} from '@ionic/angular/standalone';
import { Validadores } from '../validador/validadores';
import { ToastController } from '@ionic/angular';
import { Memorialocal } from '../almacen/memorialocal';

import { CentroServicio } from '../servicio/centro-servicio';
import { VehiculoServicio } from '../servicio/vehiculo-servicio';

@Component({
  selector: 'app-registro-vehiculo',
  templateUrl: './registro-vehiculo.page.html',
  styleUrls: ['./registro-vehiculo.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, MenuLateralComponent ,ReactiveFormsModule, IonMenuButton, IonHeader, IonHeader,
    IonToolbar, IonInput, IonDatetime, IonGrid, IonRow, IonCol, IonButton, 
    IonItem, IonLabel, IonSelect, IonSelectOption, IonTitle
  ]
})
export class RegistroVehiculoPage implements OnInit {

  registroForm!: FormGroup;
  startYear = 2015;
  endYear   = new Date().getFullYear();
  today     = new Date().toISOString().split('T')[0];
  
  centros: { salud: any[]; atm: any[]; educacion: any[]; central: any[]; } = 
    { salud: [], atm: [], educacion: [], central: [] };
  programa: { prog: any[] } = { prog: [] };
  auto: { vehiculo: any[] } = { vehiculo: [] };
  
  showNivelCentralFields = false;
  showSaludFields = false; 
  showEducacionFields = false;
  showAtmFields = false;
  
  rolUsuario: string = '';
  usuarioActivo: { usuario:string; rol:string; correo?: string } | null = null;
  maxOcupantes = 9;
  //showYearPicker = false;
 // selectedYear: string = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private toastController: ToastController,
    private centroServicio: CentroServicio,
    private VehiculoServicio : VehiculoServicio
    ) {}


  
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
    
    // Objeto para la API (aún no guarda todos los campos, necesita ajuste en el backend)
    const nuevoVehiculo = {
      patente: formValue.patente.toUpperCase(),
      marca: formValue.marca,
      modelo: formValue.modelo,
      ano: formValue.anoVehiculo,
      tipo_vehiculo: formValue.tipoVehiculo,
      capacidad: formValue.capacidad,
      revision_tecnica: new Date(formValue.fechaRevision).toISOString().split('T')[0],
      nombre_conductor: formValue.conductorTitular,
      // NOTA: Estos son los campos extra que tu API necesitará recibir y guardar
      encargado_nombre: `${formValue.nombreEncVehiculo} ${formValue.apellidoEncVehiculoPaterno}`,
      encargado_rut: formValue.rutEncVehiculo,
     conductor_reemplazo: formValue.conductorReemplazo,
      tiene_carga: formValue.tieneCarga,
      centro_asignado: formValue.centro,
      centro_salud_1: formValue.centroSalud1 || null,
      centro_salud_2: formValue.centroSalud2 || null,
      centro_educacion: formValue.centroEducacion || null,
      centro_atm: formValue.centroAtm || null,
      programa: formValue.programa,
      contrato: formValue.contrato,
          
    };
  
    this.VehiculoServicio.createVehiculo(nuevoVehiculo).subscribe({
      next: (response) => {
        this.mostrarToast('Vehículo registrado con éxito.', 'success');
        this.registroForm.reset();
        this.router.navigate(['/gestion']);
      },
      error: (error) => {
        console.error('Error al registrar vehículo:', error);
        this.mostrarToast(error.error.message || 'Error al registrar el vehículo.', 'danger');
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
      tieneCarga: [''],
      tipoVehiculo: ['',Validators.compose([ Validators.required, Validadores.soloTexto])],
      anoVehiculo: ['',[Validators.required, Validators.min(2015), Validators.max(this.endYear)]],
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
    const year = new Date(ev.detail.value).getFullYear().toString();
    this.registroForm.patchValue({ anoVehiculo: year });
  }


  onRevSelected(ev: any) {
    this.registroForm.patchValue({ fechaRevision: ev.detail.value });
  }

  
  onCentroChange(event: any) {
    
    const selectedCentro = event.detail.value;

    // Restablecer los campos visibles
    this.showNivelCentralFields = false;
    this.showEducacionFields = false;
    this.showAtmFields = false;
    this.showSaludFields = false;    

    // Mostrar campos según el cargo seleccionado
   if (selectedCentro === 'nivelCentral') {
      this.showNivelCentralFields = true;
    } else if (selectedCentro === 'educacion') {
      this.showEducacionFields = true;
    } else if (selectedCentro === 'atm') {
      this.showAtmFields = true;
    } else if (selectedCentro === 'salud') {
     this.showSaludFields= true;
    } 
    if (this.showSaludFields) {
      this.registroForm.get('centroSalud1')?.setValidators([Validators.required]);
    } else {
      this.registroForm.get('centroSalud1')?.clearValidators();
      this.registroForm.get('centroSalud1')?.setValue('');
      this.registroForm.get('centroSalud2')?.setValue('');
    }
    this.registroForm.get('centroSalud1')?.updateValueAndValidity();
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
