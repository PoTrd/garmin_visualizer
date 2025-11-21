import { Component, computed, effect, input } from '@angular/core';
import { Activity } from '../../../../shared/model/activity.model';

type Day = {
    date: Date;
    lstActivities: Activity[];
}

@Component({
  selector: 'app-monthly-volume-widget',
  templateUrl: './monthly-volume-widget.html',
  styleUrls: ['./monthly-volume-widget.css'],
})
export class MonthlyVolumeWidget {
  selectedMonth = input<string | null>(null);
  data = input<Activity[]>();
  displayedData = computed<Day[]>(() => {
    const month = this.selectedMonth();
    const activities = this.data() ?? [];
    if (!month) {
      return [];
    }
    
    const result: Day[] = [];
    const numberOfDays = this.getNumberOfDaysInMonth(month);

    for (let day = 1; day <= numberOfDays; day++) {
      const currentMonth = month;
      const currentYear = new Date().getFullYear();
      const currentDate = new Date(`${currentMonth} ${day}, ${currentYear}`);
      const dayActivities = activities.filter(activity => {
        return activity.date.getFullYear() === currentYear && 
          activity.date.getMonth() === currentDate.getMonth() &&
          activity.date.getDate() === day;
      });
      result.push({
        date: currentDate,
        lstActivities: dayActivities
      });
    }

    const actualYear = new Date().getFullYear();
    const firstDayOfMonth = new Date(`${month} 1, ${actualYear}`)
    const offset = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;

    for (let i = 0; i < offset; i++) {
      const monthBefore = new Date (`${month} 1, ${actualYear}`).setMonth(new Date(`${month} 1, ${actualYear}`).getMonth() -1);
      const numberOfDaysInMonthBefore = this.getNumberOfDaysInMonth(new Date(monthBefore).toLocaleString('en-US', { month: 'long' }));
      const dateToAdd = new Date(actualYear, new Date(monthBefore).getMonth(), numberOfDaysInMonthBefore - i);
      const dayActivities = activities.filter(activity => {
        return activity.date.getFullYear() === actualYear && 
          activity.date.getMonth() === new Date(monthBefore).getMonth() &&
          activity.date.getDate() === dateToAdd.getDate();
      });
      result.unshift({
        date: dateToAdd,
        lstActivities: dayActivities
      });
    }
    
    return result;
  });

  constructor() {
    effect(() => {
      const month = this.selectedMonth();
      if (month) {
      }
    });
  }

  getNumberOfDaysInMonth(month: string): number {
    const months31 = ['January', 'March', 'May', 'July', 'August', 'October', 'December'];
    const months30 = ['April', 'June', 'September', 'November'];
    if (months31.includes(month)) return 31;
    if (months30.includes(month)) return 30;
    if (month === 'February') return 28;
    return 0;
  }

  test(): void {
    console.log('Test function called');
    console.log('Displayed Data:', this.displayedData());
  }
}
