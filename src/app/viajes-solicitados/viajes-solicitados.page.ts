import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { routes } from '../app.routes';
import {     } from '@ionic/angular/standalone';
import { MenuLateralComponent } from '../componentes/menu-lateral/menu-lateral.component';
import { Agenda, AgendaItem } from '../servicio/agenda';
import { IonCard, IonButton, IonCardContent, IonCardHeader, IonCardSubtitle, IonInput,
  IonCardTitle,} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular'
import { Memorialocal } from '../almacen/memorialocal';


@Component({
  selector: 'app-viajes-solicitados',
  templateUrl: './viajes-solicitados.page.html',
  styleUrls: ['./viajes-solicitados.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [ IonCard, IonButton, IonCardContent, IonInput ,IonCardHeader, IonCardSubtitle, 
    IonCardTitle,  CommonModule,  FormsModule, MenuLateralComponent]
})
export class ViajesSolicitadosPage implements OnInit {
  solicitudes: any[] = [];
  rolUsuario: string = '';
  rechazandoId: string | null = null;
  motivoRechazo: string = '';


  constructor(
    private agenda: Agenda,
    private toastController: ToastController
  ) {}


  

  private async showToast(msg: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastController.create({ message: msg, duration: 2000, color });
    await toast.present();
  }

  private async load() {
    this.solicitudes = await Memorialocal.obtenerSolicitudes();
  }
  async ngOnInit() {
    await this.load();
  }

  async cargarSolicitudes() {
    const all = await this.agenda.obtenerSolicitudes();
    this.solicitudes = (all || []).filter(s => s.estado === 'pendiente');
  }

  trackByFn(_: number, item: AgendaItem) {
    return item.id;
  }

  async aceptarSolicitud(id: string) {
    await this.agenda.actualizarEstadoSolicitud(id, 'aceptado');
    this.solicitudes = this.solicitudes.filter(s => s.id !== id);
    this.showToast('Solicitud aceptada.', 'success');
  }

  mostrarCampoMotivo(id: string) {
    this.rechazandoId = id;
    this.motivoRechazo = '';
  }


  async rechazarConMotivo() {
    if (!this.rechazandoId) return;
    if (!this.motivoRechazo.trim()) {
      this.showToast('Debe ingresar motivo', 'warning');
      return;
    }
     await this.agenda.actualizarEstadoSolicitudConMotivo(
      this.rechazandoId!,
      'rechazado',
      this.motivoRechazo
    );
    this.solicitudes = this.solicitudes.filter(s => s.id !== this.rechazandoId);
    this.rechazandoId = null;
    this.showToast('Solicitud rechazada con motivo.', 'danger');
  }



 
  async actualizarEstado(id: string, nuevoEstado: string) {
    await this.agenda.actualizarEstadoSolicitud(id, nuevoEstado);
    await this.cargarSolicitudes(); 
  }


 
}