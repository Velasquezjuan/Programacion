import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonApp, IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonButtons, IonMenuButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonInput, IonButton, AlertController
} from '@ionic/angular/standalone';
import { MenuLateralComponent } from '../componentes/menu-lateral/menu-lateral.component';
import { ToastController } from '@ionic/angular';
import { Memorialocal } from '../almacen/memorialocal';

interface UsuarioActivo { id: string; usuario: string; rol: string; }
interface Solicitud { 
  id: string;
  solicitante: string;
  fecha: string;
  hora: string;
  direccion?: string;
  motivo: string;
  ocupante: string;
  ocupantes: number;
  estado: string;
  // tras agendar:
  patenteVehiculo?: string;
  tipoVehiculo?: string;
}
interface Vehiculo { id: string; patente: string; tipoVehiculo: string; }

@Component({
  selector: 'app-viajes-solicitados',
  templateUrl: './viajes-solicitados.page.html',
  styleUrls: ['./viajes-solicitados.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [ IonApp, MenuLateralComponent, IonHeader, IonToolbar, IonButtons, IonMenuButton,
    IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle,
    IonCardSubtitle, IonCardContent, IonInput, IonButton, CommonModule, FormsModule
  ]
})
export class ViajesSolicitadosPage implements OnInit {
  solicitudes: Solicitud[] = [];
  vehiculos: Vehiculo[] = [];
  rolUsuario = '';
  rechazandoId: string | null = null;
  motivoRechazo = '';

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  private async showToast(
    msg: string,
    color: 'success' | 'warning' | 'danger' = 'success'
  ) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    await t.present();
  }

  async ngOnInit() {
    // 1) Cargo el usuario activo
    const activos = await Memorialocal.obtener<UsuarioActivo>('usuarioActivo');
    const ua = activos.length ? activos[0] : null;
    this.rolUsuario = ua?.rol ?? '';

    // 2) Cargo solicitudes pendientes
    const todas = await Memorialocal.obtener<Solicitud>('viajesSolicitados');
    this.solicitudes = todas.filter(s => s.estado === 'pendiente');

    // 3) Cargo vehículos disponibles
    this.vehiculos = await Memorialocal.obtener<Vehiculo>('vehiculos');
  }

  trackByFn(_: number, item: Solicitud) {
    return item.id;
  }

  /** Abre el alerta para seleccionar vehículo */
  async abrirAgendar(solicitudId: string) {
    const inputs = this.vehiculos.map(v => ({
      type: 'radio' as const,
      label: `${v.tipoVehiculo} – ${v.patente}`,
      value: v.id
    }));

    const alert = await this.alertCtrl.create({
      header: 'Seleccione vehículo',
      inputs,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: value => {
            if (!value) {
              this.showToast('Debe elegir un vehículo.', 'warning');
              return;
            }
            // delegamos la actualización
            this.procesarAgendar(solicitudId, value);
          }
        }
      ]
    });
    await alert.present();
  }

  /** Actualiza la solicitud en IndexedDB y en la vista */
  private async procesarAgendar(solicitudId: string, vehiculoId: string) {
    const veh = this.vehiculos.find(v => v.id === vehiculoId)!;
    const sol = await Memorialocal.buscarPorCampo<Solicitud>(
      'viajesSolicitados',
      'id',
      solicitudId
    );
    if (sol) {
      sol.estado = 'aceptado';
      sol.patenteVehiculo = veh.patente;
      sol.tipoVehiculo = veh.tipoVehiculo;
      await Memorialocal.reemplazarPorCampo(
        'viajesSolicitados',
        'id',
        solicitudId,
        sol
      );
      // lo quitamos de la lista local
      this.solicitudes = this.solicitudes.filter(s => s.id !== solicitudId);
      this.showToast('Viaje agendado correctamente.', 'success');
    }
  }

  mostrarCampoMotivo(id: string) {
    this.rechazandoId = id;
    this.motivoRechazo = '';
  }

  async rechazarConMotivo() {
    if (!this.rechazandoId) return;
    if (!this.motivoRechazo.trim()) {
      this.showToast('Debe ingresar un motivo.', 'warning');
      return;
    }
    await Memorialocal.actualizarEstadoSolicitudConMotivo(
      this.rechazandoId,
      'rechazado',
      this.motivoRechazo
    );
    this.solicitudes = this.solicitudes.filter(s => s.id !== this.rechazandoId);
    this.rechazandoId = null;
    this.showToast('Solicitud rechazada con motivo.', 'danger');
  }
}
