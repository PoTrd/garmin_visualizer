import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualVolumeWidget } from './annual-volume-widget';

describe('AnnualVolumeWidget', () => {
  let component: AnnualVolumeWidget;
  let fixture: ComponentFixture<AnnualVolumeWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnualVolumeWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnualVolumeWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
