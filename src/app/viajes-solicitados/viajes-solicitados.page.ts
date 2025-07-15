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
import { CentroServicio } from '../servicio/centro-servicio';

interface UsuarioActivo { id: string; usuario: string; rol: string; }
interface Solicitud {
  id: string;
  solicitante: string;
  fecha: string;    // 'YYYY-MM-DD'
  hora: string;     // 'HH:mm'
  puntoSalida:string;
  direccionSalida: string;
  centroSaludSalida?: string; 
  centroEducacionSalida?: string; 
  centroAtmSalida?: string
  nivelCentralSalida?: string; 
  puntoDestino?: string;  
  direccionDestino?: string;   
  centroSaludDestino?:  string;
  centroEducacionDestino?: string;
  centroAtmDestino?:    string;
  nivelCentralDestino?: string;
  tiempoUso: number;
  fechaCreacion: string; // 'YYYY-MM-DD'
  dentroComuna?: 'si'|'no';
  necesitaCarga?: 'si'|'no';
  motivo: string;
  ocupante: string;
  ocupantes: number;
  estado: string;   // 'pendiente' | 'aceptado' | 'rechazado'
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
  imports: [ IonApp, MenuLateralComponent, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,  IonContent, 
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonInput, IonButton,
    CommonModule, FormsModule ]
})
export class ViajesSolicitadosPage implements OnInit {
  solicitudes: Solicitud[] = [];
  vehiculos: Vehiculo[] = [];
  rolUsuario = '';
  rechazandoId: string | null = null;
  motivoRechazo = '';
 
