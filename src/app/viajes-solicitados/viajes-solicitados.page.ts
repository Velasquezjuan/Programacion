import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonApp, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonInput,
  IonButton, AlertController, ToastController } from '@ionic/angular/standalone';
import { MenuLateralComponent } from '../componentes/menu-lateral/menu-lateral.component';
import { Memorialocal } from '../almacen/memorialocal';
import { addIcons } from 'ionicons';
import { calendarOutline, carOutline, personOutline, closeCircleOutline } from 'ionicons/icons';

// import servicios
import { CentroServicio } from '../servicio/centro-servicio';
import { NotificacionesCorreo } from '../servicio/notificaciones-correo';
import { AutentificacionUsuario } from '../servicio/autentificacion-usuario';
import { VehiculoServicio } from '../servicio/vehiculo-servicio';
import { ViajesServicio } from '../servicio/viajes-servicio';


interface Solicitud {
  id: string;
  solicitante: string;
  fecha: string;
  hora: string;
  puntoSalida: string;
  direccionSalida?: string;
  centroSaludSalida?: string;
  centroEducacionSalida?: string;
  centroAtmSalida?: string;
  puntoDestino?: string;
  direccionDestino?: string;
  centroSaludDestino?: string;
  centroEducacionDestino?: string;
  centroAtmDestino?: string;
  motivo: string;
  necesitaCarga?: 'si' | 'no';
  ocupante: string;
  ocupantes: number;
  estado: string;
  patenteVehiculo?: string;
  tipoVehiculo?: string;
  motivoRechazo?: string;
  motivoReagendamiento?: string;
  correo_solicitante?: string;
}

interface Vehiculo { id: string; patente: string; tipoVehiculo: string; }
interface Usuario { id: string; usuario: string; rol: string; correo: string; }

