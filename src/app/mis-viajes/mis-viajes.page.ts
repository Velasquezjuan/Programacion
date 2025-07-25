import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuLateralComponent } from '../componentes/menu-lateral/menu-lateral.component';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, 
  IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonButton,
  IonButtons, IonMenuButton,
 } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Memorialocal }            from '../almacen/memorialocal';
import { AutentificacionUsuario }  from '../servicio/autentificacion-usuario';
import { CentroServicio }         from '../servicio/centro-servicio';
import { AlertController, ToastController } from '@ionic/angular';

interface Solicitud {
  id: string;
  solicitante: string;
  fecha: string;
  hora: string;
  fechaSolicitud: string;
  puntoSalida: string;
  direccionSalida?: string;
  centroSaludSalida?: string;
  centroEducacionSalida?: string;
  centroAtmSalida?: string;
  nivelCentralSalida?: string;
  puntoDestino: string;
  centro: string;
  direccionDestino?: string;
  centroSaludDestino?: string;
  centroEducacionDestino?: string;
  centroAtmDestino?: string;
  nivelCentralDestino?: string;
  vehiculo: string;
  tipoVehiculo?: string;
  ocupantes: number;
  motivo: string;
  motivoRechazo?: string;
  necesitaCarga?: 'si'|'no';
  ocupante: string;
  estado: 'pendiente'|'aceptado'|'rechazado'|'reagendado'|'finalizado'|'no realizado'|'agendado';
  fechaRegistro?: string;
  justificativo?: string; 

}

@Component({
  selector: 'app-mis-viajes',
  templateUrl: './mis-viajes.page.html',
  styleUrls: ['./mis-viajes.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
  imports: [CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton,
    IonCard, IonCardHeader, IonCardTitle,
    IonCardSubtitle, IonCardContent, 
  ]
})
export class MisViajesPage implements OnInit {
  
  todas: Solicitud[] = [];
  filtro: 'todos'|'pendiente'|'aceptado'|'rechazado'|'reagendado' = 'pendiente';
  usuarioActivo!: string;

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
  { value: 'aceptado',   label: 'Aceptados'   },
  { value: 'finalizado', label: 'Finalizados' }, 
  { value: 'no realizado', label: 'No Realizados' }, 
  { value: 'rechazado',  label: 'Rechazados'  },
  { value: 'reagendado', label: 'Reagendados' }
];

  constructor(
    private router: Router,
    private auth: AutentificacionUsuario,
    private centroService: CentroServicio,
    private alertController: AlertController, 
    private toastController: ToastController 
  ) {}

  async ngOnInit() {

  this.centros.central   = this.centroService.obtenerCentros('central');
  this.centros.salud     = this.centroService.obtenerCentros('salud');
  this.centros.atm       = this.centroService.obtenerCentros('atm');
  this.centros.educacion = this.centroService.obtenerCentros('educacion');
  this.centros.comunal    = this.centroService.obtenerCentros('comunal' as any);
  this.centros.otro       = this.centroService.obtenerCentros('otro' as any);
  
  const usr = await this.auth.obtenerUsuarioActivo();
    this.usuarioActivo = usr?.usuario ?? '';
    const all = await Memorialocal.obtener<Solicitud>('viajesSolicitados');
    this.todas = all
      .filter(v => v.solicitante === this.usuarioActivo)
      .map(v => ({
        ...v,
        estado: v.estado==='aceptado' && v.fechaRegistro&&v.fechaRegistro!==v.fecha
                ? 'reagendado'
                : v.estado
      }));
  }

  get viajes(): Solicitud[] {
    let list = [...this.todas];
    if (this.filtro!=='todos') {
      list = list.filter(v => v.estado===this.filtro);
    }
    // pendientes al principio
    list.sort((a,b) => {
      if (a.estado==='pendiente'&&b.estado!=='pendiente') return -1;
      if (a.estado!=='pendiente'&&b.estado==='pendiente') return 1;
      return a.fecha.localeCompare(b.fecha)||a.hora.localeCompare(b.hora);
    });
    return list;
  }

  getBorderClass(e: string){
  switch(e){
    case 'aceptado':    return 'border-success';
    case 'finalizado':  return 'border-tertiary'; 
    case 'rechazado':   return 'border-danger';
    case 'no realizado':return 'border-dark'; 
    case 'reagendado':  return 'border-primary';
    default:            return 'border-warning';
  }
}

  async cargarViajes() {
    const all = await Memorialocal.obtener<Solicitud>('viajesSolicitados');
    this.todas = all.filter(v =>
      v.solicitante === this.usuarioActivo &&
      (this.filtro === 'todos' || v.estado === this.filtro)
    );
  }

  onFiltroChange(ev: any){
    this.filtro = ev.detail.value;
    this.cargarViajes();
  }

  private formatLabelWithAddress( 
  list: Array<{ value: string; label: string }>,
  code: string,
  address: string
): string {
  const found = list.find(i => i.value === code);
  const label = found ? found.label : code;
  return address ? `${label} – ${address}` : label;
}

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


  return this.formatLabelWithAddress(list, code, subCode ?? '');
}


getDestinoLabel(sol: Solicitud): string {
  let list = this.centros.central;
  let code = sol.puntoDestino || '';
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

 
  return this.formatLabelWithAddress(list, code, sub ?? '');
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
          handler: async () => {
            
            viaje.estado = 'finalizado';
            await Memorialocal.guardar('viajesSolicitados', viaje);
            this.mostrarToast('Viaje marcado como finalizado.', 'success');
            this.ngOnInit(); 
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
          placeholder: 'Ej: El ocupante no se pudo presentó, el vehículo tuvo un problema, etc.',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (!data.justificativo || data.justificativo.trim() === '') {
              this.mostrarToast('El justificativo no puede estar vacío.', 'danger');
              return false;
            }
            
           
            viaje.estado = 'no realizado';
            viaje.justificativo = data.justificativo;
            await Memorialocal.guardar('viajesSolicitados', viaje);
            this.mostrarToast('El viaje ha sido marcado como no realizado.', 'tertiary');
            this.ngOnInit(); 
            return true;
          },
        },
      ],
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

   // Navegaciones
   goToHomePage() {
    this.router.navigate(['/home']);
  }



}
