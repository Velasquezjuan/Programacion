import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { ViajesServicio } from '../servicio/viajes-servicio';
import { NotificacionesCorreo } from '../servicio/notificaciones-correo';


/*interface ViajeAPI {
  id_viaje: number;
  solicitante_nombre: string;
  correo_solicitante: string;
  fecha_viaje: string;
  hora_inicio: string;
  hora_fin: string | null;
  punto_salida: string;
  punto_destino: string;
  motivo: string;
  ocupantes: number;
  estado: string;
  vehiculo_patente: string | null;
  responsable_nombre: string;
}*/

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
  patenteVehiculo?: string;
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
  selector: 'app-calendario',
  templateUrl: './calendario.page.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrls: ['./calendario.page.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule,FullCalendarModule ]
})
export class CalendarioPage implements OnInit {
 
   rolUsuario: string | null = null;
   nombreUsuario: string = '';
 

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
    eventContent: (arg) => {
      const p = (arg.event.extendedProps as any);
      const div = document.createElement('div');
      div.style.fontSize = '0.75em';
      div.innerHTML = `
        <b>${arg.event.title}</b><br>
        <i>Salida: ${p.punto_salida}</i><br>
        <i>Destino: ${p.punto_destino}</i><br>
        <i>Vehículo: ${p.tipoVehiculo || 'No asignado'}</i><br>
        <i>Ocupantes: ${p.ocupantes}</i><br>
        <i>Responsable: ${p.responsable}</i><br>
        <i>Motivo: ${p.motivo}</i><br>
        <i>${arg.timeText}</i>
      `;
      return { domNodes: [div] };
    },
    
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
    await this.cargarDatosDelCalendario();
  }

  async cargarDatosDelCalendario() {
    const usr = await this.auth.obtenerUsuarioActivo();
    if (!usr) {
    this.showToast('No se pudo identificar al usuario.', 'danger');
    return;
  }

    this.rolUsuario = usr.rol;
    this.nombreUsuario = usr.nombre;
    const isAdmin = ['adminSistema', 'its', 'coordinador'].includes(this.rolUsuario ?? '');

   forkJoin({
    viajesNormales: this.viajesServicio.getViajes(),
    viajesMasivos: this.viajesServicio.getViajesMasivos()
  }).subscribe({
    next: (resultados) => {
      console.log("Datos recibidos del backend:", resultados);

      const todosLosViajes = [...resultados.viajesNormales, ...resultados.viajesMasivos];

        const viajesVisibles = todosLosViajes.filter(viaje =>
          ['aceptado', 'agendado'].includes(viaje.estado) &&
          (isAdmin || viaje.nombre_solicitante === this.nombreUsuario)
        );

     this.calendarOptions.events = viajesVisibles.map(viaje => ({
        id: viaje.id_viaje.toString(),
        title: `Viaje de ${viaje.nombre_solicitante}`,
        start: `${viaje.fecha_viaje.split('T')[0]}T${viaje.hora_inicio}`,
        allDay: false,
        color: this.getColorPorViaje(viaje), 
        extendedProps: viaje
      /*{
        puntoSalida: s.punto_salida ? this.getSalidaLabel(s) : s.origen,
        puntoDestino: s.punto_destino ? this.getDestinoLabel(s) : s.destino,
        vehiculo: s.tipoVehiculo, 
        ocupantes: s.ocupantes,
        responsable: s.responsable || s.ocupante,
        motivo: s.motivo,
        fecha: s.fecha,
        hora: s.hora_inicio || s.hora
      }*/
    }));

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

 

  async abrirReagendar(viajeId: string, viaje: viaje) {
  /*  const todas = await Memorialocal.obtenerSolicitudes();
    const sol = todas.find(s => s.id === solicitudId);
    if (!sol) {
      return this.showToast('Solicitud no encontrada', 'danger');
    }*/
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
    return '#2be2e2ff'; // color viaje masivo
  }
  // colores  viajes normales segun estados
  switch(s.estado) {
    case 'aceptado': return '#2dd36f'; // Verde
    case 'agendado': return '#ffc409'; // Amarillo
    default: return '#38ffc3ff'; // Azul por defecto
  }
}

exportarPDF() {

 forkJoin({
    viajesNormales: this.viajesServicio.getViajes(),
    viajesMasivos: this.viajesServicio.getViajesMasivos()
  }).subscribe({
    next: (resultados) => {
      const { viajesNormales, viajesMasivos } = resultados;

      if (viajesNormales.length === 0 && viajesMasivos.length === 0) {
        this.showToast('No hay datos para exportar.', 'warning');
        return;
      }

      const doc = new jsPDF();
      doc.text("Reporte de Viajes del Calendario", 14, 15);
      let finalY = 20; 

      const head = [['ID', 'Fecha', 'Hora', 'Solicitante', 'Destino', 'Vehículo']];

      if (viajesNormales.length > 0) {
        doc.text("Viajes Normales", 14, finalY + 5);
        const bodyNormal = viajesNormales.map(v => [ v.id_viaje, new Date(v.fecha_viaje).toLocaleDateString('es-CL'), v.hora_inicio, v.nombre_solicitante, v.punto_destino, v.tipoVehiculo || 'N/A' ]);
        
        autoTable(doc, {
          head: head,
          body: bodyNormal,
          startY: finalY + 10,
          theme: 'grid',
          styles: { fontSize: 8 },
        });
        finalY = (doc as any).lastAutoTable.finalY; 
      }

      if (viajesMasivos.length > 0) {
        finalY += 10;
        doc.text("Viajes Masivos", 14, finalY);
        const bodyMasivo = viajesMasivos.map(v => [ v.id_viaje, new Date(v.fecha_viaje).toLocaleDateString('es-CL'), v.hora_inicio, v.nombre_solicitante, v.punto_destino, v.tipoVehiculo || 'N/A' ]);

        autoTable(doc, {
          head: head,
          body: bodyMasivo,
          startY: finalY + 5,
          theme: 'grid',
          styles: { fontSize: 8 },
        });
      }

      doc.save(`reporte_viajes_${new Date().toISOString().split('T')[0]}.pdf`);
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
      if (viajes.length === 0) {
        this.showToast('No hay viajes normales para exportar.', 'warning');
        return;
      }
      const doc = new jsPDF();
      doc.addImage('assets/img/Logo cmpa 2.png', 'PNG', 150, 10, 40, 15);
      doc.text("Reporte de Viajes Normales", 14, 15);
      const head = [['ID', 'Fecha', 'Hora', 'Solicitante', 'Responsable' , 'Destino', 'Vehículo', 
        'conductor', 'patente']];
      const body = viajes.map(v => [ v.id_viaje, new Date(v.fecha_viaje).toLocaleDateString('es-CL'), v.hora_inicio, 
        v.nombre_solicitante || v.apellido_solicitante , v.responsable_nombre, v.punto_destino, v.tipoVehiculo || 'N/A', v.conductorAsignado || 'N/A', v.patenteVehiculo || 'N/A'
       ]);
      autoTable(doc, { head, body, startY: 30 });
      doc.save('reporte_viajes_normales.pdf');
    },
    error: (err) => this.showToast('Error al cargar datos para PDF.', 'danger')
  });
}
exportarPDFMasivos() {
  this.viajesServicio.getViajesMasivos().subscribe({
    next: (viajes) => {
      if (viajes.length === 0) {
        this.showToast('No hay viajes masivos para exportar.', 'warning');
        return;
      }
      const doc = new jsPDF();
      doc.addImage('assets/img/Logo cmpa 2.png', 'PNG', 150, 10, 40, 15);
      doc.text("Reporte de Viajes Masivos", 14, 15);
      const head = [['ID', 'Fecha', 'Hora', 'Solicitante','Responsable', 'Destino', 'Vehículo',
        'conductor', 'patente']];
      const body = viajes.map(v => [ v.id_viaje, new Date(v.fecha_viaje).toLocaleDateString('es-CL'), v.hora_inicio, v.nombre_solicitante, 
         v.nombre_solicitante || v.apellido_solicitante , v.responsable_nombre,v.punto_destino, v.tipoVehiculo || 'N/A',
        v.conductorAsignado || 'N/A', v.patenteVehiculo || 'N/A'
       ]);
      autoTable(doc, { head, body, startY: 30 });
      doc.save('reporte_viajes_masivos.pdf');
    },
    error: (err) => this.showToast('Error al cargar datos para PDF.', 'danger')
  });
}

}



