import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoMovilGlobalPage } from './estado-movil-global.page';

describe('EstadoMovilGlobalPage', () => {
  let component: EstadoMovilGlobalPage;
  let fixture: ComponentFixture<EstadoMovilGlobalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadoMovilGlobalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
