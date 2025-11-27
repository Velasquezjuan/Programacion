import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonInput,
  IonGrid, IonRow, IonCol, IonButton, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin  from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { AlertController } from '@ionic/angular';
import { forkJoin } from 'rxjs';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

//servicios
import { Memorialocal } from '../almacen/memorialocal';
import { AutentificacionUsuario } from '../servicio/autentificacion-usuario';
import { CentroServicio } from '../servicio/centro-servicio';
import { VehiculoServicio } from '../servicio/vehiculo-servicio';
import { ViajesServicio } from '../servicio/viajes-servicio';
import { NotificacionesCorreo } from '../servicio/notificaciones-correo';


interface viaje {
  id_viaje: string;
  nombre_solicitante: string;
  apellido_solicitante: string;
  responsable: string;
  nombre_programa: string;
  fecha_viaje: string;
  hora_inicio: string;
  punto_salida: string;
  direccionSalida?: string;
  centroSaludSalida?: string;
  centroEducacionSalida?: string;
  centroAtmSalida?: string;
  punto_destino?: string;
  direccionDestino?: string;
  centroSaludDestino?: string;
  centroEducacionDestino?: string;
  centroAtmDestino?: string;
  motivo: string;
  necesita_carga?: 'si' | 'no';
  //ocupante: string;
  ocupantes: number;
  estado: string;
  patente?: string;
  tipoVehiculo?: string;
  motivoRechazo?: string;
  motivoReagendamiento?: string;
  correo_solicitante?: string;
}

interface Usuario {
  rut: string;
  rol: string;
  nombre: string;
  correo: string;
}

@Component({
  selector: 'app-programacion',
  templateUrl: './programacion.page.html',
  styleUrls: ['./programacion.page.scss'],
   schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [CommonModule, FormsModule,FullCalendarModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonInput,
  IonGrid, IonRow, IonCol, IonButton, IonSelect, IonSelectOption
  ]
})
export class ProgramacionPage implements OnInit {


  viajesNormalesCargados: any[] = []; 
  _todosLosViajes: any[] = [];
 
  centrosPrincipales: { value: number; label: string }[] = [];
  programas: { value: string; label: string }[] = [];
  establecimientosSalud: { value: number; label: string }[] = [];
  establecimientosEducacion: { value: number; label: string }[] = [];
  establecimientosAtm: { value: number; label: string }[] = [];

 
  showSalud     = false;
  showEducacion = false;
  showAtm       = false;


  filtros = {
    patente: '',
    centro: '',
    proveedor: '',
    programa: '',
    fechaInicio: '',
    fechaFin: ''
  };

   rolUsuario: string | null = null;
   nombreUsuario: string = '';
   fechaInicioFiltro: string = '';
   fechaFinFiltro: string = '';
 

