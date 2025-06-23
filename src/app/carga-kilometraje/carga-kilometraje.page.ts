import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-carga-kilometraje',
  templateUrl: './carga-kilometraje.page.html',
  styleUrls: ['./carga-kilometraje.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CargaKilometrajePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
