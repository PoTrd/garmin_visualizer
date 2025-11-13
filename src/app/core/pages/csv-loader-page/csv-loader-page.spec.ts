import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvLoaderPage } from './csv-loader-page';

describe('CsvLoaderPage', () => {
  let component: CsvLoaderPage;
  let fixture: ComponentFixture<CsvLoaderPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CsvLoaderPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsvLoaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
