import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonApp, IonMenu, IonMenuButton, IonHeader, IonTitle, IonToolbar, IonInput, IonDatetime,
  IonGrid, IonRow, IonCol, IonButton, IonItem, IonLabel, IonSelect, 
  IonSelectOption, } from '@ionic/angular/standalone';

@Component({
  selector: 'app-solicitud-viaje-emergencia',
  templateUrl: './solicitud-viaje-emergencia.page.html',
  styleUrls: ['./solicitud-viaje-emergencia.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonApp, IonMenu, IonMenuButton, IonHeader, IonTitle, IonToolbar, IonInput, IonDatetime,
    IonGrid, IonRow, IonCol, IonButton, IonItem, IonLabel, IonSelect, 
    IonSelectOption, CommonModule, FormsModule ]
})
export class SolicitudViajeEmergenciaPage implements OnInit {

  constructor(private route: Router ) { }


  goToHomePage() {
    this.route.navigate(['/home']);
  }

  ngOnInit() {
  }

}
