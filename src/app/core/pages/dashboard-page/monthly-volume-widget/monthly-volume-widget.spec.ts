import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyVolumeWidget } from './monthly-volume-widget';

describe('MonthVolumeWidget', () => {
  let component: MonthlyVolumeWidget;
  let fixture: ComponentFixture<MonthlyVolumeWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyVolumeWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyVolumeWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
