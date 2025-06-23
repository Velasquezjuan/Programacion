import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoViajePage } from './estado-viaje.page';

describe('EstadoViajePage', () => {
  let component: EstadoViajePage;
  let fixture: ComponentFixture<EstadoViajePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadoViajePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
