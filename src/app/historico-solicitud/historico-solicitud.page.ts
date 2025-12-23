/**
 * ============================================================================
 * PROYECTO: GECOVI (Gestión de Control de Viajes)
 * DESARROLLADO POR: Juan Velasquez
 * FECHA DE CREACIÓN: 10 DE MARZO DEL 2025
 * ============================================================================
 * Este código es propiedad intelectual de Juan Velasquez.
 * Prohibida su distribución o copia sin autorización.
 * Lo hice para mi examen de titulo y que si me salio CTM AJAJ
 * ============================================================================
 */
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { MenuLateralComponent } from '../componentes/menu-lateral/menu-lateral.component';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, 
  IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonButton,
  IonButtons, IonMenuButton, IonSearchbar
 } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Memorialocal } from '../almacen/memorialocal';
import { AutentificacionUsuario } from '../servicio/autentificacion-usuario';
import { CentroServicio } from '../servicio/centro-servicio';
import { ViajesServicio } from '../servicio/viajes-servicio';
import { VehiculoServicio } from '../servicio/vehiculo-servicio';
import { AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkDoneCircle, closeCircle, checkmarkCircle } from 'ionicons/icons';

import { NotificacionesCorreo } from '../servicio/notificaciones-correo';

interface Solicitud {
  id_viaje: string;
  nombre_solicitante: string;
  apellido_solicitante: string;
  responsable: string;
  nombre_programa: string;
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
  ocupantes: number;
  estado: string;
  patenteVehiculo?: string;
  tipoVehiculo?: string;
  justificativo_no_realizado?: string;
  motivoReagendamiento?: string;
  correo_solicitante?: string;
}

interface Usuario {
  id: string;
  usuario: string;
  rol: string;
  correo?: string;
}


@Component({
  selector: 'app-historico-solicitud',
  templateUrl: './historico-solicitud.page.html',
  styleUrls: ['./historico-solicitud.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonCard, IonCardHeader, IonCardTitle,
    IonCardSubtitle, IonCardContent, IonSearchbar]
})
export class HistoricoSolicitudPage implements OnInit {

  todas: Solicitud[] = [];
  viajesFiltrados: Solicitud[] = [];
  filtro: 'todos'|'pendiente'|'Agendado'|'rechazado'|'reagendado' = 'todos';
  usuarioActivo!: { nombre: string; correo?: string };
  searchTerm: string = '';
  fechaInicioFiltro: string = '';
  fechaFinFiltro: string = '';

   centros = {
    central: [] as { value: string; label: string }[],
    salud: [] as { value: string; label: string }[],
    atm: [] as { value: string; label: string }[],
    educacion: [] as { value: string; label: string }[],
    comunal: [] as { value: string; label: string }[],
    otro: [] as { value: string; label: string }[]
  };

 estados = [
  { value: 'todos',      label: 'Todos'       },
  { value: 'pendiente',  label: 'Pendientes'  },
  { value: 'Agendado',   label: 'Agendado'   },
  { value: 'finalizado', label: 'Finalizados' }, 
  { value: 'no realizado', label: 'No Realizados' }, 
  { value: 'rechazado',  label: 'Rechazados'  },
  { value: 'reagendado', label: 'Reagendados' }
];

  centrosPrincipales: { value: number; label: string }[] = [];
  establecimientos: { value: number; label: string }[] = [];
  establecimientosSalud: { value: number, label: string }[] = [];
  establecimientosEducacion: { value: number; label: string }[] = []
  establecimientosAtm: { value: number, label: string }[] = [];
  establecimientosComunal: { value: number, label: string }[] = [];
  establecimientosOtro: { value: number, label: string }[] = [];  


  constructor(
    private router: Router,
    private auth: AutentificacionUsuario,
    private centroServicio: CentroServicio,
    private alertController: AlertController, 
    private toastController: ToastController,
    private notificaciones: NotificacionesCorreo,
    private viajeServicio: ViajesServicio,
    private vehiculoServicio: VehiculoServicio
  ) { 
    addIcons({checkmarkDoneCircle,closeCircle,checkmarkCircle});
  }

  async ngOnInit() {
    try {
    console.log('1. ngOnInit iniciado.');

    this.centrosPrincipales = this.centroServicio.obtenerCentros();
    
    console.log('2. Obteniendo usuario...');
    const usr = await this.auth.obtenerUsuarioActivo();
    console.log('3. Usuario obtenido:', usr);

    this.usuarioActivo = usr ?? { usuario: '', correo: '' };

    console.log('4. Llamando a cargarViajes...');
    this.cargarViajes();

  } catch (error) {
    console.error('¡ERROR FATAL en ngOnInit!:', error);
  }
 }

