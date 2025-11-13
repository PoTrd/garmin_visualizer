
import { Injectable } from '@angular/core';
import { Activity } from '../model/activity.model';

@Injectable({
  providedIn: 'root',
})
export class CsvParserService {
  parse(csvText: string): Activity[] {
    const lines = csvText.split('\n');
    if (lines.length < 2) {
      return [];
    }

    const header = lines[0].split(',');
    const dataRows = lines.slice(1);

    const activities: Activity[] = dataRows.map(rowStr => {
      if (rowStr.trim() === '') return null;
      const row = rowStr.split(',');
      const activityData: { [key: string]: string } = {};
      header.forEach((key, index) => {
        activityData[key.replace(/"/g, '')] = row[index] ? row[index].replace(/"/g, '') : '--';
      });

      try {
        const durationParts = (activityData['Durée'] || '00:00:00').split(':').map(Number);
        const durationInSeconds = (durationParts[0] || 0) * 3600 + (durationParts[1] || 0) * 60 + (durationParts[2] || 0);

        return {
          activityType: activityData['Type d\'activité'],
          date: new Date(activityData['Date']),
          title: activityData['Titre'],
          distance: this.parseNumber(activityData['Distance']),
          calories: this.parseNumber(activityData['Calories']),
          duration: durationInSeconds,
          avgHR: this.parseNumber(activityData['Fréquence cardiaque moyenne']),
          maxHR: this.parseNumber(activityData['Fréquence cardiaque maximale']),
          avgPace: activityData['Allure moyenne'],
          totalAscent: this.parseNumber(activityData['Ascension totale']),
        };
      } catch (error) {
        console.error('Error parsing row:', activityData, error);
        return null;
      }
    }).filter((activity): activity is Activity => activity !== null && !isNaN(activity.date.getTime()));

    return activities;
  }
  
  private parseNumber(value: string | undefined): number {
    if (!value || value.trim() === '--') {
      return 0;
    }
    // Remove thousand separators before parsing
    const cleanValue = value.replace(/,/g, '');
    return parseFloat(cleanValue) || 0;
  }
}