   centros = {
    central: [] as { value: string; label: string }[],
    salud: [] as { value: string; label: string }[],
    atm: [] as { value: string; label: string }[],
    educacion: [] as { value: string; label: string }[],
    comunal: [] as { value: string; label: string }[],
    otro: [] as { value: string; label: string }[]
  };
  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private centroService: CentroServicio
  ) {
    addIcons({
      calendarOutline,carOutline, personOutline, closeCircleOutline });
  }

  private async showToast(
    msg: string,
    color: 'success' | 'warning' | 'danger' = 'success'
  ) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    await t.present();
  }

  async ngOnInit() {
    
    this.centros.central = this.centroService.obtenerCentros('central');
    // Carga usuario activo
    const activos = await Memorialocal.obtener<UsuarioActivo>('usuarioActivo');
    this.rolUsuario = activos[0]?.rol ?? '';
    // Luego datos
    await this.reloadData();
  }

  private async reloadData() {
    const todas = await Memorialocal.obtener<Solicitud>('viajesSolicitados');
    this.solicitudes = todas.filter(s => s.estado === 'pendiente');
    this.vehiculos    = await Memorialocal.obtener<Vehiculo>('vehiculos');
  }

  trackByFn(_: number, item: Solicitud) {
    return item.id;
  }

  /** 1) Selección de vehículo al agendar */
  async abrirAgendar(solicitudId: string) {
    // buscamos la solicitud (solo para chequear que exista)
    const sol = this.solicitudes.find(s => s.id === solicitudId);
    if (!sol) return this.showToast('Solicitud no encontrada', 'danger');

    // inputs radio de vehículos
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
          handler: (vehId: string) => {
            if (!vehId) {
              this.showToast('Debe elegir un vehículo.', 'warning');
              return false; // no cierra
            }
            this.procesarAgendar(solicitudId, vehId);
            return true; // cierra
          }
        }
      ]
    });
    await alert.present();
  }

  /** 2) Guarda el vehículo elegido y marca como aceptado */
  private async procesarAgendar(solicitudId: string, vehiculoId: string) {
    const veh = this.vehiculos.find(v => v.id === vehiculoId)!;
    const sol = await Memorialocal.buscarPorCampo<Solicitud>(
      'viajesSolicitados','id', solicitudId
    );
    if (!sol) return;

    // Evita choque: mismo vehículo, misma fecha/hora ya aceptado
    if (sol.patenteVehiculo) {
      const todas = await Memorialocal.obtener<Solicitud>('viajesSolicitados');
      const choque = todas.find(s =>
        s.id !== sol.id &&
        s.estado === 'aceptado' &&
        s.patenteVehiculo === veh.patente &&
        s.fecha === sol.fecha &&
        s.hora === sol.hora
      );
      if (choque) {
        return this.showToast(
          'Ese vehículo ya está ocupado en ese horario',
          'warning'
        );
      }
    }

    sol.estado = 'aceptado';
    sol.patenteVehiculo = veh.patente;
    sol.tipoVehiculo   = veh.tipoVehiculo;
    await Memorialocal.reemplazarPorCampo(
      'viajesSolicitados','id', sol.id, sol
    );

    this.showToast('Viaje agendado correctamente.', 'success');
    await this.reloadData();
  }

  /** 3) Rechazo con motivo */
  mostrarCampoMotivo(id: string) {
    this.rechazandoId = id;
    this.motivoRechazo = '';
  }

  async rechazarConMotivo() {
    if (!this.rechazandoId) return;
    if (!this.motivoRechazo.trim()) {
      return this.showToast('Debe ingresar un motivo.', 'warning');
    }
    await Memorialocal.actualizarEstadoSolicitudConMotivo(
      this.rechazandoId,'rechazado', this.motivoRechazo
    );
    this.showToast('Solicitud rechazada con motivo.', 'danger');
    this.rechazandoId = null;
    await this.reloadData();
  }

  /** 4) Reagendar (cambia fecha+hora) */
  async abrirReagendar(solicitudId: string) {
    const sol = this.solicitudes.find(s => s.id === solicitudId);
    if (!sol) {
      return this.showToast('Solicitud no encontrada', 'danger');
    }

    const alert = await this.alertCtrl.create({
      header: 'Reagendar viaje',
      inputs: [{
        name: 'nuevoDateTime',
        type: 'datetime-local',
        value: `${sol.fecha}T${sol.hora}`
      }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: async (data: any) => {
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

  private async procesarReagendar(
    sol: Solicitud,
    nuevaFecha: string,
    nuevaHora: string
  ) {
    // idem choque de vehículo
    if (sol.patenteVehiculo) {
      const todas = await Memorialocal.obtener<Solicitud>('viajesSolicitados');
      const choque = todas.find(s =>
        s.id !== sol.id &&
        s.estado === 'aceptado' &&
        s.patenteVehiculo === sol.patenteVehiculo &&
        s.fecha === nuevaFecha &&
        s.hora === nuevaHora
      );
      if (choque) {
        return this.showToast(
          'Ese vehículo ya está ocupado en ese horario',
          'warning'
        );
      }
    }

    sol.fecha = nuevaFecha;
    sol.hora  = nuevaHora;
    await Memorialocal.reemplazarPorCampo('viajesSolicitados','id', sol.id, sol);
    this.showToast('Viaje reagendado correctamente.', 'success');
    await this.reloadData();
  }

  /** etiqueta para punto de salida */
 private formatLabelWithAddress( 
  list: Array<{ value: string; label: string }>,
  code: string,
  address: string
): string {
  const found = list.find(i => i.value === code);
  const label = found ? found.label : code;
  return address ? `${label} – ${address}` : label;
}

/** etiqueta para punto de salida */
getSalidaLabel(sol: Solicitud): string {
  let list = this.centros.central;
  let code = sol.puntoSalida;
  let subCode = sol.direccionSalida;

  switch (sol.puntoSalida) {
    case 'salud':
      list = this.centros.salud;
      subCode = sol.centroSaludSalida || '';
      break;
    case 'educacion':
      list = this.centros.educacion;
      subCode = sol.centroEducacionSalida || '';
      break;
    case 'atm':
      list = this.centros.atm;
      subCode = sol.centroAtmSalida || '';
      break;
  }

  // Aquí forzamos string (nunca undefined)
  return this.formatLabelWithAddress(list, code, subCode ?? '');
}

/** etiqueta para punto de destino */
getDestinoLabel(sol: Solicitud): string {
  let list = this.centros.central;
  let code = sol.puntoDestino   || '';
  let sub  = sol.direccionDestino || '';

  switch (code) {
    case 'salud':
      list = this.centros.salud;
      sub  = sol.centroSaludDestino   || sub;
      break;
    case 'educacion':
      list = this.centros.educacion;
      sub  = sol.centroEducacionDestino || sub;
      break;
    case 'atm':
      list = this.centros.atm;
      sub  = sol.centroAtmDestino     || sub;
      break;
  }

  // Y aquí igual, garantizamos un string
  return this.formatLabelWithAddress(list, code, sub ?? '');
}
}
