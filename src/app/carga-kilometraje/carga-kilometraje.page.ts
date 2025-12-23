/**
 * ============================================================================
 * PROYECTO: GECOVI (Gestión de Control de Viajes)
 * DESARROLLADO POR: Juan Velasquez
 * FECHA DE CREACIÓN: 10 DE MARZO DEL 2025
 * ============================================================================
 * Este código es propiedad intelectual de Juan Velasquez.
 * Prohibida su distribución o copia sin autorización.
 * Lo hice para mi examen de titulo y que si me salio CTM AJAJ
 * ============================================================================
 */
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
