import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InfiniteScrollCustomEvent, IonSearchbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-estado-movil-global',
  templateUrl: './estado-movil-global.page.html',
  styleUrls: ['./estado-movil-global.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [ CommonModule,IonSearchbar , FormsModule]
})
export class EstadoMovilGlobalPage implements OnInit {
  vehiculos: any[] = [];
  maxVehiculos = 50; // Máximo de vehículos a cargar
  loadedVehiculos = 0; // Contador de vehículos cargados

  constructor() {}

  ngOnInit() {
    this.loadMoreVehicles(5); // Cargar los primeros 5 vehículos
  }

  private loadMoreVehicles(count: number = 5) {
    const newVehicles = [];
    for (let i = 0; i < count && this.loadedVehiculos < this.maxVehiculos; i++) {
      this.loadedVehiculos++;
      newVehicles.push({
        titulo: `Vehículo ${this.loadedVehiculos}`,
        estado: ['Disponible', 'Ocupado', 'Fuera de Servicio'][Math.floor(Math.random() * 3)],
        lugar: `Estación ${Math.floor(Math.random() * 10) + 1}`,
        imagen: `assets/img/vehiculo${(this.loadedVehiculos % 3) + 1}.jpg`
      });
    }
    this.vehiculos = [...this.vehiculos, ...newVehicles];
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    setTimeout(() => {
      if (this.loadedVehiculos >= this.maxVehiculos) {
        event.target.disabled = true; // Deshabilita el scroll si no hay más vehículos
      } else {
        this.loadMoreVehicles(5);
      }
      event.target.complete();
    }, 1000);
  }

  trackByFn(index: number, item: any): number {
    return index;
  }

  public results = [ ...this.vehiculos];

  handleInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase() || '';
    this.results = this.vehiculos.filter((d) => d.toLowerCase().includes(query));
  }
}