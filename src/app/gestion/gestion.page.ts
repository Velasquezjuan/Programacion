import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MenuLateralComponent } from '../componentes/menu-lateral/menu-lateral.component';
import { IonContent, IonHeader, IonTitle, IonToolbar, 
  IonItem, IonList, IonLabel, IonSearchbar, IonSelect,IonSelectOption,
  IonButton, IonIcon, IonApp,IonButtons, 
 } from '@ionic/angular/standalone';
 import { HttpClient } from '@angular/common/http';
 import { HttpClientModule } from '@angular/common/http';
 import { addIcons } from 'ionicons';
import { trash, sync, createOutline, saveOutline, closeCircleOutline,
  checkmarkDoneOutline, checkmarkOutline, trashOutline, checkmarkCircleOutline
 } from 'ionicons/icons';
import { Memorialocal } from '../almacen/memorialocal';
import { Administracion } from '../servicio/administracion';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.page.html',
  styleUrls: ['./gestion.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonHeader,HttpClientModule, IonTitle, RouterModule, MenuLateralComponent, IonToolbar, CommonModule, 
    FormsModule, ReactiveFormsModule , IonItem, IonList, IonLabel, IonSearchbar,
    IonSelect, IonSelectOption, IonButton, IonIcon, IonApp ,IonButtons, 
  ]
})
export class GestionPage implements OnInit {

  tipoBusqueda: string = 'usuario';
  terminoBusqueda: string = '';
  criterioBusqueda: string = '';

  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  vehiculos: any[] = [];
  vehiculosFiltrados: any[] = [];

  usuarioEditandoRut: string | null = null;
  vehiculoEditandoPatente: string | null = null;
  registroForm!: FormGroup;
  actividadActiva: boolean = true;
  requiereReemplazo: boolean = false;

  constructor(
    private router: Router, 
    private fb: FormBuilder,
    private administracion: Administracion,
    private toastController: ToastController
  ) {
      addIcons({
        createOutline, saveOutline, closeCircleOutline, sync, trash,
         checkmarkDoneOutline, checkmarkOutline, trashOutline, checkmarkCircleOutline
         
      });}

  rolUsuario: string = '';

  ngOnInit() {
    this.cargarDatos();
  }

    cargarDatos() {
    this.administracion.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.filtrarUsuarios();
      },  
      error: (err) => this.mostrarToast('Error al cargar usuarios.', 'danger')
    });
     this.administracion.getVehiculos().subscribe({
      next: (data) => {
        this.vehiculos = data;
        this.filtrarVehiculos();
      },
      error: (err) => this.mostrarToast('Error al cargar vehículos.', 'danger')
    });
  }

  
  async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning' | 'primary' = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'top'
    });
    toast.present();
  }

  filtrarUsuarios() {
    const termino = this.terminoBusqueda.trim().toLowerCase();
    if (!termino) {
      this.usuariosFiltrados = [...this.usuarios];
    } else {
      this.usuariosFiltrados = this.usuarios.filter(user =>
        user.rut?.toLowerCase().includes(termino) ||
        user.nombre?.toLowerCase().includes(termino)
      );
    }
  }


editarUsuario(usuario: any) { this.usuarioEditandoRut = usuario.rut; }
cancelarEdicionUsuario() { this.usuarioEditandoRut = null; this.cargarDatos(); }

 guardarUsuario(usuario: any) {
    this.administracion.updateUsuario(usuario.rut, 
      { nombre: usuario.nombre, rol: usuario.rol }).subscribe({
      next: () => {
        this.mostrarToast('Usuario actualizado.', 'success');
        this.usuarioEditandoRut = null;
      },
      error: (err) => this.mostrarToast('Error al guardar usuario.', 'danger')
    });
  }


