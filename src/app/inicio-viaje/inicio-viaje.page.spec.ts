import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioViajePage } from './inicio-viaje.page';

describe('InicioViajePage', () => {
  let component: InicioViajePage;
  let fixture: ComponentFixture<InicioViajePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InicioViajePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
