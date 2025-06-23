import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SolicitudViajePage } from './solicitud-viaje.page';

describe('SolicitudViajePage', () => {
  let component: SolicitudViajePage;
  let fixture: ComponentFixture<SolicitudViajePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudViajePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
