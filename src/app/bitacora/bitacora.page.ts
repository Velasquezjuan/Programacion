import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonLabel, IonSearchbar, IonToggle,
  IonList, IonItem, IonInput,IonButton, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonGrid, IonRow, IonCol, IonIcon, IonText,
  IonItemDivider,IonSelect, IonSelectOption
 } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { searchCircle, downloadOutline, warningOutline } from 'ionicons/icons';

import { NgChartsModule } from 'ng2-charts';
import { ChartOptions, ChartData, ChartType, Chart, registerables } from 'chart.js';

import { ToastController, LoadingController } from '@ionic/angular';

import { Bitacora } from '../servicio/bitacora';
import { AutentificacionUsuario }  from '../servicio/autentificacion-usuario';
import { CentroServicio }         from '../servicio/centro-servicio';
import { ViajesServicio }         from '../servicio/viajes-servicio';
import { VehiculoServicio }       from '../servicio/vehiculo-servicio';




@Component({
  selector: 'app-bitacora',
  templateUrl: './bitacora.page.html',
  styleUrls: ['./bitacora.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [ CommonModule, 
    FormsModule, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonGrid,
    IonRow, IonCol, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonText,
    IonList, IonItemDivider,  NgChartsModule,   IonSelect, IonSelectOption,
  ]
})
export class BitacoraPage implements OnInit {

  centrosPrincipales: { value: number; label: string }[] = [];
  programas: { value: string; label: string }[] = [];
  establecimientosSalud: { value: number; label: string }[] = [];
  establecimientosEducacion: { value: number; label: string }[] = [];
  establecimientosAtm: { value: number; label: string }[] = [];
  
  diasInactivosReporte: number = 0;
 
  showSalud     = false;
  showEducacion = false;
  showAtm       = false;


 public barChartOptions: ChartOptions = { responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        display: true,
        position: 'right', 
      },
    },
  };
  
  public pieChartOptions: ChartOptions = { responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        display: true,
        position: 'right', 
      },
    },
  };
  
  public centrosChartData: ChartData<'bar'> | null = null;
  
  public vehiculosChartData: ChartData<'pie'> | null = null;
  
  public programasChartData: ChartData<'bar'> | null = null;
  
  public usuariosChartData: ChartData<'pie'> | null = null;

  dashboardData: any = {};
  reporteResultados: any[] = [];
  resumenReporte: any = {};
  reporteActivo: boolean = false;

  filtros = {
    patente: '',
    centro: '',
    proveedor: '',
    programa: '',
    fechaInicio: '',
    fechaFin: '',
    Movimiento: ''
  };

  filtro: 'todos'|'pendiente'|'Agendado'|'rechazado'|'reagendado' = 'todos';
  usuarioActivo!: { nombre: string; correo?: string };
  searchTerm: string = '';
  fechaInicioFiltro: string = '';
  fechaFinFiltro: string = '';



  constructor(
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private bitacora: Bitacora,
    private centroServicio: CentroServicio,

  ) {
      addIcons({downloadOutline,warningOutline});
    Chart.register(...registerables);
      this.addIcons();

     }

  ngOnInit() {
   this.cargarDashboardData();

   this.programas = this.centroServicio.obtenerPrograma('prog');
   this.centrosPrincipales = this.centroServicio.obtenerCentros();
  }


  async buscarReporte() {
    const loading = await this.loadingController.create({
      message: 'Generando reporte...',
      spinner: 'crescent'
    });
    await loading.present();

    this.bitacora.generarReporte(this.filtros).subscribe({
      next: (data) => {
        this.reporteResultados = data.resultados;
        this.resumenReporte = data.resumen;
        this.diasInactivosReporte = data.diasInactivos;
        this.reporteActivo = true; 
        loading.dismiss();
        this.mostrarToast('Reporte generado con éxito.', 'success');
      },
      error: (err) => {
        console.error('Error al generar reporte', err);
        this.mostrarToast('Error al generar reporte.', 'danger');
        loading.dismiss();
      }
    });
  }

  limpiarFiltros() {
    this.filtros = {
      patente: '',
      centro: '',
      proveedor: '',
      programa: '',
      fechaInicio: '',
      fechaFin: '',
      Movimiento: ''
    };
    this.reporteActivo = false; 
    this.reporteResultados = [];
    this.resumenReporte = {};
  }

  async exportarReporte() {
   this.bitacora.exportarReporte(this.filtros).subscribe({
      next: (response: Blob) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'reporte_detallado.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.mostrarToast('Reporte exportado con éxito.', 'success');
      },
      error: (err) => {
          console.error('Error al exportar reporte', err);
          this.mostrarToast('Error al exportar el reporte.', 'danger');
      }
  });
}

  async mostrarToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    toast.present();
  }
  

  goToHomePage() {
    this.router.navigate(['/home']);
  } 

  addIcons() {
    addIcons({
      'search-circle': searchCircle
    });
  }

  exportarDashboard() {
    this.bitacora.exportarDashboard().subscribe({
      next: (data: Blob) => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reporte_dashboard.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        this.mostrarToast('Dashboard exportado con éxito.', 'success');
      },
      error: (err) => {
        this.mostrarToast('Error al exportar el dashboard.', 'danger');
      }
    });
  }

async cargarDashboardData() { 
  const loading = await this.loadingController.create({ 
    message: 'Cargando datos del dashboard...',
    spinner: 'crescent'
  });
  await loading.present();

  this.bitacora.getDashboardData().subscribe({ // dividirlos mejor, y exportar los mejores 10 en usarios y vehiculos
    next: (data) => {
      if (data.centrosMasUsan) {
        this.centrosChartData = {
          labels: data.centrosMasUsan.map((c: any) => c.destino),
          datasets: [{ data: data.centrosMasUsan.map((c: any) => c.total_viajes), label: 'Viajes por Centro' }]
        };
      }
      

      if (data.vehiculosMasUsados) {
        this.vehiculosChartData = {
          labels: data.vehiculosMasUsados.map((v: any) => `${v.marca} (${v.patente})`),
          datasets: [{ data: data.vehiculosMasUsados.map((v: any) => v.total_viajes) }]
        };
      }

 
      if (data.programaMayorUso) {
        this.programasChartData = {
          labels: data.programaMayorUso.map((p: any) => p.nombre_programa),
          datasets: [{ data: data.programaMayorUso.map((p: any) => p.total_viajes), label: 'Viajes por Programa' }]
        };
      }

      if (data.usuarioMasSolicitudes) {
        this.usuariosChartData = {
          labels: data.usuarioMasSolicitudes.map((u: any) => `${u.nombre} ${u.apellido_paterno}`),
          datasets: [{ data: data.usuarioMasSolicitudes.map((u: any) => u.total_solicitudes) }]
        };
      }

      loading.dismiss();
    },
       error: (err) => {
      console.error('Error al cargar datos del dashboard:', err);
      this.mostrarToast('Error al cargar los datos del dashboard. Revisa la consola del backend.', 'danger');
      loading.dismiss();
       }
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
      this.establecimientosSalud = this.centroServicio.obtenerEstablecimientos(2);
      break;
    case '3': // Educación
      this.showEducacion = true;
      this.establecimientosEducacion = this.centroServicio.obtenerEstablecimientos(3);
      break;
    case '4': // ATM
      this.showAtm = true;
      this.establecimientosAtm = this.centroServicio.obtenerEstablecimientos(4);
      break;
  }
}


}


