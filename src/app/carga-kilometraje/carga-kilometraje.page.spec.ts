import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CargaKilometrajePage } from './carga-kilometraje.page';

describe('CargaKilometrajePage', () => {
  let component: CargaKilometrajePage;
  let fixture: ComponentFixture<CargaKilometrajePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CargaKilometrajePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