  calendarOptions: CalendarOptions = {
    locale: 'es',
    locales: [esLocale],
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay'
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Agenda'
    },
    initialView: 'dayGridMonth',
    events: [],
    displayEventTime: true,
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    editable: false,    
    eventClick: (info) => this.handleEventClick(info),
  };

  constructor(
    private auth: AutentificacionUsuario,
    private alertCtrl: AlertController,
    private centroSvc: CentroServicio,
    private notificaciones: NotificacionesCorreo,
    private viajesServicio: ViajesServicio,
  ) {}

   async ngOnInit() {
    this.programas = this.centroSvc.obtenerPrograma('prog');
    await this.cargarDatosDelCalendario();


  }

   limpiarFiltros() {
    this.filtros = {
      patente: '',
      centro: '',
      proveedor: '',
      programa: '',
      fechaInicio: '',
      fechaFin: ''
    };
    this.actualizarCalendario(this._todosLosViajes);

  }

  async cargarDatosDelCalendario() {
    const usr = await this.auth.obtenerUsuarioActivo();
    if (!usr) {
    this.showToast('No se pudo identificar al usuario.', 'danger');
    return;
  }

    this.rolUsuario = usr.rol;
    this.nombreUsuario = usr.nombre;
    const isAdmin = ['adminSistema', 'coordinador'].includes(this.rolUsuario ?? '');

   forkJoin({
    viajesNormales: this.viajesServicio.getViajes(),
  }).subscribe({
    next: (resultados) => {

      console.log("Datos recibidos del backend:", resultados);
      
      const todosLosViajes = [...resultados.viajesNormales];
      
      const viajesNormalesCargados = todosLosViajes.filter(viaje =>
          ['aceptado', 'agendado'].includes(viaje.estado?.toLowerCase()) &&
          (isAdmin || viaje.nombre_solicitante === this.nombreUsuario)
        );

      this._todosLosViajes = [...viajesNormalesCargados];

     this.calendarOptions.events = viajesNormalesCargados.map(viaje => {
      const color = this.getColorPorViaje(viaje);
      const textColor = (color === '#ffc409') ? '#000000' : '#ffffff';
      return {
       id: viaje.id_viaje.toString(),
       title: `Viaje: ${viaje.punto_destino || 'N/A'}`, 
       start: `${viaje.fecha_viaje.split('T')[0]}T${viaje.hora_inicio}`,
       allDay: false,
       color: color,        
       textColor: textColor, 
       extendedProps: viaje
        };
        });

    if (isAdmin) {
      this.calendarOptions.editable = true;
      this.calendarOptions.eventDurationEditable = true;
      this.calendarOptions.eventResizableFromStart = true;
      this.calendarOptions.eventDrop = this.handleEventDrop.bind(this);
      this.calendarOptions.eventResize = this.handleEventResize.bind(this);
      this.calendarOptions.eventClick = async (info) => {
        if (info.jsEvent.detail === 2) {
          await this.abrirReagendar(info.event.id, info.event.extendedProps as viaje);
        } else {
          await this.handleEventClick(info);
        }
      };
      } else {
        this.calendarOptions.eventClick = this.handleEventClick.bind(this);
      }
    },
    error: (err) => {
      console.error('Error al cargar los viajes para el calendario:', err);
      this.showToast('Error al cargar los datos del calendario.', 'danger');
    }
  });
    }

  actualizarCalendario(viajes: any[]) {
  this.calendarOptions.events = viajes.map(viaje => {
    const color = this.getColorPorViaje(viaje);
    const textColor = (color === '#ffc409') ? '#000000' : '#ffffff';
    return {
      id: viaje.id_viaje.toString(),
      title: `Solicitud: ${viaje.punto_destino || 'N/A'}`,
      start: `${viaje.fecha_viaje.split('T')[0]}T${viaje.hora_inicio}`,
      allDay: false,
      color: color,
      textColor: textColor,
      extendedProps: viaje
    };
  });
  
}
 

  async abrirReagendar(viajeId: string, viaje: viaje) {
    const alert = await this.alertCtrl.create({
      header: 'Reagendar viaje',
      inputs: [{
        name: 'nuevoDateTime',
        type: 'datetime-local',
        value: `${viaje.fecha_viaje.split('T')[0]}T${viaje.hora_inicio}`
      }],
      buttons: [
         { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: (data) => {
            if (!data.nuevoDateTime || !data.motivo?.trim()) {
              this.showToast('Debes seleccionar fecha, hora y un motivo.', 'warning');
              return false;
            }
            const [nuevaFecha, nuevaHora] = data.nuevoDateTime.split('T');
            this.procesarReagendar(viaje, nuevaFecha, nuevaHora, data.motivo);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  private async procesarReagendar(viaje: viaje, nuevaFecha: string, nuevaHora: string, motivo: string) {
   this.viajesServicio.updateViaje(viaje.id_viaje, {
      estado: 'reagendado',
      fecha_viaje: nuevaFecha,
      hora_inicio: nuevaHora,
      motivo_reagendamiento: motivo
    }).subscribe({
      next: () => {
        this.showToast('Viaje reagendado. El usuario debe confirmar.', 'success');
        if (viaje.correo_solicitante) {
            const viajeActualizado = { ...viaje, fecha_viaje: nuevaFecha, hora_inicio: nuevaHora };
            this.notificaciones.enviarCorreoReagendamiento(viaje.correo_solicitante, viajeActualizado);
        }
        this.cargarDatosDelCalendario(); 
      },
      error: (err) => this.showToast('Error al reagendar el viaje.', 'danger')
    });
  }

  private lookup(list: { value: string; label: string }[], code?: string): string {
    if (!code) return '';
    const found = list.find(x => x.value === code);
    return found ? found.label : code;
  }

   getSalidaLabel(sol: any): string {
    return sol.punto_salida || 'No especificado';
  }

  getDestinoLabel(sol: any): string {
    return sol.punto_destino || 'No especificado';
  }

  private async showToast(msg: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const t = await this.alertCtrl.create({ message: msg, buttons: ['Cerrar'], cssClass: color });
    await t.present();
  }

   async handleAdminEventClick(clickInfo: EventClickArg) {
    if (clickInfo.jsEvent.detail === 2) {
      await this.abrirReagendar(clickInfo.event.id, clickInfo.event.extendedProps as viaje);
    } else {
      await this.handleEventClick(clickInfo);
    }
  }

  async handleEventDrop(dropInfo: any) {
    const viaje = dropInfo.event.extendedProps as viaje;
    const nuevaFecha = dropInfo.event.startStr.split('T')[0];
    const nuevaHora = dropInfo.event.startStr.split('T')[1].substring(0, 5);
    
    this.viajesServicio.updateViaje(viaje.id_viaje, {
      fecha_viaje: nuevaFecha,
      hora_inicio: nuevaHora
    }).subscribe({
      next: () => {
        this.showToast('El viaje ha sido movido exitosamente.', 'success');
      },
      error: (err) => {
        this.showToast('Error al mover el viaje. Revirtiendo cambio.', 'danger');
        dropInfo.revert(); 
      }
    });
    }
  

  async handleEventResize(resizeInfo: any) {}

  async handleEventClick(clickInfo: EventClickArg) {
    const ev = clickInfo.event;
    const p = clickInfo.event.extendedProps as any;
    const fecha = ev.start?.toLocaleDateString('es-CL') || '';
    const hora = ev.start?.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) || '';
    const html = `
      El viaje lo solicito: ${ev.title} -- 
      Debe salir desde: ${p.punto_salida} -- 
      Se dirige a :${p.punto_destino} -- 
      Con el vehículo asignado: ${p.tipoVehiculo} -- 
      Con la cantidad de ocupantes de: ${p.ocupantes} -- 
      El responsable del viaje es: ${p.responsable} -- 
      El motivo de uso es: ${p.motivo} -- 
      No olvide su dia de salida es: ${fecha} -- 
      No olvide su hora de salida: ${hora} Muchas gracias por su atención.
    `;
    const alert = await this.alertCtrl.create({ header: 'Detalle de Viaje', message:  html, buttons: ['Cerrar'] });
    await alert.present();
  }

  aplicarFiltros() {
  let viajesFiltrados = [...this._todosLosViajes];

  // Filtro por Patente
if (this.filtros.patente) {
  viajesFiltrados = viajesFiltrados.filter(v => 
    v.patente_vehiculo?.toLowerCase().includes(this.filtros.patente.toLowerCase()) 
  );
}

  // Filtro por Programa
  if (this.filtros.programa) {
    viajesFiltrados = viajesFiltrados.filter(v => 
      v.nombre_programa === this.filtros.programa
    );
  }

  // Filtro por Centro 
  /*if (this.filtros.centro) {
     viajesFiltrados = viajesFiltrados.filter(v => 
      v.punto_destino.includes(this.filtros.centro)
    );
  }*/

  // Filtro por Proveedor
  if (this.filtros.proveedor) {
     viajesFiltrados = viajesFiltrados.filter(v => 
      v.responsable?.toLowerCase().includes(this.filtros.proveedor.toLowerCase())
    );
  }

  // Filtro por Rango de Fechas
  if (this.filtros.fechaInicio && this.filtros.fechaFin) {
    viajesFiltrados = viajesFiltrados.filter(v => {
      const fechaViaje = v.fecha_viaje.split('T')[0];
      return fechaViaje >= this.filtros.fechaInicio && fechaViaje <= this.filtros.fechaFin;
    });
  }

  this.actualizarCalendario(viajesFiltrados);
}

/*exportarCSV() {
  const eventos = this.calendarOptions.events as any[];
  if (eventos.length === 0) {
    this.showToast('No hay datos para exportar.', 'warning');
    return;
  }

  const headers = ['ID Viaje', 'Fecha', 'Hora Inicio', 'Solicitante', 'Salida', 'Destino', 'Motivo', 'Responsable', 'Vehículo'];
  
  const rows = eventos.map(evento => {
    const viaje = evento.extendedProps;
    return [
      viaje.id_viaje,
      new Date(viaje.fecha_viaje).toLocaleDateString('es-CL'),
      viaje.hora_inicio,
      viaje.nombre_solicitante,
      `"${viaje.punto_salida.replace(/"/g, '""')}"`,
      `"${viaje.punto_destino.replace(/"/g, '""')}"`,
      `"${viaje.motivo.replace(/"/g, '""')}"`,
      viaje.responsable,
      viaje.tipoVehiculo || 'No asignado'
    ].join(',');
  });

  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
    + headers.join(',') + '\n' 
    + rows.join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `reporte_viajes_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}*/ // dejar pendiente en caso de ser necesario sino era no mas ▼←~¤

getColorPorViaje(s: any): string {
  if (s.tipo_origen === 'masivo') {
    return '#7b1df5e8'; // color viaje masivo
  }

  const estadoNormalizado = s.estado ? s.estado.toLowerCase() : '';
  // colores  viajes normales segun estados
 switch(estadoNormalizado) {
    case 'aceptado': return '#2dd36f'; // Verde
    case 'agendado': return '#1909ffff'; // Amarillo
    default: return '#ecfd00ff'; // Azul 
  }
}

exportarPDF() {

 forkJoin({
    viajesNormales: this.viajesServicio.getViajes(),
  }).subscribe({
    next: (resultados) => {
      const { viajesNormales } = resultados;

      if (viajesNormales.length === 0) {
        this.showToast('No hay datos para exportar.', 'warning');
        return;
      }

      const doc = new jsPDF();
      doc.text("Programacion Diaria", 14, 15);
      let finalY = 20; 

      const head = [['ID', 'Fecha', 'Hora', 'Solicitante', 'Destino', 'Vehículo']];

      if (viajesNormales.length > 0) {
        doc.text("Programacion Diaria", 14, finalY + 5);
        const bodyNormal = viajesNormales.map(v => 
          [ v.id_viaje, new Date(v.fecha_viaje).toLocaleDateString('es-CL'), 
            v.hora_inicio, v.nombre_solicitante, v.punto_destino, v.tipoVehiculo || 'N/A' ]);
        
        autoTable(doc, {
          head: head,
          body: bodyNormal,
          startY: finalY + 10,
          theme: 'grid',
          styles: { fontSize: 8 },
        });
        finalY = (doc as any).lastAutoTable.finalY; 
      }

      doc.save(`programacion_diaria_${new Date().toISOString().split('T')[0]}.pdf`);
    },
    error: (err) => {
      this.showToast('Error al cargar los datos para el PDF.', 'danger');
      console.error('Error al exportar a PDF:', err);
    }
  });
}


exportarPDFNormales() {
  this.viajesServicio.getViajes().subscribe({
    next: (viajes) => {
      let viajesFiltrados = [...viajes];

      // Filtrar solo viajes en estado 'agendado' o 'aceptado'
      viajesFiltrados = viajesFiltrados.filter(v => 
        ['agendado', 'aceptado'].includes(v.estado?.toLowerCase())
      );

      // Filtro por Patente
      if (this.filtros.patente) {
      viajesFiltrados = viajesFiltrados.filter(v => 
        v.patente_vehiculo?.toLowerCase().includes(this.filtros.patente.toLowerCase()) // <-- CORREGIDO
      );
    }

      // Filtro por Programa
      if (this.filtros.programa) {
        viajesFiltrados = viajesFiltrados.filter(v => 
          v.nombre_programa === this.filtros.programa
        );
      }

      // Filtro por Proveedor
      if (this.filtros.proveedor) {
         viajesFiltrados = viajesFiltrados.filter(v => 
          v.responsable?.toLowerCase().includes(this.filtros.proveedor.toLowerCase())
        );
      }

      // Filtro por Rango de Fechas 
      if (this.filtros.fechaInicio && this.filtros.fechaFin) {
        viajesFiltrados = viajesFiltrados.filter(v => {
          const fechaViaje = v.fecha_viaje.split('T')[0];
          return fechaViaje >= this.filtros.fechaInicio && fechaViaje <= this.filtros.fechaFin;
        });
      }
    
     if (viajesFiltrados.length === 0) {
        this.showToast('No hay viajes para exportar con los filtros aplicados.', 'warning');
        return;
      }

      viajesFiltrados.sort((a, b) => a.id_viaje - b.id_viaje);
      const doc = new jsPDF();
     // doc.addImage('assets/img/Logo cmpa 2.png', 'PNG', 150, 10, 40, 15);
      //doc.text("Reporte de Viajes Normales", 14, 15);
      const head = [[
        'ID', 'Fecha', 'Hora', 'Solicitante', 'Responsable' , 'P.Salida',
        'P.Destino', 'Vehículo', 'conductor', 'patente'
      ]];
      const body = viajesFiltrados.map(v => [ 
        v.id_viaje, new Date(v.fecha_viaje).toLocaleDateString('es-CL'), 
        v.hora_inicio,
        v.nombre_solicitante || v.apellido_solicitante, 
        v.responsable,
        v.punto_salida, 
        v.punto_destino, 
        v.tipoVehiculo || 'N/A', 
        v.nombreConductor || 'N/A', 
        v.patente_vehiculo || 'N/A'
       ]);

      autoTable(doc, { head, body, startY: 50,   styles: { fontSize: 9 },
        margin: { top: 50}, 
       didDrawPage: (data: any) => {
          doc.setFontSize(18);
          doc.text("Programacion Diaria", 14, 20);
          doc.addImage('assets/img/Logo cmpa 2.png', 'PNG', 150, 10, 40, 15);

        }
        });
      doc.save('programacion diaria.pdf');
    },
    error: (err) => this.showToast('Error al cargar datos para PDF.', 'danger')
  });
}

onCentroChange(event: any) {
  const centroId = event.detail.value;

  this.showSalud = false;
  this.showEducacion = false;
  this.showAtm = false;

  this.filtros.centro = ''; 

  switch(centroId) {
    case '1': // Nivel Central
      this.filtros.centro = 'Nivel Central';
      break;
    case '2': // Salud
      this.showSalud = true;
      this.establecimientosSalud = this.centroSvc.obtenerEstablecimientos(2);
      break;
    case '3': // Educación
      this.showEducacion = true;
      this.establecimientosEducacion = this.centroSvc.obtenerEstablecimientos(3);
      break;
    case '4': // ATM
      this.showAtm = true;
      this.establecimientosAtm = this.centroSvc.obtenerEstablecimientos(4);
      break;
  }
}

}
