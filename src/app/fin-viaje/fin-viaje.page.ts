import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-fin-viaje',
  templateUrl: './fin-viaje.page.html',
  styleUrls: ['./fin-viaje.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class FinViajePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