  aplicarFiltros() {
  let list = [...this.todas];

  if (this.searchTerm && this.searchTerm.trim() !== '') {
    const term = this.searchTerm.trim().toLowerCase();
    list = list.filter(viaje => 
      viaje.id_viaje.toString().includes(term) ||
      viaje.nombre_solicitante.toLowerCase().includes(term)
    );
  }

  if (this.filtro !== 'todos') {
    list = list.filter(v => v.estado === this.filtro);
  }

  if (this.fechaInicioFiltro && this.fechaFinFiltro) {
    list = list.filter(v => {
      const fechaViaje = v.fecha_viaje.split('T')[0];
      return fechaViaje >= this.fechaInicioFiltro && fechaViaje <= this.fechaFinFiltro;
    });
  }
 
  list.sort((a, b) => new Date(b.fecha_viaje).getTime() - new Date(a.fecha_viaje).getTime());
  
  this.viajesFiltrados = list; 
}
  getBorderClass(e: string){
  switch(e){
    case 'Agendado':    return 'border-success';
    case 'finalizado':  return 'border-tertiary'; 
    case 'rechazado':   return 'border-danger';
    case 'no realizado':return 'border-dark'; 
    case 'reagendado':  return 'border-primary';
    default:            return 'border-warning';
  }
}

   async cargarViajes() {
    if (!this.usuarioActivo?.nombre) {
    console.error('No se puede cargar viajes: El nombre de usuario está vacío o nulo.');
    return;
  }
  console.log(`Iniciando carga de viajes para: ${this.usuarioActivo.nombre}`);
  this.viajeServicio.getViajes().subscribe({
    next: (data) => {
      console.log('Datos recibidos del servidor:', data);
      this.todas = data;
      this.aplicarFiltros();
    },
    error: (err) => {
      console.error('¡ERROR! Falló la llamada al servicio de viajes:', err);
      this.mostrarToast('No se pudieron cargar los viajes desde el servidor.', 'danger');
    }
  });
  }

