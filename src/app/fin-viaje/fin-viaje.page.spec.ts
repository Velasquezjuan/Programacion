import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinViajePage } from './fin-viaje.page';

describe('FinViajePage', () => {
  let component: FinViajePage;
  let fixture: ComponentFixture<FinViajePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FinViajePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