@Component({
  selector: 'app-viajes-solicitados',
  templateUrl: './viajes-solicitados.page.html',
  styleUrls: ['./viajes-solicitados.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [ IonApp, MenuLateralComponent, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,  IonContent, 
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonInput, IonButton,
    CommonModule, FormsModule ]
})
export class ViajesSolicitadosPage implements OnInit {
  solicitudes: Solicitud[] = [];
  vehiculos: Vehiculo[] = [];
  vehiculosDisponibles: Vehiculo[] = [];
  rolUsuario = '' ;
  rechazandoId: string | null = null;
  motivoRechazo = '';
  
  
  centros = {
    central: [] as { value: string; label: string }[],
    salud: [] as { value: string; label: string }[],
    atm: [] as { value: string; label: string }[],
    educacion: [] as { value: string; label: string }[],
  };

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private notificaciones: NotificacionesCorreo,
    private viajeServicio: ViajesServicio,
    private vehiculoServicio: VehiculoServicio
  ) {
    addIcons({ calendarOutline, carOutline, personOutline, closeCircleOutline });
  }

   async ngOnInit() {
    const usuariosActivos = await Memorialocal.obtener<Usuario>('usuarioActivo');
    const usuario = usuariosActivos?.[0]; 
    this.rolUsuario = usuario?.rol || '';
    this.cargarDatos();
  }

  ionViewDidEnter() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.viajeServicio.getViajes().subscribe({
      next: (data) => {
        this.solicitudes = data.filter(s => s.estado === 'pendiente');
      },
      error: (err) => this.showToast('Error al cargar solicitudes.', 'danger')
    });

    this.vehiculoServicio.getVehiculos().subscribe({
      next: (data) => this.vehiculosDisponibles = data,
      error: (err) => this.showToast('Error al cargar vehículos.', 'danger')
    });
  }
  
  trackByFn(index: number, item: any): any {
    return item.id;
  }

  async abrirAgendar(solicitud: any) {
    const inputs = this.vehiculosDisponibles.map(v => ({
      type: 'radio' as const,
      label: `${v.tipoVehiculo || 'Vehículo'} – ${v.patente}`,
      value: v.patente
    }));

    const alert = await this.alertCtrl.create({
      header: 'Seleccione vehículo',
      inputs,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: (patente: string) => {
            if (!patente) {
              this.showToast('Debe elegir un vehículo.', 'warning');
              return false;
            }
            this.procesarAgendar(solicitud, patente);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  private procesarAgendar(solicitud: any, patente: string) {
    this.viajeServicio.updateEstado(solicitud.id, 'aceptado', '', patente).subscribe({
        next: () => {
            this.showToast('Viaje agendado correctamente.', 'success');
            if (solicitud.correo_solicitante) {
                this.notificaciones.enviarCorreoAceptacion(solicitud.correo_solicitante, solicitud);
            }
            this.cargarDatos();
        },
        error: (err) => this.showToast('Error al agendar el viaje.', 'danger')
    });
  }
  
  mostrarCampoMotivo(id: string) {
    this.rechazandoId = id;
    this.motivoRechazo = '';
  }

  async rechazarConMotivo() {
    if (!this.rechazandoId || !this.motivoRechazo.trim()) {
      return this.showToast('Debe ingresar un motivo.', 'warning');
    }

    const solicitud = this.solicitudes.find(s => s.id === this.rechazandoId);
    if (!solicitud) return;

    this.viajeServicio.updateEstado(this.rechazandoId.toString(), 'rechazado', this.motivoRechazo).subscribe({
      next: () => {
        this.showToast('Solicitud rechazada con motivo.', 'danger');
        if (solicitud.correo_solicitante) {
          const infoRechazo = { ...solicitud, motivoRechazo: this.motivoRechazo };
          this.notificaciones.enviarCorreoRechazo(solicitud.correo_solicitante, infoRechazo);
        }
        this.rechazandoId = null;
        this.cargarDatos();
      },
      error: (err) => this.showToast('Error al rechazar el viaje.', 'danger')
    });
  }
  
  async abrirReagendar(solicitud: any) {
     const alert = await this.alertCtrl.create({
       header: 'Reagendar viaje',
       inputs: [
         {
           name: 'nuevoDateTime',
           type: 'datetime-local',
           value: `${solicitud.fecha_viaje.split('T')[0]}T${solicitud.hora_inicio}`
         },
         {
           name: 'motivo',
           type: 'text',
           placeholder: 'Motivo del reagendamiento'
         }
       ],
       buttons: [
         { text: 'Cancelar', role: 'cancel' },
         {
           text: 'Confirmar',
           handler: (data: any) => {
             if (!data.nuevoDateTime || !data.motivo.trim()) {
               this.showToast('Debe seleccionar fecha, hora y motivo', 'warning');
               return false;
             }
             const [nuevaFecha, nuevaHora] = data.nuevoDateTime.split('T');

             this.viajeServicio.updateEstado(solicitud.id, 'reagendado', data.motivo, solicitud.vehiculo_patente, nuevaFecha, nuevaHora).subscribe({
                 next: () => {
                     this.showToast('Viaje reagendado correctamente.', 'success');
                     if (solicitud.correo_solicitante) {
                         this.notificaciones.enviarCorreoReagendamiento(solicitud.correo_solicitante, {...solicitud, fecha_viaje: nuevaFecha, hora_inicio: nuevaHora});
                     }
                     this.cargarDatos();
                 },
                 error: (err) => this.showToast('Error al reagendar el viaje.', 'danger')
             });
             return true;
           }
         }
       ]
     });
     await alert.present();
  }

  getSalidaLabel(sol: any): string {
    return sol.punto_salida || 'No especificado';
  }

  getDestinoLabel(sol: any): string {
    return sol.punto_destino || 'No especificado';
  }

  private async showToast(msg: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const t = await this.toastCtrl.create({ message: msg, duration: 3000, color });
    await t.present();
  }
}
