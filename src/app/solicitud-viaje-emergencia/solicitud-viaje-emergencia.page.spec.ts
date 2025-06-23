import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SolicitudViajeEmergenciaPage } from './solicitud-viaje-emergencia.page';

describe('SolicitudViajeEmergenciaPage', () => {
  let component: SolicitudViajeEmergenciaPage;
  let fixture: ComponentFixture<SolicitudViajeEmergenciaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudViajeEmergenciaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
