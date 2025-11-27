import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MenuLateralComponent } from '../componentes/menu-lateral/menu-lateral.component';
import { IonContent, IonHeader, IonTitle, IonToolbar, 
  IonItem, IonList, IonLabel, IonSearchbar, IonSelect,IonSelectOption,
  IonButton, IonIcon, IonApp,IonButtons,IonText,
 } from '@ionic/angular/standalone';
 import { HttpClient } from '@angular/common/http';
 import { HttpClientModule } from '@angular/common/http';
 import { addIcons } from 'ionicons';
import { trash, sync, createOutline, saveOutline, closeCircleOutline,
  checkmarkDoneOutline, checkmarkOutline, trashOutline, checkmarkCircleOutline, keyOutline } from 'ionicons/icons';
import { Memorialocal } from '../almacen/memorialocal';
import { Administracion } from '../servicio/administracion';
import { ToastController, AlertController } from '@ionic/angular';


@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.page.html',
  styleUrls: ['./gestion.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonHeader,HttpClientModule, IonTitle, RouterModule, MenuLateralComponent, IonToolbar, CommonModule, 
    FormsModule, ReactiveFormsModule , IonItem, IonList, IonLabel, IonSearchbar,
    IonSelect, IonSelectOption, IonButton, IonIcon, IonApp ,IonButtons, IonText,
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

  establecimientos: any[] = [];
  

  constructor(
    private router: Router, 
    private fb: FormBuilder,
    private administracion: Administracion,
    private alertCtrl: AlertController,
    private toastController: ToastController
  ) {
      addIcons({keyOutline,createOutline,saveOutline,closeCircleOutline,sync,trash,checkmarkDoneOutline,checkmarkOutline,trashOutline,checkmarkCircleOutline});}

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
    this.administracion.getEstablecimientos().subscribe({
    next: (data) => {
      this.establecimientos = data;
    },
    error: (err) => this.mostrarToast('Error al cargar establecimientos.', 'danger')
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
  
  const datosActualizar = {
    nombre: usuario.nombre,
    rol: usuario.rol,
    area: usuario.area,
    ESTABLECIMIENTO_idEstablecimiento: usuario.ESTABLECIMIENTO_idEstablecimiento
  };
    this.administracion.updateUsuario(usuario.rut, datosActualizar).subscribe({
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
     necesita_reemplazo: vehiculo.necesita_reemplazo,
    nombre_conductor_reemplazo: vehiculo.necesita_reemplazo === 'si' ? vehiculo.nombre_conductor_reemplazo : null,
    patente_reemplazo: vehiculo.necesita_reemplazo === 'si' ? vehiculo.patente_reemplazo : null,
    fecha_reemplazo: vehiculo.necesita_reemplazo === 'si' ? vehiculo.fecha_reemplazo : null,
    revision_tecnica_reemplazo: vehiculo.necesita_reemplazo === 'si' ? vehiculo.revision_tecnica_reemplazo : null,
    justificacion_reemplazo: vehiculo.necesita_reemplazo === 'si' ? vehiculo.justificacion_reemplazo : null,
    autorizacion_reemplazo: vehiculo.necesita_reemplazo === 'si' ? vehiculo.autorizacion_reemplazo : null,
    
    // Campos de Documentación
    marca_reemplazo: vehiculo.necesita_reemplazo === 'si' ? vehiculo.marca_reemplazo : null,
    modelo_reemplazo: vehiculo.necesita_reemplazo === 'si' ? vehiculo.modelo_reemplazo : null,
    ano_reemplazo: vehiculo.necesita_reemplazo === 'si' ? vehiculo.ano_reemplazo : null,
    capacidad_reemplazo: vehiculo.necesita_reemplazo === 'si' ? vehiculo.capacidad_reemplazo : 0, // Usar 0 para 'no'
    permiso_circulacion_reemplazo: vehiculo.necesita_reemplazo === 'si' ? vehiculo.permiso_circulacion_reemplazo : null,
    seguro_obligatorio_reemplazo: vehiculo.necesita_reemplazo === 'si' ? vehiculo.seguro_obligatorio_reemplazo : null,
    fecha_reemplazoFin: vehiculo.necesita_reemplazo === 'si' ? vehiculo.fecha_reemplazoFin : null,
    revision_tecnica: vehiculo.revision_tecnica,
    permiso_circulacion: vehiculo.permiso_circulacion,
    seguro_obligatorio: vehiculo.seguro_obligatorio,
    };
    this.administracion.updateVehiculo(vehiculo.patente, datosActualizar).subscribe({
    next: () => {
      this.mostrarToast('Vehículo actualizado con éxito.', 'success');
      this.vehiculoEditandoPatente = null;
      this.cargarDatos(); 
    },
    error: (err) => this.mostrarToast('Error al guardar el vehículo.', 'danger')
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
      modelo_reemplazo: vehiculo.requiere_reemplazo ? vehiculo.modelo_reemplazo : null,
      marca_reemplazo: vehiculo.requiere_reemplazo ? vehiculo.marca_reemplazo : null,
      ano_reemplazo: vehiculo.requiere_reemplazo ? vehiculo.ano_reemplazo : null,
      capacidad_reemplazo: vehiculo.requiere_reemplazo ? vehiculo.capacidad_reemplazo : null,
      permiso_circulacion_reemplazo: vehiculo.requiere_reemplazo ? vehiculo.permiso_circulacion_reemplazo : null,
      seguro_obligatorio_reemplazo: vehiculo.requiere_reemplazo ? vehiculo.seguro_obligatorio_reemplazo : null,
      revicion_tecnica_reemplazo: vehiculo.requiere_reemplazo ? vehiculo.revision_tecnica_reemplazo : null,
      fecha_reemplazo: vehiculo.requiere_reemplazo ? vehiculo.fecha_reemplazo : null,
      fecha_reemplazoFin: vehiculo.requiere_reemplazo ? vehiculo.fecha_reemplazoFin : null,
      justificacion_reemplazo: vehiculo.requiere_reemplazo ? vehiculo.justificacion_reemplazo : null,
      autorizacion_reemplazo: vehiculo.requiere_reemplazo ? vehiculo.autorizacion_reemplazo : null,
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

  async desbloquearUsuario(usuario: any) {
  const alert = await this.alertCtrl.create({
    header: 'Confirmar Desbloqueo',
    message: `¿Estás seguro de que deseas desbloquear la cuenta de ${usuario.nombre}?`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Desbloquear',
        handler: () => {
          this.administracion.desbloquearUsuario(usuario.rut).subscribe({
            next: () => {
              this.mostrarToast('Usuario desbloqueado.', 'success');
              this.cargarDatos(); 
            },
            error: (err) => this.mostrarToast('Error al desbloquear.', 'danger')
          });
        }
      }
    ]
  });
  await alert.present();
}

}



function filtrarUsuarios() {
  throw new Error('Function not implemented.');
}


function goToHomePage() {
  throw new Error('Function not implemented.');
}

