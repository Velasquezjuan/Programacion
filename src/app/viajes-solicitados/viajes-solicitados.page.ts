import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonApp, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonInput,
  IonButton, AlertController, ToastController, IonSearchbar,
  IonItem } from '@ionic/angular/standalone';
import { MenuLateralComponent } from '../componentes/menu-lateral/menu-lateral.component';
import { Memorialocal } from '../almacen/memorialocal';
import { addIcons } from 'ionicons';
import { calendarOutline, carOutline, personOutline, closeCircleOutline,
  checkmarkDoneCircle,closeCircle,checkmarkCircle
 } from 'ionicons/icons';

// import servicios
import { CentroServicio } from '../servicio/centro-servicio';
import { NotificacionesCorreo } from '../servicio/notificaciones-correo';
import { AutentificacionUsuario } from '../servicio/autentificacion-usuario';
import { VehiculoServicio } from '../servicio/vehiculo-servicio';
import { ViajesServicio } from '../servicio/viajes-servicio';


interface Solicitud {
  id_viaje: string;
  nombre_solicitante: string;
  apellido_solicitante: string;
  responsable: string;
  nombre_programa: string;
  fecha_solicitud?: string;
  fecha_viaje: string;
  hora_inicio: string;
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
  necesita_carga?: 'si' | 'no';
  //ocupante: string;
  ocupantes: number;
  estado: string;
  patenteVehiculo?: string;
  tipoVehiculo?: string;
  motivoRechazo?: string;
  motivoReagendamiento?: string;
  correo_solicitante?: string;
}

interface Vehiculo { id: string; patente: string; tipoVehiculo: string; conductor?: string; }
interface Usuario { id: string; usuario: string; rol: string; correo: string; }

@Component({
  selector: 'app-viajes-solicitados',
  templateUrl: './viajes-solicitados.page.html',
  styleUrls: ['./viajes-solicitados.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [ IonApp,  IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,  IonContent, 
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonInput, IonButton,
    CommonModule, FormsModule, IonSearchbar,
  IonItem ]
})

export class ViajesSolicitadosPage implements OnInit {
 
  todas: Solicitud[] = [];
  viajesFiltrados: Solicitud[] = [];
 
  searchTerm: string = '';
  fechaFiltro: string = '';
  
  fechaSolicitudFiltro: string = '';

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
    private vehiculoServicio: VehiculoServicio,
    private centroServicio: CentroServicio,
    private auth: AutentificacionUsuario,
  ) {
    addIcons({ calendarOutline, carOutline, 
      personOutline, closeCircleOutline,
    checkmarkDoneCircle,closeCircle,checkmarkCircle
   });
  }

   async ngOnInit() {
    const usuario = await Memorialocal.obtenerValor<Usuario>('usuarioActivo');
    if (usuario) {
      this.rolUsuario = usuario.rol || '';
  } else {
      this.rolUsuario = '';
  }
    this.cargarDatos();
  }
  
  aplicarFiltros() {

  let list = [...this.todas];

  if (this.searchTerm && this.searchTerm.trim() !== '') {
    const term = this.searchTerm.trim().toLowerCase();
    list = list.filter(viaje => 
      viaje.id_viaje.toString().toLowerCase().includes(term)||
      viaje.nombre_solicitante.toLowerCase().includes(term)
    );
  }

  if (this.fechaFiltro ) {
    list = list.filter(v => {
      const fechaViaje = v.fecha_viaje.split('T')[0];
      return fechaViaje === this.fechaFiltro;
    });
  }
  if (this.fechaSolicitudFiltro) {
      list = list.filter(v => {
        if (!v.fecha_solicitud) return false; 
        
        const fechaSolicitud = v.fecha_solicitud.split('T')[0];
        return fechaSolicitud === this.fechaSolicitudFiltro;
    });
  }
 

 
 list.sort((a, b) => new Date(b.fecha_viaje).getTime() - new Date(a.fecha_viaje).getTime());
  
  //this.viajesFiltrados = list; 
  this.solicitudes = list;
}


  cargarDatos() {
    this.viajeServicio.getViajes().subscribe({  
      next: (data) => {
        const pendientes = data.filter(s => s.estado === 'pendiente');
        this.todas = pendientes;
        this.solicitudes = [...pendientes];
      },      
      error: (err) => this.showToast('Error al cargar solicitudes.', 'danger'),
      
    });

    /*this.vehiculoServicio.getVehiculos().subscribe({
      next: (data) => this.vehiculosDisponibles = data,
      error: (err) => this.showToast('Error al cargar vehículos.', 'danger')
    });*/
  }
  
  trackByFn(index: number, item: any): any {
    return item.id_viaje;
  }

  async abrirAgendar(solicitud: any) {

    if (!solicitud.PROGRAMA_id_programa) {
      this.showToast('Error: Esta solicitud no tiene un programa asociado.', 'danger');
      return;
    }

    const loading = await this.alertCtrl.create({
      header: 'Cargando Vehículos...'
    });
    await loading.present();

    this.vehiculoServicio.getVehiculosPorPrograma(solicitud.PROGRAMA_id_programa).subscribe({
      next: async (vehiculosFiltrados) => {
        await loading.dismiss();

        if (vehiculosFiltrados.length === 0) {
          this.showToast('No hay vehículos disponibles asignados a este programa.', 'warning');
          return;
        }

        const inputs = vehiculosFiltrados.map(v => ({
          type: 'radio' as const,
          label: `${v.tipoVehiculo || 'Vehículo'} – ${v.patente} - ${v.nombreConductor || 'Sin asignar'}`,
          value: v.patente
        }));

        const alert = await this.alertCtrl.create({
          header: 'Seleccione un vehículo',
          message: `Para el programa: ${solicitud.nombre_programa}`,
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
      },
      error: async (err) => {
        await loading.dismiss();
        this.showToast('Error al cargar los vehículos para este programa.', 'danger');
      }
    });
  }

  private procesarAgendar(solicitud: any, patente: string) {
     const datosActualizar = {
    estado: 'Agendado',
    vehiculo_patente: patente
  };

  this.viajeServicio.updateViaje(solicitud.id_viaje, datosActualizar).subscribe({
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

  const solicitud = this.solicitudes.find(s => s.id_viaje === this.rechazandoId);
  if (!solicitud) return;

    const datosActualizar = {
    estado: 'rechazado',
    motivo_rechazo: this.motivoRechazo
  };

  this.viajeServicio.updateViaje(this.rechazandoId.toString(), datosActualizar).subscribe({
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
              const datosActualizar = {
                          estado: 'reagendado',
                          motivo_reagendamiento: data.motivo,
                          fecha_viaje: nuevaFecha,
                          hora_inicio: nuevaHora
                        };

            this.viajeServicio.updateViaje(solicitud.id_viaje, datosActualizar).subscribe({
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
