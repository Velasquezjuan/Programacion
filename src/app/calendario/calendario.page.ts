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
//servicios
import { Memorialocal } from '../almacen/memorialocal';
import { AutentificacionUsuario } from '../servicio/autentificacion-usuario';
import { CentroServicio } from '../servicio/centro-servicio';
import { ViajesServicio } from '../servicio/viajes-servicio';

interface ViajeAPI {
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
        <i>${p.puntoSalida}</i><br>
        <i>${p.puntoDestino}</i><br>
        <i>Vehículo: ${p.vehiculo}</i><br>
        <i>Ocupantes: ${p.ocupantes}</i><br>
        <i>Responsable: ${p.responsable}</i><br>
        <i>Motivo: ${p.motivo}</i><br>
        <i>${arg.timeText}</i>
      `;
      return { domNodes: [div] };
    },
    
    eventClick: undefined
  };

  constructor(
    private auth: AutentificacionUsuario,
    private alertCtrl: AlertController,
    private centroSvc: CentroServicio,
    private viajesServicio: ViajesServicio,
  ) {}

    async ngOnInit() {
    const usr = await this.auth.obtenerUsuarioActivo();
    this.rolUsuario = usr?.rol ?? null;
    const isAdmin = ['adminSistema', 'its'].includes(this.rolUsuario!);

    const todas = await Memorialocal.obtenerSolicitudes();
    const visibles = todas.filter(s =>
      ['aceptado', 'agendado'].includes(s.estado) &&
      (isAdmin || s.solicitante === usr!.usuario)
    );

    this.calendarOptions.events = visibles.map(s => ({
      id: s.id,
      title: s.solicitante,
      start: `${s.fecha}T${s.hora_inicio || s.hora}`,
      end: `${s.fecha}T${s.hora_fin || s.hora_inicio || s.hora}`,
      allDay: false,
      extendedProps: {
        puntoSalida: s.puntoSalida ? this.getSalidaLabel(s) : s.origen,
        puntoDestino: s.puntoDestino ? this.getDestinoLabel(s) : s.destino,
        vehiculo: s.vehiculo, 
        ocupantes: s.ocupantes,
        responsable: s.responsable || s.ocupante,
        motivo: s.motivo,
        fecha: s.fecha,
        hora: s.hora_inicio || s.hora
      }
    }));

    if (isAdmin) {
      this.calendarOptions.editable = true;
      this.calendarOptions.eventDurationEditable = true;
      this.calendarOptions.eventResizableFromStart = true;
      this.calendarOptions.eventDrop = this.handleEventDrop.bind(this);
      this.calendarOptions.eventResize = this.handleEventResize.bind(this);
      this.calendarOptions.eventClick = async (info) => {
        if (info.jsEvent.detail === 2) {
          await this.abrirReagendar(info.event.id);
        } else {
          await this.handleEventClick(info);
        }
      };
    } else {
      this.calendarOptions.eventClick = this.handleEventClick.bind(this);
    }
  }


  async abrirReagendar(solicitudId: string) {
    const todas = await Memorialocal.obtenerSolicitudes();
    const sol = todas.find(s => s.id === solicitudId);
    if (!sol) {
      return this.showToast('Solicitud no encontrada', 'danger');
    }
    const alert = await this.alertCtrl.create({
      header: 'Reagendar viaje',
      inputs: [{
        name: 'nuevoDateTime',
        type: 'datetime-local',
        value: `${sol.fecha}T${sol.hora_inicio || sol.hora}`
      }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: async (data: { nuevoDateTime: string }) => {
            if (!data.nuevoDateTime) {
              this.showToast('Debes seleccionar fecha y hora', 'warning');
              return false;
            }
            const [nuevaFecha, nuevaHora] = data.nuevoDateTime.split('T');
            await this.procesarReagendar(sol, nuevaFecha, nuevaHora);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  private async procesarReagendar(sol: any, nuevaFecha: string, nuevaHora: string) {
    if (sol.patenteVehiculo) {
      const todas = await Memorialocal.obtenerSolicitudes();
      const choque = todas.find(s =>
        s.id !== sol.id &&
        s.estado === 'aceptado' &&
        s.patenteVehiculo === sol.patenteVehiculo &&
        s.fecha === nuevaFecha &&
        (s.hora_inicio || s.hora) === nuevaHora
      );
      if (choque) {
        return this.showToast('Ese vehículo ya está ocupado en ese horario', 'warning');
      }
    }
    sol.fecha = nuevaFecha;
    sol.hora = nuevaHora; 
    sol.hora_inicio = nuevaHora;
    sol.estado = 'reagendado';
    await Memorialocal.reemplazarPorCampo('viajesSolicitados', 'id', sol.id, sol);
    this.showToast('Viaje reagendado correctamente.', 'success');
    this.ngOnInit();
  }

  private lookup(list: { value: string; label: string }[], code?: string): string {
    if (!code) return '';
    const found = list.find(x => x.value === code);
    return found ? found.label : code;
  }

  private getSalidaLabel(viaje: ViajeAPI): string {
    return viaje.punto_salida || 'Origen no especificado';
  }

  private getDestinoLabel(viaje: ViajeAPI): string {
    return viaje.punto_destino || 'Destino no especificado';
  }

  private async showToast(msg: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const t = await this.alertCtrl.create({ message: msg, buttons: ['Cerrar'], cssClass: color });
    await t.present();
  }

  async handleEventDrop(dropInfo: any) {
    const ev = dropInfo.event;
    const id = ev.id;
    const fecha = ev.startStr.slice(0, 10);
    const hora = ev.startStr.slice(11, 16);
    const datos = await Memorialocal.buscarPorCampo('viajesSolicitados', 'id', id);
    if (datos) {
      (datos as any).fecha = fecha;
      (datos as any).hora = hora;
      (datos as any).hora_inicio = hora;
      await Memorialocal.reemplazarPorCampo('viajesSolicitados', 'id', id, datos);
    }
  }

  async handleEventResize(resizeInfo: any) {}

  async handleEventClick(clickInfo: EventClickArg) {
    const ev = clickInfo.event;
    const p = ev.extendedProps as any;
    const fecha = ev.start?.toLocaleDateString('es-CL') || '';
    const hora = ev.start?.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) || '';
    const html = `
      El viaje lo solicito: ${ev.title} -- 
      Debe salir desde: ${p.puntoSalida} -- 
      Se dirige a :${p.puntoDestino} -- 
      Con el vehículo asignado: ${p.vehiculo} -- 
      Con la cantidad de ocupantes de: ${p.ocupantes} -- 
      El responsable del viaje es: ${p.responsable} -- 
      El motivo de uso es: ${p.motivo} -- 
      No olvide su dia de salida es: ${fecha} -- 
      No olvide su hora de salida: ${hora} Muchas gracias por su atención.
    `;
    const alert = await this.alertCtrl.create({ header: 'Detalle de viaje', message:  html, buttons: ['Cerrar'] });
    await alert.present();
  }
}



