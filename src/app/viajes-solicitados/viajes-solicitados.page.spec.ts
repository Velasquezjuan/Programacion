import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViajesSolicitadosPage } from './viajes-solicitados.page';

describe('ViajesSolicitadosPage', () => {
  let component: ViajesSolicitadosPage;
  let fixture: ComponentFixture<ViajesSolicitadosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViajesSolicitadosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
