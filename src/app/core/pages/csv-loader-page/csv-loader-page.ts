import { Component, inject, signal } from '@angular/core';
import { CsvParserService } from '../../../shared/services/csv-parser.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-csv-loader-page',
  imports: [],
  templateUrl: './csv-loader-page.html',
  styleUrls: ['./csv-loader-page.css'],
})
export class CsvLoaderPage {
  private _csvParserService = inject(CsvParserService);
  private _router = inject(Router);

  isDragging = signal(false);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (event.dataTransfer?.files?.length) {
      const file = event.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        try {
          this.readFile(file);
          this.handleLoad();
        } catch (error) {
          console.error('Error reading file:', error);
        }
      } else {
        alert('Please drop a valid .csv file.');
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.readFile(input.files[0]);
      this.handleLoad();
    }
  }

  readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const text = e.target?.result as string;
      if (text) {
        const parsedActivities = this._csvParserService.parse(text);
        try {
          localStorage.setItem('activities', JSON.stringify(parsedActivities));
        } catch (err) {
          console.error('Failed to save activities to localStorage', err);
        }
      }
    };
    reader.readAsText(file);
  }

  handleLoad(): void {
    console.log('CSV file loaded successfully.');
    this._router.navigate(['/dashboard']);
  }
}