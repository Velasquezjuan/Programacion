import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoMovilPage } from './estado-movil.page';

describe('EstadoMovilPage', () => {
  let component: EstadoMovilPage;
  let fixture: ComponentFixture<EstadoMovilPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadoMovilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
