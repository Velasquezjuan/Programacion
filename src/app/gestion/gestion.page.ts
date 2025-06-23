import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MenuLateralComponent } from '../componentes/menu-lateral/menu-lateral.component';
import { IonContent, IonHeader, IonTitle, IonToolbar, 
  IonItem, IonList, IonLabel, IonSearchbar, IonSelect,IonSelectOption,
  IonButton, IonIcon, IonApp,IonButtons, 
 } from '@ionic/angular/standalone';
 import { HttpClientModule } from '@angular/common/http';
 import { addIcons } from 'ionicons';
import { trash, sync } from 'ionicons/icons';
import { Memorialocal } from '../almacen/memorialocal';


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
  registroForm!: FormGroup;
  actividadActiva: boolean = true;
  requiereReemplazo: boolean = false;

  constructor(
    private router: Router, 
    private fb: FormBuilder
  ) {
      addIcons({sync,trash});}

  rolUsuario: string = '';

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarVehiculos();

    this.registroForm = this.fb.group({
      nuevoRol: [''],
      patenteReemplazo: [''],
      justificacionReemplazo: ['']
    });
  }

  async cargarUsuarios() {
    const datos = await Memorialocal.obtener<any[]>('usuarios') || [];
    this.usuarios = datos;
    this.usuariosFiltrados = [...this.usuarios];
  }

 async cargarVehiculos() {
    const datos = await Memorialocal.obtener<any[]>('vehiculos') || [];
    this.vehiculos = datos;
    this.vehiculosFiltrados = [...this.vehiculos];
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

  usuarioEditandoRut: string | null = null; // NUEVA propiedad

editarUsuario(usuario: any) {
  this.usuarioEditandoRut = usuario.rut;
}

async guardarUsuario(usuarioEditado: any) {
  await Memorialocal.actualizarPorCampo('usuarios', 'rut', usuarioEditado.rut, (usuario: any) => ({
    ...usuario,
    nombre: usuarioEditado.nombre,
    rol: usuarioEditado.rol
  }));
  this.usuarioEditandoRut = null;
  await this.cargarUsuarios();
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

  // Usuarios
  async desactivarUsuario(rut: string) {
    await Memorialocal.actualizarPorCampo('usuarios', 'rut', rut, (usuario: any) => {
      usuario.activo = false;
      return usuario;
    });
    await this.cargarUsuarios();
  }

  async activarUsuario(rut: string) {
   await Memorialocal.actualizarPorCampo('usuarios', 'rut', rut, (usuario: any) => {
      usuario.activo = true;
      return usuario;
    });
   await this.cargarUsuarios();
  }

  async cambiarRolUsuario(rut: string, nuevoRol: string) {
    await Memorialocal.actualizarPorCampo('usuarios', 'rut', rut, (usuario: any) => {
      usuario.rol = nuevoRol;
      return usuario;
    });
    await this.cargarUsuarios();
  }

  // Vehículos
  async desactivarVehiculo(patente: string) {
    await Memorialocal.actualizarPorCampo('vehiculos', 'patente', patente, (vehiculo: any) => {
      vehiculo.activo = false;
      return vehiculo;
    });
   await this.cargarVehiculos();
  }

  async activarVehiculo(patente: string) {
   await Memorialocal.actualizarPorCampo('vehiculos', 'patente', patente, (vehiculo: any) => {
      vehiculo.activo = true;
      return vehiculo;
    });
   await this.cargarVehiculos();
  }

  limpiarBusqueda() {
    this.terminoBusqueda = '';
    this.criterioBusqueda = '';
    this.cargarUsuarios();
    this.cargarVehiculos();
  }
  vehiculoEditandoPatente: string | null = null; // NUEVA propiedad

editarVehiculo(vehiculo: any) {
  this.vehiculoEditandoPatente = vehiculo.patente;
}

async guardarVehiculo(vehiculoEditado: any) {
  await Memorialocal.actualizarPorCampo('vehiculos', 'patente', vehiculoEditado.patente, (vehiculo: any) => ({
    ...vehiculo,
    marca: vehiculoEditado.marca,
    modelo: vehiculoEditado.modelo,
    conductorTitular: vehiculoEditado.conductorTitular
  }));
  this.vehiculoEditandoPatente = null;
  await this.cargarVehiculos();
}

  // Navegaciones
  goToHomePage() {
    this.router.navigate(['/home']);
  }
  goToRegistroUsuarioPage() {
    this.router.navigate(['/registro-usuario']);
  }
  goToRegistroVehiculoPage() {
    this.router.navigate(['/registro-vehiculo']);
  }
  goToBitacoraPage() {
    this.router.navigate(['/bitacora']);
  }
  goToViajesSolicitadosPage() {
    this.router.navigate(['/viajes-solicitados']);
  }
}