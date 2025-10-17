import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoricoSolicitudPage } from './historico-solicitud.page';

describe('HistoricoSolicitudPage', () => {
  let component: HistoricoSolicitudPage;
  let fixture: ComponentFixture<HistoricoSolicitudPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricoSolicitudPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
