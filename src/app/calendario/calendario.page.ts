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
import { Memorialocal } from '../almacen/memorialocal';
import { AutentificacionUsuario } from '../servicio/autentificacion-usuario';


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

  constructor(
    private auth: AutentificacionUsuario,
    private alertCtrl: AlertController
  ) { }
  
  calendarOptions: CalendarOptions = {
    locale: 'es',                     
    locales: [ esLocale ], 
    plugins: [ dayGridPlugin, timeGridPlugin, interactionPlugin ],
     headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay'
    },    
    buttonText: {
      today:    'Hoy',
      month:    'Mes',
      week:     'Semana',
      day:      'Día',
      list:     'Agenda'
    },
    initialView: 'dayGridMonth',
    events: [],
      eventTimeFormat: {     
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },  
    displayEventTime: true,
 
  };

    async ngOnInit() {
       const usr = await this.auth.obtenerUsuarioActivo();
    this.rolUsuario = usr?.rol ?? null;


   if (['adminSistema','its'].includes(this.rolUsuario!)) {
      this.calendarOptions.editable = true;
      this.calendarOptions.eventDurationEditable = true;
      this.calendarOptions.eventResizableFromStart = true;
      this.calendarOptions.eventDrop = this.handleEventDrop.bind(this);
      this.calendarOptions.eventResize = this.handleEventResize.bind(this);
    }

    const solicitudes = await Memorialocal.obtenerSolicitudes();
    this.calendarOptions.events = solicitudes
    .filter(s => s.estado === 'aceptado')
    .map(s => ({
      id: s.id,
      title: s.solicitante,
      start: `${s.fecha}T${s.hora}`,
      end:   `${s.fecha}T${s.hora}`,
      allDay: false,
      extendedProps: {
        destino:      s.direccion,
        motivo:       s.motivo,
        responsable:  s.ocupante,
        vehiculo:     s.tipoVehiculo,
        ocupantes:    s.ocupantes
      }
    }));
  }

 async handleEventClick(clickInfo: EventClickArg) {
  const ev    = clickInfo.event;
  const p     = ev.extendedProps as any;
  const fecha = ev.start?.toLocaleDateString('es-CL') || '';
  const hora  = ev.start?.toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit'
  }) || '';

  const html = `
    <p><strong>Solicitante:</strong> ${ev.title}</p>
    <p><strong>Destino:</strong> ${p.destino}</p>
    <p><strong>Vehículo:</strong> ${p.vehiculo} – ${p.ocupantes} ocupantes</p>
    <p><strong>Responsable:</strong> ${p.responsable}</p>
    <p><strong>Motivo:</strong> ${p.motivo}</p>
    <p><strong>Fecha/Hora:</strong> ${fecha} ${hora}</p>
  `;

  const alert = await this.alertCtrl.create({
    header: 'Detalle de viaje',
    message: html,
    cssClass: 'calendario-alert',
    buttons: ['Cerrar']
  });
  await alert.present();
}


  /** Cuando arrastran un evento a otra fecha/hora */
  async handleEventDrop(dropInfo: any) {
    const ev    = dropInfo.event;
    const id    = ev.id;
    const fecha = ev.startStr.slice(0,10);
    const hora  = ev.startStr.slice(11,16);

    // Actualizas en tu BD IndexedDB:
    const datos = await Memorialocal.buscarPorCampo<any>(
      'viajesSolicitados','id', id
    );
    if (datos) {
      datos.fecha = fecha;
      datos.hora  = hora;
      await Memorialocal.reemplazarPorCampo(
        'viajesSolicitados','id', id, datos
      );
    }
  }

  /** Cuando cambian duración (resize) */
  async handleEventResize(resizeInfo: any) {
    // Para este caso el evento sigue siendo de un solo slot,
    // podrías ignorarlo o usarlo si manejas rangos.
  }



}