cambiarEstadoUsuario(usuario: any) {
  const nuevoEstado = usuario.activo === 'si' ? 'no' : 'si';
  this.administracion.updateUsuario(usuario.rut, { activo: nuevoEstado }).subscribe({
    next: () => {
      this.mostrarToast(`Usuario ${nuevoEstado === 'si' ? 'activado' : 'desactivado'}.`, 'success');
      usuario.activo = nuevoEstado;
      this.cargarDatos();
    },
    error: (err) => this.mostrarToast('Error al cambiar estado.', 'danger')
  });
}


  filtrarVehiculos() {
    const termino = this.criterioBusqueda.trim().toLowerCase();
    if (!termino) {
      this.vehiculosFiltrados = [...this.vehiculos];
    } else {
      this.vehiculosFiltrados = this.vehiculos.filter(vehiculo =>
        vehiculo.patente?.toLowerCase().includes(termino)
      );
    }
  }
  
  editarVehiculo(vehiculo: any) 
  { this.vehiculoEditandoPatente = vehiculo.patente; }
  cancelarEdicionVehiculo() 
  { this.vehiculoEditandoPatente = null; this.cargarDatos(); }
  
    guardarVehiculo(vehiculo: any) {
    const datosActualizar = {
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      nombre_conductor: vehiculo.nombre_conductor,
      nombre_conductor_reemplazo: vehiculo.nombre_conductor_reemplazo,
      necesita_reemplazo: vehiculo.necesita_reemplazo, 
      patente_reemplazo: vehiculo.necesita_reemplazo === 'si' ? vehiculo.patente_reemplazo : null,
      justificacion_reemplazo: vehiculo.necesita_reemplazo === 'si' ? vehiculo.justificacion_reemplazo : null,
      autorizacion_reemplazo: vehiculo.necesita_reemplazo === 'si' ? vehiculo.autorizacion_reemplazo : null,
     fecha_reemplazo: vehiculo.necesita_reemplazo === 'si' ? vehiculo.fecha_reemplazo : null,
     revision_tecnica_reemplazo: vehiculo.necesita_reemplazo === 'si' ? vehiculo.revision_tecnica_reemplazo : null
    };
    this.administracion.updateVehiculo(vehiculo.patente, datosActualizar).subscribe({
      next: () => {
        this.mostrarToast('Vehículo actualizado.', 'success');
        this.vehiculoEditandoPatente = null;
        this.cargarDatos(); 
      },
      error: (err) => this.mostrarToast('Error al guardar vehículo.', 'danger')
    });
  }

cambiarEstadoVehiculo(vehiculo: any) {
  const nuevoEstado = vehiculo.activo === 'si' ? 'no' : 'si';
  this.administracion.updateVehiculo(vehiculo.patente, { activo: nuevoEstado }).subscribe({
    next: () => {
      this.mostrarToast(`Vehículo ${nuevoEstado === 'si' ? 'activado' : 'desactivado'}.`, 'success');
      vehiculo.activo = nuevoEstado;
      this.cargarDatos();
    },
    error: (err) => this.mostrarToast('Error al cambiar estado.', 'danger')
  });
}
  
  actualizarReemplazo(vehiculo: any) {
    const datosActualizar = {
      requiere_reemplazo: vehiculo.requiere_reemplazo,
      patente_reemplazo: vehiculo.requiere_reemplazo ? vehiculo.patente_reemplazo : null,
      justificacion_reemplazo: vehiculo.requiere_reemplazo ? vehiculo.justificacion_reemplazo : null,
    };
    this.administracion.updateVehiculo(vehiculo.patente, datosActualizar).subscribe({
      next: () => {
        this.mostrarToast('Información de reemplazo actualizada.', 'success');
      },
      error: (err) => this.mostrarToast('Error al actualizar reemplazo.', 'danger')
    });
  }



  limpiarBusqueda() {
    this.terminoBusqueda = '';
    this.criterioBusqueda = '';
    this.cargarUsuarios();
    this.cargarVehiculos();
  }

  cargarUsuarios() {
    this.administracion.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.filtrarUsuarios();
      },
      error: (err) => this.mostrarToast('Error al cargar usuarios.', 'danger')
    });
  }

  cargarVehiculos() {
    this.administracion.getVehiculos().subscribe({
      next: (data) => {
        this.vehiculos = data;
        this.filtrarVehiculos();
      },
      error: (err) => this.mostrarToast('Error al cargar vehículos.', 'danger')
    });
  }

}


function filtrarUsuarios() {
  throw new Error('Function not implemented.');
}


function goToHomePage() {
  throw new Error('Function not implemented.');
}

