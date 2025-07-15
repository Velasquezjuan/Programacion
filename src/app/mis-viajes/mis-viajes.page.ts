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

interface Solicitud {
  id: string;
  solicitante: string;
  fecha: string;
  hora: string;
  puntoSalida: string;
  direccionSalida?: string;
  centro: string;
  direccionDestino?: string;
  tipoVehiculo: string;
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

  estados = [
    { value: 'todos',     label: 'Todos'      },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'aceptado',  label: 'Aceptados'  },
    { value: 'rechazado', label: 'Rechazados' },
    { value: 'reagendado',label: 'Reagendados'}
  ];

  constructor(
    private router: Router,
    private auth: AutentificacionUsuario
  ) {}

  async ngOnInit() {
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

   // Navegaciones
   goToHomePage() {
    this.router.navigate(['/home']);
  }



}
