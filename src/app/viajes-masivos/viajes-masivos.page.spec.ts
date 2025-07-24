import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViajesMasivosPage } from './viajes-masivos.page';

describe('ViajesMasivosPage', () => {
  let component: ViajesMasivosPage;
  let fixture: ComponentFixture<ViajesMasivosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViajesMasivosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