   onFiltroChange(ev: any){
    this.filtro = ev.detail.value;
    this.cargarViajes();
  }


private async verificarViajesPasados() {
  const ahora = new Date();
  const viajesPendientesDeCierre = this.todas.filter(viaje => {
    if (viaje.estado !== 'Agendado' && viaje.estado !== 'agendado') {
      return false;
    }
    const fechaViaje = new Date(`${viaje.fecha_viaje}T${viaje.hora_inicio}`);
    return fechaViaje < ahora;
  });

  if (viajesPendientesDeCierre.length > 0) {
    viajesPendientesDeCierre.sort((a, b) => new Date(`${a.fecha_viaje}T${a.hora_inicio}`).getTime() - new Date(`${b.fecha_viaje}T${b.hora_inicio}`).getTime());
    const viajeAPreguntar = viajesPendientesDeCierre[0];
      
    const alert = await this.alertController.create({
      header: 'Viaje Pasado Pendiente',
      message: `Detectamos que el viaje para "${viajeAPreguntar.motivo}" del día ${viajeAPreguntar.hora_inicio} ya ocurrió. ¿Se realizó este viaje?`,
      buttons: [
        { text: 'No, no se realizó', handler: () => this.solicitarJustificativo(viajeAPreguntar) },
        { 
          text: 'Sí, se realizó', 
          handler: () => { 
            this.viajeServicio.updateViaje(viajeAPreguntar.id_viaje, { estado: 'finalizado' }).subscribe({
              next: () => {
                this.mostrarToast('Viaje marcado como finalizado.', 'success');
                if (this.usuarioActivo?.correo) {
                  this.notificaciones.enviarCorreoViajeRealizado(this.usuarioActivo.correo, viajeAPreguntar.motivo);
                }
                this.cargarViajes();
              },
              error: (err) => this.mostrarToast('Error al actualizar el viaje.', 'danger')
            });
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present();
  }
}
async aceptarReagendamiento(viaje: Solicitud) {
  this.viajeServicio.updateViaje(viaje.id_viaje, { estado: 'Agendado' }).subscribe({
    next: async () => {
      const adminEmails = await this.getAdminEmails();
      if (adminEmails.length > 0) {
        this.notificaciones.enviarCorreoAceptacionReagendamiento(adminEmails[0], viaje);
      }
      this.mostrarToast('Has aceptado la nueva agenda del viaje.', 'success');
      this.cargarViajes();
    },
    error: (err) => this.mostrarToast('Error al aceptar el reagendamiento.', 'danger')
  });
  }

  async rechazarReagendamiento(viaje: Solicitud) {
    const alert = await this.alertController.create({
      header: 'Rechazar Reagendamiento',
      message: 'Por favor, indica por qué no puedes aceptar la nueva fecha/hora.',
      inputs: [
        { name: 'motivo', type: 'textarea', placeholder: 'Ej: No me sirve el horario, etc.' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar Rechazo', handler: async (data) => {
            if (!data.motivo || data.motivo.trim() === '') {
              this.mostrarToast('Debes ingresar un motivo para el rechazo.', 'warning');
              return false;
            }
            await this.procesarRechazoReagendamiento(viaje, data.motivo);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  private async procesarRechazoReagendamiento(viaje: Solicitud, motivo: string) {
    const datosActualizar = {
    estado: 'pendiente',
    motivo_rechazoReagendamiento: motivo
  };
  this.viajeServicio.updateViaje(viaje.id_viaje, datosActualizar).subscribe({
    next: async () => {
      const adminEmails = await this.getAdminEmails();
      adminEmails.forEach(email => {
        this.notificaciones.enviarCorreoRechazoReagendamiento(email, viaje);
      });
      this.mostrarToast('Has rechazado la nueva agenda. El administrador será notificado.', 'tertiary');
      this.cargarViajes();
    },
    error: (err) => this.mostrarToast('Error al rechazar el reagendamiento.', 'danger')
  });
  }

  private async getAdminEmails(): Promise<string[]> {
      const todosLosUsuarios = await Memorialocal.obtener<Usuario>('usuarios');
      const rolesAdmin = ['adminSistema', 'its', 'coordinador'];
      return todosLosUsuarios
        .filter(usuario => rolesAdmin.includes(usuario.rol) && usuario.correo)
        .map(admin => admin.correo!);
    }
  getSalidaLabel(sol: any): string {
    return sol.punto_salida || 'No especificado';
  }

  getDestinoLabel(sol: any): string {
    return sol.punto_destino || 'No especificado';
  }

async marcarViajeRealizado(viaje: Solicitud) {
     const alert = await this.alertController.create({
    header: 'Confirmación de Viaje',
    message: `¿Se realizó el viaje para "${viaje.motivo}"?`,
    buttons: [
      {
        text: 'No se realizó',
        role: 'cancel',
        handler: () => {
          this.solicitarJustificativo(viaje);
        },
      },
      {
        text: 'Sí, se realizó',
        handler: () => {
        
          this.viajeServicio.updateViaje(viaje.id_viaje, { estado: 'finalizado' }).subscribe({
            next: () => {
              this.mostrarToast('Viaje marcado como finalizado.', 'success');   
              if (this.usuarioActivo?.correo) {
                this.notificaciones.enviarCorreoViajeRealizado(this.usuarioActivo.correo, viaje.motivo);
              }
              this.cargarViajes();
            },
            error: (err) => this.mostrarToast('Error al actualizar el viaje.', 'danger')
          });
        },
      },
    ],
  });

  await alert.present();
}

private async solicitarJustificativo(viaje: Solicitud) {
  const alert = await this.alertController.create({
    header: 'Viaje No Realizado',
    message: 'Por favor, ingrese un breve justificativo.',
    inputs: [
      {
        name: 'justificativo',
        type: 'textarea',
        placeholder: 'Ej: El ocupante no se presentó...',
      },
    ],
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Guardar',
        handler: (data) => { 
          if (!data.justificativo || data.justificativo.trim() === '') {
            this.mostrarToast('El justificativo no puede estar vacío.', 'danger');
            return false; 
          }

          const datosActualizar = {
            estado: 'no realizado',
            justificativo_no_realizado: data.justificativo
          };
          this.viajeServicio.updateViaje(viaje.id_viaje, datosActualizar).subscribe({
            next: () => {
              this.mostrarToast('El viaje ha sido marcado como no realizado.', 'tertiary');
              if (this.usuarioActivo?.correo) {
                this.notificaciones.enviarCorreoViajeNoRealizado(this.usuarioActivo.correo, viaje);
              }
              this.cargarViajes();
            },
            error: (err) => this.mostrarToast('Error al actualizar el viaje.', 'danger')
          });
          return true; 
        }
      }
    ]
  });
  await alert.present();
}

    async mostrarToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top',
    });
    toast.present();
  }

   goToHomePage() {
    this.router.navigate(['/home']);
  }

}
