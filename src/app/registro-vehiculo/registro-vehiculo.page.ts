import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CentroServicio } from '../servicio/centro-servicio';
import { MenuLateralComponent } from '../componentes/menu-lateral/menu-lateral.component';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonMenu, IonMenuButton, IonHeader, IonTitle, IonToolbar,
   IonInput, IonDatetime, IonGrid, IonRow, IonCol, IonList,
   IonButton, IonItem, IonLabel, IonSelect, IonToggle, 
  IonSelectOption, IonApp} from '@ionic/angular/standalone';
import { Validadores } from '../validador/validadores';
import { ToastController } from '@ionic/angular';
import { Memorialocal } from '../almacen/memorialocal';

@Component({
  selector: 'app-registro-vehiculo',
  templateUrl: './registro-vehiculo.page.html',
  styleUrls: ['./registro-vehiculo.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, MenuLateralComponent ,ReactiveFormsModule, IonMenuButton, IonHeader, IonHeader,
    IonToolbar, IonInput, IonDatetime, IonGrid, IonRow, IonCol, IonButton, 
    IonItem, IonLabel, IonSelect, IonSelectOption, IonApp, IonToggle, IonTitle
  ]
})
export class RegistroVehiculoPage implements OnInit {

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

  programa: { prog: any[] } = { prog: [] };
  
  registroForm!: FormGroup; //Dar la valides del formulario

  

  showNivelCentralFields = false;
  showEducacionFields = false;
  showAtmFields = false;
  showSaludFields = false; 
  showYearPicker = false;
  selectedYear: string = '';

  constructor(
      private fb: FormBuilder, 
      private router: Router,
      private toastController: ToastController,
      private centroServicio: CentroServicio,
    ) {}

    rolUsuario: string = '';
  
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
      this.mostrarToast('Lo sentimos, el formulario no está completo. Revisa tus errores.', 'danger');
      return;
    }
  
    const nuevoVehiculo  = {
      ...this.registroForm.value,
      id: this.registroForm.value.patente.toUpperCase(),
      activo: true,
      fechaRegistro: new Date().toISOString()
    };
  
    // Obtener vehículos guardados
    const vehiculosGuardados = await Memorialocal.obtener<any>('vehiculos') || [];

    const existe = vehiculosGuardados.some((v: any) => v.id === nuevoVehiculo.id);
  
    if (existe) {
      this.mostrarToast('La patente ya está registrada.', 'danger');
      return;
    }
  
    vehiculosGuardados.push(nuevoVehiculo);
    await Memorialocal.guardar('vehiculos', vehiculosGuardados);
  
    this.mostrarToast('Vehículo registrado con éxito.', 'success');
    console.log('Vehículo almacenado:', nuevoVehiculo);
  
    this.registroForm.reset();
  }
  ngOnInit() {
    this.registroForm = this.fb.group({
      nombreEncVehiculo: ['',Validators.compose( [Validators.required, Validadores.soloTexto])],
      apellidoEncVehiculo: ['',Validators.compose([ Validators.required, Validadores.soloTexto])],
      rutEncVehiculo: ['', Validators.compose( [Validators.required, Validadores.validarRut])],
      patente: ['',Validators.compose( [Validators.required, Validadores.validarPatente])],
      marca: ['',Validators.compose([ Validators.required, Validadores.soloTexto])],
      modelo: ['',Validators.compose([ Validators.required, Validadores.soloTexto])],
      centro: ['', Validators.required],
      centroSalud: ['',],
      tieneCarga: [''],
      tipoVehiculo: ['',Validators.compose([ Validators.required, Validadores.soloTexto])],
      añoVehiculo: ['',Validators.required],
      conductorTitular: ['',Validators.compose( [Validators.required, Validadores.soloTexto])],
      conductorReemplazo: ['',Validators.compose( [Validators.required, Validadores.soloTexto])],
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
   // Método para abrir la selección del año
   openYearPicker() {
    this.showYearPicker = true;
  }

  // Método para cerrar la selección del año
  closeYearPicker() {
    this.registroForm.patchValue({ añoVehiculo: this.selectedYear });
    this.showYearPicker = false;
  }
  onYearSelected(event: any) {
    const fullDate = event.detail.value; 
    const year = new Date(fullDate).getFullYear().toString(); 

    this.selectedYear = year;
    this.registroForm.patchValue({ añoVehiculo: year });
    this.showYearPicker = false;
  }

  //Método para rutear las paginas en el menú
  
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
