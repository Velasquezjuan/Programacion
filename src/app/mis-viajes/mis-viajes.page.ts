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
  estado: 'pendiente'|'aceptado'|'rechazado'|'reagendado';
  fechaRegistro?: string;
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
    { value: 'todos',     label: 'Todos'      },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'aceptado',  label: 'Aceptados'  },
    { value: 'rechazado', label: 'Rechazados' },
    { value: 'reagendado',label: 'Reagendados'}
  ];

  constructor(
    private router: Router,
    private auth: AutentificacionUsuario,
    private centroService: CentroServicio
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
      case 'rechazado':   return 'border-danger';
      case 'reagendado':  return 'border-primary';
      default:            return 'border-warning';
    }
  }
  async cargarViajes() {
    const all = await Memorialocal.obtener<Solicitud>('viajesSolicitados');
    // sólo los del usuario y que cumplan filtro
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

  // Aquí forzamos string (nunca undefined)
  return this.formatLabelWithAddress(list, code, subCode ?? '');
}

/** etiqueta para punto de destino */
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

  // Y aquí igual, garantizamos un string
  return this.formatLabelWithAddress(list, code, sub ?? '');
}

   // Navegaciones
   goToHomePage() {
    this.router.navigate(['/home']);
  }



}
