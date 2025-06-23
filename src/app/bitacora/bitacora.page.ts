import { Component, OnInit,CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
//import { CommonModule } from '@angular/common';
//import { FormsModule } from '@angular/forms';
import { IonContent, IonLabel, IonSearchbar,
  IonList, IonItem, IonInput,IonButton,  } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { searchCircle } from 'ionicons/icons';

@Component({
  selector: 'app-bitacora',
  templateUrl: './bitacora.page.html',
  styleUrls: ['./bitacora.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonLabel, IonSearchbar,
    IonList, IonItem,  IonButton]
})
export class BitacoraPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToHomePage() {
    this.router.navigate(['/home']);
  } 

  addIcons() {
    addIcons({
      'search-circle': searchCircle
    });
  }

}
